import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Nexora",
  description: "Learn more about Nexora, the premium NFT marketplace and creator platform.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">About Nexora</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-white/80 leading-relaxed">
            Nexora is dedicated to making the best NFT platform available to everyone. We believe in empowering 
            digital artists, creators, and collectors by providing a secure, user-friendly marketplace where 
            creativity meets blockchain technology.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">For Creators</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Easy NFT creation and minting tools</li>
                <li>• Collaborative royalty systems</li>
                <li>• Launchpad for new collections</li>
                <li>• Creator-friendly fee structure</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">For Collectors</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Curated marketplace</li>
                <li>• Secure trading environment</li>
                <li>• Multiple payment options</li>
                <li>• Community features</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Technology</h2>
          <p className="text-white/80 leading-relaxed">
            Built on modern web technologies with security at its core, Nexora leverages blockchain technology 
            to ensure transparency, immutability, and true ownership of digital assets. Our platform is designed 
            to be accessible to both crypto-natives and newcomers to the NFT space.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-white/80 leading-relaxed">
            Have questions or want to learn more? Reach out to us through our community channels or 
            contact our support team.
          </p>
        </section>
      </div>
    </div>
  );
}
