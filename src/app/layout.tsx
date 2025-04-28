'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Image from 'next/image';
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
    // Simulate loading time
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  return (
    <html lang="en">
      <body>
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
          <main className="min-h-screen pt-16 bg-gray-50 bg-[url('/cooking-background.jpg')] bg-cover bg-center bg-fixed">
            {children}
            <Toaster position="bottom-center" />
          </main>
        )}
      </body>
    </html>
  );
}
