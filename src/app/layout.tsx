'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const metadata = {
  title: 'CooKing',
  description: 'Get AI-powered recipe suggestions based on your available ingredients',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="theme-color" content={metadata.themeColor} />
        <meta name="viewport" content={metadata.viewport} />
        <link rel="manifest" href={metadata.manifest} />
        <meta name="description" content={metadata.description} />
        <link rel="icon" type="image/png" href="/CooKing-Icon.png" />
        <link rel="apple-touch-icon" href="/CooKing-Icon.png" />
        <meta property="og:image" content="/CooKing.png" />
      </head>
      <body>
        <main className="min-h-screen pt-16 bg-gray-50 bg-[url('/cooking-background.jpg')] bg-cover bg-center bg-fixed">
          {children}
          <Toaster position="bottom-center" />
        </main>
      </body>
    </html>
  );
}
