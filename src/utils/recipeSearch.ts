const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  missedIngredients: Array<{ name: string }>;
  usedIngredients: Array<{ name: string }>;
  steps?: Array<{ step: string }>;
}

export async function searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredients.join(',')}&number=5&ranking=2`
    );
    
    if (!response.ok) throw new Error('Failed to fetch recipes');
    return await response.json();
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
}

export async function getRecipeInstructions(recipeId: number): Promise<Recipe['steps']> {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/${recipeId}/analyzedInstructions?apiKey=${SPOONACULAR_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch recipe instructions');
    const data = await response.json();
    return data[0]?.steps || [];
  } catch (error) {
    console.error('Error fetching recipe instructions:', error);
    return [];
  }
}