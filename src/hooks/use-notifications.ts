import { useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notifications enabled');
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported]);

  // Show a notification
  const showNotification = useCallback(
    async (options: NotificationOptions) => {
      if (!isSupported) {
        // Fallback to toast notification
        toast(options.body, {
          description: options.title,
        });
        return;
      }

      if (permission !== 'granted') {
        // Try to request permission
        const granted = await requestPermission();
        if (!granted) {
          // Fallback to toast notification
          toast(options.body, {
            description: options.title,
          });
          return;
        }
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon.svg',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
          data: options.data,
        });

        // Handle notification click
        notification.onclick = event => {
          event.preventDefault();
          window.focus();
          notification.close();

          // Handle custom data if provided
          if (options.data?.conversationId) {
            window.location.href = `/messaging/chat?conversation=${options.data.conversationId}`;
          }
        };

        // Auto-close after 5 seconds if not requiring interaction
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback to toast notification
        toast(options.body, {
          description: options.title,
        });
      }
    },
    [isSupported, permission, requestPermission]
  );

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.warn('Could not play notification sound:', err);
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }, []);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    playNotificationSound,
  };
}

// Toast hook for simple notifications
export function useToast() {
  return {
    toast: (options: {
      title: string;
      description?: string;
      type?: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }) => {
      const { title, description, type = 'info', duration = 4000 } = options;
      
      switch (type) {
        case 'success':
          toast.success(title, {
            description,
            duration,
          });
          break;
        case 'error':
          toast.error(title, {
            description,
            duration,
          });
          break;
        case 'warning':
          toast.warning(title, {
            description,
            duration,
          });
          break;
        default:
          toast.info(title, {
            description,
            duration,
          });
          break;
      }
    },
  };
}
