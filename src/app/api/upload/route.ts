/**
 * File Upload API Endpoint
 * Handles secure file uploads with validation
 */

import { NextRequest } from 'next/server';
import { 
  secureAPIHandler, 
  successResponse, 
  errorResponse,
  handleFileUpload 
} from '@/lib/apiHelpers';
import { validateFileUploadSecurity, FILE_UPLOAD_CONFIG } from '@/lib/security';

/**
 * Upload file
 */
async function uploadFile(
  request: NextRequest,
  context: { user: any; userId: string; params: any }
): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    
    if (!file) {
      return errorResponse('No file provided', 400);
    }
    
    // Determine upload configuration based on category
    let uploadConfig;
    switch (category) {
      case 'image':
      case 'avatar':
      case 'collection-image':
        uploadConfig = FILE_UPLOAD_CONFIG.IMAGES;
        break;
      case 'nft-asset':
      case 'nft':
        uploadConfig = FILE_UPLOAD_CONFIG.NFT_ASSETS;
        break;
      default:
        uploadConfig = FILE_UPLOAD_CONFIG.IMAGES; // Default to images
    }
    
    // Validate file upload
    const validation = validateFileUploadSecurity(file, uploadConfig);
    if (!validation.valid) {
      return errorResponse(
        'File validation failed',
        400,
        validation.error
      );
    }
    
    // Upload file
    // Extract JWT from Authorization header to satisfy RLS policies
    const authHeader = request.headers.get('authorization') || '';
    const userToken = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined;
    const uploadResult = await handleFileUpload(file, context.userId, category, userToken);
    if (!uploadResult.success) {
      return errorResponse(
        'File upload failed',
        500,
        uploadResult.error
      );
    }
    
    return successResponse(
      {
        filePath: uploadResult.filePath,
        filename: validation.sanitizedFilename,
        fileType: validation.fileType,
        fileSize: validation.fileSize
      },
      'File uploaded successfully'
    );
    
  } catch (error) {
    console.error('File upload error:', error);
    return errorResponse(
      'File upload failed',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Apply security wrapper to handler
export const POST = secureAPIHandler(uploadFile);
