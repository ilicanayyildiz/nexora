/**
 * Collections API Endpoint
 * Handles collection creation with security validation
 */

import { NextRequest } from 'next/server';
import { 
  secureAPIHandler, 
  successResponse, 
  errorResponse,
  validateCollectionRequest 
} from '@/lib/apiHelpers';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

/**
 * Create a new collection
 */
async function createCollection(
  request: NextRequest,
  context: { user: any; userId: string; params: any }
): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate collection data
    const validation = validateCollectionRequest(body);
    if (!validation.valid) {
      return errorResponse(
        'Validation failed',
        400,
        validation.errors?.join(', ')
      );
    }
    
    const { name, description, image_url, banner_url, mint_price, royalty_percentage } = validation.data;
    
    // Use service role client with explicit creator_id (RLS bypass for admin operations)
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Create collection in database
    const { data: collection, error } = await serviceSupabase
      .from('collections')
      .insert({
        name,
        description: description || null,
        image_url: image_url || null,
        banner_url: banner_url || null,
        mint_price: mint_price ? parseFloat(mint_price) : 0,
        royalty_percentage: royalty_percentage ? parseFloat(royalty_percentage) : 0,
        creator_id: context.userId,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Collection creation error:', error);
      return errorResponse('Failed to create collection', 500, error.message);
    }
    
    return successResponse(
      collection,
      'Collection created successfully',
      201
    );
    
  } catch (error) {
    console.error('Collection creation error:', error);
    return errorResponse(
      'Failed to create collection',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Get user's collections
 */
async function getUserCollections(
  request: NextRequest,
  context: { user: any; userId: string; params: any }
): Promise<Response> {
  try {
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
      .eq('creator_id', context.userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Collections fetch error:', error);
      return errorResponse('Failed to fetch collections', 500);
    }
    
    return successResponse(collections);
    
  } catch (error) {
    console.error('Collections fetch error:', error);
    return errorResponse(
      'Failed to fetch collections',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Apply security wrapper to handlers
export const POST = secureAPIHandler(createCollection);
export const GET = secureAPIHandler(getUserCollections);
