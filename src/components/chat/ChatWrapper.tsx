'use client';

import { useState } from 'react';
import { AdminChatSystem } from './AdminChatSystem';
import { ChatButton } from './ChatButton';
import { useConversations } from '@/hooks/use-chat';
import { MessageCircle } from 'lucide-react';

export function ChatWrapper() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialConversationId, setInitialConversationId] = useState<string | undefined>();

  // Get unread count from conversations
  const { data: conversationsData } = useConversations({ status: 'active' });
  const unreadCount =
    conversationsData?.conversations.reduce((count, conv) => count + conv.unreadCount, 0) || 0;

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleStartConversation = async (
    userOrConversationId: string | { id: string; name: string; email: string; type: string }
  ) => {
    if (typeof userOrConversationId === 'string') {
      // It's a conversation ID
      setInitialConversationId(userOrConversationId);
      setIsChatOpen(true);
    } else {
      // It's a user object - we need to create a conversation
      // Open the chat system with the user pre-selected
      setIsChatOpen(true);
      // Use a timeout to ensure the chat system is mounted before triggering the new conversation modal
      setTimeout(() => {
        const chatSystem = document.querySelector('[data-chat-system]');
        if (chatSystem) {
          // Trigger the new conversation modal with the user pre-selected
          const event = new CustomEvent('start-conversation-with-user', {
            detail: userOrConversationId,
          });
          chatSystem.dispatchEvent(event);
        }
      }, 100);
    }
  };

  // Make startConversation available globally
  if (typeof window !== 'undefined') {
    (window as any).startChatConversation = handleStartConversation;
  }

  return (
    <>
      <div className='fixed bottom-4 right-4 z-40'>
        <button
          onClick={handleToggleChat}
          className='relative flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105'
        >
          <MessageCircle className='h-6 w-6' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <AdminChatSystem
        isOpen={isChatOpen}
        onToggle={handleToggleChat}
        initialConversationId={initialConversationId}
      />
    </>
  );
}
