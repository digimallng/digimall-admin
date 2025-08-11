'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Bell, User, Store, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ChatNotification } from '@/types/chat';

interface ChatNotificationsProps {
  notifications: ChatNotification[];
  onNotificationClick: (notification: ChatNotification) => void;
  onNotificationDismiss: (notificationId: string) => void;
  onMarkAllRead: () => void;
}

export function ChatNotifications({
  notifications,
  onNotificationClick,
  onNotificationDismiss,
  onMarkAllRead,
}: ChatNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<ChatNotification[]>([]);

  useEffect(() => {
    // Show only the most recent 3 notifications
    setVisibleNotifications(
      notifications
        .filter(n => !n.read)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 3)
    );
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageCircle className='h-5 w-5 text-blue-500' />;
      case 'mention':
        return <User className='h-5 w-5 text-purple-500' />;
      case 'assignment':
        return <UserCheck className='h-5 w-5 text-green-500' />;
      case 'priority_change':
        return <Bell className='h-5 w-5 text-orange-500' />;
      default:
        return <MessageCircle className='h-5 w-5 text-gray-500' />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'new_message':
        return 'bg-blue-50 border-blue-200';
      case 'mention':
        return 'bg-purple-50 border-purple-200';
      case 'assignment':
        return 'bg-green-50 border-green-200';
      case 'priority_change':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {visibleNotifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            'max-w-sm bg-white rounded-lg shadow-lg border-l-4 p-4 animate-in slide-in-from-right-2',
            getNotificationBgColor(notification.type)
          )}
        >
          <div className='flex items-start gap-3'>
            {getNotificationIcon(notification.type)}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <p className='font-medium text-gray-900 text-sm'>{notification.title}</p>
                <button
                  onClick={() => onNotificationDismiss(notification.id)}
                  className='text-gray-400 hover:text-gray-600 p-1'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
              <p className='text-sm text-gray-600 mt-1'>{notification.content}</p>
              <div className='flex items-center justify-between mt-2'>
                <p className='text-xs text-gray-500'>
                  {notification.timestamp.toLocaleTimeString()}
                </p>
                <button
                  onClick={() => onNotificationClick(notification)}
                  className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {notifications.filter(n => !n.read).length > 3 && (
        <div className='bg-white rounded-lg shadow-lg border p-3 text-center'>
          <p className='text-sm text-gray-600'>
            +{notifications.filter(n => !n.read).length - 3} more notifications
          </p>
          <button
            onClick={onMarkAllRead}
            className='text-xs text-blue-600 hover:text-blue-800 font-medium mt-1'
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
