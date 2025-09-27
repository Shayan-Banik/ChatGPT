import React from "react";
import MessageItem from "./MessageItem";

export default function ChatWindow({
  activeChat,
  isTyping,
  messagesEndRef,
  darkMode,
}) {
  return (
    <div className="space-y-6 pb-4">
      {activeChat.messages.map((message) => (
        <MessageItem key={message.id} message={message} darkMode={darkMode} />
      ))}

      {isTyping && (
        <div className="flex gap-4 justify-start">
          <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              🤖
            </div>
            <div
              className={`p-4 rounded-2xl rounded-tl-sm ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}>
              <div className="flex gap-1">
                <div
                  className={`w-2 h-2 ${
                    darkMode ? "bg-gray-400" : "bg-gray-500"
                  } rounded-full animate-bounce`}></div>
                <div
                  className={`w-2 h-2 ${
                    darkMode ? "bg-gray-400" : "bg-gray-500"
                  } rounded-full animate-bounce`}
                  style={{ animationDelay: "0.1s" }}></div>
                <div
                  className={`w-2 h-2 ${
                    darkMode ? "bg-gray-400" : "bg-gray-500"
                  } rounded-full animate-bounce`}
                  style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
