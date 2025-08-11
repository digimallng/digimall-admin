'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertCircle, RefreshCw, Send, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  fileData?: {
    file: File;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  metadata?: Record<string, any>;
  status: 'pending' | 'sending' | 'failed' | 'sent';
}

interface OfflineMessageQueueProps {
  isOnline: boolean;
  onSendMessage: (message: QueuedMessage) => Promise<boolean>;
  className?: string;
}

interface QueueStatusProps {
  isOnline: boolean;
  queueCount: number;
  failedCount: number;
  onRetryAll: () => void;
  onClearFailed: () => void;
  className?: string;
}

// Connection status component
function ConnectionStatus({ isOnline, className }: { isOnline: boolean; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200',
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline - Messages will be sent when connected</span>
        </>
      )}
    </motion.div>
  );
}

// Queue status component
function QueueStatus({ 
  isOnline, 
  queueCount, 
  failedCount, 
  onRetryAll, 
  onClearFailed,
  className 
}: QueueStatusProps) {
  if (queueCount === 0 && failedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-800">
          <Clock className="h-4 w-4" />
          <span className="font-medium">
            {queueCount > 0 && `${queueCount} message${queueCount !== 1 ? 's' : ''} queued`}
            {queueCount > 0 && failedCount > 0 && ' • '}
            {failedCount > 0 && `${failedCount} failed`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {failedCount > 0 && (
            <>
              <button
                onClick={onRetryAll}
                className="text-xs text-yellow-700 hover:text-yellow-900 font-medium flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Retry All
              </button>
              <button
                onClick={onClearFailed}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear Failed
              </button>
            </>
          )}
        </div>
      </div>

      {!isOnline && queueCount > 0 && (
        <p className="text-xs text-yellow-700">
          Messages will be sent automatically when connection is restored.
        </p>
      )}
    </motion.div>
  );
}

// Individual queued message component
interface QueuedMessageItemProps {
  message: QueuedMessage;
  onRetry: (messageId: string) => void;
  onRemove: (messageId: string) => void;
}

function QueuedMessageItem({ message, onRetry, onRemove }: QueuedMessageItemProps) {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (message.status) {
      case 'pending':
        return 'Waiting to send';
      case 'sending':
        return 'Sending...';
      case 'failed':
        return `Failed (${message.retryCount}/${message.maxRetries} retries)`;
      case 'sent':
        return 'Sent';
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
    >
      {getStatusIcon()}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">
          {message.type === 'text' ? message.content : `${message.type} message`}
        </p>
        <p className="text-xs text-gray-500">
          {getStatusText()} • {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {message.status === 'failed' && (
          <button
            onClick={() => onRetry(message.id)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
            title="Retry sending"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        
        {['pending', 'failed'].includes(message.status) && (
          <button
            onClick={() => onRemove(message.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
            title="Remove from queue"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Main offline message queue hook
export function useOfflineMessageQueue() {
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('offlineMessageQueue');
    if (savedQueue) {
      try {
        const parsedQueue = JSON.parse(savedQueue);
        setQueue(parsedQueue);
      } catch (error) {
        console.error('Failed to load offline message queue:', error);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offlineMessageQueue', JSON.stringify(queue));
  }, [queue]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process queue when online
  useEffect(() => {
    if (isOnline && !processingRef.current && queue.some(msg => msg.status === 'pending')) {
      processQueue();
    }
  }, [isOnline, queue]);

  const addMessage = useCallback((message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    setQueue(prev => [...prev, queuedMessage]);
    return queuedMessage.id;
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current || !isOnline) return;
    
    processingRef.current = true;
    setIsProcessing(true);

    const pendingMessages = queue.filter(msg => msg.status === 'pending');
    
    for (const message of pendingMessages) {
      try {
        // Update status to sending
        setQueue(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sending' as const } : msg
        ));

        // Attempt to send the message
        const success = await sendMessage(message);
        
        if (success) {
          // Remove from queue on success
          setQueue(prev => prev.filter(msg => msg.id !== message.id));
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Failed to send queued message:', error);
        
        // Update retry count and status
        setQueue(prev => prev.map(msg => {
          if (msg.id === message.id) {
            const newRetryCount = msg.retryCount + 1;
            return {
              ...msg,
              retryCount: newRetryCount,
              status: newRetryCount >= msg.maxRetries ? 'failed' as const : 'pending' as const,
            };
          }
          return msg;
        }));
      }

      // Small delay between messages to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    processingRef.current = false;
    setIsProcessing(false);
  }, [queue, isOnline]);

  const sendMessage = async (message: QueuedMessage): Promise<boolean> => {
    // This would be replaced with actual API call
    // For now, simulate sending with a delay and potential failure
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }
    
    return true;
  };

  const retryMessage = useCallback((messageId: string) => {
    setQueue(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'pending' as const, retryCount: 0 }
        : msg
    ));
  }, []);

  const retryAllFailed = useCallback(() => {
    setQueue(prev => prev.map(msg => 
      msg.status === 'failed' 
        ? { ...msg, status: 'pending' as const, retryCount: 0 }
        : msg
    ));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setQueue(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const clearFailedMessages = useCallback(() => {
    setQueue(prev => prev.filter(msg => msg.status !== 'failed'));
  }, []);

  const clearAllMessages = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    isOnline,
    isProcessing,
    queueCount: queue.filter(msg => msg.status === 'pending').length,
    failedCount: queue.filter(msg => msg.status === 'failed').length,
    addMessage,
    retryMessage,
    retryAllFailed,
    removeMessage,
    clearFailedMessages,
    clearAllMessages,
  };
}

// Main component
export function OfflineMessageQueue({
  isOnline,
  onSendMessage,
  className
}: OfflineMessageQueueProps) {
  const {
    queue,
    queueCount,
    failedCount,
    retryMessage,
    retryAllFailed,
    removeMessage,
    clearFailedMessages,
  } = useOfflineMessageQueue();

  const [showQueue, setShowQueue] = useState(false);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Connection Status */}
      <AnimatePresence>
        {!isOnline && (
          <ConnectionStatus isOnline={isOnline} />
        )}
      </AnimatePresence>

      {/* Queue Status */}
      <QueueStatus
        isOnline={isOnline}
        queueCount={queueCount}
        failedCount={failedCount}
        onRetryAll={retryAllFailed}
        onClearFailed={clearFailedMessages}
      />

      {/* Toggle Queue View */}
      {(queueCount > 0 || failedCount > 0) && (
        <button
          onClick={() => setShowQueue(!showQueue)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showQueue ? 'Hide' : 'Show'} message queue ({queue.length})
        </button>
      )}

      {/* Queue Details */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 max-h-60 overflow-y-auto"
          >
            {queue.map(message => (
              <QueuedMessageItem
                key={message.id}
                message={message}
                onRetry={retryMessage}
                onRemove={removeMessage}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced send message hook with queue integration
export function useQueuedMessageSend() {
  const { addMessage, isOnline } = useOfflineMessageQueue();

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    type: QueuedMessage['type'] = 'text',
    fileData?: QueuedMessage['fileData'],
    metadata?: Record<string, any>
  ) => {
    const message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retryCount' | 'status'> = {
      conversationId,
      content,
      type,
      fileData,
      metadata,
      maxRetries: 3,
    };

    if (isOnline) {
      // Try to send immediately
      try {
        // Replace with actual API call
        const success = await sendMessageDirectly(message);
        if (success) {
          return { success: true, messageId: null };
        } else {
          throw new Error('Failed to send');
        }
      } catch (error) {
        // Add to queue if immediate send fails
        const messageId = addMessage(message);
        return { success: false, messageId, error };
      }
    } else {
      // Add to queue when offline
      const messageId = addMessage(message);
      return { success: false, messageId, queued: true };
    }
  }, [addMessage, isOnline]);

  return { sendMessage };
}

// Placeholder for actual API call
async function sendMessageDirectly(message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<boolean> {
  // Replace with actual API implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  return Math.random() > 0.1; // 90% success rate for testing
}