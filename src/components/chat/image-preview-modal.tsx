'use client';

import { useEffect, useState } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export function ImagePreviewModal({ imageUrl, isOpen, onClose, fileName }: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset zoom and rotation when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          e.preventDefault();
          setZoom(prev => Math.max(prev - 0.25, 0.5));
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          setRotation(prev => (prev + 90) % 360);
          break;
        case '0':
          e.preventDefault();
          setZoom(1);
          setRotation(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    // Handle data URLs differently
    if (imageUrl.startsWith('data:')) {
      // Convert data URL to blob for download
      const [header, data] = imageUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Regular URL download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
      <div className='relative max-w-7xl max-h-[90vh] mx-4'>
        {/* Header */}
        <div className='absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent z-10'>
          <div className='flex items-center gap-4'>
            <h3 className='text-white font-medium'>{fileName || 'Image Preview'}</h3>
            <div className='flex items-center gap-1 text-sm text-white/70'>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
              {rotation > 0 && <span>• Rotated: {rotation}°</span>}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {/* Zoom Controls */}
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors'
              title='Zoom out (-)'
              disabled={zoom <= 0.5}
            >
              <ZoomOut className='h-4 w-4 text-white' />
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors'
              title='Zoom in (+)'
              disabled={zoom >= 3}
            >
              <ZoomIn className='h-4 w-4 text-white' />
            </button>
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors'
              title='Rotate (R)'
            >
              <RotateCw className='h-4 w-4 text-white' />
            </button>
            <div className='w-px h-4 bg-white/20 mx-1' />
            <button
              onClick={handleDownload}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors'
              title='Download'
            >
              <Download className='h-5 w-5 text-white' />
            </button>
            <button
              onClick={() => {
                if (imageUrl.startsWith('data:')) {
                  const newWindow = window.open();
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head><title>${fileName || 'Image'}</title></head>
                        <body style="margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#000;">
                          <img src="${imageUrl}" alt="${fileName || 'Image'}" style="max-width:100%; max-height:100vh; object-fit:contain;" />
                        </body>
                      </html>
                    `);
                    newWindow.document.close();
                  }
                } else {
                  window.open(imageUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors'
              title='Open in new tab'
            >
              <ExternalLink className='h-5 w-5 text-white' />
            </button>
            <button
              onClick={onClose}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors'
              title='Close (Esc)'
            >
              <X className='h-5 w-5 text-white' />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className='relative overflow-auto max-w-full max-h-[90vh] flex items-center justify-center'>
          <img
            src={imageUrl}
            alt={fileName || 'Preview'}
            className='object-contain rounded-lg transition-transform duration-200 cursor-zoom-in'
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              maxWidth: zoom === 1 ? '100%' : 'none',
              maxHeight: zoom === 1 ? '90vh' : 'none',
            }}
            onClick={(e) => {
              // Double-click to zoom, single click with zoom to close
              if (e.detail === 2) {
                setZoom(zoom === 1 ? 2 : 1);
              } else if (zoom === 1) {
                onClose();
              }
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
        </div>

        {/* Help Text */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center'>
          <div className='px-4 py-2 bg-black/50 rounded-lg text-white text-sm'>
            <div className='flex items-center gap-4 text-xs'>
              <span>Double-click to zoom</span>
              <span>Scroll to zoom</span>
              <span>ESC to close</span>
              <span>R to rotate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
