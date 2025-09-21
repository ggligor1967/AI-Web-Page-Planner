import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserInput, PlanOptions } from './components/UserInput';
import { GeneratedPageDisplay } from './components/GeneratedPageDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateWebPagePlanStream, generateVisualMockup, generateSectionContentStream, generateCodeSnippetStream, generateAlternativePalettes, Palette, generateSmartActions, SmartAction, generateFreeformTextStream, generateImageFromPrompt } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HistoryPanel, HistoryItem } from './components/HistoryPanel';
import { GeneratedImageView } from './components/GeneratedImageView';
import { SmartActionResult } from './components/SmartActionsToolbar';


const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryItemId, setActiveHistoryItemId] = useState<string | null>(null);

  // State for visual mockup feature
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // State for interactive checklist feature
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const item = window.localStorage.getItem('webPagePlannerCheckedItems');
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error("Failed to load checked items from localStorage:", error);
      return {};
    }
  });

  // State for section content generation
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [isContentLoading, setIsContentLoading] = useState<Record<string, boolean>>({});
  const [contentError, setContentError] = useState<Record<string, string | null>>({});

  // State for code snippet generation
  const [generatedCode, setGeneratedCode] = useState<Record<string, string>>({});
  const [isCodeLoading, setIsCodeLoading] = useState<Record<string, boolean>>({});
  const [codeError, setCodeError] = useState<Record<string, string | null>>({});

  // State for alternative color palettes
  const [altPalettes, setAltPalettes] = useState<Palette[] | null>(null);
  const [isPalettesLoading, setIsPalettesLoading] = useState<boolean>(false);
  const [palettesError, setPalettesError] = useState<string | null>(null);

  // State for Smart Actions
  const [smartActions, setSmartActions] = useState<SmartAction[] | null>(null);
  const [isSmartActionsLoading, setIsSmartActionsLoading] = useState<boolean>(false);
  const [smartActionsError, setSmartActionsError] = useState<string | null>(null);
  const [smartActionResults, setSmartActionResults] = useState<Record<string, SmartActionResult>>({});


  const userInputRef = useRef<HTMLTextAreaElement>(null);
  const planDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('webPagePlannerHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('webPagePlannerHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  }, [history]);
  
  useEffect(() => {
    try {
      window.localStorage.setItem('webPagePlannerCheckedItems', JSON.stringify(checkedItems));
    } catch (error) {
      console.error("Failed to save checked items to localStorage:", error);
    }
  }, [checkedItems]);

  const addHistoryItem = useCallback((prompt: string, plan: string) => {
    if (!prompt.trim() || !plan.trim()) return;
    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2,9),
      prompt,
      plan,
      timestamp: Date.now(),
    };
    setHistory(prevHistory => [newItem, ...prevHistory.slice(0, 49)]);
  }, []);
  
  const resetAllGeneratedAssets = () => {
      setGeneratedImage(null);
      setImageError(null);
      setIsImageLoading(false);
      setCheckedItems({});
      setGeneratedContent({});
      setIsContentLoading({});
      setContentError({});
      setGeneratedCode({});
      setIsCodeLoading({});
      setCodeError({});
      setAltPalettes(null);
      setPalettesError(null);
      setIsPalettesLoading(false);
      setSmartActions(null);
      setIsSmartActionsLoading(false);
      setSmartActionsError(null);
      setSmartActionResults({});
  };

  const handleSubmit = useCallback(async (description: string, options: PlanOptions) => {
    setActiveHistoryItemId(null);
    if (!description.trim()) {
      setError("Please enter a description for your web page.");
      setGeneratedPlan(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedPlan('');
    
    resetAllGeneratedAssets();

    let accumulatedPlan = '';

    try {
      const stream = generateWebPagePlanStream(description, options);
      for await (const chunk of stream) {
        accumulatedPlan += chunk;
        setGeneratedPlan(prevPlan => (prevPlan || '') + chunk);
      }
      
      if (accumulatedPlan.trim()) {
        addHistoryItem(description, accumulatedPlan);
        setTimeout(() => planDisplayRef.current?.focus(), 0);
        
        setIsSmartActionsLoading(true);
        generateSmartActions(accumulatedPlan)
          .then(actions => {
            setSmartActions(actions);
          })
          .catch(err => {
            console.error("Failed to generate smart actions:", err);
            setSmartActionsError(err instanceof Error ? err.message : "An unknown error occurred.");
          })
          .finally(() => {
            setIsSmartActionsLoading(false);
          });

      } else { 
        setError("Model Error: The plan is empty. Please try rephrasing your description with more detail.");
        setGeneratedPlan(null);
      }
    } catch (err) {
      console.error("Error generating web page plan:", err);
      setGeneratedPlan(null); 

      if (err instanceof Error) {
        if (err.message.includes("API Key") || err.message.includes("Authentication")) {
          setError("API Key Error: Please check your environment variables to ensure the API key is valid and configured correctly.");
        } else {
          setError("Model Error: The request failed. This can happen with ambiguous prompts. Please try rephrasing your description with more detail.");
        }
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [addHistoryItem]);

  const handleGenerateMockup = useCallback(async () => {
    if (!generatedPlan) {
      setImageError("Cannot generate a mockup without a web page plan.");
      return;
    }
    setIsImageLoading(true);
    setImageError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateVisualMockup(generatedPlan);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Error generating visual mockup:", err);
      setGeneratedImage(null);
      if (err instanceof Error) {
        setImageError(`Mockup Generation Failed: ${err.message}`);
      } else {
        setImageError("An unknown error occurred while generating the mockup.");
      }
    } finally {
      setIsImageLoading(false);
    }
  }, [generatedPlan]);

  const handleClearInputAndPlan = useCallback(() => {
    setUserInput('');
    setGeneratedPlan(null);
    setError(null);
    setActiveHistoryItemId(null);
    resetAllGeneratedAssets();
  }, []);
  
  const handleUserInputChange = useCallback((value: string) => {
    setUserInput(value);
    setActiveHistoryItemId(null);
  }, []);

  const handleReuseHistoryItem = useCallback((item: HistoryItem) => {
    setUserInput(item.prompt);
    setGeneratedPlan(item.plan); 
    setError(null);
    setActiveHistoryItemId(item.id);
    resetAllGeneratedAssets();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    userInputRef.current?.focus();
  }, []);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
  }, []);

  const handleClearAllHistory = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all generation history? This action cannot be undone.")) {
      setHistory([]);
    }
  }, []);
  
  const handleChecklistToggle = useCallback((key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleGenerateContent = useCallback(async (sectionKey: string, sectionContext: string, instruction: string) => {
    if (!generatedPlan) {
      setContentError(prev => ({ ...prev, [sectionKey]: "Cannot generate content without a main plan." }));
      return;
    }

    setIsContentLoading(prev => ({ ...prev, [sectionKey]: true }));
    setContentError(prev => ({ ...prev, [sectionKey]: null }));
    setGeneratedContent(prev => ({ ...prev, [sectionKey]: '' }));

    try {
      const stream = generateSectionContentStream(generatedPlan, sectionContext, instruction);
      for await (const chunk of stream) {
        setGeneratedContent(prev => ({ ...prev, [sectionKey]: (prev[sectionKey] || '') + chunk }));
      }
    } catch (err) {
      console.error(`Error generating content for section ${sectionKey}:`, err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setContentError(prev => ({ ...prev, [sectionKey]: message }));
    } finally {
      setIsContentLoading(prev => ({ ...prev, [sectionKey]: false }));
    }
  }, [generatedPlan]);

  const handleGenerateCode = useCallback(async (sectionKey: string, componentContext: string) => {
    if (!generatedPlan) {
      setCodeError(prev => ({ ...prev, [sectionKey]: "Cannot generate code without a main plan." }));
      return;
    }
    setIsCodeLoading(prev => ({ ...prev, [sectionKey]: true }));
    setCodeError(prev => ({ ...prev, [sectionKey]: null }));
    setGeneratedCode(prev => ({ ...prev, [sectionKey]: '' }));

    try {
        const stream = generateCodeSnippetStream(generatedPlan, componentContext);
        for await (const chunk of stream) {
            setGeneratedCode(prev => ({ ...prev, [sectionKey]: (prev[sectionKey] || '') + chunk }));
        }
    } catch (err) {
        console.error(`Error generating code for component ${sectionKey}:`, err);
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        setCodeError(prev => ({ ...prev, [sectionKey]: message }));
    } finally {
        setIsCodeLoading(prev => ({ ...prev, [sectionKey]: false }));
    }
  }, [generatedPlan]);

  const handleGeneratePalettes = useCallback(async () => {
      if (!generatedPlan) {
          setPalettesError("Cannot generate palettes without a main plan.");
          return;
      }
      setIsPalettesLoading(true);
      setPalettesError(null);
      setAltPalettes(null);
      try {
          const palettes = await generateAlternativePalettes(generatedPlan);
          setAltPalettes(palettes);
      } catch (err) {
          console.error("Error generating palettes:", err);
          const message = err instanceof Error ? err.message : "An unknown error occurred.";
          setPalettesError(message);
      } finally {
          setIsPalettesLoading(false);
      }
  }, [generatedPlan]);

  const handleExecuteSmartAction = useCallback(async (action: SmartAction) => {
    const key = action.label;
    setSmartActionResults(prev => ({
        ...prev,
        [key]: { type: action.type, result: '', isLoading: true, error: null }
    }));

    try {
        if (action.type === 'text') {
            const stream = generateFreeformTextStream(action.prompt);
            for await (const chunk of stream) {
                setSmartActionResults(prev => ({
                    ...prev,
                    [key]: { ...prev[key], result: (prev[key]?.result || '') + chunk }
                }));
            }
        } else if (action.type === 'image') {
            const imageUrl = await generateImageFromPrompt(action.prompt);
            setSmartActionResults(prev => ({
                ...prev,
                [key]: { ...prev[key], result: imageUrl }
            }));
        }
    } catch (err) {
        console.error(`Error executing smart action "${key}":`, err);
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        setSmartActionResults(prev => ({
            ...prev,
            [key]: { ...prev[key], error: message }
        }));
    } finally {
        setSmartActionResults(prev => ({
            ...prev,
            [key]: { ...prev[key], isLoading: false }
        }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-background-base)] via-[var(--color-background-gradient-mid)] to-[var(--color-background-base)] text-[var(--color-text-base)] flex flex-col items-center justify-between p-4">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full max-w-4xl flex flex-col items-center">
        <div className="w-full bg-[var(--color-surface-1)] bg-opacity-70 backdrop-blur-md shadow-2xl rounded-[var(--border-radius-xl)] p-6 md:p-8 border border-[var(--border-color-base)]">
          <UserInput
            ref={userInputRef}
            onSubmit={handleSubmit}
            onClear={handleClearInputAndPlan}
            isLoading={isLoading}
            initialValue={userInput}
            onInputChange={handleUserInputChange}
          />
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {generatedPlan !== null && generatedPlan.length > 0 && !error && (
            <GeneratedPageDisplay
              ref={planDisplayRef}
              pagePlan={generatedPlan}
              onGenerateMockup={handleGenerateMockup}
              isImageLoading={isImageLoading}
              isPlanGenerated={!!generatedPlan && !isLoading}
              checkedItems={checkedItems}
              onChecklistToggle={handleChecklistToggle}
              onGenerateContent={handleGenerateContent}
              generatedContent={generatedContent}
              isContentLoading={isContentLoading}
              contentError={contentError}
              onGenerateCode={handleGenerateCode}
              generatedCode={generatedCode}
              isCodeLoading={isCodeLoading}
              codeError={codeError}
              onGeneratePalettes={handleGeneratePalettes}
              altPalettes={altPalettes}
              isPalettesLoading={isPalettesLoading}
              palettesError={palettesError}
              smartActions={smartActions}
              isSmartActionsLoading={isSmartActionsLoading}
              smartActionsError={smartActionsError}
              smartActionResults={smartActionResults}
              onExecuteSmartAction={handleExecuteSmartAction}
            />
          )}

          <GeneratedImageView
            imageUrl={generatedImage}
            isLoading={isImageLoading}
            error={imageError}
          />
        </div>

        <HistoryPanel
          historyItems={history}
          onReuseItem={handleReuseHistoryItem}
          onDeleteItem={handleDeleteHistoryItem}
          onClearAll={handleClearAllHistory}
          activeItemId={activeHistoryItemId}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;