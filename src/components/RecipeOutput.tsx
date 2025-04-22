import { motion } from 'framer-motion';
import {
  ClockIcon,
  UserGroupIcon,
  BeakerIcon,
  ScaleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  MinusCircleIcon,
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
}

export function RecipeOutput({ recipeText, ingredients }: RecipeOutputProps) {
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
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {recipe.recipeName}
              </h3>
              <p className="text-gray-600">{recipe.description}</p>
            </div>
            
            <div className="flex items-center space-x-6 mb-6 text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                {recipe.time}
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                {recipe.serves}
              </div>
              <div className="flex items-center">
                <BeakerIcon className="w-5 h-5 mr-2" />
                {recipe.difficulty}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <ScaleIcon className="w-5 h-5 mr-2 text-gray-700" />
                  <h4 className="font-semibold text-lg text-gray-700">Ingredients</h4>
                </div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center bg-white px-2 py-1 rounded">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center bg-white px-2 py-1 rounded">
                      <ExclamationCircleIcon className="w-4 h-4 text-red-500 mr-1" />
                      <span>Missing</span>
                    </div>
                    <div className="flex items-center bg-white px-2 py-1 rounded">
                      <MinusCircleIcon className="w-4 h-4 text-gray-400 mr-1" />
                      <span>Optional</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {recipe.ingredients.map((item, i) => (
                    <li 
                      key={i} 
                      className={`flex items-start p-2 rounded-lg transition-colors ${
                        item.status === 'available' ? 'bg-green-50' :
                        item.status === 'missing' ? 'bg-red-50' :
                        'bg-gray-50'
                      }`}
                    >
                      <span className={`mr-2 ${
                        item.status === 'available' ? 'text-green-500' :
                        item.status === 'missing' ? 'text-red-500' :
                        'text-gray-400'
                      }`}>
                        {item.status === 'available' ? '✓' :
                         item.status === 'missing' ? '!' :
                         '○'}
                      </span>
                      <span className={`${
                        item.status === 'available' ? 'text-green-700' :
                        item.status === 'missing' ? 'text-red-700' :
                        'text-gray-500'
                      }`}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-3 text-gray-700">Instructions</h4>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex">
                      <span className={`font-medium mr-3 ${
                        step.isCrucial ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {i + 1}.
                      </span>
                      <span className={`text-gray-600 ${
                        step.isCrucial ? 'font-medium' : ''
                      }`}>
                        {step.text}
                        {step.isCrucial && (
                          <ExclamationCircleIcon className="w-4 h-4 text-red-500 inline ml-1" />
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {recipe.tips && (
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">Tips</h4>
                <p className="text-blue-600">{recipe.tips}</p>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
