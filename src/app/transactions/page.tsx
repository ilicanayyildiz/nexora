"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SkeletonTransaction } from "@/components/LoadingSkeleton";

interface Transaction {
  id: string;
  type: 'payment' | 'purchase' | 'sale' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  timestamp: string;
  transaction_id?: string;
  crypto_amount?: number;
  crypto_currency?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'payment' | 'purchase' | 'sale' | 'refund'>('all');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        window.location.href = "/signin";
        return;
      }
      
      // Mock transaction data - replace with real data from your backend
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'payment',
          amount: 50,
          currency: 'USD',
          status: 'completed',
          description: 'Platform balance top-up',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          transaction_id: 'tx_abc123',
          crypto_amount: 50.5,
          crypto_currency: 'USDC'
        },
        {
          id: '2',
          type: 'purchase',
          amount: 25,
          currency: 'USD',
          status: 'completed',
          description: 'NFT Purchase - Cool Art #123',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          transaction_id: 'tx_def456'
        },
        {
          id: '3',
          type: 'payment',
          amount: 100,
          currency: 'USD',
          status: 'pending',
          description: 'Crypto payment - USDC',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          crypto_amount: 100,
          crypto_currency: 'USDC'
        },
        {
          id: '4',
          type: 'sale',
          amount: 75,
          currency: 'USD',
          status: 'completed',
          description: 'NFT Sale - Digital Art #456',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          transaction_id: 'tx_ghi789'
        },
        {
          id: '5',
          type: 'payment',
          amount: 30,
          currency: 'USD',
          status: 'failed',
          description: 'Payment failed - insufficient funds',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setTransactions(mockTransactions);
      setLoading(false);
    };
    void init();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const statusMatch = filter === 'all' || tx.status === filter;
    const typeMatch = typeFilter === 'all' || tx.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      case 'cancelled': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-white/70 bg-white/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💳';
      case 'purchase': return '🛒';
      case 'sale': return '💰';
      case 'refund': return '↩️';
      default: return '📄';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <div className="h-8 w-64 loading-skeleton rounded mb-2"></div>
          <div className="h-4 w-96 loading-skeleton rounded"></div>
        </div>
        
        <div className="mb-6 flex gap-4">
          <div className="h-10 w-32 loading-skeleton rounded"></div>
          <div className="h-10 w-32 loading-skeleton rounded"></div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonTransaction key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="mt-2 text-white/70">View all your payment and transaction history</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-white/20 bg-transparent text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-white/20 bg-transparent text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="purchase">Purchases</option>
            <option value="sale">Sales</option>
            <option value="refund">Refunds</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
            <p className="text-white/70">No transactions match your current filters</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-smooth hover-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{tx.description}</h3>
                    <p className="text-sm text-white/70">{formatDate(tx.timestamp)}</p>
                    {tx.transaction_id && (
                      <p className="text-xs text-white/50 font-mono">ID: {tx.transaction_id}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">
                        ${tx.amount} {tx.currency}
                      </div>
                      {tx.crypto_amount && tx.crypto_currency && (
                        <div className="text-sm text-white/70">
                          {tx.crypto_amount} {tx.crypto_currency}
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-2xl font-bold text-green-400">
            ${transactions.filter(tx => tx.status === 'completed' && tx.type === 'payment').reduce((sum, tx) => sum + tx.amount, 0)}
          </div>
          <div className="text-sm text-white/70">Total Deposited</div>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-2xl font-bold text-blue-400">
            ${transactions.filter(tx => tx.status === 'completed' && tx.type === 'purchase').reduce((sum, tx) => sum + tx.amount, 0)}
          </div>
          <div className="text-sm text-white/70">Total Spent</div>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-2xl font-bold text-emerald-400">
            ${transactions.filter(tx => tx.status === 'completed' && tx.type === 'sale').reduce((sum, tx) => sum + tx.amount, 0)}
          </div>
          <div className="text-sm text-white/70">Total Earned</div>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-2xl font-bold text-white">
            {transactions.filter(tx => tx.status === 'pending').length}
          </div>
          <div className="text-sm text-white/70">Pending</div>
        </div>
      </div>
    </div>
  );
}
