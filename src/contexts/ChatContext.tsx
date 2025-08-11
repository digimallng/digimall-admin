'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ChatConversation, ChatNotification, Message, ChatParticipant } from '@/types/chat';

interface ChatContextType {
  conversations: ChatConversation[];
  notifications: ChatNotification[];
  unreadCount: number;
  isOnline: boolean;
  currentUserId: string;
  currentUserName: string;

  // Chat actions
  startConversation: (participant: ChatParticipant, initialMessage?: string) => Promise<string>;
  sendMessage: (
    conversationId: string,
    content: string,
    type?: 'text' | 'image' | 'file'
  ) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;

  // Real-time updates
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  updateTypingStatus: (conversationId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
  userId: string;
  userName: string;
}

export function ChatProvider({ children, userId, userName }: ChatProviderProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [activeConversations, setActiveConversations] = useState<Set<string>>(new Set());

  // Mock WebSocket connection
  useEffect(() => {
    // Initialize mock data
    initializeMockData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Simulate incoming messages
      if (Math.random() > 0.95) {
        simulateIncomingMessage();
      }

      // Simulate notifications
      if (Math.random() > 0.98) {
        simulateNotification();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const initializeMockData = () => {
    const mockParticipants: ChatParticipant[] = [
      {
        id: 'customer-1',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'customer',
        isOnline: true,
        avatar: undefined,
      },
      {
        id: 'vendor-1',
        name: 'TechStore Nigeria',
        email: 'support@techstore.ng',
        type: 'vendor',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
      },
      {
        id: 'staff-1',
        name: 'Sarah Support',
        email: 'sarah@digimall.ng',
        type: 'staff',
        isOnline: true,
        role: 'Customer Support',
        department: 'Support',
      },
    ];

    const mockConversations: ChatConversation[] = [
      {
        id: 'conv-1',
        participantIds: [userId, 'customer-1'],
        participants: [mockParticipants[0]],
        lastMessage: {
          id: 'msg-1',
          senderId: 'customer-1',
          senderName: 'John Doe',
          senderType: 'customer',
          content: 'Hi, I need help with my order #12345',
          timestamp: new Date(Date.now() - 300000),
          type: 'text',
          readBy: [],
        },
        unreadCount: 1,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 300000),
        type: 'support',
        status: 'active',
        priority: 'high',
        tags: ['order-issue', 'urgent'],
        assignedTo: userId,
      },
      {
        id: 'conv-2',
        participantIds: [userId, 'vendor-1'],
        participants: [mockParticipants[1]],
        lastMessage: {
          id: 'msg-2',
          senderId: 'vendor-1',
          senderName: 'TechStore Nigeria',
          senderType: 'vendor',
          content: 'Product inventory updated successfully',
          timestamp: new Date(Date.now() - 1800000),
          type: 'text',
          readBy: [userId],
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 1800000),
        type: 'direct',
        status: 'active',
        priority: 'medium',
        tags: ['inventory'],
      },
    ];

    setConversations(mockConversations);
  };

  const simulateIncomingMessage = () => {
    const senders = [
      { id: 'customer-1', name: 'John Doe', type: 'customer' as const },
      { id: 'vendor-1', name: 'TechStore Nigeria', type: 'vendor' as const },
      { id: 'staff-1', name: 'Sarah Support', type: 'staff' as const },
    ];

    const messages = [
      'Thanks for your help!',
      'I have a question about my order',
      'Can you help me with this issue?',
      'The product quality is excellent',
      'I need to update my inventory',
      'Please check the latest reports',
    ];

    const randomSender = senders[Math.floor(Math.random() * senders.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: randomSender.id,
      senderName: randomSender.name,
      senderType: randomSender.type,
      content: randomMessage,
      timestamp: new Date(),
      type: 'text',
      readBy: [],
    };

    setConversations(prev => {
      const conversationExists = prev.find(c => c.participantIds.includes(randomSender.id));
      if (conversationExists) {
        return prev.map(conv =>
          conv.participantIds.includes(randomSender.id)
            ? {
                ...conv,
                lastMessage: newMessage,
                unreadCount: conv.unreadCount + 1,
                updatedAt: new Date(),
              }
            : conv
        );
      }
      return prev;
    });

    // Create notification
    const notification: ChatNotification = {
      id: Date.now().toString(),
      conversationId: 'conv-1',
      messageId: newMessage.id,
      type: 'new_message',
      title: `New message from ${randomSender.name}`,
      content: randomMessage,
      timestamp: new Date(),
      read: false,
      actionRequired: randomSender.type === 'customer',
    };

    setNotifications(prev => [notification, ...prev]);
  };

  const simulateNotification = () => {
    const notificationTypes = ['mention', 'assignment', 'priority_change'];
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

    const notification: ChatNotification = {
      id: Date.now().toString(),
      conversationId: 'conv-1',
      messageId: 'msg-1',
      type: randomType as any,
      title: `${randomType.replace('_', ' ')} notification`,
      content: `You have a new ${randomType.replace('_', ' ')} notification`,
      timestamp: new Date(),
      read: false,
      actionRequired: true,
    };

    setNotifications(prev => [notification, ...prev]);
  };

  const startConversation = async (
    participant: ChatParticipant,
    initialMessage?: string
  ): Promise<string> => {
    const conversationId = `conv-${Date.now()}`;

    const newConversation: ChatConversation = {
      id: conversationId,
      participantIds: [userId, participant.id],
      participants: [participant],
      lastMessage: initialMessage
        ? {
            id: `msg-${Date.now()}`,
            senderId: userId,
            senderName: userName,
            senderType: 'admin',
            content: initialMessage,
            timestamp: new Date(),
            type: 'text',
            readBy: [],
          }
        : undefined,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'direct',
      status: 'active',
      priority: 'medium',
      tags: [],
      assignedTo: userId,
    };

    setConversations(prev => [newConversation, ...prev]);
    return conversationId;
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text'
  ) => {
    const message: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      senderType: 'admin',
      content,
      timestamp: new Date(),
      type,
      readBy: [],
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, lastMessage: message, updatedAt: new Date() } : conv
      )
    );
  };

  const markAsRead = async (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv))
    );
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === notificationId ? { ...notif, read: true } : notif))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const joinConversation = (conversationId: string) => {
    setActiveConversations(prev => new Set(prev).add(conversationId));
  };

  const leaveConversation = (conversationId: string) => {
    setActiveConversations(prev => {
      const newSet = new Set(prev);
      newSet.delete(conversationId);
      return newSet;
    });
  };

  const updateTypingStatus = (conversationId: string, isTyping: boolean) => {
    // In a real implementation, this would send typing status to the server
    console.log(
      `User ${userId} is ${isTyping ? 'typing' : 'not typing'} in conversation ${conversationId}`
    );
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const contextValue: ChatContextType = {
    conversations,
    notifications,
    unreadCount,
    isOnline,
    currentUserId: userId,
    currentUserName: userName,
    startConversation,
    sendMessage,
    markAsRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    joinConversation,
    leaveConversation,
    updateTypingStatus,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
