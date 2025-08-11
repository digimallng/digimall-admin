import { useEffect, useMemo } from 'react';
import { useConversations } from './use-chat';
import { useChatWebSocket } from '@/providers/chat-websocket-provider';
import { useQueryClient } from '@tanstack/react-query';
import { chatKeys } from './use-chat';

export function useUnreadMessages() {
  const { data: conversationsData, isLoading } = useConversations({});
  const { isConnected } = useChatWebSocket();
  const queryClient = useQueryClient();

  // Calculate total unread count
  const totalUnreadCount = useMemo(() => {
    if (!conversationsData?.conversations) return 0;

    return conversationsData.conversations.reduce((total, conversation) => {
      return total + (conversation.unreadCount || 0);
    }, 0);
  }, [conversationsData]);

  // Get unread count per conversation
  const unreadCountByConversation = useMemo(() => {
    if (!conversationsData?.conversations) return {};

    return conversationsData.conversations.reduce(
      (acc, conversation) => {
        acc[conversation.id] = conversation.unreadCount || 0;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [conversationsData]);

  // Listen for new messages via WebSocket to update unread counts
  useEffect(() => {
    if (!isConnected) return;

    // Invalidate conversations when a new message arrives
    // This will trigger a refetch and update unread counts
    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    };

    // You can listen to WebSocket events here if needed
    // For now, the WebSocket provider already handles invalidation

    return () => {
      // Cleanup if needed
    };
  }, [isConnected, queryClient]);

  // Check if there are any unread messages
  const hasUnreadMessages = totalUnreadCount > 0;

  // Get formatted count for display (e.g., "99+" for counts over 99)
  const getFormattedCount = (count: number) => {
    if (count === 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  };

  return {
    totalUnreadCount,
    unreadCountByConversation,
    hasUnreadMessages,
    isLoading,
    getFormattedCount,
  };
}
