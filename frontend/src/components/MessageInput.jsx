import React from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({ inputRef, inputMessage, setInputMessage, onSend, activeChatId, darkMode }) {
  return (
    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder={activeChatId ? 'Type your message...' : 'Start a new conversation...'}
              className={`w-full p-4 pr-12 ${darkMode ? 'bg-gray-700 border-gray-600 focus:border-blue-500' : 'bg-white border-gray-300 focus:border-blue-500'} rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all`}
              rows={1}
              style={{ minHeight: '52px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = '52px';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={onSend}
            disabled={!inputMessage.trim() && activeChatId}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
