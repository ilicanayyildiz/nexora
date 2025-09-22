"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
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
  collection: {
    name: string;
    image_url: string | null;
  };
  creator: {
    username: string | null;
  };
};

export default function FavoritesPage() {
  const router = useRouter();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push("/signin");
        return;
      }
      setUserId(session.user.id);
      
      const { data: bal } = await supabase
        .from("balances")
        .select("amount")
        .eq("user_id", session.user.id)
        .single();
      setBalance(Number(bal?.amount ?? 0));
      
      await loadFavorites();
      setLoading(false);
    };
    void init();
  }, [router]);

  const loadFavorites = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("favorites")
      .select(`
        nft_id,
        nft:nfts(
          id, name, description, image_url, price, is_listed, owner_id, creator_id,
          collection:collections(name, image_url),
          creator:profiles!nfts_creator_id_fkey(username)
        )
      `)
      .eq("user_id", userId);
    
    const favoriteNfts = data?.map(fav => fav.nft).filter(Boolean) as NFT[];
    setNfts(favoriteNfts || []);
  };

  const buyNft = async (nftId: string, price: number) => {
    if (!userId) return;
    
    if (balance < price) {
      alert("Insufficient balance. Please top up your wallet.");
      return;
    }
    
    setBuying(nftId);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ buyer_id: userId, nft_id: nftId, price })
        .select("id")
        .single();
      if (orderError) throw orderError;

      // Debit balance
      const { error: debitError } = await supabase.rpc("debit_balance", {
        p_user: userId,
        p_amount: price,
        p_ref: order.id,
      });
      if (debitError) throw debitError;

      // Transfer ownership
      const { error: transferError } = await supabase
        .from("nfts")
        .update({ owner_id: userId, is_listed: false })
        .eq("id", nftId);
      if (transferError) throw transferError;

      // Update order status
      await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);

      // Refresh data
      await loadFavorites();
      const { data: newBal } = await supabase
        .from("balances")
        .select("amount")
        .eq("user_id", userId)
        .single();
      setBalance(Number(newBal?.amount ?? 0));
      
      alert("NFT purchased successfully!");
    } catch (e: any) {
      alert(`Purchase failed: ${e?.message ?? "Unknown error"}`);
    } finally {
      setBuying(null);
    }
  };

  const removeFavorite = async (nftId: string) => {
    if (!userId) return;
    
    try {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("nft_id", nftId);
      
      await loadFavorites();
    } catch (error: any) {
      alert(`Failed to remove from favorites: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <div className="text-sm text-white/70 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-white">Favorites</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1639322537228-f912e1778716?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Favorites" 
            width={96} 
            height={96} 
            className="w-full h-full object-cover" 
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">My Favorites</h1>
        <p className="text-white/70 text-lg">NFTs you've saved for later</p>
        {userId && (
          <div className="mt-4">
            <div className="text-sm text-white/60">Your Balance</div>
            <div className="text-2xl font-semibold">${balance.toFixed(2)}</div>
          </div>
        )}
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">No favorites yet</div>
          <div className="text-sm text-white/40 mt-2">
            Start exploring and add NFTs to your favorites
          </div>
          <Link 
            href="/explore"
            className="mt-4 inline-flex h-10 items-center rounded-lg px-4 font-semibold text-black hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Explore NFTs
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <div key={nft.id} className="rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
              <div className="aspect-square relative group">
                <Image src={nft.image_url} alt={nft.name} fill className="object-cover" />
                <button
                  onClick={() => removeFavorite(nft.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-lg text-red-500">♥</span>
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {nft.collection.image_url && (
                    <Image 
                      src={nft.collection.image_url} 
                      alt={nft.collection.name} 
                      width={20} 
                      height={20} 
                      className="rounded" 
                    />
                  )}
                  <span className="text-xs text-white/60">{nft.collection.name}</span>
                </div>
                
                <h3 className="font-semibold truncate mb-1">{nft.name}</h3>
                
                {nft.description && (
                  <p className="text-sm text-white/70 truncate mb-3">{nft.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    {nft.is_listed && nft.price ? (
                      <>
                        <div className="text-xs text-white/60">Price</div>
                        <div className="font-semibold">${nft.price}</div>
                      </>
                    ) : (
                      <div className="text-sm text-white/60">Not for sale</div>
                    )}
                  </div>
                  
                  {nft.is_listed && nft.price && (
                    <button
                      onClick={() => buyNft(nft.id, Number(nft.price))}
                      disabled={buying === nft.id || balance < Number(nft.price)}
                      className="h-8 rounded-md px-3 text-xs font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {buying === nft.id ? "Buying..." : "Buy"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
