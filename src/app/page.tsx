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
    <div className="container mx-auto px-4 py-8">
      <div >
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
          <p className="text-white text-lg drop-shadow">Enter your ingredients (press Enter after each one) and let AI suggest delicious recipes</p>        </div>

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
    </div>
  );
}
