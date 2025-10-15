'use client';

/**
 * File Manager Component
 *
 * Comprehensive file management component with upload, preview, and deletion.
 * Supports both images and documents.
 */

import { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { DocumentUploader } from './DocumentUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, FileText } from 'lucide-react';

type FileType = 'image' | 'document';

interface FileManagerProps {
  /**
   * File types to support
   */
  fileTypes?: FileType[];
  /**
   * Upload mode for images
   */
  imageMode?: 'single' | 'multiple';
  /**
   * Maximum number of images
   */
  maxImages?: number;
  /**
   * S3 folder path
   */
  folder?: string;
  /**
   * Current file URL(s)
   */
  value?: {
    images?: string | string[];
    document?: string;
  };
  /**
   * Callback when files change
   */
  onChange?: (files: {
    images?: string | string[];
    document?: string;
  }) => void;
  /**
   * Custom CSS class
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
}

export function FileManager({
  fileTypes = ['image', 'document'],
  imageMode = 'single',
  maxImages = 10,
  folder = 'uploads',
  value,
  onChange,
  className,
  disabled = false,
}: FileManagerProps) {
  const [activeTab, setActiveTab] = useState<FileType>(fileTypes[0]);

  const handleImageChange = useCallback(
    (urls: string | string[]) => {
      onChange?.({
        ...value,
        images: urls,
      });
    },
    [value, onChange]
  );

  const handleDocumentChange = useCallback(
    (url: string) => {
      onChange?.({
        ...value,
        document: url,
      });
    },
    [value, onChange]
  );

  // If only one file type, render without tabs
  if (fileTypes.length === 1) {
    const fileType = fileTypes[0];

    if (fileType === 'image') {
      return (
        <div className={className}>
          <ImageUploader
            mode={imageMode}
            maxFiles={maxImages}
            folder={folder}
            value={value?.images}
            onChange={handleImageChange}
            disabled={disabled}
          />
        </div>
      );
    }

    return (
      <div className={className}>
        <DocumentUploader
          folder={folder}
          value={value?.document}
          onChange={handleDocumentChange}
          disabled={disabled}
        />
      </div>
    );
  }

  // Multiple file types - use tabs
  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FileType)}>
        <TabsList className="grid w-full grid-cols-2">
          {fileTypes.includes('image') && (
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Images
            </TabsTrigger>
          )}
          {fileTypes.includes('document') && (
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          )}
        </TabsList>

        {fileTypes.includes('image') && (
          <TabsContent value="image" className="mt-4">
            <ImageUploader
              mode={imageMode}
              maxFiles={maxImages}
              folder={folder}
              value={value?.images}
              onChange={handleImageChange}
              disabled={disabled}
            />
          </TabsContent>
        )}

        {fileTypes.includes('document') && (
          <TabsContent value="document" className="mt-4">
            <DocumentUploader
              folder={folder}
              value={value?.document}
              onChange={handleDocumentChange}
              disabled={disabled}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
