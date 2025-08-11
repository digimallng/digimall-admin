'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  Loader2,
  Check,
  CheckCheck,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Info,
  Smile,
  File,
  Camera,
  Mic,
  AlertCircle,
  MessageSquare,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
  useConversation,
  useConversationMessages,
  useSendMessage,
  useMarkAsRead,
} from '@/hooks/use-chat';
import { ChatMessage, ChatConversation } from '@/lib/api/services/chat.service';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ChatWebSocketProvider, useChatWebSocket } from '@/providers/chat-websocket-provider';
import { EmojiPicker } from '@/components/emoji-picker';
import { FileAttachment } from '@/components/chat/file-attachment';
import { ImagePreviewModal } from '@/components/chat/image-preview-modal';
import { fileUploadService } from '@/services/file-upload.service';

interface InlineChatProps {
  conversationId: string;
  onClose?: () => void;
  onBack?: () => void;
}

function InlineChatContent({ conversationId, onClose, onBack }: InlineChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const {
    isConnected,
    sendMessage: sendWebSocketMessage,
    joinConversation,
    leaveConversation,
    markAsRead: markAsReadWebSocket,
  } = useChatWebSocket();

  // Queries
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(conversationId);
  const { data: messagesData, isLoading: isLoadingMessages } = useConversationMessages(
    conversationId,
    page,
    50
  );
  const messages = messagesData?.messages || [];

  // Mutations
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Join conversation room when component mounts
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);

      // Mark messages as read
      if (conversation?.unreadCount && conversation.unreadCount > 0) {
        markAsReadMutation.mutate({ conversationId });
        markAsReadWebSocket(conversationId);
      }

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected, conversation?.unreadCount]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
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
    });
  };

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachedFiles.length === 0) || !conversation) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Send text message if there's content
      if (messageContent) {
        if (isConnected) {
          sendWebSocketMessage(conversation.id, messageContent, 'text');
        } else {
          await sendMessageMutation.mutateAsync({
            conversationId: conversation.id,
            content: messageContent,
            type: 'text',
          });
        }
      }

      // Handle file uploads
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            const validation = fileUploadService.validateFile(file, 10);
            if (!validation.valid) {
              toast.error(`File validation failed: ${validation.error}`);
              continue;
            }

            const uploadedFile = await fileUploadService.uploadFile(file, progress => {
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress.percentage,
              }));
            });

            const messageType = fileUploadService.getFileType(file);

            const fileMessage = {
              conversationId: conversation.id,
              content: uploadedFile.fileName,
              type: messageType,
              fileName: uploadedFile.fileName,
              fileSize: uploadedFile.fileSize,
              fileUrl: uploadedFile.url,
              mimeType: uploadedFile.mimeType,
            };

            if (isConnected) {
              sendWebSocketMessage(conversation.id, fileMessage.content, fileMessage.type, {
                fileUrl: fileMessage.fileUrl,
                fileName: fileMessage.fileName,
                fileSize: fileMessage.fileSize,
                mimeType: fileMessage.mimeType,
              });
            } else {
              await sendMessageMutation.mutateAsync(fileMessage);
            }

            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          } catch (error) {
            console.error(`Failed to upload file ${file.name}:`, error);
            toast.error(`Failed to upload ${file.name}`);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          }
        }
        setAttachedFiles([]);
      }

      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent);
      if (attachedFiles.length > 0) {
        setAttachedFiles(attachedFiles);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (isLoadingConversation) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-gray-500'>Conversation not found</p>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p.userId !== session?.user?.id);

  return (
    <div className='flex flex-col h-full bg-white relative'>
      {/* Header - Relative positioning within container */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm'>
        <div className='flex items-center gap-4'>
          {onBack && (
            <button
              onClick={onBack}
              className='p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
          )}
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
                {otherParticipant?.userName?.charAt(0) || '?'}
              </div>
              {otherParticipant?.isOnline && (
                <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
              )}
            </div>
            <div>
              <h4 className='font-semibold text-gray-900'>
                {conversation.title || otherParticipant?.userName || 'Unknown'}
              </h4>
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <span>
                  {otherParticipant?.isOnline ? 'Online' : 'Last seen recently'}
                </span>
                <span>•</span>
                <span className='capitalize'>{otherParticipant?.userType || 'user'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
            <Phone className='h-5 w-5' />
          </button>
          <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
            <Video className='h-5 w-5' />
          </button>
          <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
            <Info className='h-5 w-5' />
          </button>
          {onClose && (
            <button onClick={onClose} className='p-2 rounded-lg text-gray-600 hover:bg-gray-100'>
              <X className='h-5 w-5' />
            </button>
          )}
        </div>
      </div>

      {/* Messages - Natural flow within container */}
      <div className='flex-1 overflow-y-auto p-6 bg-gray-50'>
        {isLoadingMessages ? (
          <div className='flex items-center justify-center h-full'>
            <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <MessageSquare className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Start the conversation</h3>
            <p className='text-gray-500 max-w-md'>
              Send a message to begin chatting with this user. They'll receive a notification when you send your first message.
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === session?.user?.id;
              const showDate =
                index === 0 ||
                new Date(message.sentAt).toDateString() !==
                  new Date(messages[index - 1].sentAt).toDateString();

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className='flex items-center justify-center mb-6'>
                      <div className='bg-white px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-500 shadow-sm'>
                        {formatFullDate(message.sentAt)}
                      </div>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold'>
                        {isOwnMessage ? 'A' : otherParticipant?.userName?.charAt(0) || '?'}
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div className='max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl'>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          ((message.messageType === 'image' || message.type === 'image') || 
                           (message.fileUrl && message.mimeType?.startsWith('image/'))) ? 'p-2' : ''
                        } ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        {((message.messageType === 'image' || message.type === 'image') || 
                          (message.fileUrl && message.mimeType?.startsWith('image/'))) && message.fileUrl ? (
                          <div
                            className='cursor-pointer'
                            onClick={() =>
                              setPreviewImage({
                                url: message.fileUrl!,
                                name: message.fileName || 'Image',
                              })
                            }
                          >
                            <img
                              src={message.fileUrl}
                              alt={message.fileName || 'Image'}
                              className='max-w-xs rounded-lg'
                            />
                            {message.fileName && (
                              <p className='mt-2 text-xs opacity-80'>{message.fileName}</p>
                            )}
                          </div>
                        ) : (message.messageType === 'video' || message.type === 'video') && message.fileUrl ? (
                          <div className='max-w-sm'>
                            <video
                              src={message.fileUrl}
                              controls
                              className='w-full rounded-lg'
                              preload='metadata'
                            >
                              Your browser does not support the video tag.
                            </video>
                            {message.fileName && (
                              <p className='mt-2 text-xs opacity-80'>{message.fileName}</p>
                            )}
                          </div>
                        ) : (message.messageType === 'audio' || message.type === 'audio') && message.fileUrl ? (
                          <div className='flex items-center gap-3 p-3 bg-gray-100 rounded-lg max-w-sm'>
                            <Mic className='h-5 w-5 text-gray-500' />
                            <div className='flex-1'>
                              <audio src={message.fileUrl} controls className='w-full'>
                                Your browser does not support the audio tag.
                              </audio>
                              {message.fileName && (
                                <p className='text-xs text-gray-600 mt-1'>{message.fileName}</p>
                              )}
                            </div>
                          </div>
                        ) : (message.messageType === 'file' || message.type === 'file') && message.fileUrl ? (
                          <div className='flex items-center gap-3 p-3 bg-gray-100 rounded-lg max-w-sm'>
                            <div className='flex-shrink-0'>
                              <File className='h-5 w-5 text-gray-500' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>
                                {message.fileName || 'File'}
                              </p>
                              {message.fileSize && (
                                <p className='text-xs text-gray-500'>
                                  {Math.round(message.fileSize / 1024)} KB
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = message.fileUrl!;
                                link.download = message.fileName || 'file';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className='flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors'
                              title='Download file'
                            >
                              <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z' />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <p className='text-sm leading-relaxed break-words'>{message.content}</p>
                        )}
                      </div>

                      {/* Message Info */}
                      <div
                        className={`flex items-center gap-2 mt-1 text-xs text-gray-400 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{formatTime(message.sentAt)}</span>
                        {isOwnMessage && (
                          <div className='flex items-center'>
                            {message.readBy && message.readBy.length > 0 ? (
                              <CheckCheck className='h-3 w-3 text-blue-500' />
                            ) : (
                              <Check className='h-3 w-3' />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Bottom of container */}
      <div className='bg-white border-t border-gray-100 shadow-lg'>
        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className='px-6 py-3 border-b border-gray-50'>
            <div className='space-y-2'>
              {attachedFiles.map((file, index) => (
                <FileAttachment
                  key={index}
                  file={file}
                  onRemove={() => removeAttachedFile(index)}
                  uploadProgress={uploadProgress[file.name]}
                />
              ))}
            </div>
          </div>
        )}

        <div className='px-6 py-4'>
          <div className='flex items-end gap-3'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileUpload}
              className='hidden'
              multiple
              accept='image/*,video/*,audio/*,.pdf,.doc,.docx'
            />

            {/* Action Buttons */}
            <div className='flex items-center gap-1'>
              <button
                onClick={handleFileSelect}
                className='p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <Paperclip className='h-5 w-5' />
              </button>
              <button className='p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'>
                <Camera className='h-5 w-5' />
              </button>
              <button className='p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'>
                <Mic className='h-5 w-5' />
              </button>
            </div>

            {/* Message Input */}
            <div className='flex-1 relative'>
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Type your message...'
                className='w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: 'auto',
                }}
                disabled={!isConnected}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className='absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors'
              >
                <Smile className='h-5 w-5' />
              </button>
              {showEmojiPicker && (
                <div className='absolute bottom-full right-0 mb-2'>
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={
                (!newMessage.trim() && attachedFiles.length === 0) ||
                !isConnected ||
                sendMessageMutation.isPending
              }
              className={`p-3 rounded-full transition-all ${
                newMessage.trim() || attachedFiles.length > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-5 w-5' />
              )}
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className='flex items-center gap-2 mt-2 text-xs text-amber-600'>
              <AlertCircle className='h-4 w-4' />
              <span>Reconnecting... Messages will be sent when connected.</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          fileName={previewImage.name}
          isOpen={true}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}

// Wrapper component that provides WebSocket context
export function InlineChat(props: InlineChatProps) {
  return (
    <ChatWebSocketProvider>
      <InlineChatContent {...props} />
    </ChatWebSocketProvider>
  );
}