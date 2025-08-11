'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Search,
  Filter,
  Archive,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ChevronDown,
  Loader2,
  Plus,
  Settings,
  Circle,
  ArrowLeft,
  Phone,
  Video,
  Info,
  MoreVertical,
  X,
  Maximize2,
  Minimize2,
  Bell,
} from 'lucide-react';
import { useConversations, useChatStats } from '@/hooks/use-chat';
import { ConversationQuery } from '@/lib/api/services/chat.service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { InlineChat } from '@/components/chat/InlineChat';
import { useSearchParams } from 'next/navigation';
import { useChatWebSocket } from '@/providers/chat-websocket-provider';

type ViewMode = 'conversations' | 'chat' | 'info';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversationId');

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('conversations');
  const [isMinimized, setIsMinimized] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'archived'>('all');
  const [isDesktop, setIsDesktop] = useState(false);

  const { data: conversationsData, isLoading, error, refetch } = useConversations({
    search: searchTerm || undefined,
    limit: 50,
  });
  const { data: stats } = useChatStats();
  const { isConnected, onlineUsers } = useChatWebSocket();

  const conversations = conversationsData?.conversations || [];
  const filteredConversations = conversations.filter(conversation => {
    if (filterStatus === 'unread') return conversation.unreadCount > 0;
    if (filterStatus === 'archived') return conversation.metadata?.archived;
    return !conversation.metadata?.archived;
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-select first conversation on desktop
  useEffect(() => {
    if (filteredConversations.length > 0 && !selectedConversationId && isDesktop) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId, isDesktop]);

  // Auto-open conversation from URL parameter
  useEffect(() => {
    if (conversationIdFromUrl) {
      setSelectedConversationId(conversationIdFromUrl);
      if (!isDesktop) {
        setViewMode('chat');
      }
    }
  }, [conversationIdFromUrl, isDesktop]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setViewMode('chat');
  };

  const handleBackToConversations = () => {
    setViewMode('conversations');
    setSelectedConversationId(null);
  };

  const handleShowInfo = () => {
    setViewMode('info');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'text-blue-600 bg-blue-50';
      case 'dispute':
        return 'text-red-600 bg-red-50';
      case 'bargaining':
        return 'text-purple-600 bg-purple-50';
      case 'customer_vendor':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations Sidebar */}
      <div
        className={`${
          viewMode === 'conversations' || isDesktop ? 'flex' : 'hidden'
        } w-full lg:w-80 xl:w-96 flex-col bg-gray-50 border-r border-gray-200 ${
          isMinimized ? 'lg:w-16' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            {!isMinimized && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Circle
                    className={`h-2 w-2 fill-current ${
                      isConnected ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  <span>{isConnected ? 'Online' : 'Offline'}</span>
                  <span>•</span>
                  <span>{filteredConversations.length} conversations</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
            {!isMinimized && (
              <>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="h-5 w-5 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Stats Bar */}
            {stats && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stats.activeConversations}</div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{stats.unassignedConversations}</div>
                    <div className="text-xs text-gray-600">Unassigned</div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="p-4 space-y-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                {[
                  { key: 'all', label: 'All', count: conversations.length },
                  {
                    key: 'unread',
                    label: 'Unread',
                    count: conversations.filter(c => c.unreadCount > 0).length,
                  },
                  {
                    key: 'archived',
                    label: 'Archived',
                    count: conversations.filter(c => c.metadata?.archived).length,
                  },
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterStatus(filter.key as any)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filterStatus === filter.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{filter.label}</span>
                    {filter.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs ${
                          filterStatus === filter.key
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                  <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations found</h3>
                  <p className="text-xs text-gray-500">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Customer conversations will appear here'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map(conversation => {
                    const customer = conversation.participants.find(p => p.userType !== 'admin');
                    const isSelected = selectedConversationId === conversation.id;
                    const hasUnread = conversation.unreadCount > 0;
                    const isOnline = customer?.isOnline || onlineUsers.has(customer?.userId || '');

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => handleConversationSelect(conversation.id)}
                        className={`relative p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {customer?.userName?.charAt(0) || '?'}
                            </div>
                            {isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3
                                className={`font-medium truncate ${
                                  hasUnread ? 'text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                {customer?.userName || conversation.title || 'Unknown User'}
                              </h3>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">
                                  {conversation.lastMessage &&
                                    formatTime(
                                      conversation.lastMessage.sentAt || conversation.updatedAt
                                    )}
                                </span>
                                {hasUnread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm truncate ${
                                  hasUnread
                                    ? 'font-medium text-gray-900'
                                    : 'text-gray-500'
                                }`}
                              >
                                {conversation.lastMessage?.content || 'Start a conversation'}
                              </p>
                              {hasUnread && (
                                <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full min-w-[20px] text-center">
                                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                </span>
                              )}
                            </div>

                            {/* Type and Priority Tags */}
                            <div className="flex gap-1 mt-2">
                              <span
                                className={cn(
                                  'px-2 py-0.5 text-xs rounded-full',
                                  getTypeColor(conversation.type)
                                )}
                              >
                                {conversation.type.replace('_', ' ')}
                              </span>
                              {conversation.metadata?.priority && (
                                <span
                                  className={cn(
                                    'px-2 py-0.5 text-xs rounded-full',
                                    getPriorityColor(conversation.metadata.priority)
                                  )}
                                >
                                  {conversation.metadata.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div
          className={`${
            viewMode === 'chat' || isDesktop ? 'flex' : 'hidden'
          } flex-1 flex-col bg-white relative overflow-hidden`}
        >
          <InlineChat conversationId={selectedConversationId} onBack={handleBackToConversations} />
        </div>
      ) : (
        // Empty State
        <div
          className={`${
            viewMode === 'chat' || isDesktop ? 'flex' : 'hidden'
          } flex-1 items-center justify-center bg-white`}
        >
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <MessageCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Choose a conversation from the sidebar to start providing customer support.
            </p>
          </div>
        </div>
      )}

      {/* Info Sidebar - Mobile overlay */}
      {viewMode === 'info' && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Conversation Info</h3>
                <button
                  onClick={() => setViewMode('chat')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mx-auto mb-3">
                  {selectedConversation.participants
                    .find(p => p.userType !== 'admin')
                    ?.userName?.charAt(0) || '?'}
                </div>
                <h4 className="font-semibold text-gray-900">
                  {selectedConversation.participants.find(p => p.userType !== 'admin')?.userName ||
                    'Unknown User'}
                </h4>
                <p className="text-sm text-gray-500">Customer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
