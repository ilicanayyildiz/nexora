"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSignedIn(Boolean(data.session));
      if (data.session) {
        const { data: bal } = await supabase.from('balances').select('amount').single();
        if (bal?.amount !== undefined) setBalance(Number(bal.amount).toFixed(2));
      } else {
        setBalance(null);
      }
    };
    void init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={28} height={28} />
            <span className="text-lg font-semibold">
              <span style={{color: 'var(--accent)'}}>Nex</span>
              <span className="text-white">ora</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm">
            <Link href="/explore" className="hover:opacity-80 transition-colors">Explore</Link>
            <Link href="/create" className="hover:opacity-80 transition-colors">Create</Link>
            <Link href="/launchpad" className="hover:opacity-80 transition-colors">Launchpad</Link>
            <Link href="/about" className="hover:opacity-80 transition-colors">About</Link>
            <Link href="/checkout" className="hover:opacity-80 transition-colors">Finance</Link>
            <Link href="/community" className="hover:opacity-80 transition-colors">Community</Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {signedIn ? (
                <>
                  {balance && (
                    <Link href="/wallet" className="h-9 items-center rounded-full border border-white/20 px-3 text-sm hover:bg-white/10 transition-colors inline-flex">
                      ${balance}
                    </Link>
                  )}
                  <Link href="/favorites" className="h-9 items-center rounded-md border border-white/20 px-3 text-sm hover:bg-white/10 transition-colors inline-flex">Favorites</Link>
                  <Link href="/dashboard" className="h-9 items-center rounded-md border border-white/20 px-3 text-sm hover:bg-white/10 transition-colors inline-flex">Dashboard</Link>
                </>
              ) : (
                <Link href="/signin" className="h-9 items-center rounded-md border border-white/20 px-3 text-sm hover:bg-white/10 transition-colors inline-flex">Sign In</Link>
              )}
            </div>

            {/* Create Collection Button */}
            <Link
              href="/create"
              className="hidden sm:inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            >
              Create Collection
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 hover:bg-white/10 transition-colors"
              onClick={() => setOpen((s) => !s)}
              aria-label="Toggle Menu"
            >
              <span className="w-5 h-5">≡</span>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="grid gap-3 text-sm">
              <Link href="/explore" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Explore</Link>
              <Link href="/create" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Create</Link>
              <Link href="/launchpad" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Launchpad</Link>
              <Link href="/about" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">About</Link>
              <Link href="/checkout" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Finance</Link>
              <Link href="/community" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Community</Link>
              
              {signedIn ? (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  <Link href="/wallet" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Wallet</Link>
                  <Link href="/transactions" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Transactions</Link>
                  <Link href="/favorites" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Favorites</Link>
                  <Link href="/dashboard" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Dashboard</Link>
                </>
              ) : (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  <Link href="/signin" className="py-2 hover:bg-white/10 px-2 rounded transition-colors">Sign In</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


