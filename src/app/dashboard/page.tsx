"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  apiClient, 
  fileUpload, 
  validateCollectionForm, 
  validateNFTForm,
  FormValidator 
} from "@/lib/clientSecurity";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  crypto_wallet_address: string | null;
  preferred_payment_method: string | null;
  is_kyc_verified: boolean;
};

type Collection = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  total_supply: number | null;
  mint_price: string | null;
  royalty_percentage: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [mintPrice, setMintPrice] = useState("");
  const [royalty, setRoyalty] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        window.location.href = "/signin";
        return;
      }
      setUserId(session.user.id);
      setEmail(session.user.email ?? null);
      
      // Fetch CSRF token for API calls
      try {
        await apiClient.csrfManager.getToken();
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }

      // Ensure CSRF cookie/token is set for secure API calls
      try {
        const { data: s } = await supabase.auth.getSession();
        const accessToken = s.session?.access_token;
        await fetch('/api/csrf', { 
          credentials: 'include', 
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined 
        });
      } catch {}

      // Load profile (including wallet/payment fields)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, crypto_wallet_address, preferred_payment_method, is_kyc_verified")
        .eq("id", session.user.id)
        .single();
      setProfile((profileData as Profile) ?? null);

      // Load user's collections
      const { data: colData } = await supabase
        .from("collections")
        .select("id, name, description, image_url, banner_url, total_supply, mint_price, royalty_percentage, created_at")
        .eq("creator_id", session.user.id)
        .order("created_at", { ascending: false });
      setCollections((colData as Collection[]) ?? []);

      // Load user's NFTs
      const { data: nftData } = await supabase
        .from("nfts")
        .select(`
          id, name, description, image_url, price, is_listed, owner_id, creator_id, created_at,
          collection:collections(name, image_url)
        `)
        .eq("creator_id", session.user.id)
        .order("created_at", { ascending: false });
      setNfts((nftData as any[]) ?? []);

      setIsLoading(false);
    };
    void bootstrap();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const canSubmit = useMemo(() => name.trim().length > 2, [name]);

  const uploadFileIfAny = async (file: File | null): Promise<string | null> => {
    if (!file || !userId) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: upErr } = await supabase.storage.from('collections').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (upErr) {
      throw upErr;
    }
    const { data } = supabase.storage.from('collections').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const ensureProfile = async () => {
    if (!userId || !email) return;
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    if (!existing) {
      await supabase
        .from('profiles')
        .insert({ id: userId, username: (email.split('@')[0] ?? null), full_name: (email.split('@')[0] ?? null) });
    }
  };

  const onCreateCollection = async () => {
    if (!userId) return;
    setFormLoading(true);
    setFormError(null);
    
    try {
      // Validate form data
      const validation = validateCollectionForm({
        name,
        description,
        imageUrl,
        bannerUrl,
        mintPrice,
        royalty
      });
      
      if (!validation.valid) {
        setFormError(validation.errors.join(', '));
        setFormLoading(false);
        return;
      }
      
      // Ensure profile exists to satisfy FK (creator_id -> profiles.id)
      await ensureProfile();

      // Check if user has crypto wallet address set up
      const { data: profile } = await supabase
        .from("profiles")
        .select("crypto_wallet_address, username, full_name")
        .eq("id", userId)
        .single();

      if (!profile?.crypto_wallet_address) {
        const confirm = window.confirm(
          `⚠️ Warning: You haven't set up your crypto wallet address yet.\n\n` +
          `Without a wallet address, you won't be able to receive payments when your NFTs are sold.\n\n` +
          `Would you like to:\n` +
          `1. Continue creating collection (you can set up your wallet later)\n` +
          `2. Go to profile settings to add your wallet address first\n\n` +
          `Click OK to continue, or Cancel to go to profile settings.`
        );
        
        if (!confirm) {
          window.location.href = "/profile/edit";
          return;
        }
      }

      let finalImageUrl = imageUrl || null;
      let finalBannerUrl = bannerUrl || null;

      // Upload files only if new files are selected (not if URLs are already provided)
      if (imageFile && !imageUrl) {
        const uploadResult = await fileUpload.uploadFile(imageFile, 'image');
        if (uploadResult.success && uploadResult.data) {
          finalImageUrl = uploadResult.data.filePath;
        } else {
          setFormError(uploadResult.error || 'Failed to upload image');
          setFormLoading(false);
          return;
        }
      }
      
      if (bannerFile && !bannerUrl) {
        const uploadResult = await fileUpload.uploadFile(bannerFile, 'image');
        if (uploadResult.success && uploadResult.data) {
          finalBannerUrl = uploadResult.data.filePath;
        } else {
          setFormError(uploadResult.error || 'Failed to upload banner');
          setFormLoading(false);
          return;
        }
      }

      // Create collection directly with Supabase (like create page)
      const { data: collection, error } = await supabase
        .from('collections')
        .insert({
          name,
          description: description || null,
          image_url: finalImageUrl,
          banner_url: finalBannerUrl,
          mint_price: mintPrice ? Number(mintPrice) : 0,
          royalty_percentage: royalty ? Number(royalty) : 0,
          creator_id: userId,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to create collection');
      }
      
      if (collection) {
        setCollections((prev) => [collection, ...prev]);
        // Reset form
        setName("");
        setDescription("");
        setImageUrl("");
        setBannerUrl("");
        setImageFile(null);
        setBannerFile(null);
        setMintPrice("");
        setRoyalty("");
      }
    } catch (e: any) {
      setFormError(e?.message ?? 'Failed to create collection');
    } finally {
      setFormLoading(false);
    }
  };

  const listNftForSale = async (nftId: string, price: number) => {
    try {
      console.log('Listing NFT:', nftId, 'with price:', price);
      
      // Validate price
      const validator = new FormValidator();
      validator.number(price, 'Price', 0.01, 10000);
      const validation = validator.getResult();
      
      if (!validation.valid) {
        alert(validation.errors.join(', '));
        return;
      }
      
      // Update NFT directly with Supabase (bypass API)
      const { error: updateError } = await supabase
        .from('nfts')
        .update({
          price: price,
          is_listed: true
        })
        .eq('id', nftId);
      
      console.log('Supabase update error:', updateError);
      
      if (updateError) {
        throw new Error(updateError.message || 'Failed to list NFT');
      }
      
      // Refresh NFTs
      const { data: nftData } = await supabase
        .from("nfts")
        .select(`
          id, name, description, image_url, price, is_listed, owner_id, creator_id, created_at,
          collection:collections(name, image_url)
        `)
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });
      setNfts((nftData as any[]) ?? []);
      
      alert("NFT listed for sale successfully!");
    } catch (error: any) {
      alert(`Failed to list NFT: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-white/70">Signed in as {email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/profile/edit" className="inline-flex items-center rounded-md border border-white/20 px-4 h-10 hover:bg-white/10">Edit Profile</Link>
          <Link href="/" className="inline-flex items-center rounded-md border border-white/20 px-4 h-10 hover:bg-white/10">Back to Home</Link>
          <button onClick={signOut} className="inline-flex items-center rounded-md bg-white text-black px-4 h-10 font-semibold hover:bg-white/90">Sign Out</button>
        </div>
      </div>

      {/* Profile & Wallet */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-4 text-sm">
            <div className="text-white/80">Username</div>
            <div className="font-medium">{profile?.username ?? "—"}</div>
            <div className="mt-3 text-white/80">Full name</div>
            <div className="font-medium">{profile?.full_name ?? "—"}</div>
            <div className="mt-3 text-white/80">User ID</div>
            <div className="font-mono text-xs break-all">{userId}</div>
          </div>
        </div>

        {/* Wallet Information */}
        <div className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <div className="mt-4 text-sm space-y-3">
            <div>
              <div className="text-white/80">Crypto Address</div>
              <div className="font-mono text-xs break-all bg-white/5 p-2 rounded mt-1">
                {profile?.crypto_wallet_address || "Not set"}
              </div>
            </div>
            <div>
              <div className="text-white/80">Payment Method</div>
              <div className="font-medium">
                {profile?.preferred_payment_method ? 
                  profile.preferred_payment_method.toUpperCase() : "Not set"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-white/80">KYC Status</div>
              <div className={`px-2 py-1 rounded text-xs ${
                profile?.is_kyc_verified 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {profile?.is_kyc_verified ? 'Verified' : 'Not Verified'}
              </div>
            </div>
          </div>
        </div>

        {/* Create Collection */}
        <div className="rounded-2xl border border-white/10 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold">Create Collection</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Collection" className="h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Mint price</span>
              <input value={mintPrice} onChange={(e) => setMintPrice(e.target.value)} placeholder="0.05" className="h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm md:col-span-2">
              <span>Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your collection" className="min-h-24 rounded-md border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Image</span>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="h-10 rounded-md border border-white/15 bg-transparent px-3 py-1 outline-none focus:ring-2 focus:ring-white/20 file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-1 file:text-black" />
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="or paste image URL" className="mt-2 h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Banner</span>
              <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} className="h-10 rounded-md border border-white/15 bg-transparent px-3 py-1 outline-none focus:ring-2 focus:ring-white/20 file:mr-3 file:rounded file:border-0 file:bg白 file:px-3 file:py-1 file:text-black" />
              <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="or paste banner URL" className="mt-2 h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Royalty %</span>
              <input value={royalty} onChange={(e) => setRoyalty(e.target.value)} placeholder="5" className="h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
          </div>
          {formError && <div className="mt-3 text-sm text-red-400">{formError}</div>}
          <div className="mt-4">
            <button disabled={!canSubmit || formLoading} onClick={onCreateCollection} className="h-10 rounded-md bg-white text-black px-4 font-semibold hover:bg-white/90 disabled:opacity-60">
              {formLoading ? "Creating..." : "Create Collection"}
            </button>
          </div>
        </div>
      </section>

      {/* Collections list */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Collections</h2>
          <span className="text-sm text-white/60">{collections.length} items</span>
        </div>
        {collections.length === 0 ? (
          <div className="mt-4 text-white/70">You have no collections yet.</div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <div key={c.id} className="rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
                {/* Banner */}
                {c.banner_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.banner_url} alt={c.name} className="h-28 w-full object-cover" />
                ) : (
                  <div className="h-28 w-full bg-gradient-to-r from-white/5 to-white/10" />
                )}
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image_url} alt={c.name} className="h-10 w-10 rounded object-cover ring-1 ring-white/10" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-white/10 ring-1 ring-white/10" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight truncate">{c.name}</div>
                      <div className="text-xs text-white/60">{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {c.description && (
                    <p className="mt-3 text-sm text-white/80 line-clamp-2">{c.description}</p>
                  )}

                  {/* Stats */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">Supply: {c.total_supply ?? 0}</span>
                    {c.mint_price !== null && c.mint_price !== undefined && (
                      <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-300/90">
                        
                        {typeof c.mint_price === 'string' ? c.mint_price : Number(c.mint_price).toLocaleString()} ETH
                      </span>
                    )}
                    {c.royalty_percentage !== null && c.royalty_percentage !== undefined && (
                      <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300/90">Royalty {c.royalty_percentage}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/wallet" className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-center">
            <div className="text-2xl mb-2">💳</div>
            <div className="text-sm font-medium">Wallet</div>
          </Link>
          <Link href="/transactions" className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Transactions</div>
          </Link>
          <Link href="/favorites" className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-center">
            <div className="text-2xl mb-2">❤️</div>
            <div className="text-sm font-medium">Favorites</div>
          </Link>
          <Link href="/checkout" className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-center">
            <div className="text-2xl mb-2">💸</div>
            <div className="text-sm font-medium">Finance</div>
          </Link>
          <Link href="/tools/mint" className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-center md:col-span-2">
            <div className="text-2xl mb-2">🛠️</div>
            <div className="text-sm font-medium">Mint NFT</div>
          </Link>
        </div>
      </section>

      {/* My NFTs section */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My NFTs</h2>
          <span className="text-sm text-white/60">{nfts.length} items</span>
        </div>
        {nfts.length === 0 ? (
          <div className="mt-4 text-white/70">You have no NFTs yet. <Link href="/tools/mint" className="underline">Mint your first NFT</Link></div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <div key={nft.id} className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="aspect-square relative">
                  {/* Fallback: nft image -> collection image -> default */}
                  <img
                    src={(nft.image_url || nft.collection?.image_url || "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80") as string}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {nft.collection?.image_url && (
                      <img src={nft.collection.image_url} alt={nft.collection.name} className="h-5 w-5 rounded" />
                    )}
                    <span className="text-xs text-white/60">{nft.collection?.name}</span>
                  </div>
                  <h3 className="font-semibold truncate">{nft.name}</h3>
                  <p className="text-sm text-white/70 truncate">{nft.description}</p>
                  <div className="mt-3">
                    {nft.is_listed ? (
                      <div className="text-sm">
                        <div className="text-white/60">Listed for</div>
                        <div className="font-semibold">${nft.price}</div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Price" 
                          id={`price-${nft.id}`}
                          step="0.01"
                          min="0.01"
                          className="flex-1 h-8 rounded text-xs px-2 border border-white/15 bg-transparent outline-none focus:ring-1 focus:ring-white/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const raw = (e.target as HTMLInputElement).value || '';
                              const normalized = raw.replace(',', '.').replace(/[^0-9.]/g, '');
                              const price = Number(normalized);
                              if (Number.isFinite(price) && price > 0) {
                                listNftForSale(nft.id, price);
                              }
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById(`price-${nft.id}`) as HTMLInputElement | null;
                            const raw = input?.value || '';
                            const normalized = raw.replace(',', '.').replace(/[^0-9.]/g, '');
                            const price = Number(normalized);
                            console.log('Button clicked - input value:', raw, 'normalized:', normalized, 'price:', price);
                            if (Number.isFinite(price) && price > 0) {
                              listNftForSale(nft.id, price);
                            } else {
                              alert('Please enter a valid price');
                            }
                          }}
                          className="h-8 rounded px-3 text-xs font-semibold text-black"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          List
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}



