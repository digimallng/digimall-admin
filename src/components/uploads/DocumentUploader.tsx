'use client';

/**
 * Document Uploader Component
 *
 * Component for uploading documents (PDF, DOC, DOCX) with progress tracking.
 */

import { useState, useCallback, useRef } from 'react';
import { FileText, Upload, X, Loader2, Check, Download } from 'lucide-react';
import { useUploadDocument, useDeleteFile, useFileValidation, useFileUtils } from '@/lib/hooks/use-uploads';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DocumentUploaderProps {
  /**
   * S3 folder path
   */
  folder?: string;
  /**
   * Current document URL
   */
  value?: string;
  /**
   * Callback when upload is complete
   */
  onChange?: (url: string) => void;
  /**
   * Custom placeholder text
   */
  placeholder?: string;
  /**
   * Custom CSS class
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Show file info
   */
  showFileInfo?: boolean;
}

interface UploadedDocument {
  url: string;
  name: string;
  size: number;
  isUploading: boolean;
}

export function DocumentUploader({
  folder = 'documents',
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  showFileInfo = true,
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [document, setDocument] = useState<UploadedDocument | null>(() => {
    if (!value) return null;
    return {
      url: value,
      name: value.split('/').pop() || 'Document',
      size: 0,
      isUploading: false,
    };
  });

  const { validateDocument } = useFileValidation();
  const { formatFileSize, extractFileKeyFromUrl } = useFileUtils();
  const { mutate: uploadDoc, isPending: isUploading } = useUploadDocument();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const file = files[0];
      const validation = validateDocument(file);

      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Show document info immediately
      setDocument({
        url: '',
        name: file.name,
        size: file.size,
        isUploading: true,
      });

      // Upload
      uploadDoc(
        { file, folder },
        {
          onSuccess: (data) => {
            const documentUrl = data.data.cloudFrontUrl || data.data.url;
            setDocument({
              url: documentUrl,
              name: file.name,
              size: data.data.size,
              isUploading: false,
            });
            onChange?.(documentUrl);
          },
          onError: () => {
            setDocument(null);
          },
        }
      );
    },
    [folder, disabled, validateDocument, uploadDoc, onChange]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Remove document
  const handleRemove = useCallback(() => {
    if (disabled || isUploading || isDeleting) return;

    if (document?.url) {
      const fileKey = extractFileKeyFromUrl(document.url);
      if (fileKey) {
        deleteFile(fileKey, {
          onSuccess: () => {
            setDocument(null);
            onChange?.('');
          },
        });
      }
    } else {
      setDocument(null);
      onChange?.('');
    }
  }, [document, disabled, isUploading, isDeleting, extractFileKeyFromUrl, deleteFile, onChange]);

  // Download document
  const handleDownload = useCallback(() => {
    if (document?.url) {
      window.open(document.url, '_blank');
    }
  }, [document]);

  // Trigger file input
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!document ? (
        // Upload Area
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed',
            isUploading && 'pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading document...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {placeholder || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        // Document Preview
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div className="flex-shrink-0">
              {document.isUploading ? (
                <div className="h-12 w-12 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded">
                  {getFileIcon(document.name)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{document.name}</p>
              {showFileInfo && document.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(document.size)}
                </p>
              )}
              {document.isUploading && (
                <p className="text-xs text-primary mt-1">Uploading...</p>
              )}
              {!document.isUploading && document.url && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Uploaded successfully
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!document.isUploading && document.url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={disabled}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replace button */}
      {document && !document.isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Replace Document
        </Button>
      )}
    </div>
  );
}
