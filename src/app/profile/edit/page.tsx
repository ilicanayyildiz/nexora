"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
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
  crypto_wallet_address: string | null;
  preferred_payment_method: string | null;
  is_kyc_verified: boolean;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [profile, setProfile] = useState<Profile>({
    id: "",
    username: "",
    full_name: "",
    avatar_url: "",
    bio: "",
    website: "",
    twitter: "",
    instagram: "",
    crypto_wallet_address: "",
    preferred_payment_method: "",
    is_kyc_verified: false,
  });

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push("/signin");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
      
      setLoading(false);
    };
    void init();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username || null,
          full_name: profile.full_name || null,
          bio: profile.bio || null,
          website: profile.website || null,
          twitter: profile.twitter || null,
          instagram: profile.instagram || null,
          // New payment fields
          crypto_wallet_address: profile.crypto_wallet_address || null,
          preferred_payment_method: profile.preferred_payment_method || null,
          is_kyc_verified: Boolean(profile.is_kyc_verified),
        })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <div className="text-sm text-white/70 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <span className="mx-2">›</span>
        <span className="text-white">Edit Profile</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-white/70">Update your profile information</p>
      </div>

      <div className="rounded-2xl border border-white/10 p-8">
        <div className="grid gap-6">
          {/* Avatar */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/20">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {(profile.username || profile.full_name || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-white/60">Avatar upload coming soon</p>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <label className="grid gap-2 text-sm">
              <span>Username</span>
              <input 
                value={profile.username || ""} 
                onChange={(e) => setProfile({...profile, username: e.target.value})}
                placeholder="Your username" 
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
            
            <label className="grid gap-2 text-sm">
              <span>Full Name</span>
              <input 
                value={profile.full_name || ""} 
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder="Your full name" 
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span>Bio</span>
            <textarea 
              value={profile.bio || ""} 
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Tell us about yourself" 
              className="min-h-32 rounded-lg border border-white/15 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-white/20" 
            />
          </label>

          <div className="grid md:grid-cols-3 gap-6">
            <label className="grid gap-2 text-sm">
              <span>Website</span>
              <input 
                value={profile.website || ""} 
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                placeholder="https://yourwebsite.com" 
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
            
            <label className="grid gap-2 text-sm">
              <span>Twitter</span>
              <input 
                value={profile.twitter || ""} 
                onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                placeholder="@username" 
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
            
            <label className="grid gap-2 text-sm">
              <span>Instagram</span>
              <input 
                value={profile.instagram || ""} 
                onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                placeholder="@username" 
                className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20" 
              />
            </label>
          </div>

          {/* Crypto Wallet Section */}
          <div className="mt-8 p-6 rounded-lg border border-white/10 bg-white/5">
            <h3 className="text-lg font-semibold mb-4">Crypto Wallet Settings</h3>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span>Crypto Wallet Address</span>
                <input 
                  value={profile.crypto_wallet_address || ""} 
                  onChange={(e) => setProfile({...profile, crypto_wallet_address: e.target.value})}
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" 
                  className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20 font-mono text-sm" 
                />
                <div className="text-xs text-white/60">
                  Enter your Ethereum wallet address to receive payments from NFT sales
                </div>
              </label>
              
              <label className="grid gap-2 text-sm">
                <span>Preferred Payment Method</span>
                <select 
                  value={profile.preferred_payment_method || ""} 
                  onChange={(e) => setProfile({...profile, preferred_payment_method: e.target.value})}
                  className="h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select payment method</option>
                  <option value="card">Credit Card</option>
                  <option value="crypto">Crypto Payment</option>
                  <option value="web3">Web3 Wallet</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </label>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="kyc_verified"
                  checked={profile.is_kyc_verified}
                  onChange={(e) => setProfile({...profile, is_kyc_verified: e.target.checked})}
                  className="w-4 h-4 rounded border border-white/15 bg-transparent"
                />
                <label htmlFor="kyc_verified" className="text-sm">
                  KYC Verified (for higher transaction limits)
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
        {success && <div className="mt-4 text-sm text-green-400">Profile updated successfully!</div>}
        
        <div className="mt-8 flex gap-4">
          <Link 
            href="/dashboard" 
            className="h-12 rounded-lg border border-white/20 px-6 flex items-center hover:bg-white/10 transition-colors"
          >
            Cancel
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="h-12 rounded-lg bg-white text-black px-6 font-semibold hover:bg-white/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
