'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ChatButtonProps {
  unreadCount?: number;
  onClick: () => void;
  isActive: boolean;
}

export function ChatButton({ unreadCount = 0, onClick, isActive }: ChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300',
        'flex items-center justify-center',
        isActive
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white',
        'hover:scale-110 hover:shadow-xl',
        unreadCount > 0 && 'animate-pulse'
      )}
    >
      {isActive ? <X className='h-6 w-6' /> : <MessageCircle className='h-6 w-6' />}

      {unreadCount > 0 && !isActive && (
        <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {isHovered && !isActive && (
        <div className='absolute bottom-16 right-0 bg-black text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap'>
          Admin Chat
          {unreadCount > 0 && (
            <span className='ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
              {unreadCount} new
            </span>
          )}
        </div>
      )}
    </button>
  );
}
