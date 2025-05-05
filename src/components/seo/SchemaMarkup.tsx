'use client';

import Script from 'next/script';

// WebPage schema for general website information
function WebPageSchema() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CooKing - Free AI Recipe Generator',
    description: 'Create custom recipes with AI based on ingredients you have at home. Powered by Gemini AI.',
    url: 'https://cooking-sepia.vercel.app',
    isPartOf: {
      '@type': 'WebSite',
      name: 'CooKing',
      url: 'https://cooking-sepia.vercel.app'
    },
    about: {
      '@type': 'Thing',
      name: 'AI Recipe Generation',
      description: 'Using artificial intelligence to create custom recipes based on available ingredients'
    },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'CooKing AI Recipe Generator',
      applicationCategory: 'Food & Drink',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    },
    keywords: 'AI Recipe, Free AI Recipe Generator, Cooking AI, Gemini AI Recipe, Recipe by Ingredients'
  };

  return (
    <Script
      id="webpage-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      strategy="afterInteractive"
    />
  );
}

// SearchAction schema for potential search box in Google results
function SearchActionSchema() {
  const searchActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': 'https://cooking-sepia.vercel.app/',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://cooking-sepia.vercel.app/?ingredients={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Script
      id="search-action-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionSchema) }}
      strategy="afterInteractive"
    />
  );
}

// Organization schema for branding information
function OrganizationSchema() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CooKing',
    url: 'https://cooking-sepia.vercel.app',
    logo: 'https://cooking-sepia.vercel.app/CooKing-Icon.png',
    sameAs: [
      'https://github.com/iCryWhenICodeAt3AM/CooKing'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://github.com/iCryWhenICodeAt3AM/CooKing/issues'
    }
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      strategy="afterInteractive"
    />
  );
}

// Main component that combines all schema markup
export default function SchemaMarkup() {
  return (
    <>
      <WebPageSchema />
      <SearchActionSchema />
      <OrganizationSchema />
    </>
  );
}