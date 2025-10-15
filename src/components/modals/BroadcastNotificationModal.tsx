'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useBroadcastNotification } from '@/lib/hooks/use-notifications';
import type { NotificationType, NotificationPriority, NotificationChannel, TargetRole, CreateBroadcastNotificationRequest } from '@/lib/api/types/notifications.types';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface BroadcastNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BroadcastNotificationModal({ open, onOpenChange }: BroadcastNotificationModalProps) {
  const broadcastMutation = useBroadcastNotification();

  const [formData, setFormData] = useState<CreateBroadcastNotificationRequest>({
    title: '',
    body: '',
    type: 'system_announcement',
    priority: 'normal',
    channels: ['in_app'],
    targetRole: 'all',
  });

  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>(['in_app']);

  const handleChannelToggle = (channel: NotificationChannel) => {
    setSelectedChannels(prev => {
      const newChannels = prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel];

      setFormData(current => ({ ...current, channels: newChannels }));
      return newChannels;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Title and body are required');
      return;
    }

    if (selectedChannels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    try {
      console.log('Sending broadcast data:', formData);
      const result = await broadcastMutation.mutateAsync(formData);
      console.log('Broadcast result:', result);

      if (result.data.targetCount === 0) {
        toast.warning('Broadcast created but no users matched the target criteria. No notifications were sent.');
      } else if (result.data.failedCount > 0) {
        toast.warning(`Notification broadcast to ${result.data.sentCount} users. ${result.data.failedCount} failed.`);
      } else {
        toast.success(`Notification successfully broadcast to ${result.data.targetCount} users`);
      }

      // Reset form
      setFormData({
        title: '',
        body: '',
        type: 'system_announcement',
        priority: 'normal',
        channels: ['in_app'],
        targetRole: 'all',
      });
      setSelectedChannels(['in_app']);

      onOpenChange(false);
    } catch (error: any) {
      console.error('Broadcast error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to broadcast notification';
      toast.error(errorMessage);
    }
  };

  const channelOptions = [
    { value: 'in_app' as NotificationChannel, label: 'In-App', icon: Bell },
    { value: 'email' as NotificationChannel, label: 'Email', icon: Mail },
    { value: 'sms' as NotificationChannel, label: 'SMS', icon: MessageSquare },
    { value: 'push' as NotificationChannel, label: 'Push', icon: Smartphone },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Broadcast Notification</DialogTitle>
          <DialogDescription>
            Send a notification to multiple users across different channels
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter notification title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              placeholder="Enter notification message"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as NotificationType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system_announcement">System Announcement</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="security_alert">Security Alert</SelectItem>
                <SelectItem value="account_update">Account Update</SelectItem>
                <SelectItem value="vendor_alert">Vendor Alert</SelectItem>
                <SelectItem value="product_update">Product Update</SelectItem>
                <SelectItem value="order_status">Order Status</SelectItem>
                <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as NotificationPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target Audience</Label>
              <Select
                value={formData.targetRole || 'everyone'}
                onValueChange={(value) => {
                  if (value === 'everyone') {
                    // Don't include targetRole to send to all active users
                    const { targetRole, ...rest } = formData;
                    setFormData(rest as CreateBroadcastNotificationRequest);
                  } else {
                    setFormData({ ...formData, targetRole: value as TargetRole });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">All Active Users (recommended)</SelectItem>
                  <SelectItem value="all">All Users (by role)</SelectItem>
                  <SelectItem value="vendors">Vendors Only</SelectItem>
                  <SelectItem value="customers">Customers Only</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Known Issue:</strong> Backend currently only queries User collection.
                  If you have vendors/customers but broadcast returns 0 users, contact backend team to fix the query logic.
                </p>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label>Delivery Channels *</Label>
            <div className="grid grid-cols-2 gap-3">
              {channelOptions.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.value}
                    className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent"
                  >
                    <Checkbox
                      id={channel.value}
                      checked={selectedChannels.includes(channel.value)}
                      onCheckedChange={() => handleChannelToggle(channel.value)}
                    />
                    <label
                      htmlFor={channel.value}
                      className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <Icon className="h-4 w-4" />
                      {channel.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action URL (optional) */}
          <div className="space-y-2">
            <Label htmlFor="actionUrl">Action URL (optional)</Label>
            <Input
              id="actionUrl"
              type="url"
              placeholder="https://example.com/action"
              value={formData.actionUrl || ''}
              onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value || undefined })}
            />
          </div>

          {/* Action Text (optional) */}
          <div className="space-y-2">
            <Label htmlFor="actionText">Action Button Text (optional)</Label>
            <Input
              id="actionText"
              placeholder="View Details"
              value={formData.actionText || ''}
              onChange={(e) => setFormData({ ...formData, actionText: e.target.value || undefined })}
            />
          </div>

          {/* Schedule (optional) */}
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule for Later (optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt || ''}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value || undefined })}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to send immediately
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={broadcastMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={broadcastMutation.isPending}>
              {broadcastMutation.isPending ? 'Broadcasting...' : formData.scheduledAt ? 'Schedule Broadcast' : 'Send Broadcast'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
