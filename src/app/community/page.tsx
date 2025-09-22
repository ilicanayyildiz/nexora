"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";

type Creator = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  collections_count: number;
  nfts_count: number;
};

export default function CommunityPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'most_collections' | 'most_nfts'>('newest');

  useEffect(() => {
    const loadCreators = async () => {
      try {
        // Get creators with their collection and NFT counts
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`
            id, username, full_name, avatar_url, bio, created_at
          `)
          .not('username', 'is', null)
          .order("created_at", { ascending: false });

        if (error) {
          console.error('Error fetching profiles:', error);
          setLoading(false);
          return;
        }

        // Get collection counts for each creator
        const creatorsWithCounts = await Promise.all(
          (profiles || []).map(async (creator) => {
            // Get collections count
            const { count: collectionsCount } = await supabase
              .from('collections')
              .select('*', { count: 'exact', head: true })
              .eq('creator_id', creator.id);

            // Get NFTs count
            const { count: nftsCount } = await supabase
              .from('nfts')
              .select('*', { count: 'exact', head: true })
              .eq('creator_id', creator.id);

            return {
              id: creator.id,
              username: creator.username,
              full_name: creator.full_name,
              avatar_url: creator.avatar_url,
              bio: creator.bio,
              collections_count: collectionsCount || 0,
              nfts_count: nftsCount || 0,
            };
          })
        );
        
        setCreators(creatorsWithCounts);
        setLoading(false);
      } catch (error) {
        console.error('Error loading creators:', error);
        setLoading(false);
      }
    };
    void loadCreators();
  }, []);

  const sortedCreators = [...creators].sort((a, b) => {
    switch (sortBy) {
      case 'most_collections':
        return b.collections_count - a.collections_count;
      case 'most_nfts':
        return b.nfts_count - a.nfts_count;
      default:
        return 0; // Already sorted by newest
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
        <span className="text-white">Community</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-4xl">👥</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Community</h1>
        <p className="text-white/70 text-lg">Connect with creators and collectors</p>
      </div>

      {/* Sort Options */}
      <div className="flex justify-center mb-8">
        <div className="flex rounded-lg border border-white/10 p-1">
          {[
            { key: 'newest', label: 'Newest' },
            { key: 'most_collections', label: 'Most Collections' },
            { key: 'most_nfts', label: 'Most NFTs' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as 'newest' | 'most_collections' | 'most_nfts')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === option.key
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Creators Grid */}
      {sortedCreators.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">No creators found</div>
          <div className="text-sm text-white/40 mt-2">Be the first to join our community!</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedCreators.map((creator) => (
            <div 
              key={creator.id} 
              className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                  {creator.avatar_url ? (
                    <Image 
                      src={creator.avatar_url} 
                      alt={creator.username || 'Creator'} 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {(creator.username || creator.full_name || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-1">
                  {creator.username || creator.full_name || 'Anonymous'}
                </h3>
                
                {creator.bio && (
                  <p className="text-sm text-white/70 line-clamp-2 mb-4">
                    {creator.bio}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{creator.collections_count}</div>
                    <div className="text-xs text-white/60">Collections</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{creator.nfts_count}</div>
                    <div className="text-xs text-white/60">NFTs</div>
                  </div>
                </div>
                
                <Link 
                  href={`/profile/${creator.id}`}
                  className="mt-4 inline-block w-full h-10 rounded-lg border border-white/20 flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Community CTA */}
      <div className="mt-16 text-center">
        <div className="rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-white/70 mb-6">
            Connect with other creators, share your work, and discover amazing NFTs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#" 
              className="inline-flex h-12 items-center rounded-lg border border-white/20 px-6 hover:bg-white/10 transition-colors"
            >
              Discord
            </a>
            <a 
              href="#" 
              className="inline-flex h-12 items-center rounded-lg border border-white/20 px-6 hover:bg-white/10 transition-colors"
            >
              Twitter
            </a>
            <a 
              href="#" 
              className="inline-flex h-12 items-center rounded-lg border border-white/20 px-6 hover:bg-white/10 transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
