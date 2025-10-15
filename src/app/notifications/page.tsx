'use client';

import { useState } from 'react';
import { useNotifications, useNotificationStatistics, useFailedNotifications, useScheduledNotifications, useDeleteNotification, useBulkDeleteNotifications, useResendNotification } from '@/lib/hooks/use-notifications';
import type { NotificationType, NotificationStatus, NotificationPriority, NotificationChannel, GetNotificationsParams } from '@/lib/api/types/notifications.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Bell, CheckCircle, Clock, Mail, MessageSquare, Plus, RefreshCw, Search, Send, Smartphone, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BroadcastNotificationModal } from '@/components/modals/BroadcastNotificationModal';

export default function NotificationsPage() {
  const [filters, setFilters] = useState<GetNotificationsParams>({
    page: 1,
    limit: 20,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Queries
  const { data: notificationsData, isLoading, error } = useNotifications(filters);
  const { data: statistics } = useNotificationStatistics();
  const { data: failedData } = useFailedNotifications(1, 10);
  const { data: scheduledData } = useScheduledNotifications(1, 10);

  // Broadcast notifications - fetch all recent notifications and filter client-side
  // Note: Backend creates individual notifications per user when broadcasting
  const { data: broadcastsData, isLoading: broadcastsLoading } = useNotifications({
    page: 1,
    limit: 100, // Fetch more to find broadcasts among individual notifications
  });

  // Filter broadcasts - notifications with broadcast metadata
  const broadcasts = broadcastsData?.data.filter(n =>
    n.metadata?.broadcast === true || n.metadata?.adminCreated === true
  ) || [];

  // Debug: log to see metadata structure
  if (broadcastsData?.data && broadcastsData.data.length > 0) {
    console.log('Sample notification metadata:', broadcastsData.data[0]?.metadata);
    console.log('Total notifications:', broadcastsData.data.length);
    console.log('Broadcasts found:', broadcasts.length);
  }

  // Mutations
  const deleteMutation = useDeleteNotification();
  const bulkDeleteMutation = useBulkDeleteNotifications();
  const resendMutation = useResendNotification();

  const notifications = notificationsData?.data || [];
  const pagination = notificationsData?.pagination;
  const stats = statistics?.data;

  const handleFilterChange = (key: keyof GetNotificationsParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters(prev => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Notification deleted successfully');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No notifications selected');
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync({ notificationIds: selectedIds });
      toast.success(`${selectedIds.length} notifications deleted successfully`);
      setSelectedIds([]);
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const handleResend = async (id: string, channels: NotificationChannel[]) => {
    try {
      await resendMutation.mutateAsync({ id, data: { channels } });
      toast.success('Notification resent successfully');
    } catch (error) {
      toast.error('Failed to resend notification');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n._id));
    }
  };

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'sms':
        return <MessageSquare className="h-3 w-3" />;
      case 'push':
        return <Smartphone className="h-3 w-3" />;
      case 'in_app':
        return <Bell className="h-3 w-3" />;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Error loading notifications</h3>
              <p className="mt-1 text-sm text-gray-500">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications Management</h1>
          <p className="text-muted-foreground">Monitor and manage platform notifications</p>
        </div>
        <Button onClick={() => setShowBroadcastModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Broadcast
        </Button>
      </div>

      <BroadcastNotificationModal
        open={showBroadcastModal}
        onOpenChange={setShowBroadcastModal}
      />

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalNotifications.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.totalRead.toLocaleString()} read, {stats.overview.totalUnread.toLocaleString()} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.deliveryRate}</div>
              <p className="text-xs text-muted-foreground">
                Read rate: {stats.overview.readRate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.failureRate}</div>
              <p className="text-xs text-muted-foreground">
                Failed: {stats.byStatus.failed?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Read Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.avgReadTimeMinutes.toFixed(1)} min</div>
              <p className="text-xs text-muted-foreground">
                Average time to read
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="broadcasts">My Broadcasts</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedData?.pagination.total || 0})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledData?.pagination.total || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>View and manage all platform notifications</CardDescription>
                </div>
                {selectedIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete {selectedIds.length} selected
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order_status">Order Status</SelectItem>
                    <SelectItem value="payment_confirmation">Payment</SelectItem>
                    <SelectItem value="system_announcement">System</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="security_alert">Security</SelectItem>
                    <SelectItem value="vendor_alert">Vendor Alert</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">No notifications match your filters</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Checkbox
                        checked={selectedIds.length === notifications.length}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-sm text-muted-foreground">Select all</span>
                    </div>
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className="flex items-start gap-3 rounded-lg border p-4 hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedIds.includes(notification._id)}
                          onCheckedChange={() => toggleSelection(notification._id)}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{notification.title}</h4>
                                <Badge className={getPriorityColor(notification.priority)}>
                                  {notification.priority}
                                </Badge>
                                <Badge className={getStatusColor(notification.status)}>
                                  {getStatusIcon(notification.status)}
                                  <span className="ml-1">{notification.status}</span>
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.type.replace('_', ' ')}
                                </Badge>
                                {notification.channels.map((channel) => (
                                  <Badge key={channel} variant="outline" className="text-xs">
                                    {getChannelIcon(channel)}
                                    <span className="ml-1">{channel}</span>
                                  </Badge>
                                ))}
                                {typeof notification.userId === 'object' && (
                                  <span className="text-xs text-muted-foreground">
                                    To: {notification.userId.firstName} {notification.userId.lastName}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {notification.status === 'failed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResend(notification._id, notification.channels)}
                                  disabled={resendMutation.isPending}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(notification._id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFilterChange('page', pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFilterChange('page', pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Notifications</CardTitle>
              <CardDescription>Notifications you have created and broadcast to users</CardDescription>
            </CardHeader>
            <CardContent>
              {broadcastsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading broadcasts...</p>
                  </div>
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="text-center mb-4">
                    <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No broadcasts found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {broadcastsData?.data.length || 0} total notifications found, but none marked as broadcasts
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setShowBroadcastModal(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Broadcast
                    </Button>
                  </div>

                  {/* Debug info */}
                  {broadcastsData?.data && broadcastsData.data.length > 0 && (
                    <details className="mt-4 w-full max-w-2xl">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                        Debug: Show all notifications metadata (click to expand)
                      </summary>
                      <div className="mt-2 max-h-96 overflow-y-auto rounded border bg-muted p-4">
                        <pre className="text-xs">
                          {JSON.stringify(
                            broadcastsData.data.slice(0, 5).map(n => ({
                              id: n._id,
                              title: n.title,
                              type: n.type,
                              metadata: n.metadata,
                              createdAt: n.createdAt,
                            })),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {broadcasts.map((notification) => (
                      <div
                        key={notification._id}
                        className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{notification.title}</h4>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              <Badge className={getStatusColor(notification.status)}>
                                {getStatusIcon(notification.status)}
                                <span className="ml-1">{notification.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.body}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.type.replace('_', ' ')}
                              </Badge>
                              {notification.channels.map((channel) => (
                                <Badge key={channel} variant="outline" className="text-xs">
                                  {getChannelIcon(channel)}
                                  <span className="ml-1">{channel}</span>
                                </Badge>
                              ))}
                              {notification.metadata?.campaign && (
                                <Badge variant="outline" className="text-xs">
                                  Campaign: {notification.metadata.campaign}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Sent: {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {notification.actionUrl && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Action URL: <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{notification.actionUrl}</a>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {notification.status === 'failed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResend(notification._id, notification.channels)}
                                disabled={resendMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(notification._id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Notifications</CardTitle>
              <CardDescription>Notifications that failed to deliver</CardDescription>
            </CardHeader>
            <CardContent>
              {failedData?.data.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No failed notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">All notifications delivered successfully</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {failedData?.data.map((notification) => (
                    <div
                      key={notification._id}
                      className="flex items-start justify-between rounded-lg border border-red-200 bg-red-50 p-4"
                    >
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {notification.channels.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {getChannelIcon(channel)}
                              <span className="ml-1">{channel}</span>
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(notification._id, notification.channels)}
                        disabled={resendMutation.isPending}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Notifications</CardTitle>
              <CardDescription>Notifications scheduled for future delivery</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledData?.data.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No scheduled notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a broadcast to schedule notifications</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledData?.data.map((notification) => (
                    <div
                      key={notification._id}
                      className="flex items-start justify-between rounded-lg border border-blue-200 bg-blue-50 p-4"
                    >
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Scheduled: {notification.scheduledAt ? new Date(notification.scheduledAt).toLocaleString() : 'N/A'}
                          </Badge>
                          {notification.channels.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {getChannelIcon(channel)}
                              <span className="ml-1">{channel}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(notification._id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
