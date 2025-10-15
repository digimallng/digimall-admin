'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Shield,
  Gift,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  notificationsService,
  NotificationItem,
  NotificationFilters
} from '@/lib/api/services/notifications.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<NotificationFilters>({
    status: 'all',
    page: 1,
    limit: 20,
  });
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to safely format timestamps
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp in notifications:', timestamp);
      return 'Invalid date';
    }

    try {
      return format(date, 'MMM dd, yyyy - hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Format error';
    }
  };

  // Helper functions to handle HTML content
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const formatNotificationMessage = (message: string) => {
    if (!message) return 'No content';

    if (message.includes('<') && message.includes('>')) {
      return stripHtmlTags(message);
    }

    return message;
  };

  const formatNotificationTitle = (title: string) => {
    if (!title) return 'Notification';

    if (title.includes('<') && title.includes('>')) {
      return stripHtmlTags(title);
    }

    return title;
  };

  // Fetch notifications with real data
  const { data: notificationResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filters, searchTerm],
    queryFn: () => notificationsService.getNotifications({
      ...filters,
      searchTerm: searchTerm || undefined,
    }),
    refetchInterval: 30000,
    staleTime: 10000,
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
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'vendor':
        return 'bg-purple-100 text-purple-600';
      case 'security':
        return 'bg-red-100 text-red-600';
      case 'promotion':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Notifications</h3>
              <p className="text-muted-foreground mb-4">Failed to connect to notification service</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value: any) => updateFilters({ status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Notifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => updateFilters({ type: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="order">Orders</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="vendor">Vendors</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="promotion">Promotions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => updateFilters({ priority: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedNotifications.length} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('mark_read')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mark Read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('mark_unread')}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Mark Unread
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select All */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedNotifications.length === notifications.length}
            onCheckedChange={handleSelectAll}
          />
          <label className="text-sm font-medium cursor-pointer" onClick={handleSelectAll}>
            Select All
          </label>
        </div>
      )}

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const CategoryIcon = getCategoryIcon(notification.category);
            const isRead = notification.read || notification.isRead;
            const isSelected = selectedNotifications.includes(notification.id);

            return (
              <Card
                key={notification.id}
                className={cn(
                  'cursor-pointer transition-all',
                  !isRead && 'border-l-4 border-blue-500 bg-blue-50/20',
                  isSelected && 'ring-2 ring-blue-500 bg-blue-50/30'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectNotification(notification.id)}
                      />
                    </div>

                    {/* Icon */}
                    <div className={cn("rounded-lg p-3 flex items-center justify-center", getNotificationColor(notification.type))}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn("text-sm font-semibold", isRead ? 'text-gray-700' : 'text-gray-900')}>
                              {formatNotificationTitle(notification.title)}
                            </h3>
                            <CategoryIcon className="h-4 w-4 text-gray-400" />
                            {notification.priority && (
                              <Badge
                                className={cn(
                                  notification.priority === 'urgent' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                  notification.priority === 'high' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
                                  notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                  'bg-green-100 text-green-800 hover:bg-green-100'
                                )}
                              >
                                {notification.priority}
                              </Badge>
                            )}
                            {!isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className={cn("text-sm mb-2", isRead ? 'text-gray-500' : 'text-gray-700')}>
                            {formatNotificationMessage(notification.message)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.sentAt || notification.createdAt)}
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isRead) {
                                  markAsUnreadMutation.mutate(notification.id);
                                } else {
                                  markAsReadMutation.mutate(notification.id);
                                }
                              }}
                            >
                              {isRead ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Mark as Unread
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Mark as Read
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this notification?')) {
                                  deleteNotificationMutation.mutate(notification.id);
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {notifications.length > 0 && filters.page && filters.page < totalPages && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMoreNotifications}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Notifications'
            )}
          </Button>
        </div>
      )}

      {/* No more notifications */}
      {notifications.length > 0 && filters.page === totalPages && (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">No more notifications to load</p>
        </div>
      )}
    </div>
  );
}
