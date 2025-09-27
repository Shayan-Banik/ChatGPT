import React from 'react';
import { MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';

export default function ChatList({
  chats,
  activeChatId,
  editingChatId,
  newChatName,
  onSelectChat,
  onEditChat,
  onDeleteChat,
  onChangeNewChatName,
  onSaveChatName,
  darkMode,
}) {
  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div key={chat.id} className={`flex items-center justify-between gap-2 p-3 rounded-lg cursor-pointer transition-colors ${chat.id === activeChatId ? (darkMode ? 'bg-gray-700' : 'bg-blue-50 border border-blue-200') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}>
          {editingChatId === chat.id ? (
            <div className="flex flex-1 gap-2 items-center">
              <input
                value={newChatName}
                onChange={(e) => onChangeNewChatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveChatName();
                  if (e.key === 'Escape') onEditChat(null);
                }}
                className={`flex-1 p-2 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
              />
              <button onClick={onSaveChatName} className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"><Check size={16} /></button>
              <button onClick={() => onEditChat(null)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"><X size={16} /></button>
            </div>
          ) : (
            <>
              <div onClick={() => onSelectChat(chat.id)} className="flex-1 flex items-center gap-3 min-w-0">
                <MessageSquare size={16} className="flex-shrink-0" />
                <span className="text-sm truncate font-medium">{chat.name}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => onEditChat(chat)} className={`p-2 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}><Edit2 size={14} /></button>
                <button onClick={() => onDeleteChat(chat.id)} className={`p-2 rounded ${darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-100 text-red-600'} transition-colors`}><Trash2 size={14} /></button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
