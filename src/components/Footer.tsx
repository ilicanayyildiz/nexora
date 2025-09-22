import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-5 text-sm">
        <div>
          <h3 className="text-base font-semibold">Nexora</h3>
          <p className="mt-2 text-white/70">Making the best NFT Platform available to everyone!</p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Products</h4>
          <ul className="space-y-2">
            <li><Link href="/explore" className="hover:underline">Marketplace</Link></li>
            <li><Link href="/create" className="hover:underline">Create NFT</Link></li>
            <li><Link href="/tools/mint" className="hover:underline">Mint Tools</Link></li>
            <li><Link href="/launchpad" className="hover:underline">Launchpad</Link></li>
            <li><Link href="/checkout" className="hover:underline">Finance</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Account</h4>
          <ul className="space-y-2">
            <li><Link href="/wallet" className="hover:underline">Wallet</Link></li>
            <li><Link href="/transactions" className="hover:underline">Transactions</Link></li>
            <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
            <li><Link href="/favorites" className="hover:underline">Favorites</Link></li>
            <li><Link href="/checkout" className="hover:underline">Finance</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">About</h4>
          <ul className="space-y-2">
            <li><Link href="/help-center" className="hover:underline">Help Center</Link></li>
            <li><Link href="/terms-of-service" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/about" className="hover:underline">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Community</h4>
          <div className="space-y-2">
            <span className="block text-white/70">Discord</span>
            <span className="block text-white/70">Twitter</span>
            <span className="block text-white/70">Telegram</span>
            <span className="block text-white/70">Medium</span>
          </div>
        </div>
      </div>
      <div className="py-6 text-center text-xs text-white/60">© {new Date().getFullYear()} Nexora</div>
    </footer>
  );
}


