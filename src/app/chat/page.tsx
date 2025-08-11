'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
  ChatConversation,
  Message,
  ChatParticipant,
  ChatFilter,
  TypingIndicator,
} from '@/types/chat';

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ChatFilter>({});
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const userId = 'admin-1';
  const userName = 'Admin User';

  // Mock data generator
  const generateMockData = () => {
    const participants: ChatParticipant[] = [
      {
        id: 'customer-1',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'customer',
        isOnline: true,
        avatar: undefined,
      },
      {
        id: 'customer-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        type: 'customer',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
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
        id: 'vendor-2',
        name: 'Fashion Hub Lagos',
        email: 'info@fashionhub.ng',
        type: 'vendor',
        isOnline: true,
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
      {
        id: 'staff-2',
        name: 'Mike Operations',
        email: 'mike@digimall.ng',
        type: 'staff',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000),
        role: 'Operations Manager',
        department: 'Operations',
      },
    ];

    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        participantIds: [userId, 'customer-1'],
        participants: [participants[0]],
        lastMessage: {
          id: '1',
          senderId: 'customer-1',
          senderName: 'John Doe',
          senderType: 'customer',
          content:
            "Hi, I need help with my order #12345. It's been 3 days and I haven't received any updates.",
          timestamp: new Date(Date.now() - 300000),
          type: 'text',
          readBy: [],
        },
        unreadCount: 2,
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
        participantIds: [userId, 'customer-2'],
        participants: [participants[1]],
        lastMessage: {
          id: '2',
          senderId: 'customer-2',
          senderName: 'Jane Smith',
          senderType: 'customer',
          content: 'Thank you for resolving my refund request so quickly!',
          timestamp: new Date(Date.now() - 600000),
          type: 'text',
          readBy: [],
        },
        unreadCount: 1,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 600000),
        type: 'support',
        status: 'active',
        priority: 'medium',
        tags: ['refund', 'resolved'],
        assignedTo: userId,
      },
      {
        id: '3',
        participantIds: [userId, 'vendor-1'],
        participants: [participants[2]],
        lastMessage: {
          id: '3',
          senderId: 'vendor-1',
          senderName: 'TechStore Nigeria',
          senderType: 'vendor',
          content: "I've updated the product inventory as requested. Please review the changes.",
          timestamp: new Date(Date.now() - 1800000),
          type: 'text',
          readBy: [userId],
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 1800000),
        type: 'direct',
        status: 'active',
        priority: 'medium',
        tags: ['inventory', 'vendor-update'],
      },
      {
        id: '4',
        participantIds: [userId, 'vendor-2'],
        participants: [participants[3]],
        lastMessage: {
          id: '4',
          senderId: userId,
          senderName: userName,
          senderType: 'admin',
          content: 'Your commission payment has been processed successfully.',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text',
          readBy: ['vendor-2'],
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 345600000),
        updatedAt: new Date(Date.now() - 3600000),
        type: 'direct',
        status: 'active',
        priority: 'low',
        tags: ['commission', 'payment'],
      },
      {
        id: '5',
        participantIds: [userId, 'staff-1'],
        participants: [participants[4]],
        lastMessage: {
          id: '5',
          senderId: 'staff-1',
          senderName: 'Sarah Support',
          senderType: 'staff',
          content: 'The weekly support report is ready for your review.',
          timestamp: new Date(Date.now() - 7200000),
          type: 'text',
          readBy: [],
        },
        unreadCount: 1,
        createdAt: new Date(Date.now() - 432000000),
        updatedAt: new Date(Date.now() - 7200000),
        type: 'direct',
        status: 'active',
        priority: 'medium',
        tags: ['internal', 'report'],
      },
      {
        id: '6',
        participantIds: [userId, 'staff-2'],
        participants: [participants[5]],
        lastMessage: {
          id: '6',
          senderId: userId,
          senderName: userName,
          senderType: 'admin',
          content: 'Please coordinate with the logistics team for the new delivery schedule.',
          timestamp: new Date(Date.now() - 10800000),
          type: 'text',
          readBy: ['staff-2'],
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 518400000),
        updatedAt: new Date(Date.now() - 10800000),
        type: 'direct',
        status: 'active',
        priority: 'high',
        tags: ['internal', 'logistics'],
      },
    ];

    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setActiveConversation(mockConversations[0]);
      loadMessages(mockConversations[0].id);
    }
  };

  const loadMessages = (conversationId: string) => {
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'customer-1',
        senderName: 'John Doe',
        senderType: 'customer',
        content: 'Hi, I need help with my order #12345',
        timestamp: new Date(Date.now() - 600000),
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
        timestamp: new Date(Date.now() - 540000),
        type: 'text',
        readBy: ['customer-1'],
      },
      {
        id: '3',
        senderId: 'customer-1',
        senderName: 'John Doe',
        senderType: 'customer',
        content:
          "The order was placed 3 days ago but I haven't received any updates. I'm getting worried.",
        timestamp: new Date(Date.now() - 480000),
        type: 'text',
        readBy: [],
      },
      {
        id: '4',
        senderId: userId,
        senderName: userName,
        senderType: 'admin',
        content:
          'I understand your concern. I can see your order #12345 is currently being processed by our fulfillment team. You should receive a tracking number within the next 24 hours.',
        timestamp: new Date(Date.now() - 420000),
        type: 'text',
        readBy: ['customer-1'],
      },
      {
        id: '5',
        senderId: 'customer-1',
        senderName: 'John Doe',
        senderType: 'customer',
        content: "That's great to hear! Will I receive an email notification when it ships?",
        timestamp: new Date(Date.now() - 360000),
        type: 'text',
        readBy: [],
      },
      {
        id: '6',
        senderId: userId,
        senderName: userName,
        senderType: 'admin',
        content:
          "Yes, absolutely! You'll receive an email with the tracking number and estimated delivery date. Is there anything else I can help you with?",
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        readBy: ['customer-1'],
      },
    ];

    setMessages(mockMessages);
  };

  useEffect(() => {
    generateMockData();
  }, []);

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

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className='h-screen flex bg-gray-50'>
      {/* Sidebar - Conversation List */}
      <div className='w-80 bg-white border-r border-gray-200 flex flex-col'>
        {/* Sidebar Header */}
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

          {/* Search */}
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

        {/* Filters */}
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

        {/* Conversations List */}
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

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col bg-white'>
        {activeConversation ? (
          <>
            {/* Chat Header */}
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

            {/* Messages Area */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {messages.map((message, index) => {
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

            {/* Message Input */}
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
                  disabled={!newMessage.trim()}
                  className='p-3 bg-primary text-white rounded-full hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                >
                  <Send className='h-4 w-4' />
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
