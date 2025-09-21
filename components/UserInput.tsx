import React, { useState, useCallback, useEffect, forwardRef } from 'react';

export interface PlanOptions {
  theme: string;
  detailLevel: string;
  creativity: number;
  brandPersona: string;
  targetAudience: string;
}

interface UserInputProps {
  onSubmit: (description: string, options: PlanOptions) => void;
  onClear: () => void;
  isLoading: boolean;
  initialValue: string;
  onInputChange: (value: string) => void;
}

const MagicWandIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ClearIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0L12 14.25m2.25-2.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


export const UserInput = forwardRef<HTMLTextAreaElement, UserInputProps>(({ onSubmit, onClear, isLoading, initialValue, onInputChange }, ref) => {
  const [description, setDescription] = useState<string>(initialValue);
  const [theme, setTheme] = useState<string>('standard');
  const [detailLevel, setDetailLevel] = useState<string>('standard');
  const [creativity, setCreativity] = useState<number>(0.7);
  const [brandPersona, setBrandPersona] = useState<string>('default');
  const [targetAudience, setTargetAudience] = useState<string>('general');

  useEffect(() => {
    // Sync internal state with the initialValue prop from the parent.
    // This is crucial for when the user reuses a history item.
    setDescription(initialValue);
  }, [initialValue]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
    onInputChange(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(description, { theme, detailLevel, creativity, brandPersona, targetAudience });
  };
  
  const handleClearInput = useCallback(() => {
    setDescription('');
    onInputChange('');
    onClear();
  }, [onClear, onInputChange]);

  const commonSelectClasses = "block w-full p-2 bg-[var(--color-surface-2)] border border-[var(--border-color-soft)] rounded-[var(--border-radius-md)] shadow-sm focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-ring)] text-[var(--color-text-base)] transition duration-150 ease-in-out";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--color-accent-300)] mb-1">
          Describe your desired web page:
        </label>
        <textarea
          ref={ref}
          id="description"
          name="description"
          rows={6}
          className="block w-full p-3 bg-[var(--color-surface-2)] border border-[var(--border-color-soft)] rounded-[var(--border-radius-md)] shadow-sm focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-ring)] text-[var(--color-text-base)] placeholder-[var(--color-text-muted)] transition duration-150 ease-in-out"
          placeholder="e.g., A landing page for a new meditation app, focusing on simplicity and calm visuals, with a section for features and a signup form."
          value={description}
          onChange={handleChange}
          disabled={isLoading}
        />
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Provide as much detail as you like. The AI will generate a structural plan based on your input.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <div>
           <label htmlFor="theme" className="block text-sm font-medium text-[var(--color-accent-300)] mb-1">
            Theme / Style
          </label>
          <select id="theme" name="theme" value={theme} onChange={e => setTheme(e.target.value)} disabled={isLoading} className={commonSelectClasses}>
            <option value="standard">Standard</option>
            <option value="minimalist">Minimalist</option>
            <option value="corporate">Corporate</option>
            <option value="playful">Playful / Creative</option>
            <option value="brutalist">Brutalist</option>
            <option value="dark-mode">Dark Mode / Tech</option>
          </select>
        </div>
        <div>
          <label htmlFor="detailLevel" className="block text-sm font-medium text-[var(--color-accent-300)] mb-1">
            Plan Detail
          </label>
          <select id="detailLevel" name="detailLevel" value={detailLevel} onChange={e => setDetailLevel(e.target.value)} disabled={isLoading} className={commonSelectClasses}>
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        <div>
          <label htmlFor="brandPersona" className="block text-sm font-medium text-[var(--color-accent-300)] mb-1">
            Brand Persona
          </label>
          <select id="brandPersona" name="brandPersona" value={brandPersona} onChange={e => setBrandPersona(e.target.value)} disabled={isLoading} className={commonSelectClasses}>
            <option value="default">Default</option>
            <option value="playful">Playful & Witty</option>
            <option value="formal">Formal & Trustworthy</option>
            <option value="minimalist-elegant">Minimalist & Elegant</option>
            <option value="bold">Bold & Adventurous</option>
          </select>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Influences the tone of voice and style.
          </p>
        </div>
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-[var(--color-accent-300)] mb-1">
            Target Audience
          </label>
          <select id="targetAudience" name="targetAudience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} disabled={isLoading} className={commonSelectClasses}>
            <option value="general">General Audience</option>
            <option value="gen-z">Gen Z Gamers</option>
            <option value="corporate">Corporate Executives</option>
            <option value="families">Young Families</option>
          </select>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Tailors content for a specific group.
          </p>
        </div>
      </div>
      
      <div>
        <label htmlFor="creativity" className="block text-sm font-medium text-[var(--color-accent-300)] mb-1">
          Creativity Level
        </label>
        <input
          id="creativity"
          type="range"
          min="0.2"
          max="1.0"
          step="0.1"
          value={creativity}
          onChange={e => setCreativity(parseFloat(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary-600)]"
          title={`Creativity: ${creativity}`}
        />
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
          <span>Conservative</span>
          <span>{creativity.toFixed(1)}</span>
          <span>Experimental</span>
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Higher creativity may produce more novel ideas, while lower values yield more predictable plans.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          title="Generate a new plan from the description above"
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-[var(--border-radius-md)] shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-1)] focus:ring-[var(--color-accent-ring)] disabled:bg-[var(--color-surface-4)] disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <MagicWandIcon />
              Generate Plan
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleClearInput}
          disabled={isLoading}
          title="Clear the input field and the current plan"
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-[var(--border-color-soft)] text-base font-medium rounded-[var(--border-radius-md)] shadow-sm text-[var(--color-text-soft)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] active:bg-[var(--color-surface-1)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-1)] focus:ring-[var(--color-accent-ring)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
        >
          <ClearIcon />
          Clear
        </button>
      </div>
    </form>
  );
});