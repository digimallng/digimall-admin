'use client';

import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  File,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  Database,
  Download,
  FileX,
  Presentation,
  BookOpen,
  Settings,
  Lock,
  Globe,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTypeIconProps {
  fileName: string;
  mimeType?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'colored' | 'minimal';
  className?: string;
}

interface FileTypeInfo {
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  category: string;
}

const fileTypeMap: Record<string, FileTypeInfo> = {
  // Images
  'jpg': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },
  'jpeg': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },
  'png': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },
  'gif': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },
  'svg': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },
  'webp': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },
  'bmp': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },
  'ico': { icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100', category: 'image' },

  // Videos
  'mp4': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },
  'avi': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },
  'mov': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },
  'wmv': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },
  'flv': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },
  'webm': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },
  'mkv': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },
  '3gp': { icon: Film, color: 'text-red-600', bgColor: 'bg-red-100', category: 'video' },

  // Audio
  'mp3': { icon: Music, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'audio' },
  'wav': { icon: Music, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'audio' },
  'ogg': { icon: Music, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'audio' },
  'flac': { icon: Music, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'audio' },
  'aac': { icon: Music, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'audio' },
  'm4a': { icon: Music, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'audio' },
  'wma': { icon: Music, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'audio' },

  // Documents
  'pdf': { icon: FileText, color: 'text-red-700', bgColor: 'bg-red-100', category: 'document' },
  'doc': { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'document' },
  'docx': { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'document' },
  'txt': { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'document' },
  'rtf': { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'document' },
  'odt': { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'document' },

  // Spreadsheets
  'xls': { icon: FileSpreadsheet, color: 'text-green-700', bgColor: 'bg-green-100', category: 'spreadsheet' },
  'xlsx': { icon: FileSpreadsheet, color: 'text-green-700', bgColor: 'bg-green-100', category: 'spreadsheet' },
  'csv': { icon: FileSpreadsheet, color: 'text-green-700', bgColor: 'bg-green-100', category: 'spreadsheet' },
  'ods': { icon: FileSpreadsheet, color: 'text-green-700', bgColor: 'bg-green-100', category: 'spreadsheet' },

  // Presentations
  'ppt': { icon: Presentation, color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'presentation' },
  'pptx': { icon: Presentation, color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'presentation' },
  'odp': { icon: Presentation, color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'presentation' },

  // Archives
  'zip': { icon: FileArchive, color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'archive' },
  'rar': { icon: FileArchive, color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'archive' },
  '7z': { icon: FileArchive, color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'archive' },
  'tar': { icon: FileArchive, color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'archive' },
  'gz': { icon: FileArchive, color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'archive' },
  'bz2': { icon: FileArchive, color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'archive' },

  // Code files
  'js': { icon: FileCode, color: 'text-yellow-500', bgColor: 'bg-yellow-100', category: 'code' },
  'ts': { icon: FileCode, color: 'text-blue-500', bgColor: 'bg-blue-100', category: 'code' },
  'jsx': { icon: FileCode, color: 'text-cyan-500', bgColor: 'bg-cyan-100', category: 'code' },
  'tsx': { icon: FileCode, color: 'text-cyan-500', bgColor: 'bg-cyan-100', category: 'code' },
  'html': { icon: FileCode, color: 'text-orange-500', bgColor: 'bg-orange-100', category: 'code' },
  'css': { icon: FileCode, color: 'text-blue-500', bgColor: 'bg-blue-100', category: 'code' },
  'scss': { icon: FileCode, color: 'text-pink-500', bgColor: 'bg-pink-100', category: 'code' },
  'sass': { icon: FileCode, color: 'text-pink-500', bgColor: 'bg-pink-100', category: 'code' },
  'json': { icon: FileCode, color: 'text-green-500', bgColor: 'bg-green-100', category: 'code' },
  'xml': { icon: FileCode, color: 'text-orange-500', bgColor: 'bg-orange-100', category: 'code' },
  'yaml': { icon: FileCode, color: 'text-purple-500', bgColor: 'bg-purple-100', category: 'code' },
  'yml': { icon: FileCode, color: 'text-purple-500', bgColor: 'bg-purple-100', category: 'code' },
  'py': { icon: FileCode, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'code' },
  'java': { icon: FileCode, color: 'text-red-600', bgColor: 'bg-red-100', category: 'code' },
  'cpp': { icon: FileCode, color: 'text-blue-700', bgColor: 'bg-blue-100', category: 'code' },
  'c': { icon: FileCode, color: 'text-blue-700', bgColor: 'bg-blue-100', category: 'code' },
  'php': { icon: FileCode, color: 'text-indigo-600', bgColor: 'bg-indigo-100', category: 'code' },
  'rb': { icon: FileCode, color: 'text-red-500', bgColor: 'bg-red-100', category: 'code' },
  'go': { icon: FileCode, color: 'text-cyan-600', bgColor: 'bg-cyan-100', category: 'code' },
  'rs': { icon: FileCode, color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'code' },
  'swift': { icon: FileCode, color: 'text-orange-500', bgColor: 'bg-orange-100', category: 'code' },
  'kt': { icon: FileCode, color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'code' },

  // Data files
  'sql': { icon: Database, color: 'text-blue-700', bgColor: 'bg-blue-100', category: 'data' },
  'db': { icon: Database, color: 'text-blue-700', bgColor: 'bg-blue-100', category: 'data' },
  'sqlite': { icon: Database, color: 'text-blue-700', bgColor: 'bg-blue-100', category: 'data' },

  // Web files
  'html': { icon: Globe, color: 'text-orange-500', bgColor: 'bg-orange-100', category: 'web' },
  'htm': { icon: Globe, color: 'text-orange-500', bgColor: 'bg-orange-100', category: 'web' },
  'xhtml': { icon: Globe, color: 'text-orange-500', bgColor: 'bg-orange-100', category: 'web' },

  // Configuration files
  'config': { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'config' },
  'conf': { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'config' },
  'ini': { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'config' },
  'env': { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'config' },

  // Security files
  'key': { icon: Lock, color: 'text-red-600', bgColor: 'bg-red-100', category: 'security' },
  'pem': { icon: Lock, color: 'text-red-600', bgColor: 'bg-red-100', category: 'security' },
  'cert': { icon: Lock, color: 'text-red-600', bgColor: 'bg-red-100', category: 'security' },
  'crt': { icon: Lock, color: 'text-red-600', bgColor: 'bg-red-100', category: 'security' },

  // Package files
  'deb': { icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'package' },
  'rpm': { icon: Package, color: 'text-red-600', bgColor: 'bg-red-100', category: 'package' },
  'pkg': { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'package' },
  'dmg': { icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'package' },
  'exe': { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'package' },
  'msi': { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'package' },
  'app': { icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'package' },

  // E-books
  'epub': { icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-100', category: 'ebook' },
  'mobi': { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'ebook' },
  'azw': { icon: BookOpen, color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'ebook' },
};

// MIME type mappings
const mimeTypeMap: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  
  'video/mp4': 'mp4',
  'video/avi': 'avi',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/webm': 'webm',

  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/flac': 'flac',
  'audio/aac': 'aac',
  'audio/x-m4a': 'm4a',

  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'application/rtf': 'rtf',

  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',

  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',

  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  'application/x-tar': 'tar',
  'application/gzip': 'gz',

  'application/javascript': 'js',
  'text/javascript': 'js',
  'application/typescript': 'ts',
  'text/html': 'html',
  'text/css': 'css',
  'application/json': 'json',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/x-yaml': 'yaml',
  'text/yaml': 'yaml',
};

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot !== -1 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function getFileTypeInfo(fileName: string, mimeType?: string): FileTypeInfo {
  // Try MIME type first
  if (mimeType && mimeTypeMap[mimeType]) {
    const extension = mimeTypeMap[mimeType];
    if (fileTypeMap[extension]) {
      return fileTypeMap[extension];
    }
  }

  // Fall back to file extension
  const extension = getFileExtension(fileName);
  if (fileTypeMap[extension]) {
    return fileTypeMap[extension];
  }

  // Default fallback
  return {
    icon: File,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    category: 'unknown'
  };
}

export function FileTypeIcon({ 
  fileName, 
  mimeType, 
  size = 'md', 
  variant = 'default',
  className 
}: FileTypeIconProps) {
  const fileInfo = getFileTypeInfo(fileName, mimeType);
  const IconComponent = fileInfo.icon;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const containerSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (variant === 'minimal') {
    return (
      <IconComponent 
        className={cn(
          sizeClasses[size],
          fileInfo.color,
          className
        )} 
      />
    );
  }

  if (variant === 'colored') {
    return (
      <div className={cn(
        containerSizeClasses[size],
        fileInfo.bgColor,
        'rounded-lg flex items-center justify-center',
        className
      )}>
        <IconComponent 
          className={cn(
            sizeClasses[size],
            fileInfo.color
          )} 
        />
      </div>
    );
  }

  return (
    <div className={cn(
      containerSizeClasses[size],
      'bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200',
      className
    )}>
      <IconComponent 
        className={cn(
          sizeClasses[size],
          'text-gray-600'
        )} 
      />
    </div>
  );
}

interface FileTypeIndicatorProps {
  fileName: string;
  mimeType?: string;
  fileSize?: number;
  className?: string;
}

export function FileTypeIndicator({ 
  fileName, 
  mimeType, 
  fileSize,
  className 
}: FileTypeIndicatorProps) {
  const fileInfo = getFileTypeInfo(fileName, mimeType);
  const extension = getFileExtension(fileName).toUpperCase();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <FileTypeIcon 
        fileName={fileName} 
        mimeType={mimeType} 
        variant="colored" 
        size="lg"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {fileName}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          {extension && (
            <span className="uppercase font-mono">{extension}</span>
          )}
          {fileSize && (
            <>
              <span>•</span>
              <span>{formatFileSize(fileSize)}</span>
            </>
          )}
          <span>•</span>
          <span className="capitalize">{fileInfo.category}</span>
        </div>
      </div>
    </div>
  );
}

// Export utilities for external use
export const getFileCategory = (fileName: string, mimeType?: string): string => {
  return getFileTypeInfo(fileName, mimeType).category;
};

export const getFileColor = (fileName: string, mimeType?: string): string => {
  return getFileTypeInfo(fileName, mimeType).color;
};

export const getSupportedFileTypes = (): string[] => {
  return Object.keys(fileTypeMap);
};

export const getFileTypesByCategory = (): Record<string, string[]> => {
  const categories: Record<string, string[]> = {};
  
  Object.entries(fileTypeMap).forEach(([extension, info]) => {
    if (!categories[info.category]) {
      categories[info.category] = [];
    }
    categories[info.category].push(extension);
  });
  
  return categories;
};