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
      available: 'bg-opacity-100',
      missing: 'bg-opacity-50 border-2 border-dashed',
      optional: 'bg-opacity-30'
    }[ingredient.status];

    // Then combine with category color
    const baseColor = {
      product: 'bg-green-100',
      preference: 'bg-purple-100',
      ingredient: 'bg-blue-100'
    }[ingredient.category];

    return `${baseColor} ${statusColor}`;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-white rounded-lg shadow">
        {ingredients.map((ingredient, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center px-3 py-1 rounded-full ${getTagColor(ingredient)}`}
          >
            <span>{ingredient.text}</span>
            <button
              onClick={() => removeIngredient(index)}
              className="ml-2 text-gray-500 hover:text-red-500"
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
          className="flex-1 min-w-[200px] p-2 outline-none"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={ingredients.length === 0}
        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Get Recipe Suggestions
      </button>
    </div>
  );
}