import { motion } from 'framer-motion';
import { useState } from 'react';
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
  tips?: string;
  sources?: string[];
}

export function RecipeOutput({ recipeText, ingredients }: RecipeOutputProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

  const parseRecipe = (section: string): AIRecipe | null => {
    const lines = section.trim().split('\n');
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

    // Parse ingredients with status indicators
    const rawIngredients = lines
      .slice(ingredientsStart, instructionsStart - 1)
      .filter(l => l.trim().startsWith('•'))
      .map(l => l.replace('•', '').trim());

    const parsedIngredients = rawIngredients.map(ing => {
      const text = ing.replace(/\[(AVAILABLE|MISSING|OPTIONAL)\]/g, '').trim();
      let status: 'available' | 'missing' | 'optional' = 'missing';

      // Check if ingredient is marked as optional in the text
      if (ing.includes('[OPTIONAL]')) {
        status = 'optional';
      }
      // Check if ingredient is marked as available or is in user's ingredients list
      else if (ing.includes('[AVAILABLE]') || ingredients.some(userIng => 
        text.toLowerCase().includes(userIng.toLowerCase()) ||
        userIng.toLowerCase().includes(text.toLowerCase())
      )) {
        status = 'available';
      }

      return { text, status };
    });

    const parsedInstructions = lines
      .slice(instructionsStart, tipsStart > 0 ? tipsStart : undefined)
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

    const tips = tipsStart > 0 ? lines[tipsStart].replace('Tips:', '').trim() : undefined;

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
      tips,
      sources
    };
  };

  const aiRecipes = recipeText
    .split('---')
    .map(parseRecipe)
    .filter((r): r is AIRecipe => r !== null);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {aiRecipes.map((recipe, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/25 backdrop-blur-[3px] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/[0.18] rounded-[10px] overflow-hidden"
        >
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-white mb-2 drop-shadow-lg">
                {recipe.recipeName}
              </h3>
              <p className="text-white/90 drop-shadow">{recipe.description}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6 text-white">
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-[2px]">
                <ClockIcon className="w-5 h-5 mr-2" />
                {recipe.time}
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-[2px]">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                {recipe.serves}
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-[2px]">
                <BeakerIcon className="w-5 h-5 mr-2" />
                {recipe.difficulty}
              </div>
            </div>

            <div className="md:hidden mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`px-6 py-2 rounded-full text-white font-medium transition-all duration-200 ${
                    activeTab === 'ingredients'
                      ? 'bg-white/20 shadow-lg scale-105'
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center">
                    <ScaleIcon className="w-5 h-5 mr-2" />
                    Ingredients
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`px-6 py-2 rounded-full text-white font-medium transition-all duration-200 ${
                    activeTab === 'instructions'
                      ? 'bg-white/20 shadow-lg scale-105'
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Instructions
                </button>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div className={`space-y-4 ${!activeTab || activeTab === 'ingredients' ? 'block' : 'hidden md:block'}`}>
                <div className="mb-4 p-3 bg-white/10 backdrop-blur-[2px] rounded-lg border border-white/[0.1]">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-white/90">Available</span>
                    </div>
                    <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full">
                      <ExclamationCircleIcon className="w-4 h-4 text-red-400 mr-1" />
                      <span className="text-white/90">Missing</span>
                    </div>
                    <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full">
                      <MinusCircleIcon className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-white/90">Optional</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {recipe.ingredients.map((item, i) => (
                    <li 
                      key={i} 
                      className={`flex items-start p-3 rounded-lg transition-colors backdrop-blur-[2px] ${
                        item.status === 'available' ? 'bg-green-400/20 border border-green-400/30' :
                        item.status === 'missing' ? 'bg-red-400/20 border border-red-400/30' :
                        'bg-white/10 border border-white/20'
                      }`}
                    >
                      <span className={`mr-2 ${
                        item.status === 'available' ? 'text-green-300' :
                        item.status === 'missing' ? 'text-red-300' :
                        'text-gray-300'
                      }`}>
                        {item.status === 'available' ? '✓' :
                         item.status === 'missing' ? '!' :
                         '○'}
                      </span>
                      <span className="text-white/90">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`space-y-4 ${!activeTab || activeTab === 'instructions' ? 'block' : 'hidden md:block'}`}>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex p-3 bg-white/10 backdrop-blur-[2px] rounded-lg border border-white/[0.1]">
                      <span className="font-medium mr-3 text-white/90">
                        {i + 1}.
                      </span>
                      <span className={`text-white/90 ${
                        step.isCrucial ? 'font-medium' : ''
                      }`}>
                        {step.text}
                        {step.isCrucial && (
                          <ExclamationCircleIcon className="w-4 h-4 text-red-400 inline ml-1" />
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {recipe.tips && (
              <div className="mt-6 bg-blue-400/20 backdrop-blur-[2px] rounded-lg p-4 border border-blue-400/30">
                <h4 className="font-semibold text-blue-200 mb-2">Tips</h4>
                <p className="text-white/90">{recipe.tips}</p>
              </div>
            )}

            {recipe.sources && recipe.sources.length > 0 && (
              <div className="mt-6 bg-white/10 backdrop-blur-[2px] rounded-lg p-4 border border-white/[0.1]">
                <h4 className="font-semibold text-white/90 mb-2 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Recipe Sources
                </h4>
                <ul className="space-y-2">
                  {recipe.sources.map((source, i) => (
                    <li key={i}>
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
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
