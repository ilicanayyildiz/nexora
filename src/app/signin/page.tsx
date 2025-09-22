"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Check if profile exists, create if not
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (!profile) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: email.split('@')[0],
            full_name: email.split('@')[0]
          });
      }
      
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-3xl font-bold">Sign in to Nexora</h1>
      <p className="mt-2 text-white/70">Welcome back. Please enter your details.</p>
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
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-md bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-4 text-sm text-white/70">
        Don&apos;t have an account? <Link className="underline" href="/signup">Sign Up</Link>
      </p>
    </div>
  );
}


