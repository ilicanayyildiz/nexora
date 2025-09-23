"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState("50");
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState<'ETH' | 'USDC' | 'USDT'>('USDC');
  const [showIframe, setShowIframe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'web3' | 'card' | 'bank'>('crypto');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const iframeBaseUrl = process.env.NEXT_PUBLIC_CRYPTO_IFRAME_URL || 'https://example.com/payment';

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        window.location.href = "/signin";
        return;
      }
      setUserId(session.user.id);

      // Pre-fill from URL query parameters
      try {
        const url = new URL(window.location.href);
        const qAmount = url.searchParams.get('amount');
        const qToken = url.searchParams.get('token');
        // const qCurrency = url.searchParams.get('currency');
        
        if (qAmount) {
          const sanitized = qAmount.replace(/[^0-9.]/g, "");
          if (sanitized && Number(sanitized) > 0) setAmount(sanitized);
        }
        
        if (qToken && ['ETH', 'USDC', 'USDT'].includes(qToken)) {
          setPaymentToken(qToken as 'ETH' | 'USDC' | 'USDT');
        }
        
        // Auto-trigger payment if all params are provided
        if (qAmount && qToken && ['ETH', 'USDC', 'USDT'].includes(qToken)) {
          setTimeout(() => setShowIframe(true), 1000);
        }
      } catch {}
      setIsLoading(false);
    };
    void init();
  }, []);

  const isValid = useMemo(() => {
    const amt = Number(amount);
    return amt > 0;
  }, [amount]);

  const getTokenInfo = (token: string) => {
    const tokens = {
      ETH: { name: 'Ethereum', symbol: 'ETH', decimals: 18, icon: '⟠' },
      USDC: { name: 'USD Coin', symbol: 'USDC', decimals: 6, icon: '💵' },
      USDT: { name: 'Tether USD', symbol: 'USDT', decimals: 6, icon: '🪙' }
    } as const;
    return tokens[token as keyof typeof tokens];
  };

  // Web3 wallet connection functions
  const connectWallet = async (wallet: 'metamask' | 'walletconnect' | 'coinbase') => {
    try {
      if (wallet === 'metamask') {
        if (!window.ethereum) {
          throw new Error('MetaMask not installed');
        }
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletAddress(accounts[0]);
        setWalletType('MetaMask');
        setWalletConnected(true);
      } else if (wallet === 'walletconnect') {
        // WalletConnect implementation would go here
        setWalletAddress('0x...WalletConnect');
        setWalletType('WalletConnect');
        setWalletConnected(true);
      } else if (wallet === 'coinbase') {
        // Coinbase Wallet implementation would go here
        setWalletAddress('0x...Coinbase');
        setWalletType('Coinbase Wallet');
        setWalletConnected(true);
      }
    } catch (error: any) {
      setPayError(`Failed to connect ${wallet}: ${error.message}`);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletType(null);
  };

  const onPay = async () => {
    if (!userId || !isValid) return;
    setProcessing(true);
    setPayError(null);
    setPayMessage(null);
    
    try {
      if (paymentMethod === 'web3' && !walletConnected) {
        setPayError('Please connect your wallet first');
        setProcessing(false);
        return;
      }

      if (paymentMethod === 'web3' && walletConnected) {
        // Simulate Web3 payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const ref = `web3_${Date.now()}`;
        const { error } = await supabase.rpc("credit_balance", {
          p_user: userId,
          p_amount: Number(amount),
          p_ref: ref,
        });
        
        if (error) {
          setPayError(error.message);
        } else {
          setPayMessage(`Payment successful! $${amount} USD (paid with ${paymentToken}) via ${walletType} received and balance credited.`);
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
        setProcessing(false);
      } else if (paymentMethod === 'crypto') {
        // Open iframe for crypto payment provider
        setShowIframe(true);
        setProcessing(false);
      } else {
        // Card/Bank payment simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const ref = `${paymentMethod}_${Date.now()}`;
        const { error } = await supabase.rpc("credit_balance", {
          p_user: userId,
          p_amount: Number(amount),
          p_ref: ref,
        });
        
        if (error) {
          setPayError(error.message);
        } else {
          setPayMessage(`Payment successful! $${amount} USD via ${paymentMethod.toUpperCase()} received and balance credited.`);
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
        setProcessing(false);
      }
    } catch (e: unknown) {
      setPayError((e as Error)?.message ?? "Payment failed");
      setProcessing(false);
    }
  };

  // Listen to messages from the iframe (success/error)
  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      // Basic origin validation
      try {
        if (iframeBaseUrl && iframeBaseUrl !== 'https://example.com/payment') {
          const iframeOrigin = new URL(iframeBaseUrl).origin;
          if (!event.origin.includes(iframeOrigin.split('://')[1])) {
            console.warn('Message from unexpected origin:', event.origin);
            return;
          }
        }
      } catch {}
      
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      
      // Handle different message types
      if (data.type === 'CRYPTO_PAYMENT' || data.type === 'PAYMENT_RESULT') {
        if (data.status === 'success' && userId) {
          const ref = data.txId || data.transactionId ? `crypto_${data.txId || data.transactionId}` : `crypto_${Date.now()}`;
          const { error } = await supabase.rpc("credit_balance", {
            p_user: userId,
            p_amount: Number(amount),
            p_ref: ref,
          });
          if (error) {
            setPayError(error.message);
          } else {
            setPayMessage('✅ Payment successful! Balance credited.');
            // Redirect to dashboard after successful payment
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          }
        } else if (data.status === 'error' || data.status === 'failed') {
          setPayError(data.message || data.error || 'Payment failed');
        } else if (data.status === 'cancelled') {
          setPayMessage('Payment cancelled');
        }
        setShowIframe(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [userId, amount, iframeBaseUrl]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold">Finance</h1>
      <p className="mt-2 text-white/70">Choose your payment method and add funds to your wallet.</p>
      
      {isLoading ? (
        <div className="mt-8 text-center">
          <p className="text-white/70">Loading...</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Payment form */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold">Payment Details</h2>
            
            {/* Payment Method Tabs */}
            <div className="mt-4 flex rounded-lg border border-white/10 p-1">
              {[
                { key: 'crypto', label: 'Crypto', icon: '₿' },
                { key: 'web3', label: 'Web3', icon: '🔗' },
                { key: 'card', label: 'Card', icon: '💳' },
                { key: 'bank', label: 'Bank', icon: '🏦' }
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    paymentMethod === method.key
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span>{method.icon}</span>
                  {method.label}
                </button>
              ))}
            </div>
            
            {/* Web3 Wallet Connection */}
            {paymentMethod === 'web3' && (
              <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/5">
                <h3 className="text-sm font-semibold mb-3">Connect Wallet</h3>
                {!walletConnected ? (
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => connectWallet('metamask')}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">🦊</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">MetaMask</div>
                        <div className="text-xs text-white/60">Connect your MetaMask wallet</div>
                      </div>
                    </button>
                    <button
                      onClick={() => connectWallet('walletconnect')}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">WC</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">WalletConnect</div>
                        <div className="text-xs text-white/60">Connect via WalletConnect</div>
                      </div>
                    </button>
                    <button
                      onClick={() => connectWallet('coinbase')}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">CB</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Coinbase Wallet</div>
                        <div className="text-xs text-white/60">Connect your Coinbase wallet</div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <div>
                        <div className="font-medium text-green-400">Connected to {walletType}</div>
                        <div className="text-xs text-white/60">{walletAddress}</div>
                      </div>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm md:col-span-2">
                <span>Amount (USD)</span>
                <input
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = v.split(".");
                    const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : v;
                    const [intPart, decPart] = sanitized.split(".");
                    const limited = decPart !== undefined ? `${intPart}.${decPart.slice(0,2)}` : intPart;
                    setAmount(limited);
                  }}
                  inputMode="decimal"
                  className="h-10 rounded-md border border-white/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-white/20"
                />
              </label>
              
              {/* Token selection - only show for crypto and web3 */}
              {(paymentMethod === 'crypto' || paymentMethod === 'web3') && (
                <label className="grid gap-1 text-sm md:col-span-2">
                  <span>Payment Token</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ETH', 'USDC', 'USDT'] as const).map((token) => {
                      const tokenInfo = getTokenInfo(token);
                      return (
                        <button key={token} onClick={() => setPaymentToken(token)} className={`p-3 rounded-lg border transition-colors ${paymentToken === token ? 'border-white/30 bg-white/10' : 'border-white/10 hover:border-white/20'}`}>
                          <div className="text-center"><div className="text-lg mb-1">{tokenInfo.icon}</div><div className="text-xs font-medium">{token}</div></div>
                        </button>
                      );
                    })}
                  </div>
                </label>
              )}

              {payError && <div className="md:col-span-2 text-sm text-red-400">{payError}</div>}
              {payMessage && <div className="md:col-span-2 text-sm text-emerald-400">{payMessage}</div>}
              <button 
                onClick={onPay} 
                disabled={
                  !isValid || 
                  processing || 
                  (paymentMethod === 'crypto' && !iframeBaseUrl) ||
                  (paymentMethod === 'web3' && !walletConnected)
                } 
                className="md:col-span-2 h-11 rounded-md px-4 font-semibold text-black disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90" 
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {processing 
                  ? "Processing..." 
                  : paymentMethod === 'web3' 
                    ? `Pay $${amount} with ${paymentToken} via ${walletType}`
                    : paymentMethod === 'crypto'
                      ? `Pay $${amount} with ${paymentToken}`
                      : `Pay $${amount} via ${paymentMethod.toUpperCase()}`
                }
              </button>
              {paymentMethod === 'crypto' && iframeBaseUrl === 'https://example.com/payment' && (
                <div className="md:col-span-2 text-xs text-yellow-400">⚠️ Using demo iframe URL. Set NEXT_PUBLIC_CRYPTO_IFRAME_URL in your environment for production.</div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="mt-4 grid gap-2 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Top up amount</span>
                <span>${amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fees</span>
                <span>$0.00</span>
              </div>
              <div className="mt-2 h-px bg-white/10" />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>${amount}</span>
              </div>
              <p className="mt-4 text-xs text-white/60">By continuing, you agree to the Terms of Service and authorize Nexora to credit your in-platform balance once the payment succeeds.</p>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Payment Iframe Modal */}
      {showIframe && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl h-[600px] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold">Complete Payment ({paymentToken})</h3>
              <button onClick={() => setShowIframe(false)} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">✕</button>
            </div>
            <div className="flex-1 p-6">
              <iframe
                title="Crypto Payment"
                src={`${iframeBaseUrl}?amount=${encodeURIComponent(amount)}&token=${encodeURIComponent(paymentToken)}&currency=${encodeURIComponent(paymentToken)}&user=${encodeURIComponent(userId || '')}&returnUrl=${encodeURIComponent(window.location.origin + '/checkout')}`}
                className="w-full h-full rounded-lg border border-white/10 bg-white"
                allow="payment *; clipboard-write;"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}