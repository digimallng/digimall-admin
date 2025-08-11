'use client';

import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock, AlertCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  timestamp?: string;
  readBy?: Array<{ userId: string; userName: string; readAt: string }>;
  className?: string;
  showTooltip?: boolean;
}

interface StatusTooltipProps {
  status: MessageStatus;
  timestamp?: string;
  readBy?: Array<{ userId: string; userName: string; readAt: string }>;
}

function StatusTooltip({ status, timestamp, readBy }: StatusTooltipProps) {
  const getTooltipContent = () => {
    switch (status) {
      case 'sending':
        return 'Sending message...';
      case 'sent':
        return timestamp ? `Sent ${new Date(timestamp).toLocaleString()}` : 'Sent';
      case 'delivered':
        return timestamp ? `Delivered ${new Date(timestamp).toLocaleString()}` : 'Delivered';
      case 'read':
        if (readBy && readBy.length > 0) {
          return `Read by ${readBy.map(r => r.userName).join(', ')}`;
        }
        return timestamp ? `Read ${new Date(timestamp).toLocaleString()}` : 'Read';
      case 'failed':
        return 'Failed to send. Tap to retry.';
      default:
        return '';
    }
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
      {getTooltipContent()}
      <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800" />
    </div>
  );
}

export function MessageStatusIndicator({ 
  status, 
  timestamp, 
  readBy, 
  className,
  showTooltip = true 
}: MessageStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="h-3 w-3 text-gray-400" />
          </motion.div>
        );
      case 'sent':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="h-3 w-3 text-gray-400" />
          </motion.div>
        );
      case 'delivered':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCheck className="h-3 w-3 text-gray-500" />
          </motion.div>
        );
      case 'read':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCheck className="h-3 w-3 text-blue-500" />
          </motion.div>
        );
      case 'failed':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
          >
            <AlertCircle className="h-3 w-3 text-red-500" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return 'text-gray-400';
      case 'sent':
        return 'text-gray-400';
      case 'delivered':
        return 'text-gray-500';
      case 'read':
        return 'text-blue-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={cn('relative group flex items-center', className)}>
      {showTooltip && (
        <StatusTooltip status={status} timestamp={timestamp} readBy={readBy} />
      )}
      <div className={cn('flex items-center transition-colors', getStatusColor())}>
        {getStatusIcon()}
      </div>
    </div>
  );
}

interface MessageTimestampProps {
  timestamp: string;
  status: MessageStatus;
  readBy?: Array<{ userId: string; userName: string; readAt: string }>;
  className?: string;
}

export function MessageTimestamp({ 
  timestamp, 
  status, 
  readBy, 
  className 
}: MessageTimestampProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={cn('flex items-center gap-1 text-xs text-gray-400', className)}>
      <span>{formatTime(timestamp)}</span>
      <MessageStatusIndicator 
        status={status} 
        timestamp={timestamp} 
        readBy={readBy}
        showTooltip={true}
      />
    </div>
  );
}

interface BulkMessageStatusProps {
  messages: Array<{
    id: string;
    status: MessageStatus;
    timestamp: string;
    readBy?: Array<{ userId: string; userName: string; readAt: string }>;
  }>;
  className?: string;
}

export function BulkMessageStatus({ messages, className }: BulkMessageStatusProps) {
  const getOverallStatus = (): MessageStatus => {
    if (messages.some(m => m.status === 'failed')) return 'failed';
    if (messages.some(m => m.status === 'sending')) return 'sending';
    if (messages.every(m => m.status === 'read')) return 'read';
    if (messages.every(m => ['read', 'delivered'].includes(m.status))) return 'delivered';
    if (messages.every(m => ['read', 'delivered', 'sent'].includes(m.status))) return 'sent';
    return 'sending';
  };

  const overallStatus = getOverallStatus();
  const latestTimestamp = messages.reduce((latest, msg) => 
    new Date(msg.timestamp) > new Date(latest) ? msg.timestamp : latest
  , messages[0]?.timestamp || '');

  const allReadBy = messages.reduce((acc, msg) => {
    if (msg.readBy) {
      msg.readBy.forEach(reader => {
        if (!acc.find(r => r.userId === reader.userId)) {
          acc.push(reader);
        }
      });
    }
    return acc;
  }, [] as Array<{ userId: string; userName: string; readAt: string }>);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-gray-400">
        {messages.length} message{messages.length !== 1 ? 's' : ''}
      </span>
      <MessageStatusIndicator 
        status={overallStatus}
        timestamp={latestTimestamp}
        readBy={allReadBy}
      />
    </div>
  );
}

// Status badge for conversation lists
interface ConversationStatusBadgeProps {
  unreadCount: number;
  lastMessageStatus?: MessageStatus;
  className?: string;
}

export function ConversationStatusBadge({ 
  unreadCount, 
  lastMessageStatus,
  className 
}: ConversationStatusBadgeProps) {
  if (unreadCount > 0) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'min-w-[20px] h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium px-1.5',
          className
        )}
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </motion.div>
    );
  }

  if (lastMessageStatus) {
    return (
      <MessageStatusIndicator 
        status={lastMessageStatus}
        className={className}
        showTooltip={false}
      />
    );
  }

  return null;
}

// Hook for managing message status
export function useMessageStatus(messageId: string) {
  const updateStatus = (newStatus: MessageStatus) => {
    // This would typically update the message status in your state management
    // For now, we'll just log it
    console.log(`Message ${messageId} status updated to: ${newStatus}`);
  };

  const markAsRead = (userId: string, userName: string) => {
    updateStatus('read');
    // Add to readBy array
    console.log(`Message ${messageId} read by ${userName} (${userId})`);
  };

  const retry = () => {
    updateStatus('sending');
    // Retry sending logic here
    console.log(`Retrying message ${messageId}`);
  };

  return {
    updateStatus,
    markAsRead,
    retry,
  };
}