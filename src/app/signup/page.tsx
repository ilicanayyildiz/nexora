"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Create profile automatically
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: email.split('@')[0], // Use email prefix as default username
          full_name: email.split('@')[0]
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
      
      setMessage("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    }
  };

  const onMagicLink = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    setLoading(false);
    if (error) setError(error.message); else setOtpSent(true);
  };

  const onOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/dashboard` } });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-3xl font-bold">Create your Nexora account</h1>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-2 text-sm">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20"
          />
        </label>
        {error && <div className="text-sm text-red-400">{error}</div>}
        {message && <div className="text-sm text-emerald-400">{message}</div>}
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-md bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-white/70">
        Already have an account? <Link className="underline" href="/signin">Sign In</Link>
      </p>
      <div className="mt-6 grid gap-3">
        {otpSent && <div className="text-sm text-emerald-400">Check your email for the magic link.</div>}
        <button onClick={onMagicLink} disabled={loading || !email} className="h-11 rounded-md border border-white/20 hover:bg-white/10 disabled:opacity-60">Send magic link</button>
        <div className="flex items-center gap-3">
          <button onClick={() => onOAuth("google")} disabled={loading} className="flex-1 h-11 rounded-md border border-white/20 hover:bg-white/10">Continue with Google</button>
          <button onClick={() => onOAuth("github")} disabled={loading} className="flex-1 h-11 rounded-md border border-white/20 hover:bg-white/10">Continue with GitHub</button>
        </div>
      </div>
    </div>
  );
}


