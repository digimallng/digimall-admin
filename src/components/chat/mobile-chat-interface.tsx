'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
  Camera,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  X,
  Plus,
  ChevronDown,
  Search,
  Settings,
  Image as ImageIcon,
  File,
  MapPin,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwipeable } from 'react-swipeable';

interface MobileChatInterfaceProps {
  conversation: any;
  messages: any[];
  onSendMessage: (message: string, type?: string) => void;
  onFileUpload: (files: File[]) => void;
  onVoiceRecord: (audioBlob: Blob) => void;
  onBack: () => void;
  className?: string;
}

interface MobileInputToolbarProps {
  onTextSend: (text: string) => void;
  onFileUpload: (files: File[]) => void;
  onVoiceRecord: (audioBlob: Blob) => void;
  onCameraCapture: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  onFileUpload: (files: File[]) => void;
  onCameraCapture: () => void;
  onLocationShare: () => void;
  onContactShare: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// Mobile-optimized message bubble
interface MobileMessageBubbleProps {
  message: any;
  isOwn: boolean;
  showAvatar?: boolean;
  onSwipeReply?: () => void;
  onLongPress?: () => void;
}

function MobileMessageBubble({ 
  message, 
  isOwn, 
  showAvatar = false,
  onSwipeReply,
  onLongPress
}: MobileMessageBubbleProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      onLongPress?.();
      // Haptic feedback for long press
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: isOwn ? undefined : onSwipeReply,
    onSwipedRight: isOwn ? onSwipeReply : undefined,
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  return (
    <motion.div
      {...swipeHandlers}
      className={cn(
        'flex gap-2 px-4 py-2',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      animate={{
        scale: isPressed ? 0.98 : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {message.sender?.[0] || '?'}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'max-w-[85%] min-w-[100px]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl shadow-sm relative',
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
          )}
        >
          {/* Message content */}
          {message.type === 'image' ? (
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="max-w-[250px] rounded-lg"
            />
          ) : (
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          )}

          {/* Message time and status */}
          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-blue-100' : 'text-gray-400'
          )}>
            <span>{new Date(message.sentAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}</span>
            {isOwn && (
              <div className="ml-1">
                {message.readBy?.length > 0 ? '✓✓' : '✓'}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Quick actions panel
function QuickActions({ 
  onFileUpload, 
  onCameraCapture, 
  onLocationShare, 
  onContactShare,
  isOpen,
  onClose 
}: QuickActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { 
      icon: ImageIcon, 
      label: 'Camera', 
      color: 'bg-green-500', 
      action: onCameraCapture 
    },
    { 
      icon: File, 
      label: 'Document', 
      color: 'bg-blue-500', 
      action: () => fileInputRef.current?.click() 
    },
    { 
      icon: MapPin, 
      label: 'Location', 
      color: 'bg-red-500', 
      action: onLocationShare 
    },
    { 
      icon: Phone, 
      label: 'Contact', 
      color: 'bg-purple-500', 
      action: onContactShare 
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Actions Panel */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl z-50 p-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  onFileUpload(Array.from(e.target.files));
                  onClose();
                }
              }}
            />

            <div className="grid grid-cols-4 gap-4">
              {actions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    action.action();
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white',
                    action.color
                  )}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-gray-600">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile input toolbar
function MobileInputToolbar({ 
  onTextSend, 
  onFileUpload, 
  onVoiceRecord, 
  onCameraCapture,
  disabled = false 
}: MobileInputToolbarProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onTextSend(message);
      setMessage('');
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording logic here
      setIsRecording(false);
    } else {
      // Start recording logic here
      setIsRecording(true);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <>
      <div className="bg-white border-t border-gray-200 p-4 safe-area-pb">
        <div className="flex items-end gap-2">
          {/* Plus button for quick actions */}
          <button
            onClick={() => setShowQuickActions(true)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
            disabled={disabled}
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Message input container */}
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-end">
            <div className="flex-1 px-4 py-3">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-500 text-base leading-relaxed"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
                disabled={disabled}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>

            {/* Emoji button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={disabled}
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          {/* Send or Voice button */}
          {message.trim() ? (
            <button
              onClick={handleSend}
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-all flex-shrink-0"
              disabled={disabled}
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              onTouchStart={handleVoiceRecord}
              onTouchEnd={handleVoiceRecord}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all flex-shrink-0',
                isRecording ? 'bg-red-500 scale-110' : 'bg-gray-500 hover:bg-gray-600'
              )}
              disabled={disabled}
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center justify-center gap-2 text-red-500"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Recording... Release to send</span>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onFileUpload={onFileUpload}
        onCameraCapture={onCameraCapture}
        onLocationShare={() => console.log('Share location')}
        onContactShare={() => console.log('Share contact')}
      />
    </>
  );
}

export function MobileChatInterface({
  conversation,
  messages,
  onSendMessage,
  onFileUpload,
  onVoiceRecord,
  onBack,
  className
}: MobileChatInterfaceProps) {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom]);

  // Handle scroll detection
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 100;
      setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  }, []);

  // Pull-to-refresh (placeholder)
  const handlePullToRefresh = () => {
    console.log('Pull to refresh triggered');
    // Implement pull-to-refresh logic here
  };

  const otherParticipant = conversation?.participants?.find((p: any) => p.userId !== 'current-user-id');

  return (
    <div className={cn('flex flex-col h-screen bg-gray-50', className)}>
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 safe-area-pt">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {otherParticipant?.userName?.[0] || '?'}
              </div>
              {otherParticipant?.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {conversation?.title || otherParticipant?.userName || 'Unknown'}
              </h4>
              <p className="text-sm text-gray-500 truncate">
                {otherParticipant?.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-behavior-y-contain"
        onScroll={handleScroll}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start chatting</h3>
              <p className="text-gray-500">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((message, index) => (
              <MobileMessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === 'current-user-id'}
                showAvatar={
                  message.senderId !== 'current-user-id' &&
                  (index === 0 || messages[index - 1].senderId !== message.senderId)
                }
                onSwipeReply={() => console.log('Reply to message:', message.id)}
                onLongPress={() => console.log('Long press on message:', message.id)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to bottom button */}
        {!isScrolledToBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              setIsScrolledToBottom(true);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="fixed bottom-24 right-4 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-10"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Input Area */}
      <MobileInputToolbar
        onTextSend={onSendMessage}
        onFileUpload={onFileUpload}
        onVoiceRecord={onVoiceRecord}
        onCameraCapture={() => console.log('Camera capture')}
        disabled={false}
      />
    </div>
  );
}

// CSS classes for safe area support
export const mobileChatStyles = `
  .safe-area-pt {
    padding-top: env(safe-area-inset-top, 0);
  }
  
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  
  /* Smooth scrolling for iOS */
  .overscroll-behavior-y-contain {
    overscroll-behavior-y: contain;
  }
  
  /* Custom scrollbar for webkit */
  .overflow-y-auto::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;