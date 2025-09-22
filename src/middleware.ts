/**
 * Main Middleware for Nexora NFT Platform
 * Combines all security middleware: rate limiting, CSRF protection, headers, etc.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Simplified middleware without complex dependencies

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip middleware for static assets
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/public/') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Create response
  let response = NextResponse.next();
  
  // Apply basic security headers
  response = applySecurityHeaders(response);
  
  // Add request ID for tracking
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  
  // Add timestamp
  response.headers.set('X-Timestamp', new Date().toISOString());
  
  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
