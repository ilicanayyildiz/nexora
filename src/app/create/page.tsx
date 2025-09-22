"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fileUpload } from "@/lib/clientSecurity";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function CreateCollectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
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
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push("/signin");
        return;
      }
      setUserId(session.user.id);
      // Ensure CSRF with Authorization header
      try { 
        const { data: s } = await supabase.auth.getSession();
        const accessToken = s.session?.access_token;
        await fetch('/api/csrf', { 
          credentials: 'include', 
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined 
        });
      } catch {}
      setIsLoading(false);
    };
    void init();
  }, [router]);

  // Route uploads via our API to avoid env/policy mismatches
  const uploadViaApiIfAny = async (category: 'collection-image' | 'banner', file: File | null): Promise<string | null> => {
    if (!file) return null;
    const res = await fileUpload.uploadFile(file, 'image');
    if (!res.success || !res.data?.filePath) throw new Error(res.error || 'Upload failed');
    return res.data.filePath;
  };

  const ensureProfile = async () => {
    const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).single();
    if (!existing) {
      const { data: session } = await supabase.auth.getSession();
      const email = session.session?.user.email ?? "";
      await supabase.from("profiles").insert({ id: userId, full_name: (email.split('@')[0] ?? null) });
    }
  };

  const onCreateCollection = async () => {
    if (!userId) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await ensureProfile();

      const [uploadedImageUrl, uploadedBannerUrl] = await Promise.all([
        uploadViaApiIfAny('collection-image', imageFile),
        uploadViaApiIfAny('banner', bannerFile),
      ]);

      const finalImageUrl = uploadedImageUrl || (imageUrl || null);
      const finalBannerUrl = uploadedBannerUrl || (bannerUrl || null);

      const { error, data } = await supabase
        .from("collections")
        .insert({
          name,
          description: description || null,
          image_url: finalImageUrl,
          banner_url: finalBannerUrl,
          mint_price: mintPrice ? Number(mintPrice) : 0,
          royalty_percentage: royalty ? Number(royalty) : 0,
          creator_id: userId,
        })
        .select("id")
        .single();
      
      if (error) throw error;
      
      alert("Collection created successfully!");
      router.push("/dashboard");
    } catch (e: any) {
      setFormError(e?.message ?? 'Failed to create collection');
    } finally {
      setFormLoading(false);
    }
  };

  const canSubmit = name.trim().length > 0;

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <div className="text-sm text-white/70 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-white">Create Collection</span>
      </div>

      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Create Collection" 
            width={96} 
            height={96} 
            className="w-full h-full object-cover" 
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">Create Collection</h1>
        <p className="text-white/70">Launch your NFT collection and start minting</p>
      </div>

      <div className="rounded-2xl border border-white/10 p-8">
        <div className="grid gap-6">
          <label className="grid gap-2 text-sm">
            <span>Collection Name *</span>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="My Awesome Collection" 
              className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
            />
          </label>
          
          <label className="grid gap-2 text-sm">
            <span>Description</span>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tell us about your collection" 
              className="min-h-32 rounded-lg border border-white/15 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-white/20" 
            />
          </label>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="grid gap-2 text-sm">
              <span>Collection Image</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} 
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 py-1 outline-none focus:ring-2 focus:ring-white/20 file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-1 file:text-black" 
              />
              <input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="or paste image URL" 
                className="mt-2 h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
            
            <label className="grid gap-2 text-sm">
              <span>Banner Image</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} 
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 py-1 outline-none focus:ring-2 focus:ring-white/20 file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-1 file:text-black" 
              />
              <input 
                value={bannerUrl} 
                onChange={(e) => setBannerUrl(e.target.value)} 
                placeholder="or paste banner URL" 
                className="mt-2 h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="grid gap-2 text-sm">
              <span>Mint Price (ETH)</span>
              <input 
                value={mintPrice} 
                onChange={(e) => setMintPrice(e.target.value)} 
                placeholder="0.05" 
                type="number"
                step="0.001"
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
            
            <label className="grid gap-2 text-sm">
              <span>Royalty Percentage</span>
              <input 
                value={royalty} 
                onChange={(e) => setRoyalty(e.target.value)} 
                placeholder="5" 
                type="number"
                min="0"
                max="10"
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
          </div>
        </div>
        
        {formError && <div className="mt-4 text-sm text-red-400">{formError}</div>}
        
        <div className="mt-8 flex gap-4">
          <Link 
            href="/dashboard" 
            className="h-12 rounded-lg border border-white/20 px-6 flex items-center hover:bg-white/10 transition-colors"
          >
            Cancel
          </Link>
          <button 
            disabled={!canSubmit || formLoading} 
            onClick={onCreateCollection} 
            className="h-12 rounded-lg bg-white text-black px-6 font-semibold hover:bg-white/90 disabled:opacity-60 transition-colors"
          >
            {formLoading ? "Creating..." : "Create Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}
