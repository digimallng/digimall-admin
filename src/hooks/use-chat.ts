import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  chatService,
  ConversationQuery,
  SendMessageRequest,
  CreateConversationRequest,
} from '@/lib/api/services/chat.service';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: (query?: ConversationQuery) => [...chatKeys.all, 'conversations', query] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
  participants: (conversationId: string) =>
    [...chatKeys.all, 'participants', conversationId] as const,
  onlineStatus: () => [...chatKeys.all, 'online-status'] as const,
  userStatus: (userId: string) => [...chatKeys.all, 'user-status', userId] as const,
  stats: () => [...chatKeys.all, 'stats'] as const,
};

// Conversations
export function useConversations(query?: ConversationQuery) {
  return useQuery({
    queryKey: chatKeys.conversations(query),
    queryFn: () => chatService.getAllConversations(query),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.conversation(conversationId),
    queryFn: () => chatService.getConversationById(conversationId),
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) => chatService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

// Messages
export function useConversationMessages(conversationId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: [...chatKeys.messages(conversationId), page, limit],
    queryFn: () => chatService.getConversationMessages(conversationId, page, limit),
    enabled: !!conversationId,
    staleTime: 10000, // 10 seconds
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => chatService.sendMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId?: string }) => {
      if (messageId) {
        return chatService.markMessageAsRead(messageId);
      }
      return chatService.markMessagesAsRead(conversationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) });
    },
  });
}

// Participants
export function useConversationParticipants(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.participants(conversationId),
    queryFn: () => chatService.getConversationParticipants(conversationId),
    enabled: !!conversationId,
  });
}

export function useAddParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      chatService.addParticipant(conversationId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.participants(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(variables.conversationId) });
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      chatService.removeParticipant(conversationId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.participants(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(variables.conversationId) });
    },
  });
}

// Conversation Management
export function useUpdateConversationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      settings,
    }: {
      conversationId: string;
      settings: Parameters<typeof chatService.updateConversationSettings>[1];
    }) => chatService.updateConversationSettings(conversationId, settings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useAssignConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, adminId }: { conversationId: string; adminId: string }) =>
      chatService.assignConversation(conversationId, adminId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.archiveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useUnarchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.unarchiveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

// Online Status
export function useOnlineStatus() {
  return useQuery({
    queryKey: chatKeys.onlineStatus(),
    queryFn: () => chatService.getOnlineStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useUserOnlineStatus(userId: string) {
  return useQuery({
    queryKey: chatKeys.userStatus(userId),
    queryFn: () => chatService.getUserOnlineStatus(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Statistics
export function useChatStats() {
  return useQuery({
    queryKey: chatKeys.stats(),
    queryFn: () => chatService.getConversationStats(),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// User Search
export function useSearchUsers() {
  return useMutation({
    mutationFn: ({ query, type }: { query: string; type?: 'customer' | 'vendor' }) =>
      chatService.searchUsers(query, type),
  });
}

// File Upload
export function useUploadChatFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, conversationId }: { file: File; conversationId: string }) =>
      chatService.uploadChatFile(file, conversationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) });
    },
  });
}
