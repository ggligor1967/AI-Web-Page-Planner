import React from 'react';

export interface HistoryItem {
  id: string;
  prompt: string;
  plan: string;
  timestamp: number;
}

interface HistoryPanelProps {
  historyItems: HistoryItem[];
  onReuseItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  activeItemId: string | null;
}

const ReuseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const ViewingIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
  </svg>
);

const DeleteIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.09 3.288.255A1.037 1.037 0 017.38 7.608l.255 1.702M14.74 9l-.346 9m-4.788 0L9.26 9" />
  </svg>
);

const ClearAllIcon: React.FC = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0L12 14.25m2.25-2.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
);


export const HistoryPanel: React.FC<HistoryPanelProps> = ({ historyItems, onReuseItem, onDeleteItem, onClearAll, activeItemId }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const createSnippet = (text: string, length: number = 70) => {
    // Try to find a specific title suggestion in the plan
    const titleMatch = text.match(/Page Title Suggestion:\s*(.*)/);
    if (titleMatch && titleMatch[1] && titleMatch[1].trim()) {
      return `Title: ${titleMatch[1].trim()}`;
    }
    
    // Fallback to the first few characters of the plan content
    const cleanedText = text
      .replace(/\n/g, ' ')
      .replace(/^[#*\-\s]+/, '')
      .trim();
    if (cleanedText.length <= length) return cleanedText;
    return `${cleanedText.substring(0, length)}...`;
  };

  return (
    <div className="w-full max-w-4xl mt-10 bg-[var(--color-surface-1)] bg-opacity-60 backdrop-blur-sm shadow-xl rounded-[var(--border-radius-lg)] p-6 border border-[var(--border-color-base)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[var(--color-accent-300)]">Generation History</h2>
        {historyItems.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center px-4 py-2 border border-[var(--color-danger-border)] text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm text-[var(--color-danger-text)] bg-[var(--color-danger-action)] hover:bg-[var(--color-danger-action-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-1)] focus:ring-[var(--color-danger-action)] transition-colors"
            title="Clear all history items"
            aria-label="Clear all history items"
          >
            <ClearAllIcon />
            Clear All
          </button>
        )}
      </div>
      {historyItems.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">
          <p>No generation history yet. Start planning!</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {historyItems.map((item) => {
            const isActive = item.id === activeItemId;
            return (
              <div key={item.id} className={`p-4 bg-[var(--color-surface-2)] bg-opacity-70 rounded-[var(--border-radius-md)] shadow border transition-all duration-200 group ${isActive ? 'border-[var(--color-accent-ring)] ring-2 ring-[var(--color-accent-ring)]/50' : 'border-[var(--border-color-soft)] hover:border-[var(--color-accent-ring)]'}`}>
                <div className="flex justify-between items-start">
                  <p 
                    className="text-sm text-[var(--color-text-soft)] mb-1.5 flex-grow mr-2"
                    title={item.prompt} // Show full prompt on hover
                    >
                    <strong>Prompt:</strong> {item.prompt.length > 70 ? `${item.prompt.substring(0, 70)}...` : item.prompt}
                  </p>
                  <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">{formatDate(item.timestamp)}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-2">
                  <strong>Plan snippet:</strong> {createSnippet(item.plan)}
                </p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => onReuseItem(item)}
                    disabled={isActive}
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-[var(--border-radius-md)] transition-colors ${
                      isActive 
                        ? 'bg-[var(--color-surface-4)] text-[var(--color-text-soft)] cursor-default' 
                        : 'text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-2)] focus:ring-[var(--color-accent-ring)]'
                    }`}
                    title={isActive ? "This plan is currently being viewed" : "Reuse this prompt and view plan"}
                    aria-label={isActive ? "This plan is currently being viewed" : "Reuse this prompt and view plan"}
                  >
                    {isActive ? (
                      <>
                        <ViewingIcon />
                        Viewing
                      </>
                    ) : (
                      <>
                        <ReuseIcon />
                        Reuse
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this history item?")) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="flex items-center px-3 py-1.5 text-xs font-medium rounded-[var(--border-radius-md)] text-[var(--color-text-soft)] bg-[var(--color-danger-action)] hover:bg-[var(--color-danger-action-hover)] border border-[var(--color-danger-border)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-2)] focus:ring-[var(--color-danger-action)] transition-colors"
                    title="Delete this history item"
                    aria-label="Delete this history item"
                  >
                    <DeleteIcon />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};