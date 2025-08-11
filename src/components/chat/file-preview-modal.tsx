'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  File,
  Archive,
  Code,
  Image as ImageIcon,
  Film,
  Music,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FilePreviewModalProps {
  file: {
    url: string;
    name: string;
    size: number;
    mimeType: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

interface PreviewerProps {
  file: {
    url: string;
    name: string;
    size: number;
    mimeType: string;
  };
}

// Image Preview Component
function ImagePreviewer({ file }: PreviewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Controls */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 z-10">
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
          className="p-1 text-white hover:bg-white/20 rounded transition-colors"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-white text-sm font-mono px-2">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
          className="p-1 text-white hover:bg-white/20 rounded transition-colors"
          disabled={zoom >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-white/30 mx-1" />
        <button
          onClick={() => setRotation(prev => (prev + 90) % 360)}
          className="p-1 text-white hover:bg-white/20 rounded transition-colors"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-4 text-white">
          <AlertCircle className="h-12 w-12" />
          <p>Failed to load image</p>
        </div>
      ) : (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          onWheel={(e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
              setZoom(prev => Math.min(prev + 0.1, 3));
            } else {
              setZoom(prev => Math.max(prev - 0.1, 0.5));
            }
          }}
        />
      )}
    </div>
  );
}

// Video Preview Component
function VideoPreviewer({ file }: PreviewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-white">
          <AlertCircle className="h-12 w-12" />
          <p>Failed to load video</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={file.url}
            className="max-w-full max-h-full"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setError(true)}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg px-4 py-2">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Audio Preview Component
function AudioPreviewer({ file }: PreviewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      {error ? (
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12" />
          <p>Failed to load audio</p>
        </div>
      ) : (
        <>
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8">
            <Music className="h-16 w-16" />
          </div>

          <audio
            ref={audioRef}
            src={file.url}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onError={() => setError(true)}
            preload="metadata"
          />

          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-medium text-center">{file.name}</h3>
            
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </button>

            <div className="flex items-center gap-4 text-sm">
              <span>{formatTime(currentTime)}</span>
              <div className="w-48 h-1 bg-white/20 rounded-full">
                <div 
                  className="h-1 bg-white rounded-full transition-all"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// PDF Preview Component
function PDFPreviewer({ file }: PreviewerProps) {
  return (
    <div className="w-full h-full">
      <iframe
        src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full border-0"
        title={file.name}
      />
    </div>
  );
}

// Text Preview Component
function TextPreviewer({ file }: PreviewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(file.url)
      .then(response => response.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [file.url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white gap-4">
        <AlertCircle className="h-12 w-12" />
        <p>Failed to load text content</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-white text-gray-900 overflow-auto">
      <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
    </div>
  );
}

// Generic File Preview Component
function GenericFilePreviewer({ file }: PreviewerProps) {
  const getFileIcon = () => {
    const type = file.mimeType.toLowerCase();
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) {
      return <Archive className="h-16 w-16" />;
    }
    if (type.includes('code') || type.includes('javascript') || type.includes('json')) {
      return <Code className="h-16 w-16" />;
    }
    return <File className="h-16 w-16" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <div className="w-32 h-32 bg-gray-600 rounded-lg flex items-center justify-center mb-6">
        {getFileIcon()}
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">{file.name}</h3>
        <p className="text-gray-300">{formatFileSize(file.size)}</p>
        <p className="text-sm text-gray-400">{file.mimeType}</p>
      </div>

      <div className="mt-6 text-center text-gray-400">
        <p>Preview not available for this file type</p>
        <p className="text-sm">Click download to view the file</p>
      </div>
    </div>
  );
}

export function FilePreviewModal({ file, isOpen, onClose, onDownload }: FilePreviewModalProps) {
  const [error, setError] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleDownload();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderPreview = () => {
    const type = file.mimeType.toLowerCase();

    try {
      if (type.startsWith('image/')) {
        return <ImagePreviewer file={file} />;
      }
      if (type.startsWith('video/')) {
        return <VideoPreviewer file={file} />;
      }
      if (type.startsWith('audio/')) {
        return <AudioPreviewer file={file} />;
      }
      if (type === 'application/pdf') {
        return <PDFPreviewer file={file} />;
      }
      if (type.startsWith('text/') || type.includes('json') || type.includes('xml')) {
        return <TextPreviewer file={file} />;
      }
      
      return <GenericFilePreviewer file={file} />;
    } catch (error) {
      setError(true);
      return <GenericFilePreviewer file={file} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute inset-4 bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-medium truncate max-w-md">{file.name}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Download (Ctrl+D)"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => window.open(file.url, '_blank')}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="w-full h-full pt-16">
              {error ? <GenericFilePreviewer file={file} /> : renderPreview()}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-center">
              <div className="text-white/70 text-sm">
                <span>Press ESC to close • Ctrl+D to download</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}