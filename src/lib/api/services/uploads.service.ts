/**
 * Uploads Service
 *
 * Service for file upload operations including images, documents, and S3 management.
 * Implements all 5 upload endpoints from ADMIN_API_DOCUMENTATION.md - File Uploads & S3 Integration section
 */

import { apiClient } from '../core';
import type {
  UploadImageResponse,
  UploadImagesResponse,
  UploadDocumentResponse,
  DeleteFileResponse,
  SignedUrlResponse,
  SignedUrlRequest,
} from '../types/uploads.types';

/**
 * Uploads Service Class
 */
class UploadsService {
  /**
   * Upload single image
   * POST /uploads/image
   * @role ADMIN, SUPER_ADMIN, VENDOR
   */
  async uploadImage(
    file: File,
    folder?: string
  ): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<UploadImageResponse>(
      '/uploads/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data!;
  }

  /**
   * Upload multiple images (max 10)
   * POST /uploads/images
   * @role ADMIN, SUPER_ADMIN, VENDOR
   */
  async uploadImages(
    files: File[],
    folder?: string
  ): Promise<UploadImagesResponse> {
    if (files.length > 10) {
      throw new Error('Maximum 10 files allowed per upload');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<UploadImagesResponse>(
      '/uploads/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data!;
  }

  /**
   * Upload document (PDF, DOC, DOCX)
   * POST /uploads/document
   * @role ADMIN, SUPER_ADMIN, VENDOR
   */
  async uploadDocument(
    file: File,
    folder?: string
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<UploadDocumentResponse>(
      '/uploads/document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data!;
  }

  /**
   * Delete file from S3
   * DELETE /uploads/{fileKey}
   * @role ADMIN, SUPER_ADMIN
   */
  async deleteFile(fileKey: string): Promise<DeleteFileResponse> {
    // URL encode the file key to handle slashes
    const encodedKey = encodeURIComponent(fileKey);

    const response = await apiClient.delete<DeleteFileResponse>(
      `/uploads/${encodedKey}`
    );

    return response.data!;
  }

  /**
   * Get signed URL for private file access
   * POST /uploads/signed-url
   * @role ADMIN, SUPER_ADMIN, VENDOR, CUSTOMER (for owned files)
   */
  async getSignedUrl(data: SignedUrlRequest): Promise<SignedUrlResponse> {
    const response = await apiClient.post<SignedUrlResponse>(
      '/uploads/signed-url',
      data
    );

    return response.data!;
  }

  /**
   * Validate image file before upload
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    return { valid: true };
  }

  /**
   * Validate document file before upload
   */
  validateDocument(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    return { valid: true };
  }

  /**
   * Extract file key from S3/CloudFront URL
   */
  extractFileKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.substring(1);
    } catch {
      return null;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export singleton instance
export const uploadsService = new UploadsService();

// Export class for testing
export { UploadsService };
