// COMMENTED OUT: Live chat page temporarily disabled for support tickets only functionality
/*
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Image,
  File,
  Users,
  Settings,
  Star,
  Archive,
  Trash2,
  Edit,
  Reply,
  Forward,
  Info,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  UserPlus,
  Tag,
  Calendar,
  Flag,
  User,
  Store,
  UserCheck,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  ChatConversation,
  Message,
  ChatParticipant,
  ChatFilter,
  TypingIndicator,
} from '@/types/chat';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useUnreadCount,
  useChatRealtime,
} from '@/lib/hooks/use-chat';

export default function ChatPage() {
  const { data: session } = useSession();
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ChatFilter>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const userId = session?.user?.id || 'admin';
  const userName = session?.user?.name || 'Admin User';

  // Real API hooks
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations({ ...filter, search: searchTerm });

  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages(activeConversation?.id || null);

  const { data: unreadCount } = useUnreadCount();

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Enable real-time updates
  useChatRealtime();

  // Get data from API hooks
  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];
  const totalUnreadCount = unreadCount || 0;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-select the first conversation if none is selected
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    sendMessageMutation.mutate({
      conversationId: activeConversation.id,
      content: newMessage,
      type: 'text',
      replyTo: replyingTo?.id,
    }, {
      onSuccess: () => {
        setNewMessage('');
        setReplyingTo(null);
      },
      onError: (error) => {
        console.error('Failed to send message:', error);
        // TODO: Show error toast/notification
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtering is now handled by the API hook
  const filteredConversations = conversations;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getParticipantTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <User className='h-4 w-4 text-blue-500' />;
      case 'vendor':
        return <Store className='h-4 w-4 text-purple-500' />;
      case 'staff':
        return <UserCheck className='h-4 w-4 text-green-500' />;
      default:
        return <User className='h-4 w-4 text-gray-500' />;
    }
  };

  // Loading and error states
  if (conversationsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorMessage 
          title="Failed to load conversations" 
          message={conversationsError.message} 
        />
      </div>
    );
  }

  return (
    <div className='h-screen flex bg-gray-50'>
      // Sidebar - Conversation List
      <div className='w-80 bg-white border-r border-gray-200 flex flex-col'>
        // Sidebar Header
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-lg font-semibold text-gray-900'>Messages</h1>
            <div className='flex items-center gap-2'>
              <button className='px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                New Chat
              </button>
              <button className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'>
                <Settings className='h-4 w-4' />
              </button>
            </div>
          </div>

          // Search
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search conversations...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        // Filters
        <div className='px-4 py-3 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            <button className='px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2'>
              <Filter className='h-3 w-3' />
              Filters
            </button>
            <select
              value={filter.type || 'all'}
              onChange={e => setFilter(prev => ({ ...prev, type: e.target.value as any }))}
              className='px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Types</option>
              <option value='support'>Support</option>
              <option value='sales'>Sales</option>
              <option value='general'>General</option>
            </select>
          </div>
        </div>

        // Conversations List
        <div className='flex-1 overflow-y-auto'>
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => {
                setActiveConversation(conversation);
                // Mark as read if there are unread messages
                if (conversation.unreadCount > 0) {
                  markAsReadMutation.mutate({
                    conversationId: conversation.id,
                  });
                }
              }}
              className={cn(
                'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                activeConversation?.id === conversation.id &&
                  'bg-orange-50 border-l-4 border-l-orange-500'
              )}
            >
              <div className='flex items-start gap-3'>
                <div className='relative flex-shrink-0'>
                  <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm'>
                    {conversation.participants[0]?.name?.charAt(0) || '?'}
                  </div>
                  {conversation.participants[0]?.isOnline && (
                    <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between mb-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium text-gray-900 text-sm truncate'>
                        {conversation.participants[0]?.name}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs rounded-full font-medium',
                          conversation.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : conversation.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {conversation.priority}
                      </span>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                      <span className='text-xs text-gray-500'>
                        {conversation.lastMessage &&
                          formatDistanceToNow(conversation.lastMessage.timestamp, {
                            addSuffix: true,
                          })}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className='w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                    {conversation.lastMessage?.content}
                  </p>

                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500 capitalize'>
                      {conversation.participants[0]?.type}
                    </span>
                    <div className='flex gap-1'>
                      {conversation.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className='px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        conversation.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : conversation.status === 'closed'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-orange-100 text-orange-700'
                      )}
                    >
                      {conversation.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      // Main Chat Area
      <div className='flex-1 flex flex-col bg-white'>
        {activeConversation ? (
          <>
            // Chat Header
            <div className='px-6 py-4 border-b border-gray-200 bg-white'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm'>
                      {activeConversation.participants[0]?.name?.charAt(0) || '?'}
                    </div>
                    {activeConversation.participants[0]?.isOnline && (
                      <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                    )}
                  </div>
                  <div>
                    <h2 className='font-medium text-gray-900'>
                      {activeConversation.participants[0]?.name}
                    </h2>
                    <p className='text-sm text-gray-500'>
                      {activeConversation.participants[0]?.isOnline ? (
                        <span className='flex items-center gap-1'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          Online
                        </span>
                      ) : (
                        `Last seen ${activeConversation.participants[0]?.lastSeen ? formatDistanceToNow(activeConversation.participants[0].lastSeen, { addSuffix: true }) : 'recently'}`
                      )}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'>
                    <Info className='h-4 w-4' />
                  </button>
                  <button className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'>
                    <MoreVertical className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>

            // Messages Area
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : messagesError ? (
                <div className="flex items-center justify-center h-full">
                  <ErrorMessage 
                    title="Failed to load messages" 
                    message={messagesError.message} 
                  />
                </div>
              ) : messages.map((message, index) => {
                const isFromAdmin = message.senderId === userId;
                const showAvatar =
                  index === 0 || messages[index - 1]?.senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={cn('flex gap-3', isFromAdmin ? 'justify-end' : 'justify-start')}
                  >
                    {!isFromAdmin && showAvatar && (
                      <div className='w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0'>
                        {message.senderName?.charAt(0)}
                      </div>
                    )}
                    {!isFromAdmin && !showAvatar && <div className='w-6 h-6 flex-shrink-0'></div>}

                    <div
                      className={cn(
                        'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl',
                        isFromAdmin ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <p className='text-sm'>{message.content}</p>
                      <div
                        className={cn(
                          'flex items-center gap-1 mt-1 text-xs',
                          isFromAdmin ? 'text-blue-100' : 'text-gray-500'
                        )}
                      >
                        <span>{format(message.timestamp, 'HH:mm')}</span>
                        {isFromAdmin && <CheckCheck className='h-3 w-3' />}
                      </div>
                    </div>

                    {isFromAdmin && showAvatar && (
                      <div className='w-6 h-6 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0'>
                        A
                      </div>
                    )}
                    {isFromAdmin && !showAvatar && <div className='w-6 h-6 flex-shrink-0'></div>}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            // Message Input
            <div className='px-6 py-4 border-t border-gray-200 bg-white'>
              <div className='flex items-end gap-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 border border-gray-200 rounded-2xl p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'>
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder='Type your message...'
                      className='flex-1 resize-none border-none outline-none bg-transparent text-sm max-h-32'
                      rows={1}
                    />
                    <div className='flex items-center gap-2'>
                      <button className='p-1 text-gray-500 hover:text-gray-700'>
                        <Paperclip className='h-4 w-4' />
                      </button>
                      <button className='p-1 text-gray-500 hover:text-gray-700'>
                        <Smile className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className='p-3 bg-primary text-white rounded-full hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                >
                  {sendMessageMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center bg-gray-50'>
            <div className='text-center'>
              <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a conversation</h3>
              <p className='text-gray-600'>
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
*/

// TEMPORARY: Redirect to support tickets while chat is disabled
export default function ChatPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat Temporarily Disabled</h3>
        <p className="text-gray-600 mb-4">
          Live chat functionality is currently disabled. Please use support tickets for customer assistance.
        </p>
        <a
          href="/support"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Support Tickets
        </a>
      </div>
    </div>
  );
}