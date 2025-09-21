import React, { useState, useCallback } from 'react';

interface GeneratedPageDisplayProps {
  pagePlan: string;
}

// --- Icon Components ---
const ClipboardIcon: React.FC<{ copied?: boolean }> = ({ copied }) => (
  copied ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a8.25 8.25 0 01-8.25 8.25H4.5A2.25 2.25 0 012.25 10.5v-3a2.25 2.25 0 012.25-2.25h1.5M15.666 3.888h-3.834m3.834 0l1.5 1.5M15.666 3.888V4.5m1.5-3.375A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m0 0V4.5m-2.166 0A2.25 2.25 0 002.25 4.5v3A2.25 2.25 0 004.5 9.75h1.5v-.055M16.5 10.5h-1.5m-6-3.75h1.5m6 3.75V15m-3-3.75V15m-3-3.75V15M9 16.5h6" />
    </svg>
  )
);

const ImageIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
  </svg>
);

const IconIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25 1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M12 7.5V5.25m0 2.25l-2.25 1.313M7.5 15l2.25-1.313M7.5 15l-2.25 1.313M7.5 15V12.75m12 0l-2.25 1.313M19.5 15l-2.25-1.313M19.5 15V12.75" />
  </svg>
);

const GridIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const IllustrationIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a17.96 17.96 0 01-1.25.12A18 18 0 013 15.86m12.59-1.49a17.962 17.962 0 01-1.25-.12A18 18 0 013 15.86m12.59-1.49V18m-8.48-6.19l.75-2.62a3.375 3.375 0 016.48-2.23l.39-1.62m-1.92.51l.21.84a2.25 2.25 0 01-1.92 2.73l-.39.08a2.25 2.25 0 01-2.73-1.92l-.84-.21m-2.23-6.48a3.375 3.375 0 01-2.23 6.48l-2.62.75m2.62-.75l-2.62.75a3.375 3.375 0 01-6.48-2.23l-1.62.39m1.62-.39l.84.21a2.25 2.25 0 011.92-2.73l.08-.39a2.25 2.25 0 012.73-1.92l-.21-.84m6.48 2.23l-2.62.75" />
  </svg>
);


// --- Placeholder Component ---
const Placeholder: React.FC<{ text: string }> = ({ text }) => {
  const match = text.match(/\[(Image|Icon|Illustration|Grid)(?::\s*(.*?))?\]/);
  if (!match) return <span>{text}</span>; // Fallback for malformed tags

  const type = match[1];
  const description = match[2] || type;
  
  let icon: React.ReactNode;
  let styleClasses: string;

  switch (type) {
    case 'Image':
      icon = <ImageIcon />;
      styleClasses = 'bg-sky-900/60 border-sky-700 text-sky-300';
      break;
    case 'Icon':
      icon = <IconIcon />;
      styleClasses = 'bg-teal-900/60 border-teal-700 text-teal-300';
      break;
    case 'Illustration':
      icon = <IllustrationIcon />;
      styleClasses = 'bg-indigo-900/60 border-indigo-700 text-indigo-300';
      break;
    case 'Grid':
      icon = <GridIcon />;
      styleClasses = 'bg-slate-600 border-slate-500 text-slate-300';
      break;
    default:
      return <span>{text}</span>;
  }

  return (
    <span className={`not-prose inline-flex items-center px-2 py-0.5 mx-1 text-xs font-medium rounded-md border align-middle ${styleClasses}`}>
      {icon}
      <span className="font-mono">{description}</span>
    </span>
  );
};


export const GeneratedPageDisplay: React.FC<GeneratedPageDisplayProps> = ({ pagePlan }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pagePlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy plan to clipboard.");
    }
  }, [pagePlan]);

  const renderLineWithPlaceholders = (line: string, keyPrefix: string): React.ReactNode[] => {
    const placeholderRegex = /\[(?:Image|Icon|Illustration|Grid)(?::[^\]]*)?\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let i = 0;

    // Use matchAll to find all placeholder occurrences.
    // This is more robust than splitting, as it explicitly handles the text segments
    // between, before, and after the placeholders.
    for (const match of line.matchAll(placeholderRegex)) {
        const placeholderText = match[0];
        // The index will always be defined for matches from matchAll
        const matchIndex = match.index as number;

        // 1. Add the text segment before the current placeholder.
        if (matchIndex > lastIndex) {
            parts.push(
                <React.Fragment key={`${keyPrefix}-txt-${i++}`}>
                    {line.substring(lastIndex, matchIndex)}
                </React.Fragment>
            );
        }

        // 2. Add the placeholder component itself.
        parts.push(
            <Placeholder key={`${keyPrefix}-ph-${i++}`} text={placeholderText} />
        );

        // 3. Update the lastIndex to the end of the current placeholder.
        lastIndex = matchIndex + placeholderText.length;
    }

    // 4. Add any remaining text after the last placeholder.
    if (lastIndex < line.length) {
        parts.push(
            <React.Fragment key={`${keyPrefix}-txt-${i++}`}>
                {line.substring(lastIndex)}
            </React.Fragment>
        );
    }
    
    // If no matches were found, the above logic correctly handles returning the full line.
    return parts;
  };

  const renderPlan = (plan: string): React.ReactNode[] => {
    const lines = plan.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        flushList();
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="not-prose bg-slate-800 p-4 rounded-md text-slate-300 font-mono text-sm my-4 overflow-x-auto whitespace-pre-wrap">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      const isListItem = line.startsWith('* ') || line.startsWith('- ');
      
      if (isListItem) {
        const content = line.substring(2);
        listItems.push(<li key={index}>{renderLineWithPlaceholders(content, `li-${index}`)}</li>);
      } else {
        flushList();
        
        if (line.startsWith('# ')) {
          elements.push(<h1 key={index}>{line.substring(2)}</h1>);
        } else if (line.startsWith('## ')) {
          elements.push(<h2 key={index}>{line.substring(3)}</h2>);
        } else if (line.startsWith('### ')) {
          elements.push(<h3 key={index}>{line.substring(4)}</h3>);
        } else if (line.startsWith('---')) {
          elements.push(<hr key={index} className="border-slate-600" />);
        } else if (line.trim() !== '') {
          elements.push(<p key={index}>{renderLineWithPlaceholders(line, `p-${index}`)}</p>);
        }
      }
    });

    flushList(); 

    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre key="code-streaming" className="not-prose bg-slate-800 p-4 rounded-md text-slate-300 font-mono text-sm my-4 overflow-x-auto whitespace-pre-wrap">
          <code>{codeBlockContent.join('\n')}</code>
        </pre>
      );
    }
    
    return elements;
  };


  return (
    <div className="mt-8 p-6 bg-slate-700 bg-opacity-50 rounded-lg shadow-inner border border-slate-600">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-purple-400">Generated Web Page Plan:</h2>
        <button
          onClick={handleCopy}
          title={copied ? "Copied to clipboard!" : "Copy plan to clipboard"}
          aria-label={copied ? "Plan copied to clipboard" : "Copy plan to clipboard"}
          className={`flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out
                      ${copied 
                        ? 'bg-green-600 border-green-500 text-white hover:bg-green-700 focus:ring-green-500' 
                        : 'bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500 focus:bg-slate-500 focus:ring-purple-500'}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700`}
        >
          <ClipboardIcon copied={copied} />
          {copied ? 'Copied!' : 'Copy Plan'}
        </button>
      </div>
      <div className="prose prose-sm sm:prose-base max-w-none prose-invert 
                      prose-headings:text-purple-400 prose-strong:text-purple-300 
                      prose-ul:list-disc prose-ul:pl-5 prose-li:text-slate-300
                      prose-a:text-purple-400 hover:prose-a:text-purple-300">
        {renderPlan(pagePlan)}
      </div>
    </div>
  );
};