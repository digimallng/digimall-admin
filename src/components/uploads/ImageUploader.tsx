'use client';

/**
 * Image Uploader Component
 *
 * Reusable component for uploading single or multiple images with preview.
 * Supports drag-and-drop, validation, and progress tracking.
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { useUploadImage, useUploadImages, useFileValidation } from '@/lib/hooks/use-uploads';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageUploaderProps {
  /**
   * Upload mode: single or multiple images
   */
  mode?: 'single' | 'multiple';
  /**
   * Maximum number of files (for multiple mode)
   */
  maxFiles?: number;
  /**
   * S3 folder path
   */
  folder?: string;
  /**
   * Current image URL(s)
   */
  value?: string | string[];
  /**
   * Callback when upload is complete
   */
  onChange?: (urls: string | string[]) => void;
  /**
   * Custom placeholder text
   */
  placeholder?: string;
  /**
   * Show preview of uploaded images
   */
  showPreview?: boolean;
  /**
   * Custom CSS class
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Aspect ratio for preview (e.g., "16/9", "1/1", "4/3")
   */
  aspectRatio?: string;
}

interface PreviewImage {
  url: string;
  isNew: boolean;
}

export function ImageUploader({
  mode = 'single',
  maxFiles = 10,
  folder = 'images',
  value,
  onChange,
  placeholder,
  showPreview = true,
  className,
  disabled = false,
  aspectRatio = '16/9',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<PreviewImage[]>(() => {
    if (!value) return [];
    const urls = Array.isArray(value) ? value : [value];
    return urls.map((url) => ({ url, isNew: false }));
  });

  const { validateImage, validateMultipleImages } = useFileValidation();
  const { mutate: uploadSingle, isPending: isUploadingSingle } = useUploadImage();
  const { mutate: uploadMultiple, isPending: isUploadingMultiple } = useUploadImages();

  const isUploading = isUploadingSingle || isUploadingMultiple;

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const fileArray = Array.from(files);

      // Validate based on mode
      if (mode === 'single') {
        const file = fileArray[0];
        const validation = validateImage(file);

        if (!validation.valid) {
          alert(validation.error);
          return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews([{ url: reader.result as string, isNew: true }]);
        };
        reader.readAsDataURL(file);

        // Upload
        uploadSingle(
          { file, folder },
          {
            onSuccess: (data) => {
              const imageUrl = data.data.cloudFrontUrl || data.data.url;
              setPreviews([{ url: imageUrl, isNew: false }]);
              onChange?.(imageUrl);
            },
            onError: () => {
              setPreviews([]);
            },
          }
        );
      } else {
        // Multiple mode
        const limitedFiles = fileArray.slice(0, maxFiles);
        const validation = validateMultipleImages(limitedFiles);

        if (!validation.valid) {
          alert(validation.error);
          return;
        }

        // Show previews immediately
        const newPreviews: PreviewImage[] = [];
        let loadedCount = 0;

        limitedFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push({ url: reader.result as string, isNew: true });
            loadedCount++;

            if (loadedCount === limitedFiles.length) {
              setPreviews((prev) => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        });

        // Upload
        uploadMultiple(
          { files: limitedFiles, folder },
          {
            onSuccess: (data) => {
              const uploadedUrls = data.data.map((file) => file.cloudFrontUrl || file.url);
              const newPreviews = uploadedUrls.map((url) => ({ url, isNew: false }));

              setPreviews((prev) => {
                // Remove temporary previews and add uploaded ones
                const existingPreviews = prev.filter((p) => !p.isNew);
                return [...existingPreviews, ...newPreviews];
              });

              const allUrls = [...(Array.isArray(value) ? value : []), ...uploadedUrls];
              onChange?.(allUrls);
            },
            onError: () => {
              // Remove temporary previews on error
              setPreviews((prev) => prev.filter((p) => !p.isNew));
            },
          }
        );
      }
    },
    [
      mode,
      maxFiles,
      folder,
      disabled,
      validateImage,
      validateMultipleImages,
      uploadSingle,
      uploadMultiple,
      onChange,
      value,
    ]
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

  // Remove image
  const handleRemove = useCallback(
    (index: number) => {
      if (disabled || isUploading) return;

      setPreviews((prev) => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });

      if (mode === 'single') {
        onChange?.('');
      } else {
        const urls = previews.filter((_, i) => i !== index).map((p) => p.url);
        onChange?.(urls);
      }
    },
    [mode, previews, onChange, disabled, isUploading]
  );

  // Trigger file input
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const canAddMore = mode === 'multiple' && previews.length < maxFiles;
  const showUploadArea = mode === 'single' ? previews.length === 0 : canAddMore;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {showUploadArea && (
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
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={mode === 'multiple'}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {placeholder ||
                      (mode === 'single'
                        ? 'Click to upload or drag and drop'
                        : `Upload up to ${maxFiles} images`)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {showPreview && previews.length > 0 && (
        <div
          className={cn(
            'grid gap-4',
            mode === 'single' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          )}
        >
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border bg-gray-50"
              style={{ aspectRatio }}
            >
              <Image
                src={preview.url}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Loading overlay */}
              {preview.isNew && isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}

              {/* Success indicator */}
              {!preview.isNew && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Remove button */}
              {!disabled && !isUploading && (
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add more button (multiple mode) */}
      {mode === 'multiple' && previews.length > 0 && canAddMore && !isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Add More Images ({previews.length}/{maxFiles})
        </Button>
      )}
    </div>
  );
}
