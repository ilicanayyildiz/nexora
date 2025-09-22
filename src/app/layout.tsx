import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { OrganizationData, WebsiteData } from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexora - Premium NFT Marketplace & Creator Platform",
  description: "Create, mint, and trade NFTs with collaborative royalties. Premium NFT marketplace for digital artists and collectors. Support for images, videos, 3D, and more.",
  keywords: [
    "NFT",
    "Non-Fungible Token",
    "Digital Art",
    "Crypto Art",
    "Blockchain",
    "NFT Marketplace",
    "NFT Creator",
    "NFT Minting",
    "Digital Collectibles",
    "Crypto Collectibles",
    "NFT Trading",
    "NFT Platform",
    "Web3",
    "Ethereum",
    "Polygon",
    "Digital Assets"
  ],
  authors: [{ name: "Nexora Team" }],
  creator: "Nexora",
  publisher: "Nexora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nexora.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Nexora - Premium NFT Marketplace & Creator Platform",
    description: "Create, mint, and trade NFTs with collaborative royalties. Premium NFT marketplace for digital artists and collectors.",
    url: 'https://nexora.com',
    siteName: 'Nexora',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nexora NFT Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nexora - Premium NFT Marketplace & Creator Platform",
    description: "Create, mint, and trade NFTs with collaborative royalties. Premium NFT marketplace for digital artists and collectors.",
    images: ['/og-image.png'],
    creator: '@nexora',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationData />
        <WebsiteData />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24" style={{
            background: "linear-gradient(180deg, rgba(245,158,11,0.25), rgba(245,158,11,0))"
          }} />
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
