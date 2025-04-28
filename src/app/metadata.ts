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
  },
  applicationName: 'CooKing',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/CooKing-Icon.png',
    apple: '/CooKing-Icon.png',
  },
};