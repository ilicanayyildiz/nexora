/**
 * CSRF Token API Endpoint
 * Provides CSRF tokens for client-side requests
 */

import { NextRequest } from 'next/server';
import { handleCSRFTokenRequest } from '@/middleware/csrf';

export async function GET(request: NextRequest) {
  return handleCSRFTokenRequest(request);
}
