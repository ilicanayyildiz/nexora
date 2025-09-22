import Footer from "@/components/Footer";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexora - Premium NFT Marketplace & Creator Platform",
  description: "Create, mint, and trade NFTs with collaborative royalties. Premium NFT marketplace for digital artists and collectors. Support for images, videos, 3D, and more.",
  keywords: "NFT, Non-Fungible Token, Digital Art, Crypto Art, Blockchain, NFT Marketplace, NFT Creator, NFT Minting",
  openGraph: {
    title: "Nexora - Premium NFT Marketplace & Creator Platform",
    description: "Create, mint, and trade NFTs with collaborative royalties. Premium NFT marketplace for digital artists and collectors.",
    type: "website",
    images: ["/og-home.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora - Premium NFT Marketplace & Creator Platform",
    description: "Create, mint, and trade NFTs with collaborative royalties. Premium NFT marketplace for digital artists and collectors.",
    images: ["/og-home.png"],
  },
};

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/30 via-fuchsia-500/10 to-transparent" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="animate-fade-in-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  It's all about NFTs!
                </h1>
                <p className="mt-6 text-white/80 max-w-xl">
                  We build the tools that can take you anywhere. Create collections,
                  mint NFTs, and launch with collaborative royalties.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="/dashboard" className="inline-flex items-center rounded-full bg-white text-black px-5 py-3 text-sm font-semibold hover:bg-white/90 hover-lift transition-smooth">Create my first collection</a>
                  <a href="/tools/mint" className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/10 hover-lift transition-smooth">Mint NFTs</a>
                </div>
              </div>
              <div className="relative animate-fade-in-right">
                <div className="absolute -inset-6 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse-slow" />
                <div className="relative aspect-square rounded-3xl border border-white/10 overflow-hidden hover-lift transition-smooth">
                  <Image 
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Blockchain technology abstract" 
                    width={800} 
                    height={800} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Create with Nexora */}
        <section id="create" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold">Create with Nexora</h2>
              <p className="mt-4 text-white/80">Be the owner of your Collection and take it everywhere!</p>
              <ul className="mt-6 space-y-3 text-white/80">
                <li>• Create together and split royalties instantly on every sale.</li>
                <li>• Mint 1/1 or multiples: images, gifs, videos, 3D, even PDFs.</li>
                <li>• EIP-2981 compatible. Collaborative royalties supported.</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <a href="/dashboard" className="inline-flex items-center rounded-full bg-white text-black px-5 py-3 text-sm font-semibold hover:bg-white/90">Create Collection</a>
                <a href="/tools/mint" className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/10">Start now</a>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 p-6">
                <h3 className="font-semibold">Collaborative Royalties</h3>
                <p className="mt-2 text-white/70">Split earnings between all creators automatically.</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-6">
                <h3 className="font-semibold">Multi-Format Minting</h3>
                <p className="mt-2 text-white/70">Images, GIFs, videos, 3D models, and PDFs supported.</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-6">
                <h3 className="font-semibold">Portable Collections</h3>
                <p className="mt-2 text-white/70">Own your collection and take it anywhere.</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-6">
                <h3 className="font-semibold">EIP-2981 Support</h3>
                <p className="mt-2 text-white/70">Respecting standard royalty interfaces by default.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Launchpad News */}
        <section id="launchpad" className="bg-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Featured Drops</h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                Discover the latest and most exciting NFT collections launching on our platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Featured Drop 1 */}
              <div className="group rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className="relative overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1170&auto=format&fit=crop" 
                    alt="Cyberpunk Digital Art" 
                    width={400} 
                    height={300} 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
                    LIVE NOW
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    #1
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Cyberpunk Genesis</h3>
                  <p className="text-white/70 mb-4 line-clamp-2">
                    A futuristic collection blending cyberpunk aesthetics with generative art. Each piece is unique and algorithmically crafted.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-white/60">Price</span>
                      <div className="font-semibold">0.08 ETH</div>
                    </div>
                    <div>
                      <span className="text-sm text-white/60">Supply</span>
                      <div className="font-semibold">1,000</div>
                    </div>
                    <div>
                      <span className="text-sm text-white/60">Minted</span>
                      <div className="font-semibold">847/1,000</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '84.7%'}}></div>
                  </div>
                  <button className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors">
                    View Collection
                  </button>
                </div>
              </div>

              {/* Featured Drop 2 */}
              <div className="group rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className="relative overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Neon Abstract Art" 
                    width={400} 
                    height={300} 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-black text-sm font-bold rounded-full">
                    UPCOMING
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    #2
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Neon Dreams</h3>
                  <p className="text-white/70 mb-4 line-clamp-2">
                    Vibrant abstract art collection featuring neon colors and geometric patterns. Launching in 3 days.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-white/60">Price</span>
                      <div className="font-semibold">0.12 ETH</div>
                    </div>
                    <div>
                      <span className="text-sm text-white/60">Supply</span>
                      <div className="font-semibold">500</div>
                    </div>
                    <div>
                      <span className="text-sm text-white/60">Launch</span>
                      <div className="font-semibold">Dec 25</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                  <button className="w-full py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                    Set Reminder
                  </button>
                </div>
              </div>

              {/* Featured Drop 3 */}
              <div className="group rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className="relative overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Quantum Blockchain Art" 
                    width={400} 
                    height={300} 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
                    FEATURED
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    #3
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Quantum Visions</h3>
                  <p className="text-white/70 mb-4 line-clamp-2">
                    Experimental art collection exploring quantum mechanics through digital media. Limited edition series.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-white/60">Price</span>
                      <div className="font-semibold">0.25 ETH</div>
                    </div>
                    <div>
                      <span className="text-sm text-white/60">Supply</span>
                      <div className="font-semibold">100</div>
                    </div>
                    <div>
                      <span className="text-sm text-white/60">Minted</span>
                      <div className="font-semibold">67/100</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '67%'}}></div>
                  </div>
                  <button className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors">
                    View Collection
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center gap-4">
                <a 
                  href="/launchpad" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:transform hover:scale-105"
                >
                  Explore All Drops
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a 
                  href="/create" 
                  className="inline-flex items-center px-8 py-4 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Launch Your Collection
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* Buy On / Checkout CTA */}
        <section id="buy" className="bg-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
            <h2 className="text-3xl font-bold">Buy On</h2>
            <div className="mt-8 grid md:grid-cols-2 gap-6 items-center">
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80" 
                  alt="Circuit board with neon light" 
                  width={800} 
                  height={300} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="rounded-2xl border border-white/10 p-8">
                <h3 className="text-2xl font-semibold">Top up with your card</h3>
                <p className="mt-2 text-white/70">Use your credit/debit card and we&apos;ll credit your Nexora balance automatically.</p>
                <a href="/checkout" className="mt-6 inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold" style={{ backgroundColor: 'var(--accent)', color: '#000' }}>
                  Go to Checkout
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Community */}
        <section id="community" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold">Keep up with the news</h2>
          <p className="mt-2 text-white/70">Be a part of our community and connect with us:</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Telegram", "Discord", "Twitter", "Instagram", "Medium", "Coingecko", "Coinmarketcap"].map((n) => (
              <button key={n} type="button" disabled className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm cursor-default opacity-70">
                {n}
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
