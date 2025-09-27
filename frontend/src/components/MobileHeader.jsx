import React from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileHeader({ onOpenSidebar, activeTitle }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
      <button
        onClick={onOpenSidebar}
        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-lg font-semibold text-white">{activeTitle || 'ChatBuddy'}</h1>
      <div className="w-10" />
    </div>
  );
}
