'use client';

import { useState, useRef } from 'react';
import { useAddTicketResponse } from '@/lib/hooks/use-support';
import { SupportTicket } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Send, 
  Paperclip, 
  Eye, 
  EyeOff, 
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TicketResponseFormProps {
  ticket: SupportTicket;
  onSuccess?: () => void;
  className?: string;
}

export function TicketResponseForm({ ticket, onSuccess, className }: TicketResponseFormProps) {
  const [responseContent, setResponseContent] = useState('');
  const [responseType, setResponseType] = useState<'public' | 'internal'>('public');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addResponseMutation = useAddTicketResponse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseContent.trim()) return;

    try {
      // Convert attachments to base64 or upload them first
      const attachmentData = await Promise.all(
        attachments.map(async (file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          data: await fileToBase64(file)
        }))
      );

      await addResponseMutation.mutateAsync({
        ticketId: ticket.id,
        data: {
          content: responseContent,
          isPublic: responseType === 'public',
          attachments: attachmentData.length > 0 ? attachmentData : undefined
        }
      });

      // Reset form
      setResponseContent('');
      setAttachments([]);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add response:', error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 5 - attachments.length); // Max 5 files
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('bg-white border rounded-lg p-4', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Response Type Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Response Type:</span>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setResponseType('public')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                responseType === 'public'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <Eye className="h-4 w-4" />
              Public
            </button>
            <button
              type="button"
              onClick={() => setResponseType('internal')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                responseType === 'internal'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <EyeOff className="h-4 w-4" />
              Internal
            </button>
          </div>
        </div>

        {/* Response Type Info */}
        <div className={cn(
          'text-xs p-2 rounded-md flex items-center gap-2',
          responseType === 'public' 
            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
            : 'bg-gray-50 text-gray-700 border border-gray-200'
        )}>
          <AlertCircle className="h-3 w-3" />
          {responseType === 'public' 
            ? 'This response will be visible to the customer'
            : 'This is an internal note, only visible to support staff'
          }
        </div>

        {/* Response Content */}
        <div>
          <Textarea
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder={`Type your ${responseType} response here...`}
            rows={6}
            className="w-full resize-none"
            required
          />
        </div>

        {/* File Attachments */}
        <div>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-4 transition-colors',
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-gray-50'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center">
              <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag files here or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Max 5 files, 10MB each
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
            />
          </div>

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!responseContent.trim() || addResponseMutation.isPending}
            className="flex items-center gap-2"
          >
            {addResponseMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Response
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {addResponseMutation.error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Failed to send response. Please try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}