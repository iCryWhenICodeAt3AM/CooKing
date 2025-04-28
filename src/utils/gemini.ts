const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const RECIPE_PROMPT = `You are a creative cooking expert. Given these ingredients: [ingredient_list], suggest 3 delicious recipes.

For EACH recipe, use this EXACT format (including the --- separators):

---
Recipe: [Recipe Name]
Description: A brief, appetizing description
Total Time: [Prep Time + Cook Time]
Serves: [Number of servings]
Difficulty: [Easy/Medium/Hard]

Ingredients: (with exact measurements)
• [amount] [ingredient] - [AVAILABLE] [from user's list]
• [amount] [ingredient] - [MISSING] [needs to be purchased]
• [amount] [ingredient] - [OPTIONAL] [can be skipped or substituted]
[continue for all ingredients, marking each as AVAILABLE/MISSING/OPTIONAL]

Instructions:
1. [Clear, detailed step with timing if applicable]
2. [Next step]
[continue numbered steps]

Tips: [Essential cooking tips, substitutions, or storage advice]
---

Keep steps clear and numbered. Use standard US measurements (cups, tablespoons, etc.) with metric equivalents when possible.
Focus on practical, achievable recipes that match the available ingredients.
Mark each ingredient clearly as [AVAILABLE], [MISSING], or [OPTIONAL] based on the user's ingredient list.`;

/**
 * Calls the Gemini API to generate smart recipe suggestions.
 * @param ingredients - Array of user-provided ingredients.
 * @returns Formatted recipe suggestions text.
 */
export async function getRecipeSuggestions(ingredients: string[]) {
  try {
    const response = await fetch(`${API_ENDPOINT}?key=${process.env.API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: RECIPE_PROMPT.replace('[ingredient_list]', ingredients.join(', '))
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating recipes:', error);
    throw new Error('Failed to generate recipes. Please try again.');
  }
}
