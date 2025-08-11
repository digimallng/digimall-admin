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
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import {
  ChatConversation,
  Message,
  ChatParticipant,
  ChatFilter,
  TypingIndicator,
} from '@/types/chat';

interface ChatSystemProps {
  isOpen: boolean;
  onToggle: () => void;
  userId: string;
  userName: string;
  initialConversationId?: string;
}

export function ChatSystem({
  isOpen,
  onToggle,
  userId,
  userName,
  initialConversationId,
}: ChatSystemProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ChatFilter>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Mock data generator
  const generateMockData = () => {
    const participants: ChatParticipant[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'customer',
        isOnline: true,
        avatar: undefined,
      },
      {
        id: '2',
        name: 'TechStore Nigeria',
        email: 'support@techstore.ng',
        type: 'vendor',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
      },
      {
        id: '3',
        name: 'Sarah Admin',
        email: 'sarah@digimall.ng',
        type: 'staff',
        isOnline: true,
        role: 'Customer Support',
        department: 'Support',
      },
    ];

    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        participantIds: [userId, '1'],
        participants: [participants[0]],
        lastMessage: {
          id: '1',
          senderId: '1',
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
        id: '2',
        participantIds: [userId, '2'],
        participants: [participants[1]],
        lastMessage: {
          id: '2',
          senderId: '2',
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
      {
        id: '3',
        participantIds: [userId, '3'],
        participants: [participants[2]],
        lastMessage: {
          id: '3',
          senderId: userId,
          senderName: userName,
          senderType: 'admin',
          content: 'Thanks for the report update',
          timestamp: new Date(Date.now() - 7200000),
          type: 'text',
          readBy: ['3'],
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 7200000),
        type: 'direct',
        status: 'active',
        priority: 'low',
        tags: ['internal'],
      },
    ];

    setConversations(mockConversations);

    if (initialConversationId) {
      const initialConv = mockConversations.find(c => c.id === initialConversationId);
      if (initialConv) {
        setActiveConversation(initialConv);
        loadMessages(initialConversationId);
      }
    }
  };

  const loadMessages = (conversationId: string) => {
    // Mock messages for the conversation
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: '1',
        senderName: 'John Doe',
        senderType: 'customer',
        content: 'Hi, I need help with my order #12345',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        readBy: [],
      },
      {
        id: '2',
        senderId: userId,
        senderName: userName,
        senderType: 'admin',
        content:
          "Hello John! I'd be happy to help you with your order. Let me look that up for you.",
        timestamp: new Date(Date.now() - 240000),
        type: 'text',
        readBy: ['1'],
      },
      {
        id: '3',
        senderId: '1',
        senderName: 'John Doe',
        senderType: 'customer',
        content: "The order was placed 3 days ago but I haven't received any updates",
        timestamp: new Date(Date.now() - 180000),
        type: 'text',
        readBy: [],
      },
      {
        id: '4',
        senderId: userId,
        senderName: userName,
        senderType: 'admin',
        content:
          'I can see your order is currently being processed by our fulfillment team. You should receive a tracking number within the next 24 hours.',
        timestamp: new Date(Date.now() - 120000),
        type: 'text',
        readBy: ['1'],
      },
    ];

    setMessages(mockMessages);
  };

  useEffect(() => {
    if (isOpen) {
      generateMockData();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      senderType: 'admin',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      readBy: [],
      replyTo: replyingTo?.id,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyingTo(null);

    // Update conversation's last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversation.id
          ? { ...conv, lastMessage: message, updatedAt: new Date() }
          : conv
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const participantMatch = conv.participants.some(
        p =>
          p.name.toLowerCase().includes(searchLower) || p.email.toLowerCase().includes(searchLower)
      );
      const messageMatch = conv.lastMessage?.content.toLowerCase().includes(searchLower);
      if (!participantMatch && !messageMatch) return false;
    }

    if (filter.type && filter.type !== 'all' && conv.type !== filter.type) return false;
    if (filter.status && filter.status !== 'all' && conv.status !== filter.status) return false;
    if (filter.priority && filter.priority !== 'all' && conv.priority !== filter.priority)
      return false;
    if (filter.unreadOnly && conv.unreadCount === 0) return false;
    if (filter.assignedToMe && conv.assignedTo !== userId) return false;

    return true;
  });

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
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getParticipantTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return '👤';
      case 'vendor':
        return '🏪';
      case 'staff':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed right-4 bottom-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300',
        isMinimized ? 'h-16 w-80' : 'h-[600px] w-[900px]'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <MessageCircle className='h-6 w-6 text-blue-600' />
          <div>
            <h3 className='font-semibold text-gray-900'>Admin Chat</h3>
            <p className='text-sm text-gray-600'>
              {conversations.filter(c => c.unreadCount > 0).length} unread
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
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
                <button className='flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
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
                    value={filter.type || 'all'}
                    onChange={e => setFilter(prev => ({ ...prev, type: e.target.value as any }))}
                    className='px-2 py-1 border border-gray-300 rounded'
                  >
                    <option value='all'>All Types</option>
                    <option value='direct'>Direct</option>
                    <option value='group'>Group</option>
                    <option value='support'>Support</option>
                  </select>
                  <select
                    value={filter.priority || 'all'}
                    onChange={e =>
                      setFilter(prev => ({ ...prev, priority: e.target.value as any }))
                    }
                    className='px-2 py-1 border border-gray-300 rounded'
                  >
                    <option value='all'>All Priorities</option>
                    <option value='urgent'>Urgent</option>
                    <option value='high'>High</option>
                    <option value='medium'>Medium</option>
                    <option value='low'>Low</option>
                  </select>
                </div>
                <div className='flex gap-2 mt-2'>
                  <label className='flex items-center gap-1 text-sm'>
                    <input
                      type='checkbox'
                      checked={filter.unreadOnly || false}
                      onChange={e => setFilter(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                    />
                    Unread only
                  </label>
                  <label className='flex items-center gap-1 text-sm'>
                    <input
                      type='checkbox'
                      checked={filter.assignedToMe || false}
                      onChange={e =>
                        setFilter(prev => ({ ...prev, assignedToMe: e.target.checked }))
                      }
                    />
                    Assigned to me
                  </label>
                </div>
              </div>
            )}

            {/* Conversations */}
            <div className='flex-1 overflow-y-auto'>
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setActiveConversation(conversation);
                    loadMessages(conversation.id);
                    // Mark as read
                    setConversations(prev =>
                      prev.map(c => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
                    );
                  }}
                  className={cn(
                    'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                    activeConversation?.id === conversation.id && 'bg-blue-50 border-blue-200'
                  )}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3 flex-1'>
                      <div className='relative'>
                        <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold'>
                          {conversation.participants[0]?.name?.charAt(0) || '?'}
                        </div>
                        <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center'>
                          <span className='text-xs'>
                            {getParticipantTypeIcon(conversation.participants[0]?.type)}
                          </span>
                        </div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium text-gray-900 truncate'>
                            {conversation.participants[0]?.name}
                          </p>
                          <span
                            className={cn(
                              'px-2 py-1 text-xs rounded-full',
                              getPriorityColor(conversation.priority)
                            )}
                          >
                            {conversation.priority}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 truncate mt-1'>
                          {conversation.lastMessage?.content}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                          <span
                            className={cn(
                              'px-2 py-1 text-xs rounded-full',
                              getStatusColor(conversation.status)
                            )}
                          >
                            {conversation.status}
                          </span>
                          {conversation.tags.map(tag => (
                            <span
                              key={tag}
                              className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs text-gray-500'>
                        {conversation.lastMessage &&
                          formatDistanceToNow(conversation.lastMessage.timestamp, {
                            addSuffix: true,
                          })}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className='inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full mt-1'>
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                        {activeConversation.participants[0]?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          {activeConversation.participants[0]?.name}
                        </h4>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <span className='capitalize'>
                            {activeConversation.participants[0]?.type}
                          </span>
                          <span>•</span>
                          <span
                            className={cn(
                              'flex items-center gap-1',
                              activeConversation.participants[0]?.isOnline
                                ? 'text-green-600'
                                : 'text-gray-500'
                            )}
                          >
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full',
                                activeConversation.participants[0]?.isOnline
                                  ? 'bg-green-500'
                                  : 'bg-gray-400'
                              )}
                            />
                            {activeConversation.participants[0]?.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
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

                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.senderId === userId ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0'>
                        {message.senderName?.charAt(0)}
                      </div>
                      <div
                        className={cn(
                          'max-w-xs lg:max-w-md',
                          message.senderId === userId ? 'items-end' : 'items-start'
                        )}
                      >
                        <div
                          className={cn(
                            'px-4 py-2 rounded-2xl',
                            message.senderId === userId
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          {message.replyTo && (
                            <div className='text-xs opacity-75 mb-1 p-2 bg-black/10 rounded border-l-2 border-white/30'>
                              Replying to previous message
                            </div>
                          )}
                          <p className='text-sm'>{message.content}</p>
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <p className='text-xs text-gray-500'>
                            {format(message.timestamp, 'HH:mm')}
                          </p>
                          {message.senderId === userId && (
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
                  ))}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
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
                      <span>
                        {typingUsers.map(u => u.userName).join(', ')}{' '}
                        {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Reply indicator */}
                {replyingTo && (
                  <div className='px-4 py-2 bg-gray-50 border-t border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Reply className='h-4 w-4 text-gray-500' />
                        <span className='text-sm text-gray-600'>
                          Replying to {replyingTo.senderName}
                        </span>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className='p-1 rounded text-gray-500 hover:bg-gray-200'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <p className='text-sm text-gray-500 mt-1 truncate'>{replyingTo.content}</p>
                  </div>
                )}

                {/* Message Input */}
                <div className='p-4 border-t border-gray-200'>
                  <div className='flex items-end gap-3'>
                    <div className='flex-1'>
                      <textarea
                        ref={messageInputRef}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder='Type your message...'
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                        rows={1}
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <Paperclip className='h-5 w-5' />
                      </button>
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <Image className='h-5 w-5' />
                      </button>
                      <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
                        <Smile className='h-5 w-5' />
                      </button>
                      <GlowingButton
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size='sm'
                        variant='primary'
                        icon={<Send className='h-4 w-4' />}
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
                    Choose a conversation from the list to start chatting
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
                        key={participant.id}
                        className='flex items-center gap-3 p-2 bg-white rounded-lg'
                      >
                        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                          {participant.name?.charAt(0)}
                        </div>
                        <div className='flex-1'>
                          <p className='font-medium text-gray-900'>{participant.name}</p>
                          <p className='text-sm text-gray-600 capitalize'>{participant.type}</p>
                        </div>
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className='font-medium text-gray-900 mb-2'>Tags</h5>
                  <div className='flex flex-wrap gap-2'>
                    {activeConversation.tags.map(tag => (
                      <span
                        key={tag}
                        className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className='font-medium text-gray-900 mb-2'>Actions</h5>
                  <div className='space-y-2'>
                    <button className='w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'>
                      <Archive className='h-4 w-4' />
                      Archive Conversation
                    </button>
                    <button className='w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'>
                      <Flag className='h-4 w-4' />
                      Change Priority
                    </button>
                    <button className='w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'>
                      <UserPlus className='h-4 w-4' />
                      Add Participant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
