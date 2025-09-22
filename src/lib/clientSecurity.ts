/**
 * Client-side Security Utilities for Nexora NFT Platform
 * Provides client-side validation and security helpers
 */

import { sanitizeText, sanitizeHtml, sanitizeEmail } from './security';
import { supabase } from './supabaseClient';

/**
 * Client-side form validation
 */
export class FormValidator {
  private errors: string[] = [];
  
  /**
   * Validate email
   */
  email(value: string, fieldName: string = 'Email'): this {
    if (!value) {
      this.errors.push(`${fieldName} is required`);
      return this;
    }
    
    try {
      sanitizeEmail(value);
    } catch (error) {
      this.errors.push(`${fieldName} format is invalid`);
    }
    
    return this;
  }
  
  /**
   * Validate required field
   */
  required(value: string, fieldName: string): this {
    if (!value || value.trim().length === 0) {
      this.errors.push(`${fieldName} is required`);
    }
    
    return this;
  }
  
  /**
   * Validate minimum length
   */
  minLength(value: string, min: number, fieldName: string): this {
    if (value && value.length < min) {
      this.errors.push(`${fieldName} must be at least ${min} characters`);
    }
    
    return this;
  }
  
  /**
   * Validate maximum length
   */
  maxLength(value: string, max: number, fieldName: string): this {
    if (value && value.length > max) {
      this.errors.push(`${fieldName} must be less than ${max} characters`);
    }
    
    return this;
  }
  
  /**
   * Validate number
   */
  number(value: string | number, fieldName: string, min?: number, max?: number): this {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num) || !isFinite(num)) {
      this.errors.push(`${fieldName} must be a valid number`);
      return this;
    }
    
    if (min !== undefined && num < min) {
      this.errors.push(`${fieldName} must be at least ${min}`);
    }
    
    if (max !== undefined && num > max) {
      this.errors.push(`${fieldName} must be less than ${max}`);
    }
    
    return this;
  }
  
  /**
   * Validate URL
   */
  url(value: string, fieldName: string): this {
    if (!value) return this;
    
    try {
      new URL(value);
    } catch {
      this.errors.push(`${fieldName} must be a valid URL`);
    }
    
    return this;
  }
  
  /**
   * Get validation result
   */
  getResult(): { valid: boolean; errors: string[] } {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors]
    };
  }
  
  /**
   * Clear errors
   */
  clear(): this {
    this.errors = [];
    return this;
  }
}

/**
 * Sanitize form data before submission
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      switch (key) {
        case 'email':
          try {
            sanitized[key] = sanitizeEmail(value);
          } catch {
            sanitized[key] = value; // Keep original for error display
          }
          break;
        case 'description':
        case 'bio':
          sanitized[key] = sanitizeHtml(value);
          break;
        default:
          sanitized[key] = sanitizeText(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * CSRF token management
 */
export class CSRFManager {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  
  /**
   * Get CSRF token
   */
  async getToken(): Promise<string | null> {
    // Check if token is still valid
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    
    try {
      // Attach Authorization so CSRF session key matches authenticated requests
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      this.token = data.csrfToken;
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      return this.token;
    } catch (error) {
      console.error('CSRF token error:', error);
      return null;
    }
  }
  
  /**
   * Get token for headers
   */
  async getTokenHeader(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return token ? { 'x-csrf-token': token } : {};
  }
  
  /**
   * Clear token
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }
}

/**
 * Secure API client
 */
export class SecureAPIClient {
  private csrfManager = new CSRFManager();
  
  /**
   * Make secure API request
   */
  async request(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const tokenHeaders = await this.csrfManager.getTokenHeader();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...tokenHeaders,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers
      },
      credentials: 'include'
    };
    
    try {
      const response = await fetch(url, secureOptions);
      
      // Handle CSRF token refresh
      if (response.status === 403 && response.headers.get('x-csrf-refresh')) {
        this.csrfManager.clearToken();
        const newTokenHeaders = await this.csrfManager.getTokenHeader();
        
        // Retry with new token
        const retryOptions: RequestInit = {
          ...secureOptions,
          headers: {
            ...secureOptions.headers,
            ...newTokenHeaders
          }
        };
        
        return fetch(url, retryOptions);
      }
      
      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
  
  /**
   * POST request
   */
  async post(url: string, data: any): Promise<Response> {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(sanitizeFormData(data))
    });
  }
  
  /**
   * GET request
   */
  async get(url: string): Promise<Response> {
    return this.request(url, {
      method: 'GET'
    });
  }
  
  /**
   * PUT request
   */
  async put(url: string, data: any): Promise<Response> {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(sanitizeFormData(data))
    });
  }
  
  /**
   * DELETE request
   */
  async delete(url: string): Promise<Response> {
    return this.request(url, {
      method: 'DELETE'
    });
  }
}

/**
 * File upload security
 */
export class SecureFileUpload {
  /**
   * Validate file before upload
   */
  validateFile(file: File, config: {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
  }): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(config.maxSize / 1024 / 1024)}MB`
      };
    }
    
    // Check MIME type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }
    
    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !config.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Upload file securely
   */
  async uploadFile(
    file: File,
    category: string = 'general',
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validate file
      const config = category === 'image' 
        ? { maxSize: 10 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
        : { maxSize: 50 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf'], allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav', 'pdf'] };
      
      const validation = this.validateFile(file, config);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      // CSRF + Auth headers
      const csrfHeaders = await new CSRFManager().getTokenHeader();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          ...csrfHeaders,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Upload failed' };
      }
      
      const data = await response.json();
      return { success: true, data: data.data };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
}

/**
 * Global instances
 */
export const apiClient = new SecureAPIClient();
export const fileUpload = new SecureFileUpload();
export const csrfManager = new CSRFManager();

/**
 * Utility functions
 */
export function validateCollectionForm(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  mintPrice?: string;
  royalty?: string;
}): { valid: boolean; errors: string[] } {
  const validator = new FormValidator();
  
  validator
    .required(data.name, 'Collection name')
    .minLength(data.name, 3, 'Collection name')
    .maxLength(data.name, 100, 'Collection name');
  
  if (data.description) {
    validator.maxLength(data.description, 1000, 'Description');
  }
  
  if (data.imageUrl) {
    validator.url(data.imageUrl, 'Image URL');
  }
  
  if (data.bannerUrl) {
    validator.url(data.bannerUrl, 'Banner URL');
  }
  
  if (data.mintPrice) {
    validator.number(data.mintPrice, 'Mint price', 0, 1000);
  }
  
  if (data.royalty) {
    validator.number(data.royalty, 'Royalty percentage', 0, 25);
  }
  
  return validator.getResult();
}

export function validateNFTForm(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  collectionId: string;
}): { valid: boolean; errors: string[] } {
  const validator = new FormValidator();
  
  validator
    .required(data.name, 'NFT name')
    .minLength(data.name, 1, 'NFT name')
    .maxLength(data.name, 100, 'NFT name');
  
  if (data.description) {
    validator.maxLength(data.description, 1000, 'Description');
  }
  
  if (data.imageUrl) {
    validator.url(data.imageUrl, 'Image URL');
  }
  
  validator.required(data.collectionId, 'Collection');
  
  return validator.getResult();
}
