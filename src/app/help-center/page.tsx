import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - Nexora",
  description: "Get help and support for using Nexora NFT marketplace.",
};

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">How to Create an Account</h3>
              <p className="text-white/80">
                Connect your digital wallet (MetaMask, WalletConnect, or other supported wallets) to get started. 
                No traditional registration required - your wallet is your identity.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">How to Mint NFTs</h3>
              <p className="text-white/80">
                Use our minting tools to create your first NFT. Upload your digital artwork, add metadata, 
                and set your royalty preferences. The process is simple and secure.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Trading & Transactions</h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">How to Buy NFTs</h3>
              <p className="text-white/80">
                Browse our marketplace, find NFTs you love, and purchase them using crypto or traditional payment methods. 
                All transactions are secure and transparent.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">How to Sell NFTs</h3>
              <p className="text-white/80">
                List your NFTs for sale with our easy-to-use interface. Set your price, choose your payment methods, 
                and start earning from your digital creations.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Technical Support</h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Wallet Connection Issues</h3>
              <p className="text-white/80">
                Make sure your wallet is properly connected and you have sufficient funds for gas fees. 
                Try refreshing the page or reconnecting your wallet.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Transaction Problems</h3>
              <p className="text-white/80">
                If a transaction fails, check your gas fees and network status. Failed transactions may still 
                consume gas fees, but your funds will be returned.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
          <div className="bg-white/5 rounded-xl p-6">
              <p className="text-white/80 mb-4">
                Can&apos;t find what you&apos;re looking for? Our community and support team are here to help.
              </p>
            <div className="flex gap-4">
              <a href="/community" className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Join Community
              </a>
              <a href="mailto:support@nexora.com" className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
