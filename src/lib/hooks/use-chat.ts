import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { handleApiError } from '../api/client';
import { ChatConversation, Message, ChatParticipant } from '@/types/chat';

// ===== CHAT QUERY KEYS =====
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
  participants: () => [...chatKeys.all, 'participants'] as const,
  unreadCount: () => [...chatKeys.all, 'unread-count'] as const,
};

// ===== TYPES =====
interface ChatFilters {
  type?: 'all' | 'support' | 'sales' | 'general' | 'direct';
  status?: 'all' | 'active' | 'closed' | 'archived';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  unreadOnly?: boolean;
  search?: string;
}

interface SendMessageData {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  replyTo?: string;
  metadata?: Record<string, any>;
}

interface CreateConversationData {
  participantIds: string[];
  type: 'support' | 'sales' | 'general' | 'direct';
  subject?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  initialMessage?: string;
}

// ===== CONVERSATION HOOKS =====

/**
 * Hook to fetch all conversations with filters
 */
export function useConversations(filters?: {
  type?: 'all' | 'direct' | 'group' | 'support';
  status?: 'all' | 'active' | 'closed' | 'archived';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  participantType?: 'all' | 'customer' | 'vendor' | 'staff';
  unreadOnly?: boolean;
  assignedToMe?: boolean;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  search: string;
}) {
  return useQuery({
    queryKey: [...chatKeys.conversations(), filters],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{
          conversations: ChatConversation[];
          total: number;
          unreadCount: number;
        }>('/chat/conversations', filters);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a specific conversation
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: chatKeys.conversation(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) return null;
      try {
        const response = await apiClient.get<ChatConversation>(`/chat/conversations/${conversationId}`);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch messages for a conversation
 */
export function useMessages(conversationId: string | null, options?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...chatKeys.messages(conversationId || ''), options],
    queryFn: async () => {
      if (!conversationId) return { messages: [], hasMore: false };
      try {
        const response = await apiClient.get<{
          messages: Message[];
          hasMore: boolean;
          total: number;
        }>(`/chat/conversations/${conversationId}/messages`, options);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get total unread message count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ count: number }>('/chat/unread-count');
        return response.count;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch chat participants (staff, customers, vendors)
 */
export function useChatParticipants(search?: string) {
  return useQuery({
    queryKey: [...chatKeys.participants(), { search }],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ChatParticipant[]>('/chat/participants', { search });
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== MUTATION HOOKS =====

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      try {
        const response = await apiClient.post<Message>(`/chat/conversations/${data.conversationId}/messages`, {
          content: data.content,
          type: data.type || 'text',
          replyTo: data.replyTo,
          metadata: data.metadata,
        });
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: (message, variables) => {
      // Update messages cache
      queryClient.setQueryData(
        chatKeys.messages(variables.conversationId),
        (old: any) => {
          if (!old) return { messages: [message], hasMore: false };
          return {
            ...old,
            messages: [...old.messages, message],
          };
        }
      );

      // Update conversation last message
      queryClient.setQueryData(
        chatKeys.conversation(variables.conversationId),
        (old: ChatConversation | undefined) => {
          if (!old) return old;
          return {
            ...old,
            lastMessage: message,
            updatedAt: message.timestamp,
          };
        }
      );

      // Invalidate conversations list to update order and last message
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Hook to create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConversationData) => {
      try {
        const response = await apiClient.post<ChatConversation>('/chat/conversations', data);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Hook to mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, messageIds }: {
      conversationId: string;
      messageIds?: string[];
    }) => {
      try {
        const response = await apiClient.post(`/chat/conversations/${conversationId}/mark-read`, {
          messageIds,
        });
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: (_, variables) => {
      // Update conversation unread count
      queryClient.setQueryData(
        chatKeys.conversation(variables.conversationId),
        (old: ChatConversation | undefined) => {
          if (!old) return old;
          return {
            ...old,
            unreadCount: 0,
          };
        }
      );

      // Update conversations list
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            conversations: old.conversations.map((conv: ChatConversation) =>
              conv.id === variables.conversationId
                ? { ...conv, unreadCount: 0 }
                : conv
            ),
          };
        }
      );

      // Update unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

/**
 * Hook to update conversation status/priority
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, updates }: {
      conversationId: string;
      updates: Partial<Pick<ChatConversation, 'status' | 'priority' | 'tags' | 'assignedTo'>>;
    }) => {
      try {
        const response = await apiClient.patch<ChatConversation>(
          `/chat/conversations/${conversationId}`,
          updates
        );
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: (conversation) => {
      // Update conversation cache
      queryClient.setQueryData(
        chatKeys.conversation(conversation.id),
        conversation
      );

      // Update conversations list
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            conversations: old.conversations.map((conv: ChatConversation) =>
              conv.id === conversation.id ? conversation : conv
            ),
          };
        }
      );
    },
  });
}

/**
 * Hook to delete/archive a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, archive = false }: {
      conversationId: string;
      archive?: boolean;
    }) => {
      try {
        const endpoint = archive ? 'archive' : 'delete';
        const response = await apiClient.post(`/chat/conversations/${conversationId}/${endpoint}`);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: (_, variables) => {
      // Remove from conversations list or update status
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            conversations: variables.archive
              ? old.conversations.map((conv: ChatConversation) =>
                  conv.id === variables.conversationId
                    ? { ...conv, status: 'archived' }
                    : conv
                )
              : old.conversations.filter((conv: ChatConversation) => conv.id !== variables.conversationId),
          };
        }
      );

      // Remove conversation details cache
      queryClient.removeQueries({
        queryKey: chatKeys.conversation(variables.conversationId)
      });

      // Remove messages cache
      queryClient.removeQueries({
        queryKey: chatKeys.messages(variables.conversationId)
      });
    },
  });
}

// ===== UTILITY HOOKS =====

/**
 * Hook to search conversations and messages
 */
export function useSearchChats(query: string) {
  return useQuery({
    queryKey: [...chatKeys.all, 'search', { query }],
    queryFn: async () => {
      if (!query.trim()) return { conversations: [], messages: [] };
      
      try {
        const response = await apiClient.get<{
          conversations: ChatConversation[];
          messages: (Message & { conversationId: string })[];
        }>('/chat/search', { query });
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get chat statistics for admin dashboard
 */
export function useChatStats(period?: 'day' | 'week' | 'month' | 'year') {
  return useQuery({
    queryKey: [...chatKeys.all, 'stats', { period }],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{
          totalConversations: number;
          activeConversations: number;
          totalMessages: number;
          avgResponseTime: number;
          unreadMessages: number;
          conversationsByType: Record<string, number>;
          messagesByDay: Array<{ date: string; count: number }>;
        }>('/chat/stats', { period });
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== REAL-TIME HOOKS (WebSocket simulation) =====

/**
 * Hook to simulate real-time message updates
 * In a real app, this would use WebSocket connections
 */
export function useChatRealtime() {
  const queryClient = useQueryClient();

  // Simulate periodic updates for now
  // In production, this would establish WebSocket connections
  useQuery({
    queryKey: [...chatKeys.all, 'realtime'],
    queryFn: async () => {
      // Periodically refetch unread count and active conversations
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
      return null;
    },
    refetchInterval: 30 * 1000, // Every 30 seconds
    enabled: true,
  });
}