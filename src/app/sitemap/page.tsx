'use client';

import Link from 'next/link';

export default function HTMLSitemap() {
  return (
    <div className="container mx-auto px-4 py-12 relative z-10">
      <h1 className="text-3xl font-bold mb-8 text-white">CooKing - Site Map</h1>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 shadow-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-4 text-white">Main Pages</h2>
        <ul className="space-y-2 text-white/90">
          <li>
            <Link href="/" className="text-blue-300 hover:text-blue-200 transition-colors">
              Home - AI Recipe Generator
            </Link>
            <p className="text-sm mt-1">Create custom recipes with AI using your available ingredients</p>
          </li>
          <li>
            <Link href="/offline" className="text-blue-300 hover:text-blue-200 transition-colors">
              Offline Page
            </Link>
            <p className="text-sm mt-1">Access when you're offline</p>
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-4 mt-8 text-white">Features</h2>
        <ul className="space-y-2 text-white/90">
          <li>
            <span className="text-blue-300">AI Recipe Generation</span>
            <p className="text-sm mt-1">Generate custom recipes based on ingredients you have at home</p>
          </li>
          <li>
            <span className="text-blue-300">Ingredient Categorization</span>
            <p className="text-sm mt-1">Smart detection of available, missing, and optional ingredients</p>
          </li>
          <li>
            <span className="text-blue-300">Step-by-Step Instructions</span>
            <p className="text-sm mt-1">Clear cooking directions with highlighted crucial steps</p>
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-4 mt-8 text-white">Resources</h2>
        <ul className="space-y-2 text-white/90">
          <li>
            <a 
              href="https://github.com/iCryWhenICodeAt3AM/CooKing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              GitHub Repository
            </a>
            <p className="text-sm mt-1">Contribute to CooKing's development</p>
          </li>
        </ul>
      </div>

      <div className="text-center mt-8 text-white/70 text-sm">
        <p>This sitemap helps search engines discover and index all pages of CooKing.</p>
        <p>CooKing - Free AI Recipe Generator powered by Gemini AI</p>
      </div>
    </div>
  );
}