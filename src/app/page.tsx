'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { IngredientInput } from '../components/IngredientInput';
import { RecipeOutput } from '../components/RecipeOutput';
import { getRecipeSuggestions } from '../utils/gemini';
import Image from 'next/image';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<string | null>(null);
  const [currentIngredients, setCurrentIngredients] = useState<string[]>([]);

  const handleSubmit = async (ingredients: string[]) => {
    setLoading(true);
    setCurrentIngredients(ingredients);
    try {
      const result = await getRecipeSuggestions(ingredients);
      setRecipeResult(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>CooKing - Free AI Recipe Generator using Gemini AI</h1>
        <p>Create custom recipes with AI based on ingredients you have at home. Powered by Gemini AI.</p>
      </div>
      
      <div className="flex-grow">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/CooKing-Icon.png"
              alt="CooKing Logo"
              width={64}
              height={64}
              className="rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">CooKing</h1>
          <p className="text-white text-lg drop-shadow">Enter your ingredients (press Enter after each one) and let AI suggest delicious recipes</p>
        </div>

        <IngredientInput onSubmit={handleSubmit} />

        {loading && (
          <div className="w-full max-w-md mx-auto mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/90">Generating recipe suggestions...</p>
          </div>
        )}

        {recipeResult && !loading && (
          <div className="mt-8">
            <RecipeOutput recipeText={recipeResult} ingredients={currentIngredients} />
          </div>
        )}
      </div>
      
      {/* Application Footer */}
      <footer className="mt-12 py-6 border-t border-white/20">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-xl p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] border border-white/[0.15]">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-md font-bold mr-2 shadow-lg">
              BETA
            </span>
            <p className="text-white/70 text-sm">
              Free AI Recipe Generator powered by Gemini API
            </p>
          </div>
          
          <div className="flex items-center">
            <a 
              href="https://github.com/iCryWhenICodeAt3AM/CooKing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-white/70 hover:text-white transition-colors text-sm group"
              aria-label="Support CooKing on GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Contribute on GitHub
            </a>
          </div>
        </div>
        
        {/* SEO optimized content in footer */}
        <div className="text-center mt-4 text-xs text-white/50 bg-white/5 backdrop-blur-xl rounded-lg p-3 max-w-4xl mx-auto mt-4 border border-white/10">
          <p>Your continued support helps us improve this free AI recipe generator.</p>
          <p className="mt-1">
            <span className="hidden md:inline">Keywords: </span>
            <span className="space-x-2">
              <span>AI Recipe</span>
              <span>•</span>
              <span>Gemini AI Recipe</span>
              <span>•</span>
              <span>Free AI Recipe</span>
              <span>•</span>
              <span>Cooking AI</span>
              <span>•</span>
              <span>Cooking Gemini AI</span>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
