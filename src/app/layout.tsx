'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const metadata = {
  title: 'CooKing - Smart Recipe Assistant',
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
        <meta name="theme-color" content={metadata.themeColor} />
        <meta name="viewport" content={metadata.viewport} />
        <link rel="manifest" href={metadata.manifest} />
        <meta name="description" content={metadata.description} />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <main className="min-h-screen bg-gray-50">
          {children}
          <Toaster position="bottom-center" />
        </main>
      </body>
    </html>
  );
}
