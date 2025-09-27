import React from "react";
import { Settings, LogOut, Sun, Moon } from "lucide-react";

export default function UserProfile({
  user,
  showUserMenu,
  setShowUserMenu,
  darkMode,
  setDarkMode,
  onLogout,
}) {
  const handleOpenAuth = (path) => {
    window.location.href = path;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        } transition-colors`}>
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.name ? user.name.charAt(0) : "C"}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-sm truncate">
            {user?.name ?? "Welcome"}
          </p>
          <p
            className={`text-xs truncate ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
            {user?.email ?? ""}
          </p>
        </div>
        <Settings
          size={16}
          className={darkMode ? "text-gray-400" : "text-gray-500"}
        />
      </button>

      {showUserMenu && (
        <div
          className={`absolute bottom-full left-0 right-0 mb-2 ${
            darkMode
              ? "bg-gray-700 border border-gray-600"
              : "bg-white border border-gray-200"
          } rounded-lg shadow-lg py-2 z-50`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
              darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
            } transition-colors`}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          {user ? (
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                darkMode
                  ? "hover:bg-gray-600 text-red-400"
                  : "hover:bg-gray-100 text-red-600"
              } transition-colors`}>
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <div className="px-4 py-2">
              <button
                onClick={() => handleOpenAuth("/login")}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded mb-2">
                Login
              </button>
              <button
                onClick={() => handleOpenAuth("/register")}
                className="w-full px-3 py-2 border rounded">
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
