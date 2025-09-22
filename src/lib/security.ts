/**
 * Security utilities for Nexora NFT Platform
 * Includes input sanitization, validation, and security helpers
 */

// DOMPurify import with conditional loading for server/client environments
let purify: any = null;

// Initialize DOMPurify based on environment
if (typeof window !== 'undefined') {
  // Client-side
  import('dompurify').then((DOMPurify) => {
    purify = DOMPurify.default;
  });
} else {
  // Server-side
  try {
    const DOMPurify = require('dompurify');
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    purify = DOMPurify(window);
  } catch (error) {
    console.warn('DOMPurify not available on server-side:', error);
  }
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // If DOMPurify is not available, fall back to basic sanitization
  if (!purify) {
    return sanitizeText(input);
  }
  
  try {
    return purify.sanitize(input, { 
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  } catch (error) {
    console.warn('DOMPurify sanitization failed, falling back to basic sanitization:', error);
    return sanitizeText(input);
  }
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const sanitized = sanitizeText(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized.toLowerCase();
}

/**
 * Validate and sanitize username
 */
export function sanitizeUsername(username: string): string {
  if (!username) return '';
  
  const sanitized = sanitizeText(username);
  
  // Username rules: 3-30 chars, alphanumeric + underscore + dash
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  
  if (!usernameRegex.test(sanitized)) {
    throw new Error('Username must be 3-30 characters, alphanumeric with _ or -');
  }
  
  return sanitized;
}

/**
 * Validate and sanitize price/number inputs
 */
export function sanitizeNumber(input: string | number, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number format');
  }
  
  if (num < min || num > max) {
    throw new Error(`Number must be between ${min} and ${max}`);
  }
  
  return num;
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(file: File, options: {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > options.maxSize) {
    return { 
      valid: false, 
      error: `File size must be less than ${Math.round(options.maxSize / 1024 / 1024)}MB` 
    };
  }
  
  // Check MIME type
  if (!options.allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}` 
    };
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !options.allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: `File extension not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}` 
    };
  }
  
  return { valid: true };
}

/**
 * Generate secure random string for tokens
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate URL format
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const sanitized = sanitizeText(url);
    new URL(sanitized); // This will throw if invalid
    return sanitized;
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Escape special characters for database queries
 */
export function escapeSql(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  // API endpoints
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Authentication
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
  },
  
  // File uploads
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
  },
  
  // NFT creation
  NFT_CREATE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each user to 20 NFT creations per hour
  },
  
  // Payment processing
  PAYMENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each user to 5 payment attempts per hour
  }
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
};

/**
 * File upload configuration
 */
export const FILE_UPLOAD_CONFIG = {
  // Image files
  IMAGES: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  
  // NFT assets
  NFT_ASSETS: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav',
      'application/pdf', 'model/gltf-binary', 'model/gltf+json'
    ],
    allowedExtensions: [
      'jpg', 'jpeg', 'png', 'gif', 'webp',
      'mp4', 'webm', 'mov',
      'mp3', 'wav', 'ogg',
      'pdf',
      'glb', 'gltf'
    ]
  }
};

/**
 * Validate collection data
 */
export function validateCollectionData(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  mintPrice?: string;
  royalty?: string;
}) {
  const errors: string[] = [];
  
  // Validate name
  try {
    data.name = sanitizeText(data.name);
    if (data.name.length < 3 || data.name.length > 100) {
      errors.push('Collection name must be 3-100 characters');
    }
  } catch (error) {
    errors.push('Invalid collection name format');
  }
  
  // Validate description
  if (data.description) {
    try {
      data.description = sanitizeHtml(data.description);
      if (data.description.length > 1000) {
        errors.push('Description must be less than 1000 characters');
      }
    } catch (error) {
      errors.push('Invalid description format');
    }
  }
  
  // Validate URLs
  if (data.imageUrl) {
    try {
      data.imageUrl = sanitizeUrl(data.imageUrl);
    } catch (error) {
      errors.push('Invalid image URL');
    }
  }
  
  if (data.bannerUrl) {
    try {
      data.bannerUrl = sanitizeUrl(data.bannerUrl);
    } catch (error) {
      errors.push('Invalid banner URL');
    }
  }
  
  // Validate prices
  if (data.mintPrice) {
    try {
      const price = sanitizeNumber(data.mintPrice, 0, 1000);
      data.mintPrice = price.toString();
    } catch (error) {
      errors.push('Invalid mint price (must be 0-1000)');
    }
  }
  
  if (data.royalty) {
    try {
      const royalty = sanitizeNumber(data.royalty, 0, 25);
      data.royalty = royalty.toString();
    } catch (error) {
      errors.push('Invalid royalty percentage (must be 0-25%)');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitizedData: data
  };
}

/**
 * Validate NFT data
 */
export function validateNFTData(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  collectionId: string;
}) {
  const errors: string[] = [];
  
  // Validate name
  try {
    data.name = sanitizeText(data.name);
    if (data.name.length < 1 || data.name.length > 100) {
      errors.push('NFT name must be 1-100 characters');
    }
  } catch (error) {
    errors.push('Invalid NFT name format');
  }
  
  // Validate description
  if (data.description) {
    try {
      data.description = sanitizeHtml(data.description);
      if (data.description.length > 1000) {
        errors.push('Description must be less than 1000 characters');
      }
    } catch (error) {
      errors.push('Invalid description format');
    }
  }
  
  // Validate image URL
  if (data.imageUrl) {
    try {
      data.imageUrl = sanitizeUrl(data.imageUrl);
    } catch (error) {
      errors.push('Invalid image URL');
    }
  }
  
  // Validate collection ID (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.collectionId)) {
    errors.push('Invalid collection ID format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitizedData: data
  };
}

/**
 * Validate file upload security (alias for validateFileUpload)
 */
export const validateFileUploadSecurity = validateFileUpload;
