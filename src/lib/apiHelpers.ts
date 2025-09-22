/**
 * API Helper functions for Nexora NFT Platform
 * Provides secure API route utilities with validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/middleware/csrf';
import { 
  sanitizeText, 
  sanitizeEmail, 
  validateCollectionData, 
  validateNFTData,
  sanitizeNumber 
} from '@/lib/security';
import { supabase } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';

/**
 * API Response types
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string, 
  status: number = 400,
  error?: string
): NextResponse<APIResponse> {
  return NextResponse.json(
    { success: false, error: error || message, message },
    { status }
  );
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T, 
  message?: string,
  status: number = 200
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    { success: true, data, message },
    { status }
  );
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{
  user: any;
  userId: string;
} | null> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return { user, userId: user.id };
  } catch (error) {
    return null;
  }
}

/**
 * Secure API route wrapper with authentication and CSRF protection
 */
export function secureAPIHandler(
  handler: (request: NextRequest, context: {
    user: any;
    userId: string;
    params: any;
  }) => Promise<NextResponse<APIResponse>>
) {
  return async (request: NextRequest, context: { params: any }): Promise<NextResponse<APIResponse>> => {
    try {
      // CSRF protection for non-GET requests (allowlist certain routes like file upload)
      const pathname = new URL(request.url).pathname;
      const csrfSkip =
        pathname.startsWith('/api/upload') ||
        pathname.startsWith('/api/nfts') ||
        pathname.startsWith('/api/collections');
      if (!csrfSkip) {
        const csrfValidation = validateCSRFToken(request);
        if (!csrfValidation.valid) {
          return errorResponse('CSRF token validation failed', 403, csrfValidation.error);
        }
      }
      
      // Authentication
      const authResult = await getAuthenticatedUser(request);
      if (!authResult) {
        return errorResponse('Authentication required', 401);
      }
      
      // Call the handler with authenticated context
      return await handler(request, {
        ...authResult,
        params: context.params
      });
      
    } catch (error) {
      console.error('API Handler Error:', error);
      return errorResponse(
        'Internal server error',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}

/**
 * Public API route wrapper (no authentication required)
 */
export function publicAPIHandler(
  handler: (request: NextRequest, context: { params: any }) => Promise<NextResponse<APIResponse>>
) {
  return async (request: NextRequest, context: { params: any }): Promise<NextResponse<APIResponse>> => {
    try {
      // CSRF protection for non-GET requests (allowlist as needed)
      const pathname = new URL(request.url).pathname;
      const csrfSkip =
        pathname.startsWith('/api/upload') ||
        pathname.startsWith('/api/nfts') ||
        pathname.startsWith('/api/collections');
      if (!csrfSkip) {
        const csrfValidation = validateCSRFToken(request);
        if (!csrfValidation.valid) {
          return errorResponse('CSRF token validation failed', 403, csrfValidation.error);
        }
      }
      
      // Call the handler
      return await handler(request, context);
      
    } catch (error) {
      console.error('Public API Handler Error:', error);
      return errorResponse(
        'Internal server error',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}

/**
 * Validate and sanitize request body
 */
export function validateRequestBody<T>(
  request: NextRequest,
  validator: (data: any) => { valid: boolean; data?: T; errors?: string[] }
): { valid: boolean; data?: T; errors?: string[]; response?: NextResponse<APIResponse> } {
  try {
    // This would typically parse JSON from request body
    // For Next.js API routes, you'd get the body differently
    const body = {}; // Placeholder - actual implementation depends on your setup
    
    const result = validator(body);
    
    if (!result.valid) {
      return {
        valid: false,
        errors: result.errors,
        response: errorResponse('Validation failed', 400, result.errors?.join(', '))
      };
    }
    
    return { valid: true, data: result.data };
    
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid request body'],
      response: errorResponse('Invalid request body', 400)
    };
  }
}

/**
 * Collection data validator
 */
export function validateCollectionRequest(data: any): { 
  valid: boolean; 
  data?: any; 
  errors?: string[] 
} {
  const validation = validateCollectionData(data);
  
  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors
    };
  }
  
  return {
    valid: true,
    data: validation.sanitizedData
  };
}

/**
 * NFT data validator
 */
export function validateNFTRequest(data: any): { 
  valid: boolean; 
  data?: any; 
  errors?: string[] 
} {
  const validation = validateNFTData(data);
  
  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors
    };
  }
  
  return {
    valid: true,
    data: validation.sanitizedData
  };
}

/**
 * User profile data validator
 */
export function validateProfileRequest(data: any): { 
  valid: boolean; 
  data?: any; 
  errors?: string[] 
} {
  const errors: string[] = [];
  const sanitizedData: any = {};
  
  // Validate username
  if (data.username) {
    try {
      sanitizedData.username = sanitizeText(data.username);
      if (sanitizedData.username.length < 3 || sanitizedData.username.length > 30) {
        errors.push('Username must be 3-30 characters');
      }
    } catch (error) {
      errors.push('Invalid username format');
    }
  }
  
  // Validate full name
  if (data.full_name) {
    try {
      sanitizedData.full_name = sanitizeText(data.full_name);
      if (sanitizedData.full_name.length > 100) {
        errors.push('Full name must be less than 100 characters');
      }
    } catch (error) {
      errors.push('Invalid full name format');
    }
  }
  
  // Validate bio
  if (data.bio) {
    try {
      sanitizedData.bio = sanitizeText(data.bio);
      if (sanitizedData.bio.length > 500) {
        errors.push('Bio must be less than 500 characters');
      }
    } catch (error) {
      errors.push('Invalid bio format');
    }
  }
  
  // Validate website URL
  if (data.website) {
    try {
      sanitizedData.website = data.website.startsWith('http') 
        ? sanitizeText(data.website)
        : `https://${sanitizeText(data.website)}`;
    } catch (error) {
      errors.push('Invalid website URL');
    }
  }
  
  return {
    valid: errors.length === 0,
    data: sanitizedData,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Pagination helper
 */
export function getPaginationParams(request: NextRequest): {
  page: number;
  limit: number;
  offset: number;
} {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Database error handler
 */
export function handleDatabaseError(error: any): NextResponse<APIResponse> {
  console.error('Database Error:', error);
  
  // Handle specific Supabase errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        return errorResponse('Resource already exists', 409);
      case '23503': // Foreign key constraint violation
        return errorResponse('Referenced resource not found', 400);
      case '23514': // Check constraint violation
        return errorResponse('Invalid data provided', 400);
      default:
        return errorResponse('Database operation failed', 500);
    }
  }
  
  return errorResponse('Database operation failed', 500);
}

/**
 * File upload helper
 */
export async function handleFileUpload(
  file: File,
  userId: string,
  category: string = 'uploads',
  accessToken?: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    
    // Generate secure file path
    const filePath = `${category}/${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
    
    // Choose target bucket based on category
    const bucket = category.includes('banner')
      ? 'banners'
      : category.includes('nft')
        ? 'nfts'
        : 'collections';

    // Create a per-request client with user's JWT so RLS sees 'authenticated'
    const supa = accessToken
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
          { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
        )
      : supabase;

    // Upload to Supabase Storage using user-scoped client
    const { error } = await supa.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: (file as any).type || undefined
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Get public URL
    const { data } = supa.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return { success: true, filePath: data.publicUrl };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}
