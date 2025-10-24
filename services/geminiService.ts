
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateRecipe(ingredients: string[]): Promise<string> {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
You are an expert chef specializing in authentic Malay cuisine. Your task is to create a delicious Malay food recipe using ONLY the following ingredients: ${ingredients.join(', ')}.

Your response must be in Markdown format and structured as follows:

### **[Catchy Malay Recipe Name]**

**Description:**
A brief, enticing description of the dish.

**Ingredients:**
- [Ingredient 1]
- [Ingredient 2]
- ... (Only use the ingredients provided in the list above)

**Instructions:**
1. [Step 1]
2. [Step 2]
3. ...

**Chef's Tip:**
(Optional: Add a helpful tip related to the preparation or serving of the dish).

If it's impossible to create a traditional Malay dish with the given ingredients, be creative and invent a modern fusion dish with a strong Malay flavor profile. Do not use any ingredients not mentioned in the provided list. Do not invent quantities if they cannot be inferred; just list the ingredients.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe from Gemini API.");
  }
}
