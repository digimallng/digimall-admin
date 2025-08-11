'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'orders' | 'users' | 'products' | 'payments' | 'system';
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'iPhone 15 Pro Max is running low on stock (5 units remaining)',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    category: 'products',
    priority: 'high',
    actionUrl: '/products',
  },
  {
    id: '2',
    type: 'success',
    title: 'Payment Received',
    message: 'Payment of ₦85,000 received from John Doe for Order #12345',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    category: 'payments',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'error',
    title: 'Failed Payment',
    message: 'Payment failed for Order #12346. Customer card was declined.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: true,
    category: 'payments',
    priority: 'high',
  },
  {
    id: '4',
    type: 'info',
    title: 'New Vendor Registration',
    message: 'TechHub Nigeria has submitted a vendor application for review',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: false,
    category: 'users',
    priority: 'medium',
  },
  {
    id: '5',
    type: 'success',
    title: 'Order Completed',
    message: 'Order #12344 has been successfully delivered to customer',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    category: 'orders',
    priority: 'low',
  },
  {
    id: '6',
    type: 'warning',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will begin at 2:00 AM tomorrow',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    category: 'system',
    priority: 'medium',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return XCircle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'error':
        return 'from-red-500 to-pink-600';
      case 'info':
        return 'from-blue-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
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
      default:
        return Bell;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'read' && notification.read) ||
      (filter === 'unread' && !notification.read);

    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;

    const matchesSearch =
      searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
                onClick={markAllAsRead}
                className='flex items-center gap-2'
              >
                <CheckCircle className='h-4 w-4' />
                Mark All Read
              </GlowingButton>
              <GlowingButton size='sm' variant='primary'>
                <Settings className='h-4 w-4 mr-2' />
                Settings
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-gray-500' />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as 'all' | 'unread' | 'read')}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value='all'>All Notifications</option>
              <option value='unread'>Unread</option>
              <option value='read'>Read</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Categories</option>
            <option value='orders'>Orders</option>
            <option value='users'>Users</option>
            <option value='products'>Products</option>
            <option value='payments'>Payments</option>
            <option value='system'>System</option>
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

      {/* Notifications List */}
      <div className='space-y-4'>
        {filteredNotifications.length === 0 ? (
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
          filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const CategoryIcon = getCategoryIcon(notification.category);

            return (
              <AnimatedCard
                key={notification.id}
                delay={index * 50}
                className={cn(
                  'group cursor-pointer transition-all duration-200',
                  !notification.read && 'border-l-4 border-blue-500 bg-blue-50/20'
                )}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className='p-6'>
                  <div className='flex items-start gap-4'>
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
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              )}
                            >
                              {notification.title}
                            </h3>
                            <CategoryIcon className='h-4 w-4 text-gray-400' />
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                notification.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : notification.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              )}
                            >
                              {notification.priority}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'text-sm mb-2',
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            )}
                          >
                            {notification.message}
                          </p>
                          <div className='flex items-center gap-2 text-xs text-gray-500'>
                            <Clock className='h-3 w-3' />
                            {format(notification.timestamp, 'MMM dd, yyyy - hh:mm a')}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-2 ml-4'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors'
                            title={notification.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {notification.read ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className='rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors'
                            title='Delete notification'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                          <button className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors'>
                            <MoreVertical className='h-4 w-4' />
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
      {filteredNotifications.length > 0 && (
        <div className='text-center'>
          <GlowingButton variant='secondary' size='sm'>
            Load More Notifications
          </GlowingButton>
        </div>
      )}
    </div>
  );
}
