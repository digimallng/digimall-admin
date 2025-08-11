'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Image as ImageIcon, Film, Music, File, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

interface FileError {
  file: string;
  error: string;
}

export function DragDropUpload({
  onFilesSelected,
  accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar',
  maxFiles = 10,
  maxSize = 10,
  disabled = false,
  className,
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<FileError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    if (accept && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return fileExtension === acceptedType;
        }
        if (acceptedType.includes('/*')) {
          const baseType = acceptedType.split('/')[0];
          return mimeType.startsWith(baseType);
        }
        return mimeType === acceptedType;
      });

      if (!isAccepted) {
        return 'File type not supported';
      }
    }

    return null;
  }, [accept, maxSize]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors: FileError[] = [];

    // Check max files limit
    if (fileArray.length > maxFiles) {
      newErrors.push({
        file: 'Multiple files',
        error: `Maximum ${maxFiles} files allowed`,
      });
      setErrors(newErrors);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push({ file: file.name, error });
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [maxFiles, validateFile, onFilesSelected]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value
    e.target.value = '';
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon className="h-6 w-6" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <Film className="h-6 w-6" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return <Music className="h-6 w-6" />;
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          'hover:border-blue-400 hover:bg-blue-50/50',
          isDragOver && 'border-blue-500 bg-blue-50 scale-[1.02]',
          disabled && 'opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-transparent',
          !isDragOver && !disabled && 'border-gray-300'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload files by clicking or dragging and dropping"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <div className={cn(
            'mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop files here' : 'Upload files'}
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or click to browse
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Maximum {maxFiles} files, {maxSize}MB each</p>
              <p>Supported: Images, Videos, Audio, Documents</p>
            </div>
          </div>
        </div>

        {/* Supported file types preview */}
        <div className="mt-6 flex justify-center space-x-4 opacity-40">
          <ImageIcon className="h-5 w-5" />
          <Film className="h-5 w-5" />
          <Music className="h-5 w-5" />
          <FileText className="h-5 w-5" />
          <File className="h-5 w-5" />
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <span className="font-medium text-red-800">{error.file}:</span>
                <span className="text-red-600 ml-1">{error.error}</span>
              </div>
              <button
                onClick={() => setErrors(prev => prev.filter((_, i) => i !== index))}
                className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}