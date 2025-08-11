
export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileUploadService {
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header for FormData, let browser set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Simulate progress for immediate feedback
      if (onProgress) {
        onProgress({
          loaded: file.size,
          total: file.size,
          percentage: 100,
        });
      }

      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
    }
  }

  async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileName: string, progress: UploadProgress) => void
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map(file =>
      this.uploadFile(file, progress => {
        if (onProgress) {
          onProgress(file.name, progress);
        }
      })
    );

    return Promise.all(uploadPromises);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  isAudioFile(file: File): boolean {
    return file.type.startsWith('audio/');
  }

  getFileType(file: File): 'image' | 'video' | 'audio' | 'file' {
    if (this.isImageFile(file)) return 'image';
    if (this.isVideoFile(file)) return 'video';
    if (this.isAudioFile(file)) return 'audio';
    return 'file';
  }

  validateFile(file: File, maxSizeInMB: number = 10): { valid: boolean; error?: string } {
    const maxSize = maxSizeInMB * 1024 * 1024; // Convert to bytes

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeInMB}MB limit`,
      };
    }

    // Add more validation as needed (file types, etc.)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported',
      };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();
