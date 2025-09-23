"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  connected: boolean;
}

export default function WalletPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        window.location.href = "/signin";
        return;
      }
      setUserId(session.user.id);
      
      // Get platform balance
      const { data: bal } = await supabase.from('balances').select('amount').single();
      if (bal?.amount !== undefined) setBalance(Number(bal.amount).toFixed(2));

      // Get user profile for crypto wallet info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("crypto_wallet_address, username, full_name")
        .eq("id", session.user.id)
        .single();
      setProfile(profileData);
    };
    void init();
  }, []);

  const connectWallet = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Mock wallet connection - replace with real Web3 integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWalletInfo: WalletInfo = {
        address: '0x742d35Cc6634C0532925a3b8D7Ac6c9C2b3C4d5e',
        balance: '2.45',
        network: 'Ethereum Mainnet',
        connected: true
      };
      
      setWalletInfo(mockWalletInfo);
    } catch (e: any) {
      setError(e?.message ?? "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    setError(null);
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      // You could add a toast notification here
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const withdrawToCrypto = async () => {
    if (!profile?.crypto_wallet_address) {
      alert("Please set up your crypto wallet address in your profile first.");
      return;
    }

    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (Number(withdrawAmount) > Number(balance)) {
      alert("Insufficient balance for withdrawal.");
      return;
    }

    setWithdrawing(true);
    try {
      // Simulate withdrawal to crypto wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would:
      // 1. Debit user's platform balance
      // 2. Send crypto to their wallet address
      // 3. Record transaction in ledger
      
      alert(`Withdrawal initiated! $${withdrawAmount} will be sent to ${profile.crypto_wallet_address}`);
      setWithdrawAmount("");
    } catch (e: any) {
      alert(`Withdrawal failed: ${e.message}`);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="mt-2 text-white/70">Manage your crypto wallet and platform balance</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Platform Balance */}
        <div className="rounded-2xl border border-white/10 p-6 hover-lift transition-smooth">
          <h2 className="text-lg font-semibold mb-4">Platform Balance</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              ${balance || '0.00'}
            </div>
            <p className="text-white/70 mb-4">Available for NFT purchases</p>
            <div className="flex gap-3">
              <Link href="/checkout" className="flex-1 h-10 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center">
                💳 Finance
              </Link>
              <button 
                onClick={() => document.getElementById('withdraw-modal')?.classList.remove('hidden')}
                className="flex-1 h-10 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                💸 Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Crypto Wallet */}
        <div className="rounded-2xl border border-white/10 p-6 hover-lift transition-smooth">
          <h2 className="text-lg font-semibold mb-4">Crypto Wallet</h2>
          
          {!walletInfo ? (
            <div className="text-center">
              <div className="text-4xl mb-4">🦊</div>
              <p className="text-white/70 mb-4">Connect your Web3 wallet to manage crypto assets</p>
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="w-full h-12 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-colors"
                style={{ backgroundColor: 'var(--accent)', color: '#000' }}
              >
                {connecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Connecting...
                  </div>
                ) : (
                  'Connect MetaMask'
                )}
              </button>
              {error && (
                <div className="mt-3 text-sm text-red-400">{error}</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {walletInfo.balance} ETH
                </div>
                <p className="text-white/70 text-sm">{walletInfo.network}</p>
              </div>
              
              <div className="rounded-lg bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Wallet Address</span>
                  <button
                    onClick={copyAddress}
                    className="text-xs text-white/50 hover:text-white/70 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="font-mono text-sm text-white">
                  {formatAddress(walletInfo.address)}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 h-10 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors">
                  📤 Send
                </button>
                <button className="flex-1 h-10 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors">
                  📥 Receive
                </button>
                <button
                  onClick={disconnectWallet}
                  className="flex-1 h-10 rounded-lg border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Features */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-2xl mb-3">🔗</div>
          <h3 className="font-semibold mb-2">Multi-Chain Support</h3>
          <p className="text-sm text-white/70">Connect to Ethereum, Polygon, and other networks</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-2xl mb-3">🔒</div>
          <h3 className="font-semibold mb-2">Secure Storage</h3>
          <p className="text-sm text-white/70">Your private keys never leave your device</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-2xl mb-3">⚡</div>
          <h3 className="font-semibold mb-2">Fast Transactions</h3>
          <p className="text-sm text-white/70">Quick NFT minting and trading</p>
        </div>
      </div>

      {/* Supported Wallets */}
      <div className="mt-8 rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold mb-4">Supported Wallets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['MetaMask', 'WalletConnect', 'Coinbase', 'Trust Wallet'].map((wallet) => (
            <div key={wallet} className="text-center p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">
                {wallet === 'MetaMask' && '🦊'}
                {wallet === 'WalletConnect' && '🔗'}
                {wallet === 'Coinbase' && '🔵'}
                {wallet === 'Trust Wallet' && '🛡️'}
              </div>
              <div className="text-sm font-medium">{wallet}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="mt-8 rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold mb-4">Coming Soon</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="text-xl">🎯</div>
            <div>
              <div className="font-medium">NFT Staking</div>
              <div className="text-sm text-white/70">Earn rewards by staking your NFTs</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="text-xl">🏆</div>
            <div>
              <div className="font-medium">Governance Tokens</div>
              <div className="text-sm text-white/70">Vote on platform decisions</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="text-xl">💎</div>
            <div>
              <div className="font-medium">Cross-Chain Bridge</div>
              <div className="text-sm text-white/70">Move assets between networks</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="text-xl">🔥</div>
            <div>
              <div className="font-medium">DeFi Integration</div>
              <div className="text-sm text-white/70">Lend, borrow, and earn with NFTs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <div id="withdraw-modal" className="hidden fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Withdraw to Crypto Wallet</h3>
            <button 
              onClick={() => document.getElementById('withdraw-modal')?.classList.add('hidden')}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Withdrawal Amount (USD)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 rounded-lg border border-white/15 bg-transparent px-4 outline-none focus:ring-2 focus:ring-white/20"
              />
              <div className="text-xs text-white/60 mt-1">
                Available: ${balance || '0.00'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Destination Wallet</label>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-sm font-mono break-all">
                  {profile?.crypto_wallet_address || "Not set - Please update your profile"}
                </div>
                {!profile?.crypto_wallet_address && (
                  <div className="text-xs text-yellow-400 mt-1">
                    <a href="/profile/edit" className="underline">Set up your crypto wallet address</a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => document.getElementById('withdraw-modal')?.classList.add('hidden')}
                className="flex-1 h-12 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={withdrawToCrypto}
                disabled={withdrawing || !profile?.crypto_wallet_address || !withdrawAmount}
                className="flex-1 h-12 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-colors"
                style={{ backgroundColor: 'var(--accent)', color: '#000' }}
              >
                {withdrawing ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}