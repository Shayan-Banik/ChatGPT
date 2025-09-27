import { useState, useRef, useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { MessageSquare, Plus } from "lucide-react";

const Home = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user] = useState({ name: "John Doe", email: "john.doe@example.com" });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const userMenuRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat]);

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
  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      name: `New Chat`,
      messages: [
        {
          id: 1,
          text: "Hello! I'm your AI assistant. How can I help you today?",
          isBot: true,
          timestamp: new Date(),
        },
      ],
    };
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChatId);
    setInputMessage("");
    setSidebarOpen(false); // Close sidebar on mobile after creating new chat
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

    // If no active chat, create one first
    if (!activeChatId) {
      const newChatId = Date.now();
      const newChat = {
        id: newChatId,
        name:
          inputMessage.length > 30
            ? inputMessage.substring(0, 30) + "..."
            : inputMessage,
        messages: [
          {
            id: 1,
            text: "Hello! I'm your AI assistant. How can I help you today?",
            isBot: true,
            timestamp: new Date(),
          },
        ],
      };

      const userMessage = {
        id: Date.now() + 1,
        text: inputMessage,
        isBot: false,
        timestamp: new Date(),
      };

      newChat.messages.push(userMessage);
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChatId);
      setInputMessage("");

      // Bot response
      setIsTyping(true);
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 2,
          text: `You said: "${inputMessage}". This is a demo bot response. I'm here to help you with any questions or tasks you might have!`,
          isBot: true,
          timestamp: new Date(),
        };
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === newChatId
              ? { ...chat, messages: [...chat.messages, botMessage] }
              : chat
          )
        );
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );
    setInputMessage("");

    setIsTyping(true);
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: `You said: "${inputMessage}". This is a demo bot response. I'm here to help you with any questions or tasks you might have!`,
        isBot: true,
        timestamp: new Date(),
      };
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, botMessage] }
            : chat
        )
      );
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // Delete chat
  const handleDeleteChat = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setActiveChatId(remainingChats.length ? remainingChats[0].id : null);
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
  const handleLogout = () => {
    console.log("User logged out");
    setShowUserMenu(false);
    // Add your logout logic here
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
              // Welcome screen when no chat is selected
              <div className="flex items-center justify-center h-full ">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 mt-44 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome to ChatBuddy
                  </h2>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-6`}>
                    Start a conversation with your AI assistant. Ask questions,
                    get help, or just chat!
                  </p>
                  <button
                    onClick={handleNewChat}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <Plus size={20} />
                    Start New Chat
                  </button>
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
