import { apiClient } from '../client';

// Create a specialized client for chat that always uses the proxy
class ChatApiClient {
  private baseURL = '/api/proxy';

  async getAuthHeaders(): Promise<Record<string, string>> {
    return apiClient.getAuthHeaders();
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;

      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.message || errorResponse.error || errorMessage;
        errorData = errorResponse;
      } catch {
        try {
          errorMessage = await response.text() || errorMessage;
        } catch {}
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    try {
      const result = await response.json();
      // Handle API response wrapper format
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        if (!result.success) {
          throw new Error(result.message || 'Request failed');
        }
        return result.data;
      }
      // Return raw result if not wrapped
      return result;
    } catch (error) {
      // If parsing fails, return empty object
      return {} as T;
    }
  }
}

const chatApiClient = new ChatApiClient();

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'offer' | 'system';
  messageType?: "text" | "image" | "video" | "audio" | "file" | "files" | "system" | "bargain_offer" | "bargain_counter" | "bargain_accept" | "bargain_reject";
  metadata?: Record<string, any>;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  sentAt: string;
  readBy?: { userId: string; readAt: string }[];
  offer?: {
    amount: number;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export interface ChatParticipant {
  userId: string;
  userName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    userType: string;
    isOnline: boolean;
    lastSeen: string;
  };
  userType?: 'vendor' | 'customer' | 'admin';
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  verified?: boolean;
  location?: string;
  joinedAt: string;
  role?: 'admin' | 'member';
  isActive?: boolean;
}

export interface ChatConversation {
  id: string;
  type: 'customer_vendor' | 'customer_support' | 'vendor_support' | 'dispute' | 'bargaining' | 'general';
  title?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    disputeId?: string;
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    customerSince?: string;
    assignedTo?: string;
  };
}

export interface ConversationQuery {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  status?: 'active' | 'archived';
  assignedTo?: string;
  priority?: string;
}

export interface ConversationsResponse {
  conversations: ChatConversation[];
  total: number;
  page: number;
  totalPages: number;
  limit?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'offer';
  metadata?: Record<string, any>;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface CreateConversationRequest {
  type: 'customer_vendor' | 'customer_support' | 'vendor_support' | 'dispute' | 'bargaining' | 'general';
  participants: string[];
  title?: string;
  orderId?: string;
  productId?: string;
  metadata?: Record<string, any>;
}

export class ChatService {
  // Get all conversations (admin can see all)
  async getAllConversations(query: ConversationQuery = {}): Promise<ConversationsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.type) params.append('type', query.type);
    if (query.search) params.append('search', query.search);
    // Remove status as it's not accepted by the backend
    // if (query.status) params.append('status', query.status);
    if (query.assignedTo) params.append('assignedTo', query.assignedTo);
    if (query.priority) params.append('priority', query.priority);

    console.log('Fetching conversations with query:', query);
    console.log('Request URL:', `/chat/conversations?${params.toString()}`);
    
    const response = await chatApiClient.get<ConversationsResponse>(`/chat/conversations?${params.toString()}`);
    
    console.log('Chat service response:', response);
    
    return {
      conversations: response.conversations || [],
      total: response.total || response.pagination?.total || 0,
      page: response.page || response.pagination?.page || 1,
      totalPages: response.totalPages || response.pagination?.totalPages || 0,
      limit: response.limit || response.pagination?.limit || query.limit || 50,
      pagination: response.pagination || {
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || query.limit || 50,
        totalPages: response.totalPages || 0,
      },
    };
  }

  // Get conversation by ID
  async getConversationById(conversationId: string): Promise<ChatConversation> {
    return chatApiClient.get<ChatConversation>(`/chat/conversations/${conversationId}`);
  }

  // Create a new conversation
  async createConversation(request: CreateConversationRequest): Promise<ChatConversation> {
    return chatApiClient.post<ChatConversation>('/chat/conversations', request);
  }

  // Get conversation participants
  async getConversationParticipants(conversationId: string): Promise<ChatParticipant[]> {
    return chatApiClient.get<ChatParticipant[]>(`/chat/conversations/${conversationId}/participants`);
  }

  // Add participant to conversation
  async addParticipant(conversationId: string, userId: string): Promise<void> {
    await chatApiClient.post(`/chat/conversations/${conversationId}/participants`, { userId });
  }

  // Remove participant from conversation
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    await chatApiClient.delete(`/chat/conversations/${conversationId}/participants/${userId}`);
  }

  // Get conversation messages
  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: ChatMessage[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await chatApiClient.get<{
      messages: ChatMessage[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);

    return {
      messages: response.messages || [],
      pagination: response.pagination || {
        total: response.total || 0,
        page: response.page || page,
        limit: response.limit || limit,
        totalPages: response.totalPages || 0,
      },
    };
  }

  // Send a message
  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    return chatApiClient.post<ChatMessage>('/chat/messages', request);
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string): Promise<void> {
    await chatApiClient.post(`/chat/conversations/${conversationId}/mark-read`);
  }

  // Mark specific message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    await chatApiClient.post(`/chat/messages/${messageId}/mark-read`);
  }

  // Get online status of all users
  async getOnlineStatus(): Promise<{
    totalOnline: number;
    onlineUsers: Array<{
      userId: string;
      lastSeen: string;
      isTyping: boolean;
    }>;
  }> {
    return chatApiClient.get<{
      totalOnline: number;
      onlineUsers: Array<{
        userId: string;
        lastSeen: string;
        isTyping: boolean;
      }>;
    }>('/chat/online-status');
  }

  // Get user online status
  async getUserOnlineStatus(userId: string): Promise<{
    isOnline: boolean;
    lastSeen: string;
    isTyping: boolean;
  }> {
    return chatApiClient.get<{
      isOnline: boolean;
      lastSeen: string;
      isTyping: boolean;
    }>(`/chat/online-status/${userId}`);
  }

  // Upload file for chat
  async uploadChatFile(file: File, conversationId: string): Promise<{
    fileId: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);

    return chatApiClient.post<{
      fileId: string;
      filename: string;
      url: string;
      mimeType: string;
      size: number;
    }>(`/chat/conversations/${conversationId}/files/upload`, formData);
  }

  // Update conversation settings (admin only)
  async updateConversationSettings(
    conversationId: string,
    settings: {
      title?: string;
      isActive?: boolean;
      metadata?: Record<string, any>;
      priority?: 'high' | 'medium' | 'low';
      assignedTo?: string;
      tags?: string[];
    }
  ): Promise<ChatConversation> {
    return chatApiClient.put<ChatConversation>(`/chat/conversations/${conversationId}/settings`, settings);
  }

  // Assign conversation to admin
  async assignConversation(conversationId: string, adminId: string): Promise<void> {
    await chatApiClient.post(`/chat/conversations/${conversationId}/assign`, { adminId });
  }

  // Archive conversation
  async archiveConversation(conversationId: string): Promise<void> {
    await chatApiClient.post(`/chat/conversations/${conversationId}/archive`);
  }

  // Unarchive conversation
  async unarchiveConversation(conversationId: string): Promise<void> {
    await chatApiClient.post(`/chat/conversations/${conversationId}/unarchive`);
  }

  // Search users for starting new conversations
  async searchUsers(query: string, type?: 'customer' | 'vendor'): Promise<Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    avatar?: string;
  }>> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) params.append('type', type);

    return apiClient.get<Array<{
      id: string;
      name: string;
      email: string;
      type: string;
      avatar?: string;
    }>>(`/users/search?${params.toString()}`);
  }

  // Get conversation statistics (admin only)
  async getConversationStats(): Promise<{
    totalConversations: number;
    activeConversations: number;
    unassignedConversations: number;
    averageResponseTime: number;
    conversationsByType: Record<string, number>;
    conversationsByPriority: Record<string, number>;
  }> {
    return chatApiClient.get<{
      totalConversations: number;
      activeConversations: number;
      unassignedConversations: number;
      averageResponseTime: number;
      conversationsByType: Record<string, number>;
      conversationsByPriority: Record<string, number>;
    }>('/chat/admin/stats');
  }
}

export const chatService = new ChatService();