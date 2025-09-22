import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Image 
            src="/logo.svg" 
            alt="Nexora Logo" 
            width={120} 
            height={120} 
            className="mx-auto opacity-50"
          />
        </div>
        
        <h1 className="text-6xl font-bold mb-4" style={{color: 'var(--accent)'}}>
          404
        </h1>
        
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center rounded-lg px-6 py-3 font-semibold text-black hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Go Home
          </Link>
          
          <Link 
            href="/explore"
            className="inline-flex items-center rounded-lg border border-white/20 px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
          >
            Explore NFTs
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-white/50">
          <p>Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link href="/explore" className="hover:underline">Explore</Link>
            <Link href="/create" className="hover:underline">Create</Link>
            <Link href="/launchpad" className="hover:underline">Launchpad</Link>
            <Link href="/community" className="hover:underline">Community</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
