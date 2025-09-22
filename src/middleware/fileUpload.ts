/**
 * File Upload Security Middleware for Nexora NFT Platform
 * Provides secure file upload handling with validation and sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateFileUpload, FILE_UPLOAD_CONFIG } from '@/lib/security';

/**
 * File upload validation result
 */
interface UploadValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
  fileType?: string;
  fileSize?: number;
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove any path separators and special characters
  let sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .replace(/_{2,}/g, '_'); // Replace multiple underscores with single
  
  // Ensure filename is not empty and has reasonable length
  if (!sanitized || sanitized.length < 1) {
    sanitized = 'file';
  }
  
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 95);
    sanitized = `${name}.${ext}`;
  }
  
  return sanitized;
}

/**
 * Validate file upload security
 */
export function validateFileUploadSecurity(
  file: File,
  options: {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
    scanForMalware?: boolean;
  }
): UploadValidationResult {
  try {
    // Basic file validation
    const basicValidation = validateFileUpload(file, options);
    if (!basicValidation.valid) {
      return { valid: false, error: basicValidation.error };
    }
    
    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);
    
    // Additional security checks
    const securityChecks = performSecurityChecks(file);
    if (!securityChecks.valid) {
      return { valid: false, error: securityChecks.error };
    }
    
    return {
      valid: true,
      sanitizedFilename,
      fileType: file.type,
      fileSize: file.size
    };
    
  } catch (error) {
    return { 
      valid: false, 
      error: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Perform additional security checks on uploaded files
 */
function performSecurityChecks(file: File): { valid: boolean; error?: string } {
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i,
    /\.(sh|bash|zsh|fish)$/i,
    /\.(sql|db|sqlite)$/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return { valid: false, error: 'File type not allowed for security reasons' };
    }
  }
  
  // Check for hidden files
  if (file.name.startsWith('.')) {
    return { valid: false, error: 'Hidden files are not allowed' };
  }
  
  // Check for double extensions (potential malware)
  const nameParts = file.name.split('.');
  if (nameParts.length > 2) {
    // Check if any part looks suspicious
    for (let i = 0; i < nameParts.length - 1; i++) {
      const part = nameParts[i].toLowerCase();
      if (['exe', 'bat', 'cmd', 'com', 'scr'].includes(part)) {
        return { valid: false, error: 'Suspicious file extension detected' };
      }
    }
  }
  
  // Check file size against reasonable limits
  const maxImageSize = 10 * 1024 * 1024; // 10MB
  const maxVideoSize = 100 * 1024 * 1024; // 100MB
  const maxAudioSize = 50 * 1024 * 1024; // 50MB
  const maxDocumentSize = 25 * 1024 * 1024; // 25MB
  
  if (file.type.startsWith('image/') && file.size > maxImageSize) {
    return { valid: false, error: 'Image file too large (max 10MB)' };
  }
  
  if (file.type.startsWith('video/') && file.size > maxVideoSize) {
    return { valid: false, error: 'Video file too large (max 100MB)' };
  }
  
  if (file.type.startsWith('audio/') && file.size > maxAudioSize) {
    return { valid: false, error: 'Audio file too large (max 50MB)' };
  }
  
  if (file.type === 'application/pdf' && file.size > maxDocumentSize) {
    return { valid: false, error: 'PDF file too large (max 25MB)' };
  }
  
  return { valid: true };
}

/**
 * File upload middleware for API routes
 */
export function fileUploadSecurity(config: {
  type: 'images' | 'nft_assets' | 'custom';
  customConfig?: {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
  };
}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Check if request has files
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return null; // Not a file upload request
      }
      
      // Get upload configuration
      let uploadConfig;
      switch (config.type) {
        case 'images':
          uploadConfig = FILE_UPLOAD_CONFIG.IMAGES;
          break;
        case 'nft_assets':
          uploadConfig = FILE_UPLOAD_CONFIG.NFT_ASSETS;
          break;
        case 'custom':
          uploadConfig = config.customConfig!;
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid upload configuration' },
            { status: 400 }
          );
      }
      
      // Parse form data
      const formData = await request.formData();
      const files: File[] = [];
      
      // Extract files from form data
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }
      
      // Validate each file
      const validationResults: UploadValidationResult[] = [];
      for (const file of files) {
        const result = validateFileUploadSecurity(file, uploadConfig);
        validationResults.push(result);
        
        if (!result.valid) {
          return NextResponse.json(
            { 
              error: 'File upload validation failed',
              details: validationResults
            },
            { status: 400 }
          );
        }
      }
      
      // If all files are valid, add validation results to request headers
      // for use in the API handler
      const response = NextResponse.next();
      response.headers.set('x-upload-validation', JSON.stringify(validationResults));
      
      return null; // Allow request to continue
      
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'File upload processing failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Image upload security middleware
 */
export const imageUploadSecurity = fileUploadSecurity({ type: 'images' });

/**
 * NFT asset upload security middleware
 */
export const nftAssetUploadSecurity = fileUploadSecurity({ type: 'nft_assets' });

/**
 * Custom upload security middleware
 */
export function createCustomUploadSecurity(config: {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}) {
  return fileUploadSecurity({ type: 'custom', customConfig: config });
}

/**
 * Generate secure file path
 */
export function generateSecureFilePath(
  userId: string,
  filename: string,
  category: string = 'uploads'
): string {
  // Create a secure directory structure
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const sanitizedFilename = sanitizeFilename(filename);
  
  return `${category}/${userId}/${timestamp}-${randomId}-${sanitizedFilename}`;
}

/**
 * Validate file path to prevent directory traversal
 */
export function validateFilePath(filePath: string): { valid: boolean; error?: string } {
  // Check for directory traversal attempts
  if (filePath.includes('..') || filePath.includes('~') || filePath.startsWith('/')) {
    return { valid: false, error: 'Invalid file path' };
  }
  
  // Check for absolute paths
  if (filePath.startsWith('/') || /^[a-zA-Z]:/.test(filePath)) {
    return { valid: false, error: 'Absolute paths not allowed' };
  }
  
  // Check path length
  if (filePath.length > 255) {
    return { valid: false, error: 'File path too long' };
  }
  
  return { valid: true };
}

/**
 * Get file extension safely
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
}

/**
 * File upload statistics for monitoring
 */
export function getFileUploadStats(): {
  totalUploads: number;
  failedUploads: number;
  averageFileSize: number;
} {
  // This would typically come from a database or monitoring service
  // For now, return mock data
  return {
    totalUploads: 0,
    failedUploads: 0,
    averageFileSize: 0
  };
}

/**
 * Clean up temporary files
 */
export function cleanupTempFiles(tempDir: string): Promise<void> {
  // Implementation would depend on your file storage system
  // This is a placeholder for cleanup logic
  return Promise.resolve();
}
