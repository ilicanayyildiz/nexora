"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  created_at: string;
};

type Collection = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  total_supply: number;
  created_at: string;
};

type NFT = {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  price: string | null;
  is_listed: boolean;
  token_id: number;
  created_at: string;
  collection: {
    id: string;
    name: string;
    image_url: string | null;
  };
};

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collections' | 'nfts'>('collections');

  useEffect(() => {
    const loadData = async () => {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();
      
      setProfile(profileData as Profile);

      // Load collections
      const { data: collectionsData } = await supabase
        .from("collections")
        .select("id, name, description, image_url, banner_url, total_supply, created_at")
        .eq("creator_id", profileId)
        .order("created_at", { ascending: false });
      
      setCollections((collectionsData as Collection[]) ?? []);

      // Load NFTs
      const { data: nftsData } = await supabase
        .from("nfts")
        .select(`
          id, name, description, image_url, price, is_listed, token_id, created_at,
          collection:collections(id, name, image_url)
        `)
        .eq("creator_id", profileId)
        .order("created_at", { ascending: false });
      
      setNfts((nftsData as NFT[]) ?? []);
      setLoading(false);
    };
    void loadData();
  }, [profileId]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
        <Link href="/community" className="underline">Back to Community</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <div className="text-sm text-white/70 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/community" className="hover:underline">Community</Link>
        <span className="mx-2">›</span>
        <span className="text-white">{profile.username || profile.full_name || 'Profile'}</span>
      </div>

      {/* Profile Header */}
      <div className="text-center mb-12">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20">
          {profile.avatar_url ? (
            <Image 
              src={profile.avatar_url} 
              alt={profile.username || 'Profile'} 
              width={128} 
              height={128} 
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <span className="text-4xl font-bold">
                {(profile.username || profile.full_name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {profile.username || profile.full_name || 'Anonymous'}
        </h1>
        
        {profile.bio && (
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-4">
            {profile.bio}
          </p>
        )}
        
        <div className="flex justify-center gap-6 text-sm text-white/60">
          <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>{collections.length} Collections</span>
          <span>•</span>
          <span>{nfts.length} NFTs</span>
        </div>

        {/* Social Links */}
        {(profile.website || profile.twitter || profile.instagram) && (
          <div className="flex justify-center gap-4 mt-6">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                Website
              </a>
            )}
            {profile.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                Twitter
              </a>
            )}
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                Instagram
              </a>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex rounded-lg border border-white/10 p-1">
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'collections'
                ? 'bg-white text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Collections ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab('nfts')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'nfts'
                ? 'bg-white text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            NFTs ({nfts.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'collections' ? (
        <div>
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/60 text-lg">No collections found</div>
              <div className="text-sm text-white/40 mt-2">This user hasn't created any collections yet</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collections.map((collection) => (
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
                          {collection.total_supply} items
                        </p>
                      </div>
                    </div>
                    
                    {collection.description && (
                      <p className="text-sm text-white/70 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {nfts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/60 text-lg">No NFTs found</div>
              <div className="text-sm text-white/40 mt-2">This user hasn't created any NFTs yet</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
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
      )}
    </div>
  );
}
