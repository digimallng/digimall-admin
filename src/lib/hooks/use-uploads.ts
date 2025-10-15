/**
 * Uploads Hook
 *
 * React hooks for file upload operations including images, documents, and S3 management.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadsService } from '../api/services/uploads.service';
import type {
  UploadImageResponse,
  UploadImagesResponse,
  UploadDocumentResponse,
  DeleteFileResponse,
  SignedUrlResponse,
  SignedUrlRequest,
  FileUploadState,
} from '../api/types/uploads.types';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// ===== UPLOAD IMAGE HOOK =====

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadsService.uploadImage(file, folder),
    onSuccess: (data: UploadImageResponse) => {
      toast.success(data.message || 'Image uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
}

// ===== UPLOAD MULTIPLE IMAGES HOOK =====

export function useUploadImages() {
  return useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      uploadsService.uploadImages(files, folder),
    onSuccess: (data: UploadImagesResponse) => {
      toast.success(data.message || `${data.data.length} image(s) uploaded successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload images');
    },
  });
}

// ===== UPLOAD DOCUMENT HOOK =====

export function useUploadDocument() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadsService.uploadDocument(file, folder),
    onSuccess: (data: UploadDocumentResponse) => {
      toast.success(data.message || 'Document uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

// ===== DELETE FILE HOOK =====

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileKey: string) => uploadsService.deleteFile(fileKey),
    onSuccess: (data: DeleteFileResponse) => {
      toast.success(data.message || 'File deleted successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete file');
    },
  });
}

// ===== GET SIGNED URL HOOK =====

export function useGetSignedUrl() {
  return useMutation({
    mutationFn: (data: SignedUrlRequest) => uploadsService.getSignedUrl(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate signed URL');
    },
  });
}

// ===== MULTI-FILE UPLOAD WITH PROGRESS =====

export function useMultiFileUpload() {
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(
    new Map()
  );

  const uploadFiles = useCallback(
    async (files: File[], folder?: string) => {
      // Initialize upload states
      const initialStates = new Map<string, FileUploadState>();
      files.forEach((file) => {
        initialStates.set(file.name, {
          file,
          progress: 0,
          status: 'pending',
        });
      });
      setUploadStates(initialStates);

      // Upload files sequentially
      const results: UploadImageResponse[] = [];

      for (const file of files) {
        try {
          // Update status to uploading
          setUploadStates((prev) => {
            const next = new Map(prev);
            const state = next.get(file.name);
            if (state) {
              next.set(file.name, { ...state, status: 'uploading' });
            }
            return next;
          });

          // Validate file
          const validation = uploadsService.validateImage(file);
          if (!validation.valid) {
            throw new Error(validation.error);
          }

          // Upload file
          const result = await uploadsService.uploadImage(file, folder);
          results.push(result);

          // Update status to success
          setUploadStates((prev) => {
            const next = new Map(prev);
            const state = next.get(file.name);
            if (state) {
              next.set(file.name, {
                ...state,
                status: 'success',
                progress: 100,
                result: result.data,
              });
            }
            return next;
          });
        } catch (error) {
          // Update status to error
          setUploadStates((prev) => {
            const next = new Map(prev);
            const state = next.get(file.name);
            if (state) {
              next.set(file.name, {
                ...state,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              });
            }
            return next;
          });
        }
      }

      return results;
    },
    []
  );

  const resetStates = useCallback(() => {
    setUploadStates(new Map());
  }, []);

  const getUploadState = useCallback(
    (fileName: string) => {
      return uploadStates.get(fileName);
    },
    [uploadStates]
  );

  const getAllStates = useCallback(() => {
    return Array.from(uploadStates.values());
  }, [uploadStates]);

  return {
    uploadFiles,
    resetStates,
    getUploadState,
    getAllStates,
    uploadStates,
  };
}

// ===== FILE VALIDATION HOOKS =====

export function useFileValidation() {
  const validateImage = useCallback((file: File) => {
    return uploadsService.validateImage(file);
  }, []);

  const validateDocument = useCallback((file: File) => {
    return uploadsService.validateDocument(file);
  }, []);

  const validateMultipleImages = useCallback((files: File[]) => {
    if (files.length > 10) {
      return {
        valid: false,
        error: 'Maximum 10 files allowed per upload',
      };
    }

    for (const file of files) {
      const validation = uploadsService.validateImage(file);
      if (!validation.valid) {
        return validation;
      }
    }

    return { valid: true };
  }, []);

  return {
    validateImage,
    validateDocument,
    validateMultipleImages,
  };
}

// ===== UTILITY HOOKS =====

export function useFileUtils() {
  const extractFileKeyFromUrl = useCallback((url: string) => {
    return uploadsService.extractFileKeyFromUrl(url);
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    return uploadsService.formatFileSize(bytes);
  }, []);

  return {
    extractFileKeyFromUrl,
    formatFileSize,
  };
}
