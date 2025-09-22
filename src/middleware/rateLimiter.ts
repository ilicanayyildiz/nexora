/**
 * Rate Limiting Middleware for Nexora NFT Platform
 * Uses in-memory storage for development, can be extended to Redis for production
 */

import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/security';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limiting
// In production, this should be replaced with Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for production with reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwarded?.split(',')[0] || realIp || '127.0.0.1';
  
  return clientIp;
}

/**
 * Rate limiting middleware
 */
export function rateLimiter(limitConfig: {
  windowMs: number;
  max: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance
      cleanupExpiredEntries();
    }
    
    // Generate key for rate limiting
    const key = limitConfig.keyGenerator 
      ? limitConfig.keyGenerator(request) 
      : getClientIdentifier(request);
    
    const now = Date.now();
    const windowStart = now - limitConfig.windowMs;
    
    // Get current entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + limitConfig.windowMs
      };
    }
    
    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);
    
    // Check if limit exceeded
    if (entry.count > limitConfig.max) {
      const response = NextResponse.json(
        { 
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', limitConfig.max.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, limitConfig.max - entry.count).toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
      response.headers.set('Retry-After', Math.ceil((entry.resetTime - now) / 1000).toString());
      
      return response;
    }
    
    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limitConfig.max.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, limitConfig.max - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
    
    return null; // Allow request to continue
  };
}

/**
 * API rate limiter (general API endpoints)
 */
export const apiRateLimiter = rateLimiter(RATE_LIMITS.API);

/**
 * Auth rate limiter (login, signup, password reset)
 */
export const authRateLimiter = rateLimiter(RATE_LIMITS.AUTH);

/**
 * Upload rate limiter (file uploads)
 */
export const uploadRateLimiter = rateLimiter(RATE_LIMITS.UPLOAD);

/**
 * NFT creation rate limiter (per user)
 */
export const nftCreateRateLimiter = (userId: string) => 
  rateLimiter({
    ...RATE_LIMITS.NFT_CREATE,
    keyGenerator: () => `nft_create:${userId}`
  });

/**
 * Payment rate limiter (per user)
 */
export const paymentRateLimiter = (userId: string) => 
  rateLimiter({
    ...RATE_LIMITS.PAYMENT,
    keyGenerator: () => `payment:${userId}`
  });

/**
 * Custom rate limiter for specific endpoints
 */
export function createCustomRateLimiter(config: {
  windowMs: number;
  max: number;
  keyGenerator?: (request: NextRequest) => string;
}) {
  return rateLimiter(config);
}

/**
 * Rate limiting decorator for API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiter: (req: NextRequest) => Promise<NextResponse | null>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Call the original handler
    return handler(request);
  };
}

/**
 * Rate limiting statistics (for monitoring)
 */
export function getRateLimitStats(): {
  totalEntries: number;
  activeEntries: number;
  memoryUsage: string;
} {
  const now = Date.now();
  let activeEntries = 0;
  
  for (const entry of rateLimitStore.values()) {
    if (now <= entry.resetTime) {
      activeEntries++;
    }
  }
  
  return {
    totalEntries: rateLimitStore.size,
    activeEntries,
    memoryUsage: `${Math.round(JSON.stringify(rateLimitStore).length / 1024)}KB`
  };
}

/**
 * Clear rate limit entries (for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
