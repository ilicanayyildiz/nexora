/**
 * NFTs API Endpoint
 * Handles NFT creation and management with security validation
 */

import { NextRequest } from 'next/server';
import { 
  secureAPIHandler, 
  successResponse, 
  errorResponse,
  validateNFTRequest 
} from '@/lib/apiHelpers';
import { supabase } from '@/lib/supabaseClient';

/**
 * Create a new NFT
 */
async function createNFT(
  request: NextRequest,
  context: { user: any; userId: string; params: any }
): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate NFT data
    const validation = validateNFTRequest(body);
    if (!validation.valid) {
      return errorResponse(
        'Validation failed',
        400,
        validation.errors?.join(', ')
      );
    }
    
    const { name, description, image_url, collection_id } = validation.data;
    
    // Verify collection ownership
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, creator_id')
      .eq('id', collection_id)
      .single();
    
    if (collectionError || !collection) {
      return errorResponse('Collection not found', 404);
    }
    
    if (collection.creator_id !== context.userId) {
      return errorResponse('Unauthorized to create NFT in this collection', 403);
    }
    
    // Get next token ID for the collection
    const { data: existingNfts } = await supabase
      .from('nfts')
      .select('token_id')
      .eq('collection_id', collection_id)
      .order('token_id', { ascending: false })
      .limit(1);
    
    const nextTokenId = existingNfts && existingNfts.length > 0 ? existingNfts[0].token_id + 1 : 1;
    
    // Create NFT
    const { data: nft, error } = await supabase
      .from('nfts')
      .insert({
        collection_id,
        token_id: nextTokenId,
        name,
        description: description || null,
        image_url: image_url || 'https://via.placeholder.com/400x400?text=NFT+Image',
        owner_id: context.userId,
        creator_id: context.userId,
        price: null,
        is_listed: false,
        is_sold: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('NFT creation error:', error);
      return errorResponse('Failed to create NFT', 500);
    }
    
    return successResponse(
      nft,
      'NFT created successfully',
      201
    );
    
  } catch (error) {
    console.error('NFT creation error:', error);
    return errorResponse(
      'Failed to create NFT',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Get user's NFTs
 */
async function getUserNFTs(
  request: NextRequest,
  context: { user: any; userId: string; params: any }
): Promise<Response> {
  try {
    const { data: nfts, error } = await supabase
      .from('nfts')
      .select(`
        *,
        collection:collections(name, image_url),
        creator:profiles!nfts_creator_id_fkey(username, full_name)
      `)
      .eq('creator_id', context.userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('NFTs fetch error:', error);
      return errorResponse('Failed to fetch NFTs', 500);
    }
    
    return successResponse(nfts);
    
  } catch (error) {
    console.error('NFTs fetch error:', error);
    return errorResponse(
      'Failed to fetch NFTs',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Apply security wrapper to handlers
export const POST = secureAPIHandler(createNFT);
export const GET = secureAPIHandler(getUserNFTs);
