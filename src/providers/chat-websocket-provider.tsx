'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { ChatMessage, ChatConversation } from '@/lib/api/services/chat.service';
import { useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '@/hooks/use-chat';
import { getAccessToken } from '@/lib/api/client';
import { useNotifications } from '@/hooks/use-notifications';

interface ChatWebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  isRetrying: boolean;
  sendMessage: (
    conversationId: string,
    content: string,
    type?: string,
    metadata?: {
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    }
  ) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string, messageId?: string) => void;
  onlineUsers: Set<string>;
  typingUsers: Map<string, Set<string>>; // conversationId -> Set of userIds
  retryConnection: () => void;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextType | null>(null);

export const useChatWebSocket = () => {
  const context = useContext(ChatWebSocketContext);
  if (!context) {
    throw new Error('useChatWebSocket must be used within a ChatWebSocketProvider');
  }
  return context;
};

interface ChatWebSocketProviderProps {
  children: React.ReactNode;
}

export function ChatWebSocketProvider({ children }: ChatWebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { showNotification, playNotificationSound } = useNotifications();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const retryTimeoutRef = useRef<NodeJS.Timeout | number | undefined>(undefined);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const currentConversationIdRef = useRef<string | null>(null);

  // Manual retry function
  const retryConnection = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached. Stopping retries.');
      setConnectionError('Unable to connect to chat service. Please check your connection.');
      setIsRetrying(false);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff, max 30s
    console.log(
      `Retrying WebSocket connection in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`
    );

    setIsRetrying(true);
    retryTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      connectWebSocket();
    }, delay);
  };

  const connectWebSocket = async () => {
    const token = await getAccessToken();
    if (!token) {
      console.log('No access token available for WebSocket connection');
      setConnectionError('Authentication required for chat service');
      return;
    }

    // Try to connect to chat WebSocket service
    const chatSocketUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:5800';

    console.log('Admin attempting to connect to chat service:', chatSocketUrl);

    // Check if chat service is optional
    const isChatOptional = process.env.NEXT_PUBLIC_CHAT_OPTIONAL !== 'false';

    const newSocket = io(chatSocketUrl, {
      auth: {
        token: token,
        userType: 'admin', // Identify as admin
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: false, // We'll handle reconnection manually
      timeout: 5000, // 5 second connection timeout
      forceNew: true, // Always create a new connection
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Admin successfully connected to chat WebSocket');
      setIsConnected(true);
      setConnectionError(null);
      setIsRetrying(false);
      reconnectAttempts.current = 0;

      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = undefined as any;
      }
    });

    newSocket.on('connect_error', error => {
      console.warn('Admin chat WebSocket connection error:', error.message);

      // Check if chat service is optional
      const isChatOptional = process.env.NEXT_PUBLIC_CHAT_OPTIONAL !== 'false';

      if (isChatOptional) {
        // Chat is optional, don't show error to user
        console.log('Chat service is optional and not available');
        setConnectionError(null); // Don't show error
        setIsConnected(false);
        setIsRetrying(false);
      } else {
        // Chat is required, show error and retry
        setConnectionError(`Failed to connect to chat service: ${error.message}`);
        setIsConnected(false);

        // Only retry if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          retryConnection();
        }
      }
    });

    newSocket.on('disconnect', reason => {
      console.log('Admin disconnected from chat WebSocket:', reason);
      setIsConnected(false);

      // Only attempt to reconnect if it wasn't a manual disconnect
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        console.log('Attempting to reconnect due to:', reason);
        retryConnection();
      }
    });

    newSocket.on('connect_error', error => {
      console.error('Admin chat WebSocket connection error:', error.message || error);
      setIsConnected(false);

      // Handle specific error types
      let errorMessage = 'Connection failed';
      if (error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout - chat service may be unavailable';
      } else if (error.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Chat service is not running';
      } else if (error.message?.includes('unauthorized')) {
        errorMessage = 'Authentication failed';
      }

      setConnectionError(errorMessage);

      // Attempt to reconnect
      retryConnection();
    });

    // Chat event handlers
    newSocket.on('connected', data => {
      console.log('Admin chat service connected:', data);
    });

    newSocket.on('new_message', (data: { message: ChatMessage; conversationId: string }) => {
      console.log('Admin received new message:', data);

      // Invalidate messages for the conversation
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(data.conversationId),
      });

      // Invalidate conversations to update last message and unread count
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });

      // Show notification if the message is not from the current user
      // and not in the currently active conversation
      if (
        data.message.senderId !== session?.user?.id &&
        data.conversationId !== currentConversationIdRef.current
      ) {
        // Play notification sound
        playNotificationSound();

        // Show browser notification
        showNotification({
          title: 'New Message',
          body: data.message.content,
          tag: `chat-${data.conversationId}`,
          data: {
            conversationId: data.conversationId,
          },
        });
      }
    });

    newSocket.on(
      'message_sent',
      (data: { tempId: string; messageId: string; timestamp: string }) => {
        console.log('Message sent confirmation:', data);
      }
    );

    newSocket.on('message_error', (data: { error: string }) => {
      console.error('Message error:', data.error);
    });

    newSocket.on(
      'user_typing',
      (data: { userId: string; userName: string; conversationId: string; isTyping: boolean }) => {
        console.log('User typing:', data);

        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const conversationTypers = newMap.get(data.conversationId) || new Set();

          if (data.isTyping) {
            conversationTypers.add(data.userId);

            // Clear existing timeout for this user
            const timeoutKey = `${data.conversationId}-${data.userId}`;
            if (typingTimeouts.current.has(timeoutKey)) {
              clearTimeout(typingTimeouts.current.get(timeoutKey)!);
            }

            // Set timeout to remove typing indicator after 3 seconds
            const timeout = setTimeout(() => {
              setTypingUsers(prev => {
                const newMap = new Map(prev);
                const typists = newMap.get(data.conversationId);
                if (typists) {
                  typists.delete(data.userId);
                  if (typists.size === 0) {
                    newMap.delete(data.conversationId);
                  }
                }
                return newMap;
              });
              typingTimeouts.current.delete(timeoutKey);
            }, 3000);

            typingTimeouts.current.set(timeoutKey, timeout);
          } else {
            conversationTypers.delete(data.userId);
            if (conversationTypers.size === 0) {
              newMap.delete(data.conversationId);
            }
          }

          newMap.set(data.conversationId, conversationTypers);
          return newMap;
        });
      }
    );

    newSocket.on(
      'user_status_changed',
      (data: { userId: string; isOnline: boolean; lastSeen: string }) => {
        console.log('User status changed:', data);

        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (data.isOnline) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });

        // Invalidate conversations to update online status
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        });
      }
    );

    newSocket.on(
      'messages_read',
      (data: { userId: string; conversationId: string; messageId?: string }) => {
        console.log('Messages marked as read:', data);

        // Invalidate conversations to update unread count
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        });

        // Invalidate messages to update read status
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(data.conversationId),
        });
      }
    );

    newSocket.on('joined_conversation', (data: { conversationId: string }) => {
      console.log('Joined conversation:', data.conversationId);
    });

    newSocket.on('left_conversation', (data: { conversationId: string }) => {
      console.log('Left conversation:', data.conversationId);
    });

    newSocket.on('join_error', (data: { error: string; conversationId: string }) => {
      console.error('Join conversation error:', data);
    });

    // Admin-specific events
    newSocket.on('conversation_assigned', (data: { conversationId: string; adminId: string }) => {
      console.log('Conversation assigned:', data);

      // Invalidate conversations to update assignment
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    });

    newSocket.on('priority_changed', (data: { conversationId: string; priority: string }) => {
      console.log('Priority changed:', data);

      // Invalidate conversation details
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(data.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    if (!session || !session.accessToken) {
      console.log('No session available, skipping WebSocket connection');
      return;
    }

    // Reset connection state
    setConnectionError(null);
    setIsRetrying(false);
    reconnectAttempts.current = 0;

    // Connect to WebSocket
    connectWebSocket();

    return () => {
      console.log('Cleaning up admin chat WebSocket connection');

      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = undefined as any;
      }

      // Clear all typing timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();

      // Disconnect socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [session?.accessToken, queryClient]);

  // WebSocket methods
  const sendMessage = (
    conversationId: string,
    content: string,
    type: string = 'text',
    metadata?: {
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    }
  ) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, cannot send message');
      return;
    }

    socket.emit('send_message', {
      conversationId,
      content,
      type,
      ...(metadata && {
        fileUrl: metadata.fileUrl,
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
      }),
    });
  };

  const joinConversation = (conversationId: string) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, cannot join conversation');
      return;
    }

    socket.emit('join_conversation', { conversationId });
    currentConversationIdRef.current = conversationId;
  };

  const leaveConversation = (conversationId: string) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, cannot leave conversation');
      return;
    }

    socket.emit('leave_conversation', { conversationId });
    if (currentConversationIdRef.current === conversationId) {
      currentConversationIdRef.current = null;
    }
  };

  const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit('typing_indicator', {
      conversationId,
      isTyping,
    });
  };

  const markAsRead = (conversationId: string, messageId?: string) => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit('mark_as_read', {
      conversationId,
      messageId,
    });
  };

  const contextValue: ChatWebSocketContextType = {
    socket,
    isConnected,
    connectionError,
    isRetrying,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markAsRead,
    onlineUsers,
    typingUsers,
    retryConnection,
  };

  return (
    <ChatWebSocketContext.Provider value={contextValue}>{children}</ChatWebSocketContext.Provider>
  );
}
