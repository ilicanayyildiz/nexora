/**
 * CSRF Protection Middleware for Nexora NFT Platform
 * Implements Double Submit Cookie pattern for CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSecureToken } from '@/lib/security';

interface CSRFToken {
  token: string;
  expires: number;
}

// In-memory storage for CSRF tokens
// In production, consider using encrypted cookies or session store
const csrfTokens = new Map<string, CSRFToken>();

/**
 * Configuration for CSRF protection
 */
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  expiresIn: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 60 * 60 * 1000, // 1 hour
};

/**
 * Clean up expired CSRF tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [key, token] of csrfTokens.entries()) {
    if (now > token.expires) {
      csrfTokens.delete(key);
    }
  }
}

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(CSRF_CONFIG.tokenLength);
}

/**
 * Store CSRF token for a session
 */
export function storeCSRFToken(sessionId: string, token: string): void {
  const expires = Date.now() + CSRF_CONFIG.expiresIn;
  csrfTokens.set(sessionId, { token, expires });
  
  // Cleanup expired tokens periodically
  if (Math.random() < 0.1) { // 10% chance
    cleanupExpiredTokens();
  }
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(sessionId: string, providedToken: string): boolean {
  const storedToken = csrfTokens.get(sessionId);
  
  if (!storedToken) {
    return false;
  }
  
  // Check if token is expired
  if (Date.now() > storedToken.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  // Compare tokens using constant-time comparison
  return constantTimeCompare(storedToken.token, providedToken);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Get session ID from request
 */
function getSessionId(request: NextRequest): string {
  // Try to get session ID from various sources
  const sessionCookie = request.cookies.get('session-id')?.value;
  const authHeader = request.headers.get('authorization');
  
  if (sessionCookie) {
    return sessionCookie;
  }
  
  if (authHeader) {
    // Extract user ID from JWT or session token
    const token = authHeader.replace('Bearer ', '');
    // In a real implementation, you would decode the JWT here
    return `auth:${token}`;
  }
  
  // Fallback to IP + User-Agent for anonymous users
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';
  
  return `anonymous:${ip}:${userAgent}`;
}

/**
 * CSRF protection middleware
 */
export function csrfProtection() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Skip CSRF protection for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null;
    }
    
    // Skip CSRF protection for certain endpoints
    const url = new URL(request.url);
    const skipPaths = ['/api/health', '/api/webhooks'];
    
    if (skipPaths.some(path => url.pathname.startsWith(path))) {
      return null;
    }
    
    const sessionId = getSessionId(request);
    
    // Get token from header
    const providedToken = request.headers.get(CSRF_CONFIG.headerName);
    
    if (!providedToken) {
      return NextResponse.json(
        { error: 'CSRF token missing', message: 'CSRF token is required for this request' },
        { status: 403 }
      );
    }
    
    // Verify token
    if (!verifyCSRFToken(sessionId, providedToken)) {
      return NextResponse.json(
        { error: 'CSRF token invalid', message: 'Invalid or expired CSRF token' },
        { status: 403 }
      );
    }
    
    return null; // Allow request to continue
  };
}

/**
 * Generate CSRF token response
 */
export function generateCSRFResponse(request: NextRequest): NextResponse {
  // Ensure we have a stable session-id cookie independent of auth token
  let sessionId = request.cookies.get('session-id')?.value;
  if (!sessionId) {
    sessionId = generateSecureToken(24);
  }
  const token = generateCSRFToken();

  // Store token bound to session-id cookie
  storeCSRFToken(sessionId, token);

  // Create response with token in cookie and header
  const response = NextResponse.json({ csrfToken: token });

  // Set/refresh session-id cookie
  response.cookies.set('session-id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_CONFIG.expiresIn / 1000,
    path: '/'
  });

  // Set CSRF token in cookie
  response.cookies.set(CSRF_CONFIG.cookieName, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_CONFIG.expiresIn / 1000,
    path: '/'
  });

  // Set CSRF token in header
  response.headers.set(CSRF_CONFIG.headerName, token);

  return response;
}

/**
 * CSRF token endpoint handler
 */
export async function handleCSRFTokenRequest(request: NextRequest): Promise<NextResponse> {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }
  
  return generateCSRFResponse(request);
}

/**
 * Validate CSRF token for API routes
 */
export function validateCSRFToken(request: NextRequest): { valid: boolean; error?: string } {
  // Skip validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true };
  }
  
  const sessionId = getSessionId(request);
  const providedToken = request.headers.get(CSRF_CONFIG.headerName);
  
  if (!providedToken) {
    return { valid: false, error: 'CSRF token missing' };
  }
  
  if (!verifyCSRFToken(sessionId, providedToken)) {
    return { valid: false, error: 'Invalid CSRF token' };
  }
  
  return { valid: true };
}

/**
 * CSRF protection decorator for API routes
 */
export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply CSRF protection
    const csrfResponse = await csrfProtection()(request);
    if (csrfResponse) {
      return csrfResponse;
    }
    
    // Call the original handler
    return handler(request);
  };
}

/**
 * Get CSRF token for client-side use
 */
export function getCSRFTokenForClient(sessionId: string): string | null {
  const storedToken = csrfTokens.get(sessionId);
  
  if (!storedToken || Date.now() > storedToken.expires) {
    return null;
  }
  
  return storedToken.token;
}

/**
 * CSRF statistics for monitoring
 */
export function getCSRFStats(): {
  totalTokens: number;
  activeTokens: number;
  memoryUsage: string;
} {
  const now = Date.now();
  let activeTokens = 0;
  
  for (const token of csrfTokens.values()) {
    if (now <= token.expires) {
      activeTokens++;
    }
  }
  
  return {
    totalTokens: csrfTokens.size,
    activeTokens,
    memoryUsage: `${Math.round(JSON.stringify(csrfTokens).length / 1024)}KB`
  };
}

/**
 * Clear CSRF tokens (for testing)
 */
export function clearCSRFTokens(): void {
  csrfTokens.clear();
}
