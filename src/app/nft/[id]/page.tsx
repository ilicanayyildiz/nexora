"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type NFT = {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  price: string | null;
  is_listed: boolean;
  owner_id: string | null;
  creator_id: string;
  token_id: number;
  created_at: string;
  collection: {
    id: string;
    name: string;
    image_url: string | null;
  };
  owner: {
    username: string | null;
    full_name: string | null;
  };
  creator: {
    username: string | null;
    full_name: string | null;
  };
};

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const nftId = params.id as string;
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session) {
        setUserId(session.user.id);
        const { data: bal } = await supabase
          .from("balances")
          .select("amount")
          .eq("user_id", session.user.id)
          .single();
        setBalance(Number(bal?.amount ?? 0));
      }

      // Load NFT
      const { data: nftData } = await supabase
        .from("nfts")
        .select(`
          id, name, description, image_url, price, is_listed, owner_id, creator_id, 
          token_id, created_at,
          collection:collections(id, name, image_url),
          owner:profiles!nfts_owner_id_fkey(username, full_name),
          creator:profiles!nfts_creator_id_fkey(username, full_name)
        `)
        .eq("id", nftId)
        .single();
      
      setNft(nftData as NFT);
      setLoading(false);
    };
    void init();
  }, [nftId]);

  const buyNft = async () => {
    if (!userId || !nft) {
      router.push("/signin");
      return;
    }
    
    if (balance < Number(nft.price)) {
      alert("Insufficient balance. Please top up your wallet.");
      return;
    }
    
    setBuying(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ buyer_id: userId, nft_id: nft.id, price: Number(nft.price) })
        .select("id")
        .single();
      if (orderError) throw orderError;

      // Debit balance
      const { error: debitError } = await supabase.rpc("debit_balance", {
        p_user: userId,
        p_amount: Number(nft.price),
        p_ref: order.id,
      });
      if (debitError) throw debitError;

      // Transfer ownership
      const { error: transferError } = await supabase
        .from("nfts")
        .update({ owner_id: userId, is_listed: false })
        .eq("id", nft.id);
      if (transferError) throw transferError;

      // Update order status
      await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);

      alert("NFT purchased successfully!");
      router.push("/wallet");
    } catch (e: any) {
      alert(`Purchase failed: ${e?.message ?? "Unknown error"}`);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;
  }

  if (!nft) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">NFT not found</h1>
        <Link href="/explore" className="underline">Back to Explore</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <div className="text-sm text-white/70 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/explore" className="hover:underline">Explore</Link>
        <span className="mx-2">›</span>
        <Link href={`/collection/${nft.collection.id}`} className="hover:underline">{nft.collection.name}</Link>
        <span className="mx-2">›</span>
        <span className="text-white">{nft.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* NFT Image */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-2xl overflow-hidden">
            <Image 
              src={nft.image_url} 
              alt={nft.name} 
              fill 
              className="object-cover" 
            />
          </div>
          
          {/* Collection Info */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10">
            {nft.collection.image_url && (
              <Image 
                src={nft.collection.image_url} 
                alt={nft.collection.name} 
                width={40} 
                height={40} 
                className="rounded-lg object-cover" 
              />
            )}
            <div>
              <div className="text-sm text-white/60">Collection</div>
              <Link 
                href={`/collection/${nft.collection.id}`}
                className="font-semibold hover:underline"
              >
                {nft.collection.name}
              </Link>
            </div>
          </div>
        </div>

        {/* NFT Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
            <div className="text-white/70">
              Token ID: #{nft.token_id}
            </div>
          </div>

          {nft.description && (
            <div>
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-white/80 leading-relaxed">{nft.description}</p>
            </div>
          )}

          {/* Owner & Creator */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm text-white/60 mb-1">Owner</div>
              <div className="font-semibold">
                {nft.owner?.username || nft.owner?.full_name || 'Unknown'}
              </div>
            </div>
            
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm text-white/60 mb-1">Creator</div>
              <div className="font-semibold">
                {nft.creator?.username || nft.creator?.full_name || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Price & Buy */}
          {nft.is_listed && nft.price ? (
            <div className="rounded-2xl border border-white/10 p-6">
              <div className="text-sm text-white/60 mb-2">Current Price</div>
              <div className="text-3xl font-bold mb-4">${nft.price}</div>
              
              {userId ? (
                <div className="space-y-3">
                  <div className="text-sm text-white/60">
                    Your Balance: ${balance.toFixed(2)}
                  </div>
                  
                  <button
                    onClick={buyNft}
                    disabled={buying || balance < Number(nft.price)}
                    className="w-full h-12 rounded-lg font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {buying ? "Buying..." : balance < Number(nft.price) ? "Insufficient Balance" : "Buy Now"}
                  </button>
                  
                  {balance < Number(nft.price) && (
                    <Link 
                      href="/checkout"
                      className="block w-full h-10 rounded-lg border border-white/20 flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                    >
                      Finance
                    </Link>
                  )}
                </div>
              ) : (
                <Link 
                  href="/signin"
                  className="block w-full h-12 rounded-lg font-semibold text-black hover:opacity-90 transition-opacity text-center leading-[48px]"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Sign In to Buy
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 p-6 text-center">
              <div className="text-lg font-semibold mb-2">Not for Sale</div>
              <div className="text-white/70">This NFT is not currently listed for sale</div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm text-white/60 mb-1">Created</div>
              <div className="font-semibold">
                {new Date(nft.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm text-white/60 mb-1">Contract Address</div>
              <div className="font-mono text-sm">
                0x1234...5678 (Demo)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
