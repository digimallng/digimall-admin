'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  RefreshCw,
  Zap,
  Shield,
  Gift,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { 
  notificationsService, 
  NotificationItem, 
  NotificationFilters 
} from '@/lib/api/services/notifications.service';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<NotificationFilters>({
    status: 'all',
    page: 1,
    limit: 20,
  });
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch notifications with real data
  const { data: notificationResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filters, searchTerm],
    queryFn: () => notificationsService.getNotifications({
      ...filters,
      searchTerm: searchTerm || undefined,
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Mutations for notification actions
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification marked as read');
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    },
  });

  const markAsUnreadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsUnread(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification marked as unread');
    },
    onError: () => {
      toast.error('Failed to mark notification as unread');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ action, notificationIds }: { action: 'mark_read' | 'mark_unread' | 'delete', notificationIds: string[] }) =>
      notificationsService.bulkAction({ action, notificationIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const actionText = variables.action === 'mark_read' ? 'marked as read' : 
                        variables.action === 'mark_unread' ? 'marked as unread' : 'deleted';
      toast.success(`${variables.notificationIds.length} notifications ${actionText}`);
      setSelectedNotifications([]);
    },
    onError: () => {
      toast.error('Failed to perform bulk action');
    },
  });

  const notifications = notificationResponse?.notifications || [];
  const unreadCount = notificationResponse?.unreadCount || 0;
  const totalPages = notificationResponse?.totalPages || 1;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return XCircle;
      case 'info':
        return Info;
      case 'system':
        return Settings;
      case 'order':
        return ShoppingCart;
      case 'payment':
        return DollarSign;
      case 'vendor':
        return Users;
      case 'security':
        return Shield;
      case 'promotion':
        return Gift;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'error':
        return 'from-red-500 to-pink-600';
      case 'info':
        return 'from-blue-500 to-purple-600';
      case 'system':
        return 'from-gray-500 to-slate-600';
      case 'order':
        return 'from-blue-500 to-indigo-600';
      case 'payment':
        return 'from-green-500 to-teal-600';
      case 'vendor':
        return 'from-purple-500 to-violet-600';
      case 'security':
        return 'from-red-500 to-rose-600';
      case 'promotion':
        return 'from-pink-500 to-rose-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'orders':
        return ShoppingCart;
      case 'users':
        return Users;
      case 'products':
        return Package;
      case 'payments':
        return DollarSign;
      case 'system':
        return Settings;
      case 'security':
        return Shield;
      case 'vendor_management':
        return Users;
      case 'disputes':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read && !notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleBulkAction = (action: 'mark_read' | 'mark_unread' | 'delete') => {
    if (selectedNotifications.length === 0) {
      toast.error('Please select notifications first');
      return;
    }
    bulkActionMutation.mutate({ action, notificationIds: selectedNotifications });
  };

  const updateFilters = (newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const loadMoreNotifications = () => {
    if (filters.page && filters.page < totalPages) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  };

  if (error) {
    return (
      <div className='space-y-8'>
        <AnimatedCard className='text-center py-12'>
          <div className='flex flex-col items-center gap-4'>
            <div className='rounded-full bg-red-100 p-4'>
              <XCircle className='h-8 w-8 text-red-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Error Loading Notifications</h3>
              <p className='text-gray-600 mb-4'>Failed to connect to notification service</p>
              <GlowingButton onClick={() => refetch()} variant='primary'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Retry
              </GlowingButton>
            </div>
          </div>
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Notifications
              </h1>
              <p className='text-gray-600 mt-2 flex items-center gap-2'>
                <Bell className='h-4 w-4' />
                {unreadCount} unread notifications
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <GlowingButton
                size='sm'
                variant='secondary'
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                Refresh
              </GlowingButton>
              <GlowingButton
                size='sm'
                variant='secondary'
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                className='flex items-center gap-2'
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <CheckCircle className='h-4 w-4' />
                )}
                Mark All Read
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
        <div className='flex flex-wrap items-center gap-4'>
          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className='flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2'>
              <span className='text-sm text-blue-700 font-medium'>
                {selectedNotifications.length} selected
              </span>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => handleBulkAction('mark_read')}
                  className='p-1 text-blue-600 hover:text-blue-800 transition-colors'
                  title='Mark as read'
                >
                  <Eye className='h-4 w-4' />
                </button>
                <button
                  onClick={() => handleBulkAction('mark_unread')}
                  className='p-1 text-blue-600 hover:text-blue-800 transition-colors'
                  title='Mark as unread'
                >
                  <EyeOff className='h-4 w-4' />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className='p-1 text-red-600 hover:text-red-800 transition-colors'
                  title='Delete'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
          )}

          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-gray-500' />
            <select
              value={filters.status}
              onChange={e => updateFilters({ status: e.target.value as 'all' | 'unread' | 'read' })}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value='all'>All Notifications</option>
              <option value='unread'>Unread</option>
              <option value='read'>Read</option>
            </select>
          </div>

          <select
            value={filters.type || 'all'}
            onChange={e => updateFilters({ type: e.target.value === 'all' ? undefined : e.target.value })}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Types</option>
            <option value='info'>Info</option>
            <option value='success'>Success</option>
            <option value='warning'>Warning</option>
            <option value='error'>Error</option>
            <option value='system'>System</option>
            <option value='order'>Orders</option>
            <option value='payment'>Payments</option>
            <option value='vendor'>Vendors</option>
            <option value='security'>Security</option>
            <option value='promotion'>Promotions</option>
          </select>

          <select
            value={filters.priority || 'all'}
            onChange={e => updateFilters({ priority: e.target.value === 'all' ? undefined : e.target.value })}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Priorities</option>
            <option value='urgent'>Urgent</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>
        </div>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='search'
            placeholder='Search notifications...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Select All */}
      {notifications.length > 0 && (
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <button
            onClick={handleSelectAll}
            className='flex items-center gap-2 hover:text-gray-900 transition-colors'
          >
            {selectedNotifications.length === notifications.length ? (
              <CheckSquare className='h-4 w-4' />
            ) : (
              <Square className='h-4 w-4' />
            )}
            Select All
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className='space-y-4'>
        {isLoading && notifications.length === 0 ? (
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <AnimatedCard key={i} className='p-6'>
                <div className='animate-pulse flex items-start gap-4'>
                  <div className='rounded-xl bg-gray-200 h-12 w-12' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-3/4' />
                    <div className='h-3 bg-gray-200 rounded w-1/2' />
                    <div className='h-3 bg-gray-200 rounded w-1/4' />
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <AnimatedCard className='text-center py-12'>
            <div className='flex flex-col items-center gap-4'>
              <div className='rounded-full bg-gray-100 p-4'>
                <Bell className='h-8 w-8 text-gray-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>No notifications found</h3>
                <p className='text-gray-600'>Try adjusting your filters or search terms</p>
              </div>
            </div>
          </AnimatedCard>
        ) : (
          notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const CategoryIcon = getCategoryIcon(notification.category);
            const isRead = notification.read || notification.isRead;
            const isSelected = selectedNotifications.includes(notification.id);

            return (
              <AnimatedCard
                key={notification.id}
                delay={index * 50}
                className={cn(
                  'group cursor-pointer transition-all duration-200 hover:shadow-md',
                  !isRead && 'border-l-4 border-blue-500 bg-blue-50/20',
                  isSelected && 'ring-2 ring-blue-500 bg-blue-50/30'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className='p-6'>
                  <div className='flex items-start gap-4'>
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNotification(notification.id);
                      }}
                      className='mt-1 text-gray-400 hover:text-blue-600 transition-colors'
                    >
                      {isSelected ? (
                        <CheckSquare className='h-4 w-4' />
                      ) : (
                        <Square className='h-4 w-4' />
                      )}
                    </button>

                    {/* Icon */}
                    <div
                      className={cn(
                        'rounded-xl p-3 bg-gradient-to-r transition-all duration-300',
                        getNotificationColor(notification.type),
                        'group-hover:scale-110'
                      )}
                    >
                      <Icon className='h-5 w-5 text-white' />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3
                              className={cn(
                                'text-sm font-semibold',
                                isRead ? 'text-gray-700' : 'text-gray-900'
                              )}
                            >
                              {notification.title}
                            </h3>
                            <CategoryIcon className='h-4 w-4 text-gray-400' />
                            {notification.priority && (
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                  notification.priority === 'urgent'
                                    ? 'bg-red-100 text-red-800'
                                    : notification.priority === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : notification.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                )}
                              >
                                {notification.priority}
                              </span>
                            )}
                            {!isRead && (
                              <div className='w-2 h-2 bg-blue-500 rounded-full' />
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-sm mb-2',
                              isRead ? 'text-gray-500' : 'text-gray-700'
                            )}
                          >
                            {notification.message}
                          </p>
                          <div className='flex items-center gap-2 text-xs text-gray-500'>
                            <Clock className='h-3 w-3' />
                            {format(new Date(notification.timestamp), 'MMM dd, yyyy - hh:mm a')}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-2 ml-4'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (isRead) {
                                markAsUnreadMutation.mutate(notification.id);
                              } else {
                                markAsReadMutation.mutate(notification.id);
                              }
                            }}
                            className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors'
                            title={isRead ? 'Mark as unread' : 'Mark as read'}
                            disabled={markAsReadMutation.isPending || markAsUnreadMutation.isPending}
                          >
                            {isRead ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this notification?')) {
                                deleteNotificationMutation.mutate(notification.id);
                              }
                            }}
                            className='rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors'
                            title='Delete notification'
                            disabled={deleteNotificationMutation.isPending}
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            );
          })
        )}
      </div>

      {/* Load More */}
      {notifications.length > 0 && filters.page && filters.page < totalPages && (
        <div className='text-center'>
          <GlowingButton 
            variant='secondary' 
            size='sm' 
            onClick={loadMoreNotifications}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Loading...
              </>
            ) : (
              'Load More Notifications'
            )}
          </GlowingButton>
        </div>
      )}

      {/* No more notifications */}
      {notifications.length > 0 && filters.page === totalPages && (
        <div className='text-center py-4'>
          <p className='text-gray-500 text-sm'>No more notifications to load</p>
        </div>
      )}
    </div>
  );
}