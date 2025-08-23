'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Sun, Moon, Command, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { notificationsService, NotificationItem } from '@/lib/api/services';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from admin service
  const { data: notificationResponse, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications({
      limit: 10,
      status: 'all', // Get both read and unread for display
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!session?.accessToken,
  });

  const notifications = notificationResponse?.notifications || [];
  const unreadCount = notificationResponse?.unreadCount || notifications.filter(n => !n.read).length || 0;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'success': return '🟢';
      default: return '🔵';
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await notificationsService.markAsRead(notification.id);
      refetchNotifications(); // Refresh the notifications list
    }
    
    // If there's an action URL, navigate to it
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    refetchNotifications();
  };

  return (
    <header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200/50 bg-white/80 px-4 backdrop-blur-md lg:px-6'>
      <div className='flex flex-1 items-center space-x-4'>
        <MobileMenuButton onClick={onMenuToggle} />

        <div className='relative w-full max-w-md'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3'>
            <Search className='h-4 w-4 text-gray-400' />
          </div>
          <input
            type='search'
            placeholder='Search anything...'
            className='w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20'
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            <kbd className='inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500'>
              <Command className='mr-1 h-3 w-3' />K
            </kbd>
          </div>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        {/* Theme Toggle */}
        <button className='relative rounded-xl p-2.5 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900'>
          <Sun className='h-5 w-5' />
        </button>

        {/* Notifications */}
        <div className='relative' ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className='relative rounded-xl p-2.5 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900'
          >
            <Bell className='h-5 w-5' />
            {unreadCount > 0 && (
              <span className='absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-medium text-white'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className='absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg'>
              <div className='p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-sm font-semibold text-gray-900'>
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </h3>
                  <div className='flex items-center gap-2'>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className='text-xs text-green-600 hover:text-green-700'
                      >
                        Mark All Read
                      </button>
                    )}
                    <button 
                      onClick={refetchNotifications}
                      className='text-xs text-blue-600 hover:text-blue-700'
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                
                <div className='max-h-64 overflow-y-auto'>
                  {notifications.length === 0 ? (
                    <div className='py-4 text-center text-sm text-gray-500'>
                      No notifications
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                            notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className='flex items-start space-x-2'>
                            <span className='text-sm'>{getNotificationIcon(notification.type)}</span>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between'>
                                <p className={`text-sm truncate ${
                                  notification.read ? 'font-normal text-gray-700' : 'font-medium text-gray-900'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2'></div>
                                )}
                              </div>
                              <p className='text-xs text-gray-600 mt-1'>
                                {notification.message}
                              </p>
                              <div className='flex items-center justify-between mt-1'>
                                <p className='text-xs text-gray-400'>
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                                {notification.priority && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    notification.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                    notification.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {notification.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className='border-t pt-2 mt-3'>
                  <button className='w-full text-center text-xs text-blue-600 hover:text-blue-700'>
                    View all notifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className='relative' ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className='ml-3 flex items-center space-x-3 rounded-xl bg-gray-50/50 p-2 transition-all duration-200 hover:bg-gray-100/50'
          >
            <div className='relative'>
              <div className='h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5'>
                <div className='flex h-full w-full items-center justify-center rounded-full bg-white/20'>
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session?.user?.name || 'User'}
                      className='h-full w-full rounded-full object-cover'
                    />
                  ) : (
                    <User className='h-4 w-4 text-white' />
                  )}
                </div>
              </div>
              <div className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
            </div>
            <div className='hidden text-sm sm:block text-left'>
              <p className='font-medium text-gray-900'>
                {session?.user?.name || 'Admin User'}
              </p>
              <p className='text-gray-500'>
                {session?.user?.email || 'admin@digimall.ng'}
              </p>
            </div>
            <ChevronDown className='h-4 w-4 text-gray-400' />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className='absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg'>
              <div className='p-2'>
                <div className='px-3 py-2 border-b border-gray-100'>
                  <p className='text-sm font-medium text-gray-900'>
                    {session?.user?.name || 'Admin User'}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {session?.user?.email || 'admin@digimall.ng'}
                  </p>
                </div>
                
                <div className='py-1'>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to settings
                    }}
                    className='flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg'
                  >
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className='flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
