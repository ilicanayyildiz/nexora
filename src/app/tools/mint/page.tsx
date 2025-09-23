"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { fileUpload } from "@/lib/clientSecurity";

type Collection = {
  id: string;
  name: string;
  image_url: string | null;
};

export default function MintToolsPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Step 2
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetUrl, setAssetUrl] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDesc, setNftDesc] = useState("");

  // Step 3
  const [balance, setBalance] = useState("1");
  const [royalty, setRoyalty] = useState("5");

  // Review
  const canNextFrom1 = useMemo(() => Boolean(selectedCollectionId), [selectedCollectionId]);
  const canNextFrom2 = useMemo(() => nftName.trim().length > 0 && (assetFile || assetUrl), [nftName, assetFile, assetUrl]);

  const handleMint = async () => {
    if (!userId || !selectedCollectionId || !nftName) return;
    
    try {
      // Check if user has crypto wallet address set up
      const { data: profile } = await supabase
        .from("profiles")
        .select("crypto_wallet_address, username, full_name")
        .eq("id", userId)
        .single();

      console.log("Profile data:", profile);
      console.log("Crypto wallet address:", profile?.crypto_wallet_address);

      if (!profile?.crypto_wallet_address) {
        alert(
          `You must add a crypto wallet address to your profile before minting.\n\n` +
          `Go to Profile → Edit → Crypto Wallet Settings and set your address.`
        );
        window.location.href = "/profile/edit";
        return;
      }
      // Get the next token ID for this collection
      const { data: existingNfts } = await supabase
        .from("nfts")
        .select("token_id")
        .eq("collection_id", selectedCollectionId)
        .order("token_id", { ascending: false })
        .limit(1);
      
      const nextTokenId = existingNfts && existingNfts.length > 0 ? existingNfts[0].token_id + 1 : 1;
      
      // Upload asset file if provided
      let finalImageUrl = assetUrl || "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
      if (assetFile) {
        try {
          console.log("Starting file upload for NFT...");
          const uploadResult = await fileUpload.uploadFile(assetFile, "nft-image");
          console.log("Upload result:", JSON.stringify(uploadResult, null, 2));
          
          if (uploadResult.success && uploadResult.data?.filePath) {
            // Check if filePath is already a full URL or just a path
            if (uploadResult.data.filePath.startsWith('http')) {
              // Already a full URL
              finalImageUrl = uploadResult.data.filePath;
            } else {
              // Convert storage path to public URL
              const { data } = supabase.storage.from('nfts').getPublicUrl(uploadResult.data.filePath);
              finalImageUrl = data.publicUrl;
            }
            console.log("Final image URL:", finalImageUrl);
          } else {
            console.error("Upload failed or no filePath:", uploadResult);
          }
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          // Continue with placeholder URL if upload fails
        }
      }
      
      // Create the NFT
      const { error } = await supabase
        .from("nfts")
        .insert({
          collection_id: selectedCollectionId,
          token_id: nextTokenId,
          name: nftName,
          description: nftDesc || null,
          image_url: finalImageUrl,
          owner_id: userId,
          creator_id: userId,
          price: null,
          is_listed: false, // Not listed for sale by default
          is_sold: false
        });
      
      if (error) throw error;
      
      alert("NFT minted successfully! You can now list it for sale from your dashboard.");
      
      // Reset form
      setStep(1);
      setSelectedCollectionId(null);
      setAssetFile(null);
      setAssetUrl("");
      setNftName("");
      setNftDesc("");
      setBalance("1");
      setRoyalty("5");
      
    } catch (error: any) {
      alert(`Mint failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session) {
        setUserId(session.user.id);
        const { data: colData } = await supabase
          .from("collections")
          .select("id, name, image_url")
          .eq("creator_id", session.user.id)
          .order("created_at", { ascending: false });
        setCollections((colData as Collection[]) ?? []);
      }
      setLoading(false);
    };
    void bootstrap();
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl text-sm text-white/70">
        <span>Tools</span>
        <span className="mx-2">›</span>
        <span className="text-white">Mint</span>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-7xl text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Mint Tools" 
            width={96} 
            height={96} 
            className="w-full h-full object-cover" 
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">Mint Tools</h1>
        <p className="text-white/70 text-lg">Create and mint your NFTs</p>
      </div>

      <div className="mx-auto max-w-7xl mt-4 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Left sidebar */}
        <aside className="hidden lg:block rounded-xl border border-white/10 p-4">
          <div className="text-base font-semibold">Mint!</div>
          <nav className="mt-4 grid gap-3 text-sm">
            <Link href="/dashboard" className="hover:underline">Edit my collections</Link>
            <Link href="/dashboard" className="hover:underline">Create collection</Link>
            <Link href="#" className="hover:underline">Customize drop</Link>
          </nav>
        </aside>

        {/* Main content */}
        <div>
          {/* Header */}
          <div className="mt-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Mint</h1>
            <Link href="/dashboard" className="inline-flex h-10 items-center rounded-md border border-white/20 px-4 hover:bg-white/10">Edit my collections</Link>
          </div>

          {/* Stepper */}
          <ol className="mt-6 grid grid-cols-4 gap-3 text-sm">
            {["Select a collection", "Customize NFT", "Set Balance & Royalties", "Review"].map((label, i) => {
              const idx = i + 1;
              const active = step === idx;
              const done = step > idx;
              return (
                <li key={label} className={`rounded-md border border-white/15 px-3 py-2 ${active ? "bg-white/10" : done ? "bg-white/5" : "bg-transparent"}`}>
                  <div className="font-medium">{idx}</div>
                  <div className="text-white/80">{label}</div>
                </li>
              );
            })}
          </ol>

          {/* Step content: only when user is logged in */}
          {userId ? (
            <div className="mt-6 rounded-2xl border border-white/10 p-6">
        {step === 1 && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select a collection</h2>
              <Link href="/dashboard" className="text-sm underline">Create collection</Link>
            </div>
            {collections.length === 0 ? (
              <div className="text-white/70">No collections found. Create one from the dashboard.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collections.map((c) => (
                        <button key={c.id} onClick={() => setSelectedCollectionId(c.id)} className={`text-left rounded-xl border px-4 py-3 hover:bg-white/5 ${selectedCollectionId === c.id ? "border-white" : "border-white/10"}`}>
                    <div className="flex items-center gap-3">
                      {c.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image_url} alt={c.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-white/10" />
                      )}
                      <div className="font-medium">{c.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4">
              <button disabled={!canNextFrom1} onClick={() => setStep(2)} className="h-10 rounded-md bg-white text-black px-4 font-semibold hover:bg-white/90 disabled:opacity-60">Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Customize NFT</h2>
            <label className="grid gap-1 text-sm">
              <span>Asset</span>
              <input type="file" onChange={(e) => setAssetFile(e.target.files?.[0] ?? null)} className="h-10 rounded-md border border-white/15 bg-transparent px-3 py-1 outline-none focus:ring-2 focus:ring-white/20 file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-1 file:text-black" />
              <input value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} placeholder="or paste a URL" className="mt-2 h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Name</span>
              <input value={nftName} onChange={(e) => setNftName(e.target.value)} placeholder="My NFT" className="h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Description</span>
              <textarea value={nftDesc} onChange={(e) => setNftDesc(e.target.value)} placeholder="Describe your NFT" className="min-h-24 rounded-md border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <div className="mt-2 flex gap-3">
              <button onClick={() => setStep(1)} className="h-10 rounded-md border border-white/20 px-4 hover:bg-white/10">Back</button>
              <button disabled={!canNextFrom2} onClick={() => setStep(3)} className="h-10 rounded-md bg-white text-black px-4 font-semibold hover:bg-white/90 disabled:opacity-60">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Set Balance & Royalties</h2>
            <label className="grid gap-1 text-sm">
              <span>Balance (quantity)</span>
              <input value={balance} onChange={(e) => setBalance(e.target.value)} className="h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Royalty %</span>
              <input value={royalty} onChange={(e) => setRoyalty(e.target.value)} className="h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20" />
            </label>
            <div className="mt-2 flex gap-3">
              <button onClick={() => setStep(2)} className="h-10 rounded-md border border-white/20 px-4 hover:bg-white/10">Back</button>
              <button onClick={() => setStep(4)} className="h-10 rounded-md bg-white text-black px-4 font-semibold hover:bg-white/90">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Review</h2>
            <div className="text-sm text-white/80">Collection: {collections.find(c => c.id === selectedCollectionId)?.name ?? "—"}</div>
            <div className="text-sm text-white/80">Name: {nftName || "—"}</div>
            <div className="text-sm text-white/80">Quantity: {balance}</div>
            <div className="text-sm text-white/80">Royalty: {royalty}%</div>
            <div className="mt-2 flex gap-3">
              <button onClick={() => setStep(3)} className="h-10 rounded-md border border-white/20 px-4 hover:bg-white/10">Back</button>
              <button onClick={handleMint} className="h-10 rounded-md bg-white text-black px-4 font-semibold hover:bg-white/90">Mint NFT</button>
            </div>
            <p className="text-xs text-white/60">Wallet mint flow is not wired yet. This page mirrors the UX similar to the reference and will connect to a blockchain/minter later.</p>
          </div>
        )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 p-6 text-white/70 text-sm">
              Please sign in to proceed with minting steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


