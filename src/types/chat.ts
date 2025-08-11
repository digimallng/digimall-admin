export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'admin' | 'customer' | 'vendor' | 'staff';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Attachment[];
  readBy: string[];
  isEdited?: boolean;
  editedAt?: Date;
  replyTo?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'audio' | 'video';
  size: number;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  type: 'direct' | 'group' | 'support';
  title?: string;
  description?: string;
  status: 'active' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  assignedTo?: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  type: 'admin' | 'customer' | 'vendor' | 'staff';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  role?: string;
  department?: string;
}

export interface ChatFilter {
  type?: 'all' | 'direct' | 'group' | 'support';
  status?: 'all' | 'active' | 'closed' | 'archived';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  participantType?: 'all' | 'customer' | 'vendor' | 'staff';
  unreadOnly?: boolean;
  assignedToMe?: boolean;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: Date;
}

export interface ChatNotification {
  id: string;
  conversationId: string;
  messageId: string;
  type: 'new_message' | 'mention' | 'assignment' | 'priority_change';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
}
