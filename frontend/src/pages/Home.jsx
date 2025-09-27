import { useState, useRef, useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { MessageSquare, Plus } from "lucide-react";
import axios from "axios";
import { io as ioClient } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const safeGetLocal = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const safeSetLocal = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  };

  const [activeChatId, setActiveChatId] = useState(() => {
    const val = safeGetLocal("activeChatId");
    return val ? val : null;
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  // user will be null when not authenticated
  const [user, setUser] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const userMenuRef = useRef(null);
  const socketRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat]);

  // persist active chat id
  useEffect(() => {
    if (activeChatId !== null && activeChatId !== undefined)
      safeSetLocal("activeChatId", String(activeChatId));
  }, [activeChatId]);

  // Fetch chats and user on mount
  useEffect(() => {
    // Fetch auth first. If authenticated, fetch chats and initialize socket.
    const init = async () => {
      try {
        const resUser = await axios.get("http://localhost:3000/api/auth/me", {
          withCredentials: true,
        });
        if (resUser.data && resUser.data.user) {
          const u = resUser.data.user;
          setUser({
            name:
              u.fullName && u.fullName.firstName
                ? `${u.fullName.firstName} ${u.fullName.lastName || ""}`.trim()
                : u.email,
            email: u.email,
          });

          // fetch chats for authenticated user
          try {
            const res = await axios.get("http://localhost:3000/api/chat", {
              withCredentials: true,
            });
            const serverChats = res.data.chats.reverse() || [];
            const normalized = serverChats.map((c) => ({
              id: c._id,
              _id: c._id,
              name: c.title,
              messages: (c.messages || []).map((m, idx) => ({
                id: idx + 1,
                text: m.text ?? m.content ?? "",
                isBot:
                  typeof m.isBot === "boolean" ? m.isBot : m.role === "model",
                timestamp: m.timestamp ?? m.createdAt ?? null,
              })),
            }));
            setChats(normalized);
            const stored = safeGetLocal("activeChatId");
            if (stored) {
              const found = normalized.find(
                (c) => String(c.id) === String(stored)
              );
              if (found) setActiveChatId(String(stored));
            }
          } catch (e) {
            console.error("Failed to fetch chats", e);
          }

          // initialize socket only for authenticated users
          try {
            const socket = ioClient("http://localhost:3000", {
              withCredentials: true,
            });
            socketRef.current = socket;

            socket.on("connect", () => {
              console.log("socket connected", socket.id);
            });

            socket.on("connect_error", (err) => {
              console.error("Socket connect error", err.message || err);
            });

            socket.on("ai-response", (payload) => {
              const botMessage = {
                id: String(Date.now()),
                text: payload.content,
                isBot: true,
                timestamp: payload.timestamp || new Date().toISOString(),
              };

              setChats((prevChats) =>
                prevChats.map((chat) =>
                  String(chat.id) === String(payload.chat)
                    ? { ...chat, messages: [...chat.messages, botMessage] }
                    : chat
                )
              );
              setIsTyping(false);
            });
          } catch (err) {
            console.error("Socket init failed", err);
          }
        } else {
          // not authenticated: show register modal after delay
          const seen = safeGetLocal("seenRegisterModal");
          if (!seen) {
            setTimeout(() => {
              setShowRegisterModal(true);
              safeSetLocal("seenRegisterModal", "1");
            }, 2500);
          }
        }
      } catch (err) {
        // not authenticated or error
        const seen = safeGetLocal("seenRegisterModal");
        if (!seen) {
          setTimeout(() => {
            setShowRegisterModal(true);
            safeSetLocal("seenRegisterModal", "1");
          }, 2500);
        }
        console.error("Auth check failed", err);
      }
    };

    init();
  }, []);

  // Initialize socket.io client and listeners
  useEffect(() => {
    try {
      const socket = ioClient("http://localhost:3000", {
        withCredentials: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("socket connected", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connect error", err.message || err);
      });

      socket.on("ai-response", (payload) => {
        // payload: { content, chat, timestamp }
        const botMessage = {
          id: String(Date.now()),
          text: payload.content,
          isBot: true,
          timestamp: payload.timestamp || new Date().toISOString(),
        };

        setChats((prevChats) =>
          prevChats.map((chat) =>
            String(chat.id) === String(payload.chat)
              ? { ...chat, messages: [...chat.messages, botMessage] }
              : chat
          )
        );
        setIsTyping(false);
      });

      return () => {
        if (socket) {
          socket.off("ai-response");
          socket.off("connect_error");
          socket.off("connect");
          socket.disconnect();
        }
      };
    } catch (err) {
      console.error("Failed to initialize socket", err);
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create a new chat
  const handleNewChat = async (titleParam) => {
    // Only allow authenticated users to create chats
    if (!user || !user.email) {
      // open register modal or navigate to login
      setShowRegisterModal(true);
      return null;
    }

    // accept only string titles from callers; if caller passed an event (from onClick), prompt instead
    let title = null;
    if (typeof titleParam === "string" && titleParam.trim()) {
      title = titleParam.trim();
    } else {
      title = window.prompt("Enter a title for this chat", "New Chat");
    }
    if (!title) return null;

    const newChatId = String(Date.now());
    const newChat = {
      id: newChatId,
      name: title,
      messages: [],
    };

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chat",
        {
          title,
          messages: newChat.messages,
        },
        { withCredentials: true }
      );
      const saved = res.data.chat;
      const savedNormalized = {
        id: saved._id,
        _id: saved._id,
        name: saved.title,
        messages: (saved.messages || []).map((m, idx) => ({
          id: String(idx + 1),
          text: m.text,
          isBot: m.isBot,
          timestamp: m.timestamp,
        })),
      };
      setChats((prev) => [savedNormalized, ...prev]);
      setActiveChatId(savedNormalized.id);
      safeSetLocal("activeChatId", String(savedNormalized.id));
      setSidebarOpen(false);
      return savedNormalized.id;
    } catch (err) {
      console.error("Error creating chat", err);
      // fallback to client-only chat
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChatId);
      setSidebarOpen(false);
      return newChatId;
    }
  };

  // Send message in active chat
  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      if (!activeChatId) {
        handleNewChat();
        return;
      }
      return;
    }

    // prevent unauthenticated users from sending messages
    if (!user || !user.email) {
      setShowRegisterModal(true);
      return;
    }

    // If no active chat, create one first
    // ensure there's an active chat id (create if missing using message text as title)
    let ensuredChatId = activeChatId;
    const ensureChat = async () => {
      if (!ensuredChatId) {
        const title =
          inputMessage.length > 30
            ? inputMessage.substring(0, 30) + "..."
            : inputMessage;
        ensuredChatId = await handleNewChat(title);
      }
    };

    // If we need to create a chat, do it synchronously before sending
    const maybeSend = async () => {
      await ensureChat();

      const newMessage = {
        id: String(Date.now()),
        text: inputMessage,
        isBot: false,
        timestamp: new Date(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === ensuredChatId
            ? { ...chat, messages: [...chat.messages, newMessage] }
            : chat
        )
      );
      setInputMessage("");

      // emit to socket (server will send ai-response and server will persist messages)
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("user-message", {
          content: newMessage.text,
          chat: ensuredChatId,
        });
        setIsTyping(true);
      }
    };

    maybeSend();
  };

  // Delete chat
  const handleDeleteChat = async (chatId) => {
    // Optimistic UI update
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setActiveChatId(remainingChats.length ? remainingChats[0].id : null);
    }

    // If user is not authenticated, nothing to delete on server
    if (!user || !user.email) return;

    try {
      await axios.delete(`http://localhost:3000/api/chat/${chatId}`, {
        withCredentials: true,
      });
      // refetch chats to ensure state matches server
      const res = await axios.get("http://localhost:3000/api/chat", {
        withCredentials: true,
      });
      const serverChats = res.data.chats || [];
      const normalized = serverChats.map((c) => ({
        id: c._id,
        _id: c._id,
        name: c.title,
        messages: (c.messages || []).map((m, idx) => ({
          id: idx + 1,
          text: m.text ?? m.content ?? "",
          isBot: typeof m.isBot === "boolean" ? m.isBot : m.role === "model",
          timestamp: m.timestamp ?? m.createdAt ?? null,
        })),
      }));
      setChats(normalized);
    } catch (err) {
      console.error("Failed to delete chat on server", err);
      // optional: refetch chats or notify user
    }
  };

  // Start renaming chat
  const handleEditChat = (chat) => {
    setEditingChatId(chat.id);
    setNewChatName(chat.name);
  };

  // Save renamed chat
  const handleSaveChatName = () => {
    if (newChatName.trim()) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === editingChatId
            ? { ...chat, name: newChatName.trim() }
            : chat
        )
      );
    }
    setEditingChatId(null);
    setNewChatName("");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {
      // ignore errors
    }
    // clear client state and redirect to login
    safeSetLocal("activeChatId", "");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
      <MobileHeader
        onOpenSidebar={() => setSidebarOpen(true)}
        activeTitle={activeChat?.name}
      />

      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        editingChatId={editingChatId}
        newChatName={newChatName}
        onNewChat={handleNewChat}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onEditChat={(chat) => handleEditChat(chat)}
        onDeleteChat={handleDeleteChat}
        onChangeNewChatName={(val) => setNewChatName(val)}
        onSaveChatName={handleSaveChatName}
        user={user}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 pt-20 lg:pt-4 justify-center items-center">
          <div className="max-w-4xl mx-auto ">
            {!activeChat ? (
              // If authenticated show profile-style welcome, else show public landing
              <div className="flex items-center justify-center h-full ">
                <div className="text-center max-w-md mt-12">
                  {user ? (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-white text-xl font-semibold">
                          {user.name?.charAt(0) ?? "C"}
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome, {user.name}
                      </h2>
                      <p
                        className={` ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        } mb-4`}>
                        This is your ChatBuddy profile.
                      </p>
                      <div
                        className={` ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        } text-sm mb-4`}>
                        {user.email}
                      </div>
                      <p
                        className={` ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        } mb-6`}>
                        Start a new conversation or select an existing chat from
                        the sidebar.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleNewChat()}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                          <Plus size={20} />
                          Start New Chat
                        </button>
                        <button
                          onClick={() => setShowUserMenu(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
                          View Profile
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={28} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome to ChatBuddy
                      </h2>
                      <p
                        className={` ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        } mb-4`}>
                        Create an account to save chats and use all features.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => navigate("/register")}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                          Register
                        </button>
                        <button
                          onClick={() => navigate("/login")}
                          className="px-6 py-3 border rounded-lg">
                          Login
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Chat messages
              <ChatWindow
                activeChat={activeChat}
                isTyping={isTyping}
                messagesEndRef={messagesEndRef}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>

        <MessageInput
          inputRef={inputRef}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSend={handleSendMessage}
          activeChatId={activeChatId}
          darkMode={darkMode}
        />
      </div>

      {/* Register modal for new visitors */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Join ChatBuddy</h3>
            <p className="text-sm mb-4">
              Create an account to save chats and sync across devices.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  navigate("/register");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded">
                Register
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 border rounded">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Home;
