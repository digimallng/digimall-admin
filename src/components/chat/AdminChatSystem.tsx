'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  Phone,
  Video,
  MoreVertical,
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Image,
  File,
  Users,
  Settings,
  Star,
  Archive,
  Trash2,
  Info,
  Clock,
  Check,
  CheckCheck,
  UserPlus,
  Tag,
  Flag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import {
  ChatConversation,
  ChatMessage,
  ChatParticipant,
  ConversationQuery,
} from '@/lib/api/services/chat.service';
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkAsRead,
  useCreateConversation,
  useSearchUsers,
  useAssignConversation,
  useUpdateConversationSettings,
  useArchiveConversation,
  useChatStats,
} from '@/hooks/use-chat';
import { useChatWebSocket } from '@/providers/chat-websocket-provider';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface AdminChatSystemProps {
  isOpen: boolean;
  onToggle: () => void;
  initialConversationId?: string;
}

export function AdminChatSystem({ isOpen, onToggle, initialConversationId }: AdminChatSystemProps) {
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ConversationQuery>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const user = session?.user
    ? {
        id: session.user.id || session.user.email || '',
        name: session.user.name || '',
        email: session.user.email || '',
      }
    : null;
  const {
    isConnected,
    connectionError,
    sendMessage: sendWebSocketMessage,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markAsRead: markAsReadWebSocket,
    onlineUsers,
    typingUsers,
    retryConnection,
  } = useChatWebSocket();

  // Queries and mutations
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations(filter);
  const conversations = conversationsData?.conversations || [];

  const { data: messagesData, isLoading: isLoadingMessages } = useConversationMessages(
    activeConversation?.id || '',
    1,
    50
  );
  const messages = messagesData?.messages || [];

  const { data: stats, isLoading: isLoadingStats } = useChatStats();

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const createConversationMutation = useCreateConversation();
  const searchUsersMutation = useSearchUsers();
  const assignConversationMutation = useAssignConversation();
  const updateSettingsMutation = useUpdateConversationSettings();
  const archiveConversationMutation = useArchiveConversation();

  // Filter messages based on search
  const filteredMessages = messageSearchTerm
    ? messages.filter(msg => msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase()))
    : messages;

  // Get typing users for active conversation
  const activeConversationTypingUsers = activeConversation
    ? typingUsers.get(activeConversation.id) || new Set()
    : new Set();

  useEffect(() => {
    if (isOpen && initialConversationId) {
      const initialConv = conversations.find(c => c.id === initialConversationId);
      if (initialConv) {
        setActiveConversation(initialConv);
      }
    }
  }, [isOpen, initialConversationId, conversations]);

  // Listen for custom event to start conversation with a specific user
  useEffect(() => {
    const handleStartConversationWithUser = (event: CustomEvent) => {
      const user = event.detail;
      setSelectedUser(user);
      setShowNewConversation(true);
    };

    const chatSystem = document.querySelector('[data-chat-system]');
    if (chatSystem) {
      chatSystem.addEventListener(
        'start-conversation-with-user',
        handleStartConversationWithUser as any
      );
    }

    return () => {
      if (chatSystem) {
        chatSystem.removeEventListener(
          'start-conversation-with-user',
          handleStartConversationWithUser as any
        );
      }
    };
  }, []);

  useEffect(() => {
    if (activeConversation?.id) {
      // Join conversation room
      joinConversation(activeConversation.id);

      // Mark messages as read
      if (activeConversation.unreadCount > 0) {
        markAsReadMutation.mutate({ conversationId: activeConversation.id });
        markAsReadWebSocket(activeConversation.id);
      }

      return () => {
        // Leave conversation room when switching
        leaveConversation(activeConversation.id);
      };
    }
  }, [activeConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // Send via API
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversation.id,
        content: newMessage.trim(),
        type: 'text',
      });

      // Also send via WebSocket for real-time delivery
      sendWebSocketMessage(activeConversation.id, newMessage.trim());

      setNewMessage('');
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!activeConversation) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing indicator
    sendTypingIndicator(activeConversation.id, true);

    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      sendTypingIndicator(activeConversation.id, false);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) return;

    try {
      const results = await searchUsersMutation.mutateAsync({
        query: userSearchQuery,
      });
      return results;
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
      return [];
    }
  };

  // Debounced user search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (userSearchQuery.trim() && showNewConversation) {
        const results = await handleSearchUsers();
        setSearchResults(results || []);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, showNewConversation]);

  const handleCreateConversation = async () => {
    if (!selectedUser) return;

    try {
      const newConversation = await createConversationMutation.mutateAsync({
        type: 'support',
        participants: [selectedUser.id],
        title: `Support chat with ${selectedUser.name}`,
      });

      setActiveConversation(newConversation);
      setShowNewConversation(false);
      setSelectedUser(null);
      setUserSearchQuery('');
      toast.success('New conversation created');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const handleAssignToMe = async (conversationId: string) => {
    if (!user) return;

    try {
      await assignConversationMutation.mutateAsync({
        conversationId,
        adminId: user.id,
      });
      toast.success('Conversation assigned to you');
    } catch (error) {
      console.error('Failed to assign conversation:', error);
      toast.error('Failed to assign conversation');
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await archiveConversationMutation.mutateAsync(conversationId);
      toast.success('Conversation archived');
      setActiveConversation(null);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      toast.error('Failed to archive conversation');
    }
  };

  const handleUpdatePriority = async (
    conversationId: string,
    priority: 'high' | 'medium' | 'low'
  ) => {
    try {
      await updateSettingsMutation.mutateAsync({
        conversationId,
        settings: { priority },
      });
      toast.success('Priority updated');
    } catch (error) {
      console.error('Failed to update priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return '👤';
      case 'vendor':
        return '🏪';
      case 'admin':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-chat-system
      className={cn(
        'fixed right-4 bottom-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300',
        isMinimized ? 'h-16 w-80' : 'h-[700px] w-[1000px]'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <MessageCircle className='h-6 w-6 text-blue-600' />
          <div>
            <h3 className='font-semibold text-gray-900'>Admin Chat System</h3>
            <div className='flex items-center gap-2 text-sm'>
              {isConnected ? (
                <span className='text-green-600 flex items-center gap-1'>
                  <div className='w-2 h-2 bg-green-500 rounded-full' />
                  Connected
                </span>
              ) : connectionError ? (
                <span className='text-red-600 flex items-center gap-1'>
                  <AlertCircle className='h-3 w-3' />
                  {connectionError}
                  <button
                    onClick={retryConnection}
                    className='ml-2 text-xs underline hover:no-underline'
                  >
                    Retry
                  </button>
                </span>
              ) : (
                <span className='text-yellow-600 flex items-center gap-1'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Connecting...
                </span>
              )}
              <span className='text-gray-600'>• {onlineUsers.size} users online</span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {stats && (
            <div className='flex items-center gap-4 mr-4 text-sm'>
              <span className='text-gray-600'>
                <span className='font-medium'>{stats.activeConversations}</span> active
              </span>
              <span className='text-gray-600'>
                <span className='font-medium'>{stats.unassignedConversations}</span> unassigned
              </span>
            </div>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className='p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
          >
            {isMinimized ? <Maximize2 className='h-4 w-4' /> : <Minimize2 className='h-4 w-4' />}
          </button>
          <button
            onClick={onToggle}
            className='p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className='flex h-[calc(100%-80px)]'>
          {/* Conversations List */}
          <div className='w-1/3 border-r border-gray-200 flex flex-col'>
            {/* Search and Filters */}
            <div className='p-4 border-b border-gray-200'>
              <div className='relative mb-3'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search conversations...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50'
                >
                  <Filter className='h-4 w-4' />
                  Filters
                </button>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className='flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  <Plus className='h-4 w-4' />
                  New
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className='p-4 border-b border-gray-200 bg-gray-50'>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <select
                    value={filter.type || ''}
                    onChange={e =>
                      setFilter(prev => ({ ...prev, type: e.target.value || undefined }))
                    }
                    className='px-2 py-1 border border-gray-300 rounded'
                  >
                    <option value=''>All Types</option>
                    <option value='customer_vendor'>Customer-Vendor</option>
                    <option value='support'>Support</option>
                    <option value='dispute'>Dispute</option>
                    <option value='bargaining'>Bargaining</option>
                  </select>
                  <select
                    value={filter.priority || ''}
                    onChange={e =>
                      setFilter(prev => ({ ...prev, priority: e.target.value || undefined }))
                    }
                    className='px-2 py-1 border border-gray-300 rounded'
                  >
                    <option value=''>All Priorities</option>
                    <option value='high'>High</option>
                    <option value='medium'>Medium</option>
                    <option value='low'>Low</option>
                  </select>
                </div>
                <div className='flex gap-2 mt-2'>
                  <label className='flex items-center gap-1 text-sm'>
                    <input
                      type='checkbox'
                      checked={filter.status === 'active'}
                      onChange={e =>
                        setFilter(prev => ({
                          ...prev,
                          status: e.target.checked ? 'active' : undefined,
                        }))
                      }
                    />
                    Active only
                  </label>
                  <label className='flex items-center gap-1 text-sm'>
                    <input
                      type='checkbox'
                      checked={filter.assignedTo === user?.id}
                      onChange={e =>
                        setFilter(prev => ({
                          ...prev,
                          assignedTo: e.target.checked ? user?.id : undefined,
                        }))
                      }
                    />
                    Assigned to me
                  </label>
                </div>
              </div>
            )}

            {/* Conversations */}
            <div className='flex-1 overflow-y-auto'>
              {isLoadingConversations ? (
                <div className='flex items-center justify-center h-full'>
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                </div>
              ) : conversations.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                  <MessageCircle className='h-12 w-12 mb-2' />
                  <p>No conversations found</p>
                </div>
              ) : (
                conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                    className={cn(
                      'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                      activeConversation?.id === conversation.id && 'bg-blue-50 border-blue-200'
                    )}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3 flex-1'>
                        <div className='relative'>
                          <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold'>
                            {conversation.participants[0]?.userName?.charAt(0) || '?'}
                          </div>
                          <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center'>
                            <span className='text-xs'>
                              {getTypeIcon(conversation.participants[0]?.userType)}
                            </span>
                          </div>
                          {onlineUsers.has(conversation.participants[0]?.userId) && (
                            <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium text-gray-900 truncate'>
                              {conversation.title || conversation.participants[0]?.userName}
                            </p>
                            {conversation.metadata?.priority && (
                              <span
                                className={cn(
                                  'px-2 py-1 text-xs rounded-full',
                                  getPriorityColor(conversation.metadata.priority)
                                )}
                              >
                                {conversation.metadata.priority}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className='text-sm text-gray-600 truncate mt-1'>
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          <div className='flex items-center gap-2 mt-2 text-xs'>
                            <span className='text-gray-500'>
                              {conversation.type.replace('_', ' ')}
                            </span>
                            {conversation.metadata?.assignedTo && (
                              <>
                                <span>•</span>
                                <span className='text-gray-500'>
                                  {conversation.metadata.assignedTo === user?.id
                                    ? 'Assigned to you'
                                    : 'Assigned'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        {conversation.lastMessage && (
                          <p className='text-xs text-gray-500'>
                            {formatDistanceToNow(new Date(conversation.lastMessage.sentAt), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className='inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full mt-1'>
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className='flex-1 flex flex-col'>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className='p-4 border-b border-gray-200 bg-white'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold'>
                        {activeConversation.participants[0]?.userName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          {activeConversation.title || activeConversation.participants[0]?.userName}
                        </h4>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <span className='capitalize'>
                            {activeConversation.participants[0]?.userType}
                          </span>
                          <span>•</span>
                          <span
                            className={cn(
                              'flex items-center gap-1',
                              onlineUsers.has(activeConversation.participants[0]?.userId)
                                ? 'text-green-600'
                                : 'text-gray-500'
                            )}
                          >
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full',
                                onlineUsers.has(activeConversation.participants[0]?.userId)
                                  ? 'bg-green-500'
                                  : 'bg-gray-400'
                              )}
                            />
                            {onlineUsers.has(activeConversation.participants[0]?.userId)
                              ? 'Online'
                              : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {!activeConversation.metadata?.assignedTo && (
                        <button
                          onClick={() => handleAssignToMe(activeConversation.id)}
                          className='flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                        >
                          <UserPlus className='h-4 w-4' />
                          Assign to me
                        </button>
                      )}
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <Phone className='h-4 w-4' />
                      </button>
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <Video className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => setShowParticipants(!showParticipants)}
                        className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'
                      >
                        <Info className='h-4 w-4' />
                      </button>
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <MoreVertical className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Search */}
                {messageSearchTerm && (
                  <div className='px-4 py-2 bg-yellow-50 border-b border-yellow-200'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-yellow-800'>
                        Searching for "{messageSearchTerm}" - {filteredMessages.length} results
                      </span>
                      <button
                        onClick={() => setMessageSearchTerm('')}
                        className='text-yellow-800 hover:text-yellow-900'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                  {isLoadingMessages ? (
                    <div className='flex items-center justify-center h-full'>
                      <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                      <MessageCircle className='h-12 w-12 mb-2' />
                      <p>{messageSearchTerm ? 'No messages found' : 'No messages yet'}</p>
                    </div>
                  ) : (
                    filteredMessages.map(message => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-3',
                          message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0'>
                          {activeConversation.participants
                            .find(p => p.userId === message.senderId)
                            ?.userName?.charAt(0) || 'A'}
                        </div>
                        <div
                          className={cn(
                            'max-w-xs lg:max-w-md',
                            message.senderId === user?.id ? 'items-end' : 'items-start'
                          )}
                        >
                          <div
                            className={cn(
                              'px-4 py-2 rounded-2xl',
                              message.senderId === user?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            )}
                          >
                            <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
                          </div>
                          <div className='flex items-center gap-2 mt-1'>
                            <p className='text-xs text-gray-500'>
                              {format(new Date(message.sentAt), 'HH:mm')}
                            </p>
                            {message.senderId === user?.id && message.readBy && (
                              <div className='flex items-center gap-1'>
                                {message.readBy.length > 0 ? (
                                  <CheckCheck className='h-3 w-3 text-blue-500' />
                                ) : (
                                  <Check className='h-3 w-3 text-gray-400' />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing indicator */}
                  {activeConversationTypingUsers.size > 0 && (
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                      <div className='flex space-x-1'>
                        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                        <div
                          className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.2s' }}
                        />
                      </div>
                      <span>Someone is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className='p-4 border-t border-gray-200'>
                  <div className='flex items-end gap-3'>
                    <div className='flex-1'>
                      <textarea
                        ref={messageInputRef}
                        value={newMessage}
                        onChange={e => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder='Type your message...'
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                        rows={1}
                        disabled={!isConnected}
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <Paperclip className='h-5 w-5' />
                      </button>
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <Image className='h-5 w-5' />
                      </button>
                      <GlowingButton
                        onClick={handleSendMessage}
                        disabled={
                          !newMessage.trim() || !isConnected || sendMessageMutation.isPending
                        }
                        size='sm'
                        variant='primary'
                        icon={
                          sendMessageMutation.isPending ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <Send className='h-4 w-4' />
                          )
                        }
                      >
                        Send
                      </GlowingButton>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center'>
                <div className='text-center'>
                  <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a conversation</h3>
                  <p className='text-gray-600'>
                    Choose a conversation from the list or start a new one
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          {showParticipants && activeConversation && (
            <div className='w-80 border-l border-gray-200 bg-gray-50'>
              <div className='p-4 border-b border-gray-200'>
                <h4 className='font-medium text-gray-900'>Conversation Details</h4>
              </div>
              <div className='p-4 space-y-4'>
                <div>
                  <h5 className='font-medium text-gray-900 mb-2'>Participants</h5>
                  <div className='space-y-2'>
                    {activeConversation.participants.map(participant => (
                      <div
                        key={participant.userId}
                        className='flex items-center gap-3 p-2 bg-white rounded-lg'
                      >
                        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                          {participant.userName?.charAt(0)}
                        </div>
                        <div className='flex-1'>
                          <p className='font-medium text-gray-900'>{participant.userName}</p>
                          <p className='text-sm text-gray-600 capitalize'>{participant.userType}</p>
                        </div>
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            onlineUsers.has(participant.userId) ? 'bg-green-500' : 'bg-gray-400'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {activeConversation.metadata?.tags &&
                  activeConversation.metadata.tags.length > 0 && (
                    <div>
                      <h5 className='font-medium text-gray-900 mb-2'>Tags</h5>
                      <div className='flex flex-wrap gap-2'>
                        {activeConversation.metadata.tags.map(tag => (
                          <span
                            key={tag}
                            className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <h5 className='font-medium text-gray-900 mb-2'>Actions</h5>
                  <div className='space-y-2'>
                    <select
                      value={activeConversation.metadata?.priority || 'medium'}
                      onChange={e =>
                        handleUpdatePriority(activeConversation.id, e.target.value as any)
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg'
                    >
                      <option value='high'>High Priority</option>
                      <option value='medium'>Medium Priority</option>
                      <option value='low'>Low Priority</option>
                    </select>
                    <button
                      onClick={() => handleArchiveConversation(activeConversation.id)}
                      className='w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
                    >
                      <Archive className='h-4 w-4' />
                      Archive Conversation
                    </button>
                    <button className='w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'>
                      <UserPlus className='h-4 w-4' />
                      Add Participant
                    </button>
                    <button className='w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'>
                      <Tag className='h-4 w-4' />
                      Manage Tags
                    </button>
                  </div>
                </div>

                <div className='text-xs text-gray-500'>
                  <p>Created: {format(new Date(activeConversation.createdAt), 'PPp')}</p>
                  <p>Updated: {format(new Date(activeConversation.updatedAt), 'PPp')}</p>
                  {activeConversation.metadata?.orderId && (
                    <p>Order ID: {activeConversation.metadata.orderId}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl p-6 w-[480px] max-h-[600px] flex flex-col'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Start New Conversation</h3>
              <button
                onClick={() => {
                  setShowNewConversation(false);
                  setSelectedUser(null);
                  setUserSearchQuery('');
                  setSearchResults([]);
                }}
                className='p-1 rounded-lg text-gray-500 hover:bg-gray-100'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='space-y-4 flex-1 overflow-hidden flex flex-col'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Search for user
                </label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                    placeholder='Enter name, email, or phone number'
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    autoFocus
                  />
                </div>
              </div>

              {/* Search Results */}
              {userSearchQuery && (
                <div className='flex-1 overflow-y-auto border border-gray-200 rounded-lg'>
                  {searchUsersMutation.isPending ? (
                    <div className='flex items-center justify-center h-32'>
                      <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className='divide-y divide-gray-100'>
                      {searchResults.map(user => (
                        <div
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className={cn(
                            'p-3 cursor-pointer hover:bg-gray-50 transition-colors',
                            selectedUser?.id === user.id && 'bg-blue-50'
                          )}
                        >
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold'>
                              {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </div>
                            <div className='flex-1'>
                              <p className='font-medium text-gray-900'>{user.name || 'No name'}</p>
                              <p className='text-sm text-gray-600'>{user.email}</p>
                              <div className='flex items-center gap-2 mt-1'>
                                <span
                                  className={cn(
                                    'px-2 py-0.5 text-xs rounded-full',
                                    user.type === 'vendor'
                                      ? 'bg-purple-100 text-purple-700'
                                      : user.type === 'customer'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                  )}
                                >
                                  {user.type}
                                </span>
                                {user.verified && (
                                  <span className='flex items-center gap-1 text-xs text-blue-600'>
                                    <CheckCircle className='h-3 w-3' />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center h-32 text-gray-500'>
                      <Users className='h-8 w-8 mb-2' />
                      <p className='text-sm'>No users found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Selected User */}
              {selectedUser && (
                <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                  <p className='text-sm font-medium text-blue-900 mb-2'>Selected User</p>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold'>
                      {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>{selectedUser.name || 'No name'}</p>
                      <p className='text-sm text-gray-600'>{selectedUser.email}</p>
                      <p className='text-xs text-gray-500 capitalize'>{selectedUser.type}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex gap-2 justify-end pt-4 border-t'>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setSelectedUser(null);
                    setUserSearchQuery('');
                    setSearchResults([]);
                  }}
                  className='px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateConversation}
                  disabled={!selectedUser || createConversationMutation.isPending}
                  className='px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {createConversationMutation.isPending && (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  {createConversationMutation.isPending ? 'Creating...' : 'Start Conversation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
