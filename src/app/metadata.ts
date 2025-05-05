import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CooKing - Free AI Recipe Generator',
  description: 'Create custom AI-powered recipes based on ingredients you have at home. Our free Gemini AI recipe generator transforms your available ingredients into delicious meals.',
  keywords: 'AI Recipe, Gemini AI Recipe, Free AI Recipe, Cooking AI, Cooking Gemini AI, Recipe by Ingredients',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CooKing',
    startupImage: ['/CooKing.png']
  },
  applicationName: 'CooKing',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/CooKing-Icon.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  openGraph: {
    type: 'website',
    title: 'CooKing - Free AI Recipe Generator',
    description: 'Create custom AI-powered recipes based on ingredients you have at home. Powered by Gemini AI.',
    siteName: 'CooKing AI Recipe Generator',
    images: [{ url: '/CooKing-Icon.png', width: 192, height: 192, alt: 'CooKing Logo' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CooKing - Free AI Recipe Generator',
    description: 'Create custom AI-powered recipes with your available ingredients',
    images: [{ url: '/CooKing-Icon.png', alt: 'CooKing Logo' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-tap-highlight': 'no',
    'msapplication-TileColor': '#ffffff'
  }
};