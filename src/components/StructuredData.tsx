interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'WebPage' | 'Product' | 'NFT';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = 'https://nexora.com';
    
    switch (type) {
      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Nexora",
          "description": "Premium NFT Marketplace & Creator Platform",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.svg`,
          "sameAs": [
            "https://twitter.com/nexora",
            "https://discord.gg/nexora",
            "https://medium.com/@nexora"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@nexora.com"
          }
        };
        
      case 'WebSite':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Nexora",
          "description": "Create, mint, and trade NFTs with collaborative royalties",
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/explore?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        };
        
      case 'NFT':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.image,
          "category": "Digital Art",
          "brand": {
            "@type": "Brand",
            "name": "Nexora"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        };
        
      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}

// Predefined structured data components
export function OrganizationData() {
  return <StructuredData type="Organization" data={{}} />;
}

export function WebsiteData() {
  return <StructuredData type="WebSite" data={{}} />;
}

export function NFTData({ nft }: { nft: any }) {
  return <StructuredData type="NFT" data={nft} />;
}
