/**
 * File Uploads Types
 *
 * Type definitions for file upload operations and S3 integration.
 * Based on ADMIN_API_DOCUMENTATION.md - File Uploads & S3 Integration section
 */

// ===== UPLOAD RESPONSES =====

export interface UploadedFile {
  key: string;
  url: string;
  cloudFrontUrl?: string;
  bucket: string;
  size: number;
  contentType: string;
}

export interface UploadImageResponse {
  success: boolean;
  message: string;
  data: UploadedFile;
}

export interface UploadImagesResponse {
  success: boolean;
  message: string;
  data: UploadedFile[];
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: UploadedFile;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
  data: {
    key: string;
  };
}

export interface SignedUrlResponse {
  success: boolean;
  message: string;
  data: {
    key: string;
    signedUrl: string;
    expiresIn: number;
  };
}

// ===== UPLOAD REQUESTS =====

export interface SignedUrlRequest {
  key: string;
  expiresIn?: number; // Expiration in seconds (default: 3600 = 1 hour)
}

// ===== UPLOAD OPTIONS =====

export interface UploadOptions {
  folder?: string;
  isPublic?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
}

// ===== FILE VALIDATION =====

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// ===== UPLOAD PROGRESS =====

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ===== FOLDER TYPES =====

export type UploadFolder =
  | 'categories'
  | 'products'
  | 'vendors'
  | 'documents'
  | 'banners'
  | 'avatars'
  | 'landing'
  | 'images';

// ===== FILE UPLOAD STATE =====

export interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: UploadedFile;
}
