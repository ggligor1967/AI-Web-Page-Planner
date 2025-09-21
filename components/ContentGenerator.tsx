import React, { useState, useCallback } from 'react';

const MagicWandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const ClipboardIcon: React.FC<{ copied?: boolean }> = ({ copied }) => (
  copied ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-[var(--color-success-text)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a8.25 8.25 0 01-8.25 8.25H4.5A2.25 2.25 0 012.25 10.5v-3a2.25 2.25 0 012.25-2.25h1.5M15.666 3.888h-3.834m3.834 0l1.5 1.5M15.666 3.888V4.5m1.5-3.375A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m0 0V4.5m-2.166 0A2.25 2.25 0 002.25 4.5v3A2.25 2.25 0 004.5 9.75h1.5v-.055M16.5 10.5h-1.5m-6-3.75h1.5m6 3.75V15m-3-3.75V15m-3-3.75V15M9 16.5h6" />
    </svg>
  )
);

const renderMarkdown = (content: string) => {
    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2">{listItems}</ul>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
        if (isListItem) {
            listItems.push(<li key={`li-${index}`}>{line.trim().substring(2)}</li>);
        } else {
            flushList();
            if (line.startsWith('### ')) elements.push(<h3 key={index}>{line.substring(4)}</h3>);
            else if (line.startsWith('## ')) elements.push(<h2 key={index}>{line.substring(3)}</h2>);
            else if (line.startsWith('# ')) elements.push(<h1 key={index}>{line.substring(2)}</h1>);
            else if (line.trim() !== '') elements.push(<p key={index}>{line}</p>);
        }
    });
    flushList();
    return <>{elements}</>;
};

interface ContentGeneratorProps {
    sectionKey: string;
    onGenerate: (instruction: string) => void;
    isLoading?: boolean;
    error?: string | null;
    content?: string;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onGenerate, isLoading, error, content }) => {
    const [copied, setCopied] = useState(false);
    const [instruction, setInstruction] = useState('');

    const handleCopy = useCallback(() => {
        if (!content) return;
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error("Failed to copy content:", err);
        });
    }, [content]);

    return (
        <div className="not-prose my-4 p-4 bg-[var(--color-surface-3)] bg-opacity-50 rounded-[var(--border-radius-lg)] border border-[var(--border-color-soft)]">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Optional: Add an instruction (e.g., 'make it more concise')"
                    disabled={isLoading}
                    className="flex-grow p-2 bg-[var(--color-surface-2)] border border-[var(--border-color-soft)] rounded-[var(--border-radius-md)] shadow-sm focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-ring)] text-[var(--color-text-base)] placeholder-[var(--color-text-muted)] transition duration-150 ease-in-out text-sm"
                />
                <button
                    onClick={() => onGenerate(instruction)}
                    disabled={isLoading}
                    title="Generate suggested content for this section"
                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-3)] focus:ring-[var(--color-accent-ring)] disabled:bg-[var(--color-surface-4)] disabled:cursor-not-allowed transition duration-150 ease-in-out"
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
                            Generate Content
                        </>
                    )}
                </button>
            </div>
            {error && (
                <div className="mt-4 p-3 bg-[var(--color-danger-base)] bg-opacity-50 border border-[var(--color-danger-border)] rounded-[var(--border-radius-md)] text-sm text-[var(--color-danger-text)]">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {content && !error && (
                <div className="mt-4 p-4 bg-[var(--color-surface-1)] rounded-[var(--border-radius-md)] border border-[var(--border-color-base)] shadow-inner relative">
                    <button
                        onClick={handleCopy}
                        title={copied ? "Copied!" : "Copy content"}
                        className={`absolute top-2 right-2 flex items-center px-2 py-1 border text-xs font-medium rounded-[var(--border-radius-md)] shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-1)]
                        ${copied
                            ? 'bg-[var(--color-success-base)] border-[var(--color-success-border)] text-white hover:bg-[var(--color-success-hover)] focus:ring-[var(--color-success-border)]'
                            : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-4)] focus:ring-[var(--color-accent-ring)]'}`
                        }
                    >
                        <ClipboardIcon copied={copied} />
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <div className="prose prose-sm max-w-none prose-custom pr-16">
                        {renderMarkdown(content)}
                    </div>
                </div>
            )}
        </div>
    );
};
