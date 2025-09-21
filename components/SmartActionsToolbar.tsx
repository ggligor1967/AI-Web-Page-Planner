import React from 'react';
import { SmartAction } from '../services/geminiService';

export interface SmartActionResult {
    type: 'text' | 'image';
    result: string;
    isLoading: boolean;
    error: string | null;
}

interface SmartActionsToolbarProps {
    actions: SmartAction[] | null;
    isLoading: boolean;
    error: string | null;
    results: Record<string, SmartActionResult>;
    onExecuteAction: (action: SmartAction) => void;
}

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const renderResultContent = (content: string) => {
    const html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export const SmartActionsToolbar: React.FC<SmartActionsToolbarProps> = ({ actions, isLoading, error, results, onExecuteAction }) => {
    if (isLoading) {
        return (
            <div className="my-4 text-center text-sm text-[var(--color-text-muted)]">
                <p>Analyzing plan for smart actions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-4 p-3 bg-[var(--color-danger-base)]/50 border border-[var(--color-danger-border)] rounded-md text-sm text-[var(--color-danger-text)]">
                <strong>Error loading smart actions:</strong> {error}
            </div>
        );
    }
    
    if (!actions || actions.length === 0) {
        return null;
    }

    return (
        <div className="my-6 p-4 bg-[var(--color-surface-3)]/50 rounded-[var(--border-radius-lg)] border border-[var(--border-color-soft)]">
            <h3 className="text-lg font-semibold text-[var(--color-accent-300)] mb-3 flex items-center"><SparklesIcon /> AI Suggested Actions:</h3>
            <div className="flex flex-wrap gap-3">
                {actions.map(action => (
                    <button
                        key={action.label}
                        onClick={() => onExecuteAction(action)}
                        disabled={results[action.label]?.isLoading}
                        className="flex items-center px-4 py-2 border text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm bg-[var(--color-surface-3)] border-[var(--border-color-soft)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-4)] focus:bg-[var(--color-surface-4)] focus:ring-[var(--color-accent-ring)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-3)] transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-wait"
                    >
                        {results[action.label]?.isLoading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        )}
                        {action.label}
                    </button>
                ))}
            </div>

            <div className="mt-4 space-y-4">
                {Object.entries(results).map(([key, value]) => (
                    <div key={key} className="p-4 bg-[var(--color-surface-1)] rounded-[var(--border-radius-md)] border border-[var(--border-color-base)] shadow-inner">
                        <h4 className="font-semibold text-[var(--color-text-base)]">{key}</h4>
                        <div className="mt-2">
                            {value.isLoading && !value.result && <p className="text-sm text-[var(--color-text-muted)]">Generating...</p>}
                            {value.error && <p className="text-sm text-[var(--color-danger-text)]"><strong>Error:</strong> {value.error}</p>}
                            {value.result && value.type === 'text' && (
                                <div className="prose prose-sm max-w-none prose-custom">{renderResultContent(value.result)}</div>
                            )}
                             {value.result && value.type === 'image' && (
                                <a href={value.result} target="_blank" rel="noopener noreferrer">
                                    <img src={value.result} alt={`Generated image for: ${key}`} className="max-w-xs h-auto rounded-md shadow-lg" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
