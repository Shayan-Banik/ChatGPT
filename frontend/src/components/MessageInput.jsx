import React from "react";
import { Send } from "lucide-react";

export default function MessageInput({
  inputRef,
  inputMessage,
  setInputMessage,
  onSend,
  activeChatId,
  darkMode,
}) {
  return (
    <div
      className={`border-t ${
        darkMode ? "border-gray-700" : "border-gray-200"
      } p-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder={
                activeChatId
                  ? "Type your message..."
                  : "Start a new conversation..."
              }
              className={`w-full p-4 pr-16 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus:border-blue-500"
                  : "bg-white border-gray-300 focus:border-blue-500"
              } rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all`}
              rows={1}
              style={{ minHeight: "52px", maxHeight: "140px" }}
              onInput={(e) => {
                // Auto-resize but cap height
                e.target.style.height = "52px";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 140) + "px";
              }}
            />

            {/* Send button sits inside the input container for better alignment on small screens */}
            <button
              onClick={onSend}
              disabled={!inputMessage.trim() && activeChatId}
              aria-label="Send message"
              className={`absolute right-3 bottom-3 flex items-center justify-center h-10 w-10 rounded-full text-white shadow-md transition-colors ${
                !inputMessage.trim() && activeChatId
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
