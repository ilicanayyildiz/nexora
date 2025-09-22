"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  };
};

export default function LaunchpadPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured' | 'new'>('all');

  useEffect(() => {
    const loadCollections = async () => {
      const { data } = await supabase
        .from("collections")
        .select(`
          id, name, description, image_url, banner_url, creator_id, mint_price, 
          royalty_percentage, total_supply, is_featured, created_at,
          creator:profiles!collections_creator_id_fkey(username, full_name)
        `)
        .order("created_at", { ascending: false });
      
      setCollections((data as Collection[]) ?? []);
      setLoading(false);
    };
    void loadCollections();
  }, []);

  const filteredCollections = collections.filter(collection => {
    switch (filter) {
      case 'featured':
        return collection.is_featured;
      case 'new':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(collection.created_at) > oneWeekAgo;
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <div className="text-sm text-white/70 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-white">Launchpad</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Launchpad" 
            width={96} 
            height={96} 
            className="w-full h-full object-cover" 
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">Launchpad</h1>
        <p className="text-white/70 text-lg">Discover and support new NFT collections</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex rounded-lg border border-white/10 p-1">
          {[
            { key: 'all', label: 'All Collections' },
            { key: 'featured', label: 'Featured' },
            { key: 'new', label: 'New This Week' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
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

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">No collections found</div>
          <div className="text-sm text-white/40 mt-2">
            {filter === 'featured' ? 'No featured collections yet' : 
             filter === 'new' ? 'No new collections this week' : 
             'No collections available'}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCollections.map((collection) => (
            <Link 
              key={collection.id} 
              href={`/collection/${collection.id}`}
              className="group rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
            >
              <div className="aspect-[4/3] relative">
                {collection.banner_url ? (
                  <Image 
                    src={collection.banner_url} 
                    alt={collection.name} 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5" />
                )}
                {collection.is_featured && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-black text-xs font-semibold rounded">
                    Featured
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {collection.image_url ? (
                    <Image 
                      src={collection.image_url} 
                      alt={collection.name} 
                      width={40} 
                      height={40} 
                      className="rounded-lg object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10" />
                  )}
                  <div>
                    <h3 className="font-semibold group-hover:text-white/80 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-xs text-white/60">
                      by {collection.creator.username || collection.creator.full_name || 'Anonymous'}
                    </p>
                  </div>
                </div>
                
                {collection.description && (
                  <p className="text-sm text-white/70 line-clamp-2 mb-3">
                    {collection.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-white/60">Mint Price</div>
                    <div className="font-semibold">
                      {collection.mint_price > 0 ? `${collection.mint_price} ETH` : 'Free'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60">Supply</div>
                    <div className="font-semibold">{collection.total_supply}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Collection CTA */}
      <div className="mt-16 text-center">
        <div className="rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Launch Your Collection?</h2>
          <p className="text-white/70 mb-6">
            Join thousands of creators who have launched their NFT collections on Nexora
          </p>
          <Link 
            href="/create" 
            className="inline-flex h-12 items-center rounded-lg px-6 font-semibold text-black hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Create Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
