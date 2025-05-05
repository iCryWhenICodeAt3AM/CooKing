import { motion } from 'framer-motion';
import { useState } from 'react';
import Head from 'next/head';
import {
  ClockIcon,
  UserGroupIcon,
  BeakerIcon,
  ScaleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface RecipeOutputProps {
  recipeText: string;
  ingredients: string[];
}

interface AIRecipe {
  recipeName: string;
  description: string;
  time: string;
  serves: string;
  difficulty: string;
  ingredients: Array<{
    text: string;
    status: 'available' | 'missing' | 'optional';
  }>;
  instructions: Array<{
    text: string;
    isCrucial: boolean;
  }>;
  unusedIngredients?: Array<{
    ingredient: string;
    reason: string;
  }>;
  tips?: string;
  sources?: string[];
}

export function RecipeOutput({ recipeText, ingredients }: RecipeOutputProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

  // SEO-related content
  const pageTitle = "Free AI Recipe Generator | CooKing with Gemini AI";
  const pageDescription = "Generate custom recipes with our Free AI Recipe Generator. CooKing uses Gemini AI to create personalized cooking ideas based on your available ingredients.";
  const keywords = "AI Recipe, Free AI Recipe Generator, Cooking AI, Gemini AI Recipe, Cooking Github, AI Cooking Assistant";

  // Function to remove double asterisks from text except in titles
  const removeAsterisksExceptTitle = (text: string): string => {
    // Don't modify title lines (Recipe:, Description:, etc.)
    if (text.startsWith('Recipe:') || 
        text.startsWith('Description:') || 
        text.startsWith('Total Time:') || 
        text.startsWith('Serves:') || 
        text.startsWith('Difficulty:') ||
        text.startsWith('Ingredients:') ||
        text.startsWith('Instructions:') ||
        text.startsWith('Tips:') ||
        text.startsWith('Sources:')) {
      return text;
    }
    
    // Remove double asterisks from all other text
    return text.replace(/\*\*([^*]+)\*\*/g, '$1');
  };

  const parseRecipe = (section: string): AIRecipe | null => {
    // Clean the recipe text by removing double asterisks
    const cleanedLines = section.trim().split('\n').map(removeAsterisksExceptTitle);
    const lines = cleanedLines;
    
    if (lines.length < 3) return null;

    const getField = (prefix: string) => {
      const line = lines.find(l => l.startsWith(prefix));
      return line ? line.replace(prefix, '').trim() : '';
    };

    const recipeName = getField('Recipe:');
    const description = getField('Description:');
    const time = getField('Total Time:');
    const serves = getField('Serves:');
    const difficulty = getField('Difficulty:');

    const ingredientsStart = lines.findIndex(l => l.startsWith('Ingredients:')) + 1;
    const instructionsStart = lines.findIndex(l => l.startsWith('Instructions:')) + 1;
    const tipsStart = lines.findIndex(l => l.startsWith('Tips:'));
    const unusedIngredientsStart = lines.findIndex(l => l.startsWith('Unused Ingredients:'));

    // Parse ingredients with status indicators
    const rawIngredients = lines
      .slice(ingredientsStart, instructionsStart - 1)
      .filter(l => l.trim().startsWith('•'))
      .map(l => l.replace('•', '').trim());

    const parsedIngredients = rawIngredients.map(ing => {
      const text = ing.replace(/\s*-\s*\[(AVAILABLE|MISSING|OPTIONAL)\]/g, '').trim();
      let status: 'available' | 'missing' | 'optional' = 'missing';

      // Check if ingredient is marked as optional in the text
      if (ing.includes('[OPTIONAL]')) {
        status = 'optional';
      }
      // Check if ingredient is explicitly marked as available
      else if (ing.includes('[AVAILABLE]')) {
        status = 'available';
      }
      // Check if ingredient matches any user-provided ingredient with a more precise matching
      else if (ingredients.some(userIng => {
        const userIngLower = userIng.toLowerCase().trim();
        // Extract the base ingredient name (removing quantities and descriptors)
        const ingredientBase = text.toLowerCase()
          .replace(/^\d+\/?\d*\s*(cup|tablespoon|teaspoon|tbsp|tsp|oz|ounce|pound|lb|g|gram|ml|l|liter|stick|packet|pinch|to taste|large|medium|small)s?\b/i, '')
          .replace(/,.*$/, '') // Remove anything after commas
          .trim();
        
        // More precise matching focused on the main ingredient name
        return ingredientBase.includes(userIngLower) || 
               userIngLower.includes(ingredientBase) ||
               // Exact match for simple single-word ingredients
               (userIngLower === ingredientBase);
      })) {
        status = 'available';
      }
      // Otherwise, it's missing (default)

      // Force status to 'missing' if explicitly marked as missing
      if (ing.includes('[MISSING]')) {
        status = 'missing';
      }

      return { text, status };
    });

    const parsedInstructions = lines
      .slice(instructionsStart, tipsStart > 0 ? tipsStart : (unusedIngredientsStart > 0 ? unusedIngredientsStart : undefined))
      .filter(l => /^\d+\./.test(l))
      .map(l => ({
        text: l.replace(/^\d+\.\s*/, '').trim(),
        isCrucial: l.toLowerCase().includes('important') || 
                   l.toLowerCase().includes('crucial') ||
                   l.toLowerCase().includes('careful') ||
                   l.toLowerCase().includes('must') ||
                   l.toLowerCase().includes('essential')
      }))
      .filter(inst => inst.text);

    // Parse the tips section
    let tips: string | undefined;
    if (tipsStart > 0) {
      const nextSectionStart = [unusedIngredientsStart].filter(idx => idx > tipsStart && idx > 0)[0];
      const tipLines = lines.slice(tipsStart, nextSectionStart);
      tips = tipLines.join(' ').replace('Tips:', '').trim();
    }

    // Parse unused ingredients if they exist
    let unusedIngredients: { ingredient: string; reason: string }[] | undefined;
    if (unusedIngredientsStart > 0) {
      const rawUnusedIngredients = lines
        .slice(unusedIngredientsStart + 1)
        .filter(l => l.trim().startsWith('•'))
        .map(l => l.replace('•', '').trim());
      
      unusedIngredients = rawUnusedIngredients.map(item => {
        const parts = item.split('–');
        if (parts.length < 2) {
          const dashParts = item.split('-');
          return {
            ingredient: dashParts[0]?.trim() || item,
            reason: dashParts.slice(1).join('-').trim() || 'Not suitable for this recipe'
          };
        }
        return {
          ingredient: parts[0].trim(),
          reason: parts[1].trim()
        };
      });
    }

    // Parse sources if they exist
    const sourcesStart = lines.findIndex(l => l.startsWith('Sources:'));
    const sources = sourcesStart > 0
      ? lines.slice(sourcesStart + 1)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean)
      : undefined;

    if (!recipeName || parsedInstructions.length === 0) return null;

    return {
      recipeName,
      description,
      time,
      serves,
      difficulty,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      unusedIngredients,
      tips,
      sources
    };
  };

  const aiRecipes = recipeText
    .split('---')
    .map(parseRecipe)
    .filter((r): r is AIRecipe => r !== null);

  // Generate structured data for recipes (Schema.org)
  const generateRecipeSchema = (recipe: AIRecipe) => {
    return {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": recipe.recipeName,
      "description": recipe.description,
      "keywords": `${recipe.recipeName}, AI Recipe, Free Recipe, Gemini AI Cooking`,
      "recipeYield": recipe.serves,
      "recipeIngredient": recipe.ingredients.map(ing => ing.text),
      "recipeInstructions": recipe.instructions.map((inst, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "text": inst.text
      })),
      "totalTime": recipe.time
    };
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph meta tags for social sharing */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CooKing AI Recipe Generator" />
        
        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Structured data for recipes */}
        {aiRecipes.length > 0 && (
          <script 
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(aiRecipes.map(generateRecipeSchema))
            }}
          />
        )}
      </Head>

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Semantic HTML5 header for SEO */}
        <div className="sr-only">
          <h1>Free AI Recipe Generator - CooKing with Gemini AI</h1>
          <p>Create custom recipes using artificial intelligence based on your available ingredients</p>
        </div>
        
        {aiRecipes.map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.27)] border border-white/[0.18] rounded-[12px] overflow-hidden relative"
          >
            {/* Glass effect inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="p-6 relative">
              <div className="mb-4">
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-2xl font-semibold text-white mb-2 drop-shadow-lg"
                >
                  {recipe.recipeName}
                </motion.h3>
                <p className="text-white/90 drop-shadow">{recipe.description}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-6 text-white">
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-lg border border-white/10">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  {recipe.time}
                </div>
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-lg border border-white/10">
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  {recipe.serves}
                </div>
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-lg border border-white/10">
                  <BeakerIcon className="w-5 h-5 mr-2" />
                  {recipe.difficulty}
                </div>
              </div>

              <div className="md:hidden mb-4">
                <div className="flex space-x-2 bg-white/10 backdrop-blur-lg p-1.5 rounded-2xl border border-white/20 shadow-inner">
                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`flex-1 px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-300 relative overflow-hidden ${
                      activeTab === 'ingredients'
                        ? 'bg-gradient-to-br from-white/30 to-white/10 shadow-lg scale-105 backdrop-blur-lg border border-white/20'
                        : 'hover:bg-white/15 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <ScaleIcon className="w-5 h-5 mr-2" />
                      <span>Ingredients</span>
                    </div>
                    {activeTab === 'ingredients' && (
                      <motion.div 
                        layoutId="tabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/80 to-purple-400/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('instructions')}
                    className={`flex-1 px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-300 relative overflow-hidden ${
                      activeTab === 'instructions'
                        ? 'bg-gradient-to-br from-white/30 to-white/10 shadow-lg scale-105 backdrop-blur-lg border border-white/20'
                        : 'hover:bg-white/15 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Instructions</span>
                    </div>
                    {activeTab === 'instructions' && (
                      <motion.div 
                        layoutId="tabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/80 to-purple-400/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </button>
                </div>
                <p className="text-white/60 text-xs mt-1 text-center">
                  Tap to switch between ingredients and instructions
                </p>
              </div>

              <div className="md:grid md:grid-cols-2 md:gap-6">
                <div className={`space-y-4 ${!activeTab || activeTab === 'ingredients' ? 'block' : 'hidden md:block'}`}>
                  <div className="mb-4 p-3 bg-white/15 backdrop-blur-lg rounded-lg border border-white/[0.15]">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                        <CheckCircleIcon className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-white/90">Available</span>
                      </div>
                      <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                        <ExclamationCircleIcon className="w-4 h-4 text-red-400 mr-1" />
                        <span className="text-white/90">Missing</span>
                      </div>
                      <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                        <MinusCircleIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-white/90">Optional</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((item, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (i * 0.03) }}
                        className={`flex items-start p-3 rounded-lg transition-colors backdrop-blur-lg ${
                          item.status === 'available' ? 'bg-green-400/20 border border-green-400/30' :
                          item.status === 'missing' ? 'bg-red-400/20 border border-red-400/30' :
                          'bg-white/10 border border-white/20'
                        } relative overflow-hidden`}
                      >
                        {/* Subtle glass highlight */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
                        
                        <span className={`mr-2 relative z-10 ${
                          item.status === 'available' ? 'text-green-300' :
                          item.status === 'missing' ? 'text-red-300' :
                          'text-gray-300'
                        }`}>
                          {item.status === 'available' ? '✓' :
                          item.status === 'missing' ? '!' :
                          '○'}
                        </span>
                        <span className="text-white/90 relative z-10">
                          {item.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className={`space-y-4 ${!activeTab || activeTab === 'instructions' ? 'block' : 'hidden md:block'}`}>
                  <ol className="space-y-3">
                    {recipe.instructions.map((step, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (i * 0.05) }}
                        className="flex p-3 bg-white/15 backdrop-blur-lg rounded-lg border border-white/[0.15] relative overflow-hidden"
                      >
                        {/* Subtle glass highlight */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
                        
                        <span className="font-medium mr-3 text-white/90 relative z-10">
                          {i + 1}.
                        </span>
                        <span className={`text-white/90 relative z-10 ${
                          step.isCrucial ? 'font-medium' : ''
                        }`}>
                          {step.text}
                          {step.isCrucial && (
                            <ExclamationCircleIcon className="w-4 h-4 text-red-400 inline ml-1" />
                          )}
                        </span>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </div>

              {recipe.tips && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 bg-blue-400/20 backdrop-blur-lg rounded-lg p-4 border border-blue-400/30 relative overflow-hidden"
                >
                  {/* Subtle glass highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-transparent pointer-events-none"></div>
                  
                  <h4 className="font-semibold text-blue-200 mb-2 relative z-10">Tips</h4>
                  <p className="text-white/90 relative z-10">{recipe.tips}</p>
                </motion.div>
              )}

              {recipe.unusedIngredients && recipe.unusedIngredients.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="mt-6 bg-purple-400/10 backdrop-blur-lg rounded-lg p-4 border border-purple-400/20 relative overflow-hidden"
                >
                  {/* Subtle glass highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-transparent to-transparent pointer-events-none"></div>
                  
                  <h4 className="font-semibold text-purple-200 mb-2 relative z-10">Unused Ingredients</h4>
                  <ul className="space-y-2">
                    {recipe.unusedIngredients.map((item, i) => (
                      <li key={i} className="flex items-start relative z-10">
                        <span className="text-purple-300 mr-2">•</span>
                        <div>
                          <span className="font-medium text-white/90">{item.ingredient}</span>
                          <span className="mx-1 text-white/50">–</span>
                          <span className="text-white/70">{item.reason}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {recipe.sources && recipe.sources.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/[0.15] relative overflow-hidden"
                >
                  {/* Subtle glass highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
                  
                  <h4 className="font-semibold text-white/90 mb-2 flex items-center relative z-10">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Recipe Sources
                  </h4>
                  <ul className="space-y-2">
                    {recipe.sources.map((source, i) => (
                      <li key={i} className="relative z-10">
                        <a 
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 transition-colors break-all text-sm"
                        >
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Recipe component footer with Beta notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-5 bg-white/10 backdrop-blur-xl rounded-lg shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] border border-white/[0.15] text-center text-white/80"
        >
          <div className="flex items-center justify-center mb-2">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-md font-bold mr-2 shadow-lg">
              BETA
            </span>
            <h4 className="text-sm font-medium">CooKing - Free AI Recipe Generator</h4>
          </div>
          <p className="text-xs mb-2">
            Currently powered by the free Gemini API. Your support helps us keep improving!
          </p>
          <a 
            href="https://github.com/iCryWhenICodeAt3AM/CooKing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors text-xs"
            aria-label="Support CooKing on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Contribute on GitHub
          </a>

          {/* Additional SEO keywords hidden but accessible to search engines */}
          <div className="sr-only">
            <h2>Free AI Recipe Generator</h2>
            <p>Generate recipes using Gemini AI, Cooking AI assistant, Free AI Recipe tool</p>
            <p>Keywords: AI Recipe, Gemini AI Recipe, Free AI Recipe, Cooking AI, Cooking Gemini AI, Cooking Github</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
