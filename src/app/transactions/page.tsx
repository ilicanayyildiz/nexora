"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Sale = {
  id: string;
  nft_id: string;
  price: number;
  seller_id: string | null;
  buyer_id: string | null;
  created_at: string;
  nft: {
    name: string;
    image_url: string | null;
  } | null;
};

type Ledger = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  ref: string | null;
  created_at: string;
};

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ledger, setLedger] = useState<Ledger[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        window.location.href = "/signin";
        return;
      }
      setUserId(session.user.id);

      // Balance
      const { data: bal } = await supabase.from("balances").select("amount").single();
      setBalance(Number(bal?.amount ?? 0));

      // Sales (as buyer or seller)
      const { data: salesData } = await supabase
        .from("sales")
        .select(
          `id, nft_id, price, seller_id, buyer_id, created_at,
           nft:nfts(id, name, image_url)`
        )
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order("created_at", { ascending: false });
      setSales((salesData as any[]) as Sale[]);

      // Ledger entries (own)
      const { data: ledgerData } = await supabase
        .from("ledger")
        .select("id, type, amount, ref, created_at")
        .order("created_at", { ascending: false });
      setLedger((ledgerData as any[]) as Ledger[]);

      setIsLoading(false);
    };
    void init();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24">Loading...</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="mt-1 text-white/70">Your balance: ${balance.toFixed(2)}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard" className="inline-flex items-center rounded-md border border-white/20 px-4 h-10 hover:bg-white/10">Back to Dashboard</Link>
          <Link href="/wallet" className="inline-flex items-center rounded-md bg-white text-black px-4 h-10 font-semibold hover:bg-white/90">Wallet</Link>
        </div>
      </div>

      {/* Sales history */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Sales & Purchases</h2>
        {sales.length === 0 ? (
          <div className="mt-4 text-white/70">No transactions yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/60">
                  <th className="p-3">NFT</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const isBuyer = s.buyer_id === userId;
                  const role = isBuyer ? "Bought" : "Sold";
                  return (
                    <tr key={s.id} className="border-t border-white/10">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {s.nft?.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.nft.image_url} alt={s.nft.name} className="h-8 w-8 rounded object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded bg-white/10" />)
                          }
                          <span className="font-medium">{s.nft?.name ?? s.nft_id}</span>
                        </div>
                      </td>
                      <td className="p-3">{role}</td>
                      <td className="p-3">${Number(s.price).toLocaleString()}</td>
                      <td className="p-3">{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ledger */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Ledger</h2>
        {ledger.length === 0 ? (
          <div className="mt-4 text-white/70">No ledger entries yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/60">
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((l) => (
                  <tr key={l.id} className="border-t border-white/10">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        l.type === 'credit' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>{l.type.toUpperCase()}</span>
                    </td>
                    <td className="p-3">${Number(l.amount).toLocaleString()}</td>
                    <td className="p-3 font-mono text-xs break-all">{l.ref ?? '—'}</td>
                    <td className="p-3">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
