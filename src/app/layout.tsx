'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { Analytics } from "@vercel/analytics/react"
import SchemaMarkup from '../components/seo/SchemaMarkup';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

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
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>CooKing - Free AI Recipe Generator</title>
        <meta name="description" content="Create custom recipes with AI using ingredients you have at home. Our free recipe generator powered by Gemini AI transforms your available ingredients into delicious meals." />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/CooKing-Icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CooKing" />
        <link rel="canonical" href="https://cooking-sepia.vercel.app" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5330406953878437" crossOrigin="anonymous"></script>
      </head>
      <body>
        <SchemaMarkup />
        {isLoading ? (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-[url('/cooking-background.jpg')] bg-cover bg-center">
            <div className="bg-white/90 p-8 rounded-lg shadow-xl flex flex-col items-center">
              <Image
                src="/CooKing-Icon.png"
                alt="CooKing Logo"
                width={96}
                height={96}
                className="mb-4"
                priority
              />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">CooKing</h1>
              <div className="animate-pulse text-gray-600">Loading your kitchen...</div>
            </div>
          </div>
        ) : (
          <div className="relative min-h-screen">
            {/* Enhanced blur overlay */}
            <div className="fixed inset-0 bg-[url('/cooking-background.jpg')] bg-cover bg-center bg-fixed" />
            <div className="fixed inset-0 backdrop-blur-md bg-black/30" />
            
            {/* Content */}
            <main className="relative min-h-screen pt-16">
              {children}
              <Toaster position="bottom-center" />
            </main>
          </div>
        )}
        <Analytics />
      </body>
    </html>
  );
}
