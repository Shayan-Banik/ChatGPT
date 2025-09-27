import React from "react";
import ChatList from "./ChatList";
import UserProfile from "./UserProfile";
import { X } from "lucide-react";

export default function Sidebar({
  chats,
  activeChatId,
  editingChatId,
  newChatName,
  onNewChat,
  onSelectChat,
  onEditChat,
  onDeleteChat,
  onChangeNewChatName,
  onSaveChatName,
  user,
  showUserMenu,
  setShowUserMenu,
  darkMode,
  setDarkMode,
  onLogout,
  setSidebarOpen,
  sidebarOpen = false,
}) {
  return (
    <div
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-80 sm:w-72 ${
        darkMode ? "bg-gray-800" : "bg-white border-r border-gray-200"
      } transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
      <div
        className={`flex items-center justify-between p-4 border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}>
        <h1 className="text-xl font-bold">ChatBuddy</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className={`lg:hidden p-2 rounded ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } transition-colors`}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4">
          <button
            onClick={() => onNewChat()}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700"
            } transition-colors font-medium`}>
            <PlusIcon />
            Create New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            editingChatId={editingChatId}
            newChatName={newChatName}
            onSelectChat={onSelectChat}
            onEditChat={onEditChat}
            onDeleteChat={onDeleteChat}
            onChangeNewChatName={onChangeNewChatName}
            onSaveChatName={onSaveChatName}
            darkMode={darkMode}
          />
        </div>
      </div>

      <div
        className={`border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        } p-4`}>
        <UserProfile
          user={user}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
    </svg>
  );
}
