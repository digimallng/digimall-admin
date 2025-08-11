'use client';

import { FileText, Image as ImageIcon, Film, Music, File, X, Upload } from 'lucide-react';

interface FileAttachmentProps {
  file: File;
  onRemove: () => void;
  uploadProgress?: number;
}

export function FileAttachment({ file, onRemove, uploadProgress }: FileAttachmentProps) {
  const getFileIcon = () => {
    const type = file.type;
    if (type.startsWith('image/')) return <ImageIcon className='h-5 w-5' />;
    if (type.startsWith('video/')) return <Film className='h-5 w-5' />;
    if (type.startsWith('audio/')) return <Music className='h-5 w-5' />;
    if (type.includes('pdf')) return <FileText className='h-5 w-5 text-red-500' />;
    return <File className='h-5 w-5' />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = file.type.startsWith('image/');
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className='relative group'>
      <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
        {/* File Icon or Image Preview */}
        {isImage && previewUrl ? (
          <div className='relative w-12 h-12 rounded overflow-hidden bg-gray-200'>
            <img
              src={previewUrl}
              alt={file.name}
              className='w-full h-full object-cover'
              onLoad={() => previewUrl && URL.revokeObjectURL(previewUrl)}
            />
          </div>
        ) : (
          <div className='w-12 h-12 bg-gray-100 rounded flex items-center justify-center'>
            {getFileIcon()}
          </div>
        )}

        {/* File Info */}
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-gray-900 truncate'>{file.name}</p>
          <p className='text-xs text-gray-500'>{formatFileSize(file.size)}</p>
        </div>

        {/* Upload Progress or Remove Button */}
        {uploadProgress !== undefined ? (
          <div className='flex items-center gap-2'>
            <div className='w-20'>
              <div className='flex items-center justify-between text-xs text-gray-500 mb-1'>
                <span>{uploadProgress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-1.5'>
                <div
                  className='bg-blue-500 h-1.5 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            {uploadProgress < 100 && <Upload className='h-4 w-4 text-gray-400 animate-pulse' />}
          </div>
        ) : (
          <button
            onClick={onRemove}
            className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
}
