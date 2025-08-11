'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, X, AlertCircle, Pause, Play, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DownloadProgress {
  id: string;
  fileName: string;
  fileSize: number;
  downloadedBytes: number;
  speed: number; // bytes per second
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  startTime: number;
  url: string;
}

interface DownloadProgressItemProps {
  download: DownloadProgress;
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRetry: (id: string) => void;
  className?: string;
}

interface DownloadManagerProps {
  downloads: DownloadProgress[];
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRetry: (id: string) => void;
  onClearCompleted: () => void;
  className?: string;
}

function DownloadProgressItem({
  download,
  onCancel,
  onPause,
  onResume,
  onRetry,
  className
}: DownloadProgressItemProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProgress = () => {
    if (download.fileSize === 0) return 0;
    return (download.downloadedBytes / download.fileSize) * 100;
  };

  const getTimeRemaining = () => {
    if (download.speed === 0 || download.status !== 'downloading') return null;
    const remainingBytes = download.fileSize - download.downloadedBytes;
    return remainingBytes / download.speed;
  };

  const getStatusIcon = () => {
    switch (download.status) {
      case 'downloading':
        return <Download className="h-4 w-4 text-blue-500 animate-bounce" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (download.status) {
      case 'pending':
        return 'Preparing...';
      case 'downloading':
        const remaining = getTimeRemaining();
        return remaining ? `${formatTime(remaining)} remaining` : 'Downloading...';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'failed':
        return download.error || 'Download failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return '';
    }
  };

  const progress = getProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {download.fileName}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{formatBytes(download.downloadedBytes)}</span>
                <span>/</span>
                <span>{formatBytes(download.fileSize)}</span>
                {download.speed > 0 && download.status === 'downloading' && (
                  <>
                    <span>•</span>
                    <span>{formatSpeed(download.speed)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {download.status === 'downloading' && (
                <button
                  onClick={() => onPause(download.id)}
                  className="p-1 text-gray-400 hover:text-yellow-600 rounded transition-colors"
                  title="Pause download"
                >
                  <Pause className="h-4 w-4" />
                </button>
              )}
              
              {download.status === 'paused' && (
                <button
                  onClick={() => onResume(download.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  title="Resume download"
                >
                  <Play className="h-4 w-4" />
                </button>
              )}
              
              {download.status === 'failed' && (
                <button
                  onClick={() => onRetry(download.id)}
                  className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                  title="Retry download"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
              
              {!['completed', 'cancelled'].includes(download.status) && (
                <button
                  onClick={() => onCancel(download.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                  title="Cancel download"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  download.status === 'completed' ? 'bg-green-500' :
                  download.status === 'failed' ? 'bg-red-500' :
                  download.status === 'paused' ? 'bg-yellow-500' :
                  'bg-blue-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{getStatusText()}</span>
              <span className="text-gray-400 font-mono">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DownloadManager({
  downloads,
  onCancel,
  onPause,
  onResume,
  onRetry,
  onClearCompleted,
  className
}: DownloadManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeDownloads = downloads.filter(d => !['completed', 'cancelled', 'failed'].includes(d.status));
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const failedDownloads = downloads.filter(d => d.status === 'failed');

  const totalProgress = downloads.length > 0 
    ? downloads.reduce((sum, d) => sum + (d.downloadedBytes / d.fileSize) * 100, 0) / downloads.length 
    : 0;

  if (downloads.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Downloads</h3>
          {activeDownloads.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {activeDownloads.length} active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {completedDownloads.length > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
            >
              Clear completed
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      {activeDownloads.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Overall Progress</span>
            <span className="text-gray-500 font-mono">{Math.round(totalProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="h-1.5 bg-blue-500 rounded-full"
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Download List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-h-96 overflow-y-auto"
          >
            <div className="p-2 space-y-2">
              <AnimatePresence mode="popLayout">
                {downloads.map((download) => (
                  <DownloadProgressItem
                    key={download.id}
                    download={download}
                    onCancel={onCancel}
                    onPause={onPause}
                    onResume={onResume}
                    onRetry={onRetry}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {!isExpanded && downloads.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-600">
          {activeDownloads.length} downloading, {completedDownloads.length} completed
          {failedDownloads.length > 0 && `, ${failedDownloads.length} failed`}
        </div>
      )}
    </motion.div>
  );
}

// Hook for managing downloads
export function useDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);

  const startDownload = useCallback((url: string, fileName: string, fileSize: number) => {
    const downloadId = Math.random().toString(36).substr(2, 9);
    
    const newDownload: DownloadProgress = {
      id: downloadId,
      fileName,
      fileSize,
      downloadedBytes: 0,
      speed: 0,
      status: 'pending',
      startTime: Date.now(),
      url,
    };

    setDownloads(prev => [...prev, newDownload]);

    // Simulate download progress (replace with actual download logic)
    simulateDownload(downloadId);

    return downloadId;
  }, []);

  const simulateDownload = (downloadId: string) => {
    const interval = setInterval(() => {
      setDownloads(prev => prev.map(download => {
        if (download.id !== downloadId || download.status !== 'downloading') {
          return download;
        }

        const elapsed = Date.now() - download.startTime;
        const speed = Math.random() * 1024 * 1024; // Random speed up to 1MB/s
        const increment = speed * 0.1; // Update every 100ms
        const newDownloaded = Math.min(download.downloadedBytes + increment, download.fileSize);

        if (newDownloaded >= download.fileSize) {
          clearInterval(interval);
          return {
            ...download,
            downloadedBytes: download.fileSize,
            speed: 0,
            status: 'completed' as const,
          };
        }

        return {
          ...download,
          downloadedBytes: newDownloaded,
          speed,
        };
      }));
    }, 100);

    // Start the download
    setDownloads(prev => prev.map(download => 
      download.id === downloadId 
        ? { ...download, status: 'downloading' as const }
        : download
    ));
  };

  const pauseDownload = useCallback((downloadId: string) => {
    setDownloads(prev => prev.map(download =>
      download.id === downloadId
        ? { ...download, status: 'paused' as const, speed: 0 }
        : download
    ));
  }, []);

  const resumeDownload = useCallback((downloadId: string) => {
    setDownloads(prev => prev.map(download =>
      download.id === downloadId
        ? { ...download, status: 'downloading' as const }
        : download
    ));
    
    simulateDownload(downloadId);
  }, []);

  const cancelDownload = useCallback((downloadId: string) => {
    setDownloads(prev => prev.map(download =>
      download.id === downloadId
        ? { ...download, status: 'cancelled' as const, speed: 0 }
        : download
    ));
  }, []);

  const retryDownload = useCallback((downloadId: string) => {
    setDownloads(prev => prev.map(download =>
      download.id === downloadId
        ? { 
            ...download, 
            status: 'pending' as const, 
            downloadedBytes: 0,
            speed: 0,
            startTime: Date.now(),
            error: undefined
          }
        : download
    ));
    
    simulateDownload(downloadId);
  }, []);

  const clearCompleted = useCallback(() => {
    setDownloads(prev => prev.filter(download => download.status !== 'completed'));
  }, []);

  return {
    downloads,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    clearCompleted,
  };
}