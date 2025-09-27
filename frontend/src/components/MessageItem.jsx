import React from 'react';

export default function MessageItem({ message, darkMode }) {
  return (
    <div className={`flex gap-4 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isBot ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
          {message.isBot ? '🤖' : '👤'}
        </div>
        <div className={`p-4 rounded-2xl ${message.isBot ? (darkMode ? 'bg-gray-700 rounded-tl-sm' : 'bg-gray-100 rounded-tl-sm text-gray-900') : 'bg-blue-600 rounded-tr-sm text-white'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <p className={`text-xs mt-2 ${message.isBot ? (darkMode ? 'text-gray-400' : 'text-gray-500') : 'text-blue-100'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
