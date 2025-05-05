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
