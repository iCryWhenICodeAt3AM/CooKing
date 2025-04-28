import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CooKing',
  description: 'Get AI-powered recipe suggestions based on your available ingredients',
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
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-tap-highlight': 'no',
    'msapplication-TileColor': '#ffffff'
  }
};