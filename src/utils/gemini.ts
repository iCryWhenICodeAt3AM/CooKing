// Currently using Gemini API v2.0 flash endpoint for recipe generation
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Define custom error types for better error handling
export class GeminiApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'GeminiApiError';
    this.statusCode = statusCode;
  }
}

export class GeminiNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiNetworkError';
  }
}

export class GeminiParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiParsingError';
  }
}

const RECIPE_PROMPT = `You are a creative cooking expert specializing in practical and delicious recipes with excellent flavor harmony. Given the following ingredients: [ingredient_list], suggest 3 diverse and realistic recipes that prioritize *delicious, well-balanced flavor combinations* and proven culinary logic.

Each recipe must be truly appetizing, achievable for home cooks, and based on realistic ingredient synergy. Only include recipes where the flavors and textures make sense together — avoid gimmicky or forced combinations.

Use this **exact format** for each recipe (with all sections and the --- separators):

---
Recipe: [Recipe Name]
Description: A mouth-watering summary of the dish, explaining the key flavor pairings and why certain ingredients were prioritized or skipped. Emphasize harmony and practicality.
Total Time: [Prep Time + Cook Time]
Serves: [Number of servings]
Difficulty: [Easy/Medium/Hard]

Ingredients: (Mark each with one of the following)
• [amount] [ingredient] - [AVAILABLE]
• [amount] [ingredient] - [MISSING]
• [amount] [ingredient] - [OPTIONAL] (briefly say why or suggest a substitute)

Instructions:
1. [Clear, step-by-step instruction with timing if needed]
2. [Continue steps...]

Tips: [Smart cooking tips, flavor-enhancing substitutions, or storage advice]

Unused Ingredients:
• [ingredient] – [brief reason it wasn’t a good fit for this dish]
---

Guidelines:
- Ensure the 3 recipes offer **variety in type** (e.g., one main, one side/soup, one breakfast/snack/dessert).
- Focus on flavor *compatibility* — build dishes around real-world culinary pairings, not just random ingredient inclusion.
- Always mark ingredients as [AVAILABLE], [MISSING], or [OPTIONAL] — no exceptions.
- Use standard US measurements (with metric in parentheses when helpful).
- Keep it practical, cohesive, and crave-worthy.`;

/**
 * Calls the Gemini API to generate smart recipe suggestions.
 * @param ingredients - Array of user-provided ingredients.
 * @returns Formatted recipe suggestions text.
 * @throws {GeminiApiError} If the API returns an error response
 * @throws {GeminiNetworkError} If there's a network-related error
 * @throws {GeminiParsingError} If the API response cannot be parsed
 */
export async function getRecipeSuggestions(ingredients: string[]) {
  if (!ingredients || ingredients.length === 0) {
    throw new GeminiApiError('Please provide at least one ingredient');
  }

  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new GeminiApiError('API key is not configured');
  }

  try {
    const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
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
      }),
      // Add timeout to prevent long-running requests
      signal: AbortSignal.timeout(30000) // 30 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      let errorMessage = `Gemini API request failed with status ${response.status}`;
      
      // Map common HTTP errors to user-friendly messages
      if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'API authentication failed. Please check your API key.';
      } else if (response.status >= 500) {
        errorMessage = 'Gemini AI service is currently unavailable. Please try again later.';
      }
      
      // Log the detailed error for debugging
      console.error(`API Error Details: ${errorText}`);
      
      throw new GeminiApiError(errorMessage, response.status);
    }

    const data = await response.json();
    
    // Verify the response structure
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new GeminiParsingError('Invalid response format from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating recipes:', error);
    
    // Handle different error types
    if (error instanceof GeminiApiError || 
        error instanceof GeminiParsingError || 
        error instanceof GeminiNetworkError) {
      throw error; // Re-throw custom errors
    } else if (error instanceof TypeError || (error as { name?: string }).name === 'AbortError') {
      throw new GeminiNetworkError('Network error or request timeout. Please check your internet connection.');
    } else {
      throw new GeminiApiError('Failed to generate recipes. Please try again later.');
    }
  }
}
