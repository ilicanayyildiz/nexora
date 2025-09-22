import { NextRequest } from 'next/server';
import { secureAPIHandler, successResponse, errorResponse } from '@/lib/apiHelpers';
import { supabase } from '@/lib/supabaseClient';

async function updateNFT(
  request: NextRequest,
  context: { user: any; userId: string; params: { id: string } }
): Promise<Response> {
  try {
    const nftId = context.params.id;
    const body = await request.json().catch(() => ({}));
    console.log('Received body:', body);
    
    const price = typeof body.price === 'string' ? parseFloat(body.price) : body.price;
    const is_listed = Boolean(body.is_listed);
    
    console.log('Parsed price:', price, 'is_listed:', is_listed);

    if (!nftId) {
      return errorResponse('NFT id is required', 400);
    }

    if (isNaN(price) || price <= 0) {
      return errorResponse('Price must be a positive number', 400);
    }

    // Ensure the NFT belongs to the current user (creator or owner)
    const { data: nft, error: fetchErr } = await supabase
      .from('nfts')
      .select('id, owner_id, creator_id')
      .eq('id', nftId)
      .single();
    if (fetchErr || !nft) {
      return errorResponse('NFT not found', 404);
    }
    if (nft.owner_id !== context.userId && nft.creator_id !== context.userId) {
      return errorResponse('Unauthorized', 403);
    }

    const updatePayload = { price: Number(price), is_listed } as { price: number; is_listed: boolean };
    console.log('Updating NFT with payload:', updatePayload);
    
    const { error } = await supabase
      .from('nfts')
      .update(updatePayload)
      .eq('id', nftId);

    if (error) {
      console.error('NFT update error:', error);
      return errorResponse('Failed to update NFT', 500, error.message);
    }
    
    console.log('NFT updated successfully');
    return successResponse({ id: nftId, ...updatePayload }, 'NFT updated');
  } catch (e) {
    return errorResponse('Failed to update NFT', 500, e instanceof Error ? e.message : 'Unknown error');
  }
}

export const PUT = secureAPIHandler(updateNFT);


