"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  creator_id: string;
  mint_price: number;
  royalty_percentage: number;
  total_supply: number;
  is_featured: boolean;
  created_at: string;
  creator: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

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
  owner: {
    username: string | null;
  };
};

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = params.id as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'listed' | 'owned'>('all');

  useEffect(() => {
    const loadData = async () => {
      // Load collection
      const { data: collectionData } = await supabase
        .from("collections")
        .select(`
          id, name, description, image_url, banner_url, creator_id, mint_price, 
          royalty_percentage, total_supply, is_featured, created_at,
          creator:profiles!collections_creator_id_fkey(username, full_name, avatar_url)
        `)
        .eq("id", collectionId)
        .single();
      
      setCollection(collectionData as Collection);

      // Load NFTs
      const { data: nftData } = await supabase
        .from("nfts")
        .select(`
          id, name, description, image_url, price, is_listed, owner_id, creator_id, 
          token_id, created_at,
          owner:profiles!nfts_owner_id_fkey(username)
        `)
        .eq("collection_id", collectionId)
        .order("token_id", { ascending: true });
      
      setNfts((nftData as NFT[]) ?? []);
      setLoading(false);
    };
    void loadData();
  }, [collectionId]);

  const filteredNfts = nfts.filter(nft => {
    switch (filter) {
      case 'listed':
        return nft.is_listed;
      case 'owned':
        return nft.owner_id !== null;
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;
  }

  if (!collection) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
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
        <span className="text-white">{collection.name}</span>
      </div>

      {/* Collection Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="aspect-[3/1] relative">
          {collection.banner_url ? (
            <Image 
              src={collection.banner_url} 
              alt={collection.name} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-white/10 to-white/5" />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20">
              {collection.image_url ? (
                <Image 
                  src={collection.image_url} 
                  alt={collection.name} 
                  width={96} 
                  height={96} 
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-white/10" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{collection.name}</h1>
                {collection.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-semibold rounded-full">
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-white/70">
                <span>by {collection.creator.username || collection.creator.full_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{nfts.length} items</span>
                <span>•</span>
                <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Info */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">About</h2>
          {collection.description ? (
            <p className="text-white/80 leading-relaxed">{collection.description}</p>
          ) : (
            <p className="text-white/60">No description provided.</p>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 p-4">
            <div className="text-sm text-white/60 mb-1">Mint Price</div>
            <div className="text-lg font-semibold">
              {collection.mint_price > 0 ? `${collection.mint_price} ETH` : 'Free'}
            </div>
          </div>
          
          <div className="rounded-lg border border-white/10 p-4">
            <div className="text-sm text-white/60 mb-1">Royalty</div>
            <div className="text-lg font-semibold">{collection.royalty_percentage}%</div>
          </div>
          
          <div className="rounded-lg border border-white/10 p-4">
            <div className="text-sm text-white/60 mb-1">Total Supply</div>
            <div className="text-lg font-semibold">{collection.total_supply}</div>
          </div>
        </div>
      </div>

      {/* NFTs Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Items</h2>
          
          <div className="flex rounded-lg border border-white/10 p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'listed', label: 'For Sale' },
              { key: 'owned', label: 'Owned' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredNfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg">No NFTs found</div>
            <div className="text-sm text-white/40 mt-2">
              {filter === 'listed' ? 'No NFTs for sale' : 
               filter === 'owned' ? 'No NFTs owned' : 
               'No NFTs in this collection'}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNfts.map((nft) => (
              <Link 
                key={nft.id} 
                href={`/nft/${nft.id}`}
                className="group rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
              >
                <div className="aspect-square relative">
                  <Image 
                    src={nft.image_url} 
                    alt={nft.name} 
                    fill 
                    className="object-cover" 
                  />
                  {nft.is_listed && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-black text-xs font-semibold rounded">
                      For Sale
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold group-hover:text-white/80 transition-colors mb-1">
                    {nft.name}
                  </h3>
                  
                  {nft.description && (
                    <p className="text-sm text-white/70 line-clamp-2 mb-3">
                      {nft.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-white/60">Token ID</div>
                      <div className="font-semibold">#{nft.token_id}</div>
                    </div>
                    
                    {nft.is_listed && nft.price && (
                      <div className="text-right">
                        <div className="text-white/60">Price</div>
                        <div className="font-semibold">${nft.price}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
