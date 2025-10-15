'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Command, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications from admin service
  const { data: notificationResponse, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications({
      limit: 10,
      status: 'all',
    }),
    refetchInterval: 30000,
    enabled: !!session?.accessToken,
  });

  const notifications = notificationResponse?.notifications || [];
  const unreadCount = notificationResponse?.unreadCount || notifications.filter(n => !n.read).length || 0;

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Unknown time';
    }

    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 0) return 'Just now';
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

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const formatNotificationMessage = (message: string) => {
    if (!message) return 'No content';

    if (message.includes('<') && message.includes('>')) {
      const stripped = stripHtmlTags(message);
      return stripped.length > 120 ? stripped.substring(0, 120) + '...' : stripped;
    }

    return message.length > 120 ? message.substring(0, 120) + '...' : message;
  };

  const formatNotificationTitle = (title: string) => {
    if (!title) return 'Notification';

    if (title.includes('<') && title.includes('>')) {
      const stripped = stripHtmlTags(title);
      return stripped.length > 60 ? stripped.substring(0, 60) + '...' : stripped;
    }

    return title.length > 60 ? title.substring(0, 60) + '...' : title;
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await notificationsService.markAsRead(notification.id);
      refetchNotifications();
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    refetchNotifications();
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-full pl-9 pr-20"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Popover open={showNotifications} onOpenChange={setShowNotifications}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 pb-2">
              <h4 className="text-sm font-semibold">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h4>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => refetchNotifications()}
                >
                  Refresh
                </Button>
              </div>
            </div>

            <Separator />

            <div className="max-h-80 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                        notification.read ? 'bg-muted/50 border-transparent' : 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              "text-sm truncate",
                              notification.read ? 'font-normal text-muted-foreground' : 'font-medium'
                            )}>
                              {formatNotificationTitle(notification.title)}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {formatNotificationMessage(notification.message)}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.sentAt || notification.createdAt)}
                            </p>
                            {notification.priority && (
                              <Badge
                                variant={
                                  notification.priority === 'urgent' ? 'destructive' :
                                  notification.priority === 'high' ? 'default' :
                                  'secondary'
                                }
                                className="h-5 text-[10px]"
                              >
                                {notification.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white/20">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session?.user?.name || 'User'}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="hidden text-left text-sm sm:block">
                <p className="font-medium leading-none">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {session?.user?.email || 'admin@digimall.ng'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email || 'admin@digimall.ng'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
