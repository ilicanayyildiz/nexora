"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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

export default function ExplorePage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [buying, setBuying] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session) {
        setUserId(session.user.id);
        const { data: bal } = await supabase.from("balances").select("amount").single();
        setBalance(Number(bal?.amount ?? 0));
        
        // Load favorites
        const { data: favs } = await supabase
          .from("favorites")
          .select("nft_id")
          .eq("user_id", session.user.id);
        setFavorites(new Set(favs?.map(f => f.nft_id) || []));
      }
      
      
      await loadNfts();
      setLoading(false);
    };
    void init();
  }, []);

  const loadNfts = async () => {
    const { data } = await supabase
      .from("nfts")
      .select(`
        id, name, description, image_url, price, is_listed, owner_id, creator_id,
        collection:collections(name, image_url),
        creator:profiles!nfts_creator_id_fkey(username)
      `)
      .eq("is_listed", true)
      .order("created_at", { ascending: false });
    
    setNfts((data as NFT[]) ?? []);
  };

  const buyNft = async (nftId: string, price: number) => {
    if (!userId) {
      window.location.href = "/signin";
      return;
    }
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
      await loadNfts();
      const { data: newBal } = await supabase.from("balances").select("amount").single();
      setBalance(Number(newBal?.amount ?? 0));
      alert("NFT purchased successfully!");
    } catch (e: any) {
      alert(`Purchase failed: ${e?.message ?? "Unknown error"}`);
    } finally {
      setBuying(null);
    }
  };

  const toggleFavorite = async (nftId: string) => {
    if (!userId) {
      window.location.href = "/signin";
      return;
    }
    
    const isFavorited = favorites.has(nftId);
    
    try {
      if (isFavorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("nft_id", nftId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(nftId);
          return newSet;
        });
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: userId, nft_id: nftId });
        setFavorites(prev => new Set([...prev, nftId]));
      }
    } catch (error: any) {
      alert(`Failed to ${isFavorited ? 'remove from' : 'add to'} favorites: ${error.message}`);
    }
  };

  const filteredNfts = nfts.filter(nft => 
    nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (nft.description && nft.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;

  return (
    <div className="min-h-screen">
      {/* Header Section - Luxy Style */}
      <div className="text-center py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Image 
            src="/logo.svg" 
            alt="NEXORA logo" 
            width={120} 
            height={120} 
            className="mx-auto mb-8"
          />
          <h1 className="text-6xl font-bold mb-6" style={{color: 'var(--accent)'}}>
            NEXORA
          </h1>
          <p className="text-2xl text-white/80 mb-12">
            Making the best NFT Platform available to everyone!
          </p>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="text-center py-12 border-t border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-lg">
            <a href="#" className="hover:opacity-80 transition-opacity">Telegram</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Discord</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Twitter</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Instagram</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Medium</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Coingecko</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Coinmarketcap</a>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Products</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="Marketplace" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-xl font-semibold mb-4">Marketplace</h3>
              <p className="text-white/70">Discover and trade NFTs</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="Tools" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-xl font-semibold mb-4">Tools</h3>
              <p className="text-white/70">Create and manage your NFTs</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="Launchpad" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-xl font-semibold mb-4">Launchpad</h3>
              <p className="text-white/70">Discover new NFT projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">About</h2>
          <div className="flex flex-wrap justify-center gap-8 text-lg">
            <a href="#" className="hover:opacity-80 transition-opacity">Help Center</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Learn More</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Join Our Community</h2>
          <div className="flex justify-center gap-8">
            <a href="/community" className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <span className="text-lg font-semibold">Discord</span>
            </a>
            <a href="/community" className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <span className="text-lg font-semibold">Telegram</span>
            </a>
            <a href="/community" className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <span className="text-lg font-semibold">Twitter</span>
            </a>
          </div>
        </div>
      </div>

      {/* NFT Marketplace Section */}
      <div className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Explore NFTs</h2>
              <p className="mt-1 text-white/70">Discover and buy NFTs from creators</p>
            </div>
            {userId && (
              <div className="text-right">
                <div className="text-sm text-white/60">Your Balance</div>
                <div className="text-xl font-semibold">${balance.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search NFTs, collections, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-lg border border-white/15 bg-transparent px-4 pr-10 outline-none focus:ring-2 focus:ring-white/20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                🔍
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNfts.map((nft) => (
              <div key={nft.id} className="rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
                <div className="aspect-square relative group">
                  <Image src={nft.image_url} alt={nft.name} fill className="object-cover" />
                  <button
                    onClick={() => toggleFavorite(nft.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className={`text-lg ${favorites.has(nft.id) ? 'text-red-500' : 'text-white'}`}>
                      {favorites.has(nft.id) ? '♥' : '♡'}
                    </span>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {nft.collection.image_url && (
                      <Image src={nft.collection.image_url} alt={nft.collection.name} width={20} height={20} className="rounded" />
                    )}
                    <span className="text-xs text-white/60">{nft.collection.name}</span>
                  </div>
                  <h3 className="font-semibold truncate">{nft.name}</h3>
                  <p className="text-sm text-white/70 truncate">{nft.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">Price</div>
                      <div className="font-semibold">${nft.price}</div>
                    </div>
                    <button
                      onClick={() => buyNft(nft.id, Number(nft.price))}
                      disabled={buying === nft.id || !userId || balance < Number(nft.price)}
                      className="h-8 rounded-md px-3 text-xs font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {buying === nft.id ? "Buying..." : "Buy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNfts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/60">
                {searchQuery ? 'No NFTs found matching your search' : 'No NFTs available for purchase'}
              </div>
              <div className="text-sm text-white/40 mt-1">
                {searchQuery ? 'Try a different search term' : 'Check back later or create your own collection'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

