'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Paperclip,
  X,
  Loader2,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Info,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragDropUpload } from './drag-drop-upload';
import { VoiceRecorder } from './voice-recorder';
import { TypingIndicator, MultipleTypingIndicator, useTypingIndicator } from './typing-indicator';
import { MessageStatusIndicator, MessageTimestamp } from './message-status';
import { FilePreviewModal } from './file-preview-modal';
import { DownloadManager, useDownloadManager } from './download-progress';
import { FileTypeIcon } from './file-type-icons';
import { MobileChatInterface } from './mobile-chat-interface';
import { SwipeableMessage, HapticFeedback } from './mobile-gestures';
import { OfflineMessageQueue, useOfflineMessageQueue } from './offline-message-queue';
import { AccessibleButton, AccessibleInput, useAnnouncements } from './accessibility';
import { InfiniteScroll, ChatInfiniteScroll } from './infinite-scroll';

interface EnhancedInlineChatProps {
  conversationId: string;
  onClose?: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}

export function EnhancedInlineChat({ 
  conversationId, 
  onClose, 
  onBack,
  isMobile = false 
}: EnhancedInlineChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    size: number;
    mimeType: string;
  } | null>(null);

  // Demo data - replace with actual data fetching
  const conversation = {
    id: conversationId,
    title: 'Customer Support',
    participants: [
      { userId: 'user1', userName: 'John Doe', isOnline: true, userType: 'customer' }
    ]
  };

  const [messages, setMessages] = useState([
    {
      id: '1',
      conversationId,
      senderId: 'user1',
      content: 'Hello, I need help with my order',
      sentAt: new Date().toISOString(),
      type: 'text',
      readBy: [],
      status: 'read' as const
    },
    {
      id: '2',
      conversationId,
      senderId: 'admin',
      content: 'Hi! I\'d be happy to help you with your order. Can you provide your order number?',
      sentAt: new Date(Date.now() - 60000).toISOString(),
      type: 'text',
      readBy: [{ userId: 'user1', userName: 'John Doe', readAt: new Date().toISOString() }],
      status: 'read' as const
    }
  ]);

  const [typingUsers, setTypingUsers] = useState<Array<{
    id: string;
    name: string;
    avatar?: string;
  }>>([]);

  // Hooks
  const { isTyping, startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { 
    downloads, 
    startDownload, 
    pauseDownload, 
    resumeDownload, 
    cancelDownload, 
    retryDownload, 
    clearCompleted 
  } = useDownloadManager();
  const { 
    addMessage: addToQueue, 
    isOnline,
    queueCount,
    failedCount 
  } = useOfflineMessageQueue();
  const { announce, announceError, announceSuccess } = useAnnouncements();

  // Handle message input changes
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Handle file uploads
  const handleFilesSelected = (files: File[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
    setShowFileUpload(false);
    announce(`${files.length} file${files.length !== 1 ? 's' : ''} attached`);
  };

  // Handle voice recording
  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    // Convert blob to file and add to messages
    const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    
    const newMsg = {
      id: Math.random().toString(36),
      conversationId,
      senderId: 'admin',
      content: `Voice message (${Math.round(duration)}s)`,
      sentAt: new Date().toISOString(),
      type: 'audio' as const,
      fileUrl: URL.createObjectURL(audioBlob),
      fileName: audioFile.name,
      fileSize: audioFile.size,
      mimeType: audioFile.type,
      readBy: [],
      status: 'sending' as const
    };

    setMessages(prev => [...prev, newMsg]);
    setShowVoiceRecorder(false);
    announceSuccess('Voice message sent');
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setAttachedFiles([]);
    stopTyping();

    // Add text message
    if (messageContent) {
      const textMsg = {
        id: Math.random().toString(36),
        conversationId,
        senderId: 'admin',
        content: messageContent,
        sentAt: new Date().toISOString(),
        type: 'text' as const,
        readBy: [],
        status: 'sending' as const
      };

      setMessages(prev => [...prev, textMsg]);
      
      // Simulate sending delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === textMsg.id ? { ...msg, status: 'sent' as const } : msg
        ));
      }, 1000);
    }

    // Handle file attachments
    for (const file of attachedFiles) {
      const fileMsg = {
        id: Math.random().toString(36),
        conversationId,
        senderId: 'admin',
        content: file.name,
        sentAt: new Date().toISOString(),
        type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        readBy: [],
        status: 'sending' as const
      };

      setMessages(prev => [...prev, fileMsg]);
    }

    announceSuccess('Message sent');
  };

  // Handle message reply
  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setNewMessage(`@${message.senderId} `);
      announce('Replying to message');
      HapticFeedback.selection();
    }
  };

  // Handle message deletion
  const handleDelete = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    announceSuccess('Message deleted');
    HapticFeedback.impact();
  };

  // Mobile interface
  if (isMobile) {
    return (
      <MobileChatInterface
        conversation={conversation}
        messages={messages}
        onSendMessage={(message) => {
          const newMsg = {
            id: Math.random().toString(36),
            conversationId,
            senderId: 'admin',
            content: message,
            sentAt: new Date().toISOString(),
            type: 'text' as const,
            readBy: [],
            status: 'sending' as const
          };
          setMessages(prev => [...prev, newMsg]);
        }}
        onFileUpload={handleFilesSelected}
        onVoiceRecord={handleVoiceRecording}
        onBack={onBack || (() => {})}
      />
    );
  }

  // Desktop interface
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          {onBack && (
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="lg:hidden"
              aria-label="Go back to conversation list"
            >
              <ArrowLeft className="h-5 w-5" />
            </AccessibleButton>
          )}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {conversation.participants[0]?.userName?.charAt(0) || '?'}
              </div>
              {conversation.participants[0]?.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {conversation.title || conversation.participants[0]?.userName || 'Unknown'}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>
                  {conversation.participants[0]?.isOnline ? 'Online' : 'Last seen recently'}
                </span>
                <span>•</span>
                <span className="capitalize">{conversation.participants[0]?.userType || 'user'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AccessibleButton variant="ghost" size="sm" aria-label="Start voice call">
            <Phone className="h-5 w-5" />
          </AccessibleButton>
          <AccessibleButton variant="ghost" size="sm" aria-label="Start video call">
            <Video className="h-5 w-5" />
          </AccessibleButton>
          <AccessibleButton variant="ghost" size="sm" aria-label="View conversation info">
            <Info className="h-5 w-5" />
          </AccessibleButton>
          {onClose && (
            <AccessibleButton variant="ghost" size="sm" onClick={onClose} aria-label="Close chat">
              <X className="h-5 w-5" />
            </AccessibleButton>
          )}
        </div>
      </div>

      {/* Offline Queue Status */}
      <OfflineMessageQueue
        isOnline={isOnline}
        onSendMessage={async () => true}
        className="mx-6 mt-4"
      />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatInfiniteScroll
          items={messages}
          loading={false}
          hasMore={false}
          onLoadMore={() => {}}
          renderItem={(message, index) => (
            <SwipeableMessage
              key={message.id}
              onReply={() => handleReply(message.id)}
              onDelete={() => handleDelete(message.id)}
              isOwn={message.senderId === 'admin'}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3 px-6 py-2',
                  message.senderId === 'admin' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {message.senderId === 'admin' ? 'A' : conversation.participants[0]?.userName?.charAt(0) || '?'}
                  </div>
                </div>

                {/* Message Content */}
                <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl shadow-sm',
                      message.type === 'image' && 'p-2',
                      message.senderId === 'admin'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    )}
                  >
                    {message.type === 'image' && message.fileUrl ? (
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setPreviewFile({
                            url: message.fileUrl!,
                            name: message.fileName || 'Image',
                            size: message.fileSize || 0,
                            mimeType: message.mimeType || 'image/jpeg',
                          })
                        }
                      >
                        <img
                          src={message.fileUrl}
                          alt={message.fileName || 'Image'}
                          className="max-w-xs rounded-lg"
                        />
                      </div>
                    ) : message.type === 'audio' && message.fileUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg max-w-sm">
                        <div className="flex-1">
                          <audio src={message.fileUrl} controls className="w-full">
                            Your browser does not support the audio tag.
                          </audio>
                        </div>
                      </div>
                    ) : message.type === 'file' && message.fileUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg max-w-sm">
                        <FileTypeIcon
                          fileName={message.fileName || 'file'}
                          mimeType={message.mimeType}
                          size="md"
                          variant="colored"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.fileName || 'File'}
                          </p>
                          {message.fileSize && (
                            <p className="text-xs text-gray-500">
                              {Math.round(message.fileSize / 1024)} KB
                            </p>
                          )}
                        </div>
                        <AccessibleButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (message.fileUrl) {
                              startDownload(message.fileUrl, message.fileName || 'file', message.fileSize || 0);
                            }
                          }}
                          aria-label={`Download ${message.fileName}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </AccessibleButton>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    )}
                  </div>

                  {/* Message Status */}
                  <MessageTimestamp
                    timestamp={message.sentAt}
                    status={message.status}
                    readBy={message.readBy}
                    className={cn(
                      'mt-1',
                      message.senderId === 'admin' ? 'justify-end' : 'justify-start'
                    )}
                  />
                </div>
              </motion.div>
            </SwipeableMessage>
          )}
          keyExtractor={(message) => message.id}
          className="h-full"
        />
      </div>

      {/* Typing Indicators */}
      <MultipleTypingIndicator typingUsers={typingUsers} />

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 shadow-lg">
        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-50">
            <div className="space-y-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileTypeIcon 
                    fileName={file.name} 
                    mimeType={file.type}
                    size="md" 
                    variant="colored" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(file.size / 1024)} KB
                    </p>
                  </div>
                  <AccessibleButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </AccessibleButton>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-4">
          <div className="flex items-end gap-3">
            {/* File Upload Button */}
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(true)}
              aria-label="Attach files"
            >
              <Paperclip className="h-5 w-5" />
            </AccessibleButton>

            {/* Message Input */}
            <div className="flex-1">
              <AccessibleInput
                label="Message"
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="resize-none"
              />
            </div>

            {/* Voice Recorder Button */}
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceRecorder(true)}
              aria-label="Record voice message"
            >
              <Paperclip className="h-5 w-5" />
            </AccessibleButton>

            {/* Send Button */}
            <AccessibleButton
              variant="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachedFiles.length === 0}
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </AccessibleButton>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Files</h3>
                <AccessibleButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(false)}
                  aria-label="Close upload dialog"
                >
                  <X className="h-5 w-5" />
                </AccessibleButton>
              </div>
              <DragDropUpload
                onFilesSelected={handleFilesSelected}
                maxFiles={5}
                maxSize={10}
              />
            </div>
          </div>
        </div>
      )}

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Record Voice Message</h3>
                <AccessibleButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoiceRecorder(false)}
                  aria-label="Close voice recorder"
                >
                  <X className="h-5 w-5" />
                </AccessibleButton>
              </div>
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                onCancel={() => setShowVoiceRecorder(false)}
                maxDuration={300}
              />
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          isOpen={true}
          onClose={() => setPreviewFile(null)}
          onDownload={() => {
            if (previewFile.url) {
              startDownload(previewFile.url, previewFile.name, previewFile.size);
            }
          }}
        />
      )}

      {/* Download Manager */}
      <DownloadManager
        downloads={downloads}
        onCancel={cancelDownload}
        onPause={pauseDownload}
        onResume={resumeDownload}
        onRetry={retryDownload}
        onClearCompleted={clearCompleted}
      />
    </div>
  );
}