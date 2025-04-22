import { useState } from 'react';
import { motion } from 'framer-motion';

interface IngredientInputProps {
  onSubmit: (ingredients: string[]) => void;
}

type InputCategory = 'ingredient' | 'product' | 'preference';

interface TaggedIngredient {
  text: string;
  category: InputCategory;
}

export function IngredientInput({ onSubmit }: IngredientInputProps) {
  const [ingredients, setIngredients] = useState<TaggedIngredient[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const categorizeInput = (input: string): TaggedIngredient => {
    const lowerInput = input.toLowerCase();
    // Cooking products
    if (lowerInput.includes('stock') || lowerInput.includes('msg') || lowerInput === 'water') {
      return { text: input, category: 'product' };
    }
    // Cooking preferences
    if (lowerInput.includes('style') || lowerInput.includes('easy') || lowerInput.includes('fast')) {
      return { text: input, category: 'preference' };
    }
    // Default to ingredient
    return { text: input, category: 'ingredient' };
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

  const getTagColor = (category: InputCategory): string => {
    switch (category) {
      case 'product':
        return 'bg-green-100';
      case 'preference':
        return 'bg-purple-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-white rounded-lg shadow">
        {ingredients.map((ingredient, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center px-3 py-1 rounded-full ${getTagColor(ingredient.category)}`}
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
          placeholder="Add ingredient and press Enter"
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