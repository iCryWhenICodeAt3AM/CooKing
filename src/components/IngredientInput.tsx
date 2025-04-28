import { useState } from 'react';
import { motion } from 'framer-motion';

interface IngredientInputProps {
  onSubmit: (ingredients: string[]) => void;
}

type InputCategory = 'ingredient' | 'product' | 'preference';
type IngredientStatus = 'available' | 'missing' | 'optional';

interface TaggedIngredient {
  text: string;
  category: InputCategory;
  status: IngredientStatus;
}

export function IngredientInput({ onSubmit }: IngredientInputProps) {
  const [ingredients, setIngredients] = useState<TaggedIngredient[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const categorizeInput = (input: string): TaggedIngredient => {
    // Remove any trailing dashes
    let cleanInput = input.replace(/-+$/, '').trim();
    const lowerInput = cleanInput.toLowerCase();
    
    // Default status is available
    let status: IngredientStatus = 'available';
    
    // Check if ingredient is marked as needed/missing
    if (lowerInput.includes('needs to be purchased') || 
        lowerInput.includes('needed') ||
        lowerInput.includes('missing')) {
      status = 'missing';
      // Clean up the text by removing the status indicators
      cleanInput = cleanInput
        .replace(/\[needs to be purchased\]/i, '')
        .replace(/\(needs to be purchased\)/i, '')
        .replace(/- needs to be purchased/i, '')
        .replace(/needs to be purchased/i, '')
        .replace(/\[needed\]/i, '')
        .replace(/\(needed\)/i, '')
        .replace(/- needed/i, '')
        .replace(/needed/i, '')
        .replace(/\[missing\]/i, '')
        .replace(/\(missing\)/i, '')
        .replace(/- missing/i, '')
        .replace(/missing/i, '')
        .trim();
    }

    // Check if ingredient is marked as optional
    if (lowerInput.includes('optional')) {
      status = 'optional';
      // Clean up the text
      cleanInput = cleanInput
        .replace(/\[optional\]/i, '')
        .replace(/\(optional\)/i, '')
        .replace(/- optional/i, '')
        .replace(/optional/i, '')
        .trim();
    }

    // Determine category
    let category: InputCategory = 'ingredient';
    if (lowerInput.includes('stock') || lowerInput.includes('msg') || lowerInput === 'water') {
      category = 'product';
    } else if (lowerInput.includes('style') || lowerInput.includes('easy') || lowerInput.includes('fast')) {
      category = 'preference';
    }

    return { 
      text: cleanInput,
      category,
      status
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      e.preventDefault();
      const taggedIngredient = categorizeInput(currentInput.trim());
      setIngredients([...ingredients, taggedIngredient]);
      setCurrentInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (ingredients.length > 0) {
      onSubmit(ingredients.map(i => i.text));
    }
  };

  const getTagColor = (ingredient: TaggedIngredient): string => {
    // First determine status color
    const statusColor = {
      available: 'bg-opacity-70 shadow-sm',
      missing: 'bg-opacity-50 border border-white/20',
      optional: 'bg-opacity-30'
    }[ingredient.status];

    // Then combine with category color
    const baseColor = {
      product: 'from-green-100/80 to-green-200/80',
      preference: 'from-purple-100/80 to-purple-200/80',
      ingredient: 'from-blue-100/80 to-blue-200/80'
    }[ingredient.category];

    return `${baseColor} ${statusColor} backdrop-blur-[2px] bg-gradient-to-r`;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[100px] p-2 sm:p-3 rounded-[10px] bg-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[3px] border border-white/[0.18]">
        {ingredients.map((ingredient, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${getTagColor(ingredient)} shadow-[0_4px_16px_0_rgba(31,38,135,0.2)] text-xs sm:text-sm max-w-full`}
          >
            <span className="text-gray-800 font-medium break-all line-clamp-1">{ingredient.text}</span>
            <button
              onClick={() => removeIngredient(index)}
              className="ml-1.5 sm:ml-2 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
            >
              ×
            </button>
          </motion.div>
        ))}
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add ingredient"
          className="flex-1 min-w-[100px] sm:min-w-[200px] p-1.5 sm:p-2 outline-none bg-transparent placeholder:text-gray-400 text-sm sm:text-base"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={ingredients.length === 0}
        className="w-full py-3 px-6 rounded-[10px] bg-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[3px] border border-white/[0.18] text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        Get Recipe Suggestions
      </button>
    </div>
  );
}