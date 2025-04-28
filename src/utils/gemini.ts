// Updated code to use Gemini Grounding with Google Search

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Prompt to generate recipe suggestions with exact ingredient matching
const RECIPE_PROMPT = `You are a creative cooking expert. Given these ingredients: [ingredient_list], suggest 3 delicious recipes.

Important Requirements:
- Only match ingredients exactly: do not substitute, generalize, or infer varieties. For example, if "onions" is provided, do not use "green onions", and vice versa.
- For EACH recipe, use this EXACT format (including the --- separators):

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
When marking availability, only consider exact ingredient names; do not treat related variants as matches.`;

/**
 * Calls the Gemini API to generate smart recipe suggestions,
 * grounded and fact-checked via Google Search.
 * @param {string[]} ingredients - Array of user-provided ingredients.
 * @returns {Promise<string>} Formatted recipe suggestions with citations.
 */
export async function getRecipeSuggestions(ingredients) {
  // Build the prompt, ensuring ingredients list is comma-separated
  const promptText = RECIPE_PROMPT.replace('[ingredient_list]', ingredients.join(', '));
  try {
    const response = await fetch(`${API_ENDPOINT}?key=${process.env.API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        tools: ['google_search_retrieval'],          // enable grounding
        dynamicRetrievalConfig: { threshold: 0.0 },  // always ground for maximum accuracy
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    let sources = [];

    // Extract grounding sources (redirect URIs) if available
    if (candidate?.groundingMetadata?.groundingChunks) {
      sources = candidate.groundingMetadata.groundingChunks
        .map((chunk: { web?: { uri?: string } }) => chunk.web?.uri)
        .filter((uri: any) => uri);
    }

    // Fallback: use citationMetadata if provided
    if (!sources.length && candidate?.citationMetadata) {
      sources = candidate.citationMetadata
        .map(meta => meta.url || meta.link)
        .filter(link => link);
    }

    // Append source links if any
    if (sources.length) {
      const uniqueSources = Array.from(new Set(sources));
      return `${text}\n---\nSources:\n${uniqueSources
        .map((link, i) => `${i + 1}. ${link}`)
        .join('\n')}`;
    }

    return text;
  } catch (error) {
    console.error('Error generating recipes:', error);
    throw new Error('Failed to generate recipes. Please try again.');
  }
}
