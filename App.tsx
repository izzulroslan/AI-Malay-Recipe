
import React, { useState, useCallback, FormEvent, FC } from 'react';
import { generateRecipe } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Helper & Icon Components (defined outside main component to prevent re-creation on re-renders) ---

const ChefHatIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 18.5a2.5 2.5 0 1 1-5 0" />
    <path d="M10 18.5V5" />
    <path d="M15 18.5a2.5 2.5 0 1 1-5 0" />
    <path d="M15 18.5V5" />
    <path d="M20 18.5a2.5 2.5 0 1 1-5 0" />
    <path d="M20 18.5V5" />
    <path d="M5 5c0-1.66 1.34-3 3-3 .92 0 1.75.42 2.28 1.08a3 3 0 0 1 4.44 0A3 3 0 0 1 17 2c1.66 0 3 1.34 3 3" />
  </svg>
);

const PlusIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const LoadingSpinner: FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-700"></div>
    <p className="text-lg text-gray-600">AI chef is thinking...</p>
  </div>
);

interface IngredientInputProps {
  ingredients: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (index: number) => void;
}

const IngredientInput: FC<IngredientInputProps> = ({ ingredients, addIngredient, removeIngredient }) => {
  const [currentIngredient, setCurrentIngredient] = useState('');

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (currentIngredient.trim()) {
      addIngredient(currentIngredient.trim());
      setCurrentIngredient('');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          placeholder="e.g., chicken, soy sauce, ginger"
          className="flex-grow p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        <button type="submit" className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center shrink-0">
          <PlusIcon className="w-6 h-6" />
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center bg-green-100 text-green-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
            {ingredient}
            <button onClick={() => removeIngredient(index)} className="ml-2 text-green-600 hover:text-green-800">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['Santan', 'Cili Padi', 'Ayam']);
  const [recipe, setRecipe] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = useCallback((ingredient: string) => {
    if (!ingredients.find(i => i.toLowerCase() === ingredient.toLowerCase())) {
        setIngredients(prev => [...prev, ingredient]);
    }
  }, [ingredients]);

  const removeIngredient = useCallback((indexToRemove: number) => {
    setIngredients(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setError("Please add at least one ingredient.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe('');
    try {
      const result = await generateRecipe(ingredients);
      setRecipe(result);
    } catch (e) {
      setError("Sorry, the AI chef had a problem. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 text-gray-800">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" 
        style={{backgroundImage: "url('https://picsum.photos/seed/malayfood/1920/1080')"}}
      ></div>
      <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200">
          
          <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
              <ChefHatIcon className="w-10 h-10 text-green-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-green-800">AI Resipi Melayu</h1>
            </div>
            <p className="text-lg text-gray-600">Your personal AI chef for authentic Malaysian cuisine.</p>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">What ingredients do you have?</h2>
            <IngredientInput 
              ingredients={ingredients} 
              addIngredient={addIngredient} 
              removeIngredient={removeIngredient} 
            />
          </section>

          <div className="flex justify-center mb-8">
            <button 
              onClick={handleGenerateRecipe} 
              disabled={isLoading || ingredients.length === 0}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
            >
              <ChefHatIcon className="w-6 h-6"/>
              <span>{isLoading ? 'Cooking...' : 'Generate Recipe'}</span>
            </button>
          </div>
          
          <section className="bg-white p-6 rounded-lg shadow-inner border border-gray-100 min-h-[200px] prose prose-green max-w-none">
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!isLoading && !error && !recipe && (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <ChefHatIcon className="w-12 h-12 mb-2"/>
                <p>Your delicious recipe will appear here!</p>
              </div>
            )}
            {recipe && <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe}</ReactMarkdown>}
          </section>

        </div>
        <footer className="text-center mt-8 text-gray-500">
            <p>Powered by Google's Gemini API</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
