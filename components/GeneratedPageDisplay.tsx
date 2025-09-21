import React, { useState, useCallback, forwardRef, useEffect, useMemo, useRef } from 'react';
import { ContentGenerator } from './ContentGenerator';
import { Palette, SmartAction } from '../services/geminiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SmartActionsToolbar, SmartActionResult } from './SmartActionsToolbar';

interface GeneratedPageDisplayProps {
  pagePlan: string;
  onGenerateMockup: () => void;
  isImageLoading: boolean;
  isPlanGenerated: boolean;
  checkedItems: Record<string, boolean>;
  onChecklistToggle: (key: string) => void;
  onGenerateContent: (sectionKey: string, sectionContext: string, instruction: string) => void;
  generatedContent: Record<string, string>;
  isContentLoading: Record<string, boolean>;
  contentError: Record<string, string | null>;
  onGenerateCode: (sectionKey: string, componentContext:string) => void;
  generatedCode: Record<string, string>;
  isCodeLoading: Record<string, boolean>;
  codeError: Record<string, string | null>;
  onGeneratePalettes: () => void;
  altPalettes: Palette[] | null;
  isPalettesLoading: boolean;
  palettesError: string | null;
  smartActions: SmartAction[] | null;
  isSmartActionsLoading: boolean;
  smartActionsError: string | null;
  smartActionResults: Record<string, SmartActionResult>;
  onExecuteSmartAction: (action: SmartAction) => void;
}

// --- Icon Components ---
const ClipboardIcon: React.FC<{ copied?: boolean }> = ({ copied }) => (
  copied ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-[var(--color-success-text)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a8.25 8.25 0 01-8.25 8.25H4.5A2.25 2.25 0 012.25 10.5v-3a2.25 2.25 0 012.25-2.25h1.5M15.666 3.888h-3.834m3.834 0l1.5 1.5M15.666 3.888V4.5m1.5-3.375A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m0 0V4.5m-2.166 0A2.25 2.25 0 002.25 4.5v3A2.25 2.25 0 004.5 9.75h1.5v-.055M16.5 10.5h-1.5m-6-3.75h1.5m6 3.75V15m-3-3.75V15m-3-3.75V15M9 16.5h6" />
    </svg>
  )
);

const ExportIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ExportPDFIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const PaletteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.14-.14.293-.27.453-.386a3.75 3.75 0 015.304 5.304c-.116.16-.246.313-.386.453l-2.88 2.88M10.5 8.197M14.25 12h4.5" />
    </svg>
);

const MockupIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
    </svg>
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
  if (!match) return <span>{text}</span>;

  const type = match[1];
  const description = match[2] || type;
  
  let icon: React.ReactNode;
  let style: React.CSSProperties;

  switch (type) {
    case 'Image':
      icon = <ImageIcon />;
      style = { 
        backgroundColor: 'var(--color-placeholder-image-bg)', 
        borderColor: 'var(--color-placeholder-image-border)', 
        color: 'var(--color-placeholder-image-text)' 
      };
      break;
    case 'Icon':
      icon = <IconIcon />;
      style = { 
        backgroundColor: 'var(--color-placeholder-icon-bg)', 
        borderColor: 'var(--color-placeholder-icon-border)', 
        color: 'var(--color-placeholder-icon-text)' 
      };
      break;
    case 'Illustration':
      icon = <IllustrationIcon />;
      style = { 
        backgroundColor: 'var(--color-placeholder-illustration-bg)', 
        borderColor: 'var(--color-placeholder-illustration-border)', 
        color: 'var(--color-placeholder-illustration-text)' 
      };
      break;
    case 'Grid':
      icon = <GridIcon />;
      style = { 
        backgroundColor: 'var(--color-surface-3)', 
        borderColor: 'var(--color-surface-4)', 
        color: 'var(--color-text-soft)' 
      };
      break;
    default:
      return <span>{text}</span>;
  }

  return (
    <span style={style} className="not-prose inline-flex items-center px-2 py-0.5 mx-1 text-xs font-medium rounded-[var(--border-radius-md)] border align-middle">
      {icon}
      <span className="font-mono">{description}</span>
    </span>
  );
};


interface PlanSection {
    title: string | null;
    content: string;
    isGeneratable: boolean;
}

const parsePlanIntoSections = (plan: string): PlanSection[] => {
    const finalSections: PlanSection[] = [];
    const topLevelChunks = plan.split(/(?=^##\s)/m);

    for (const chunk of topLevelChunks) {
        if (!chunk.trim()) continue;

        const headingMatch = chunk.match(/^##\s+(.*)/);
        const chunkTitle = headingMatch ? headingMatch[1].trim() : null;
        
        if (chunkTitle && chunkTitle.startsWith('Key Sections')) {
            finalSections.push({
                title: chunkTitle,
                content: `## ${chunkTitle}`,
                isGeneratable: false,
            });
            
            const keySectionsContent = chunk.substring(headingMatch![0].length).trim();
            const subSections = keySectionsContent.split(/(?=^###\s)/m);

            for (const subChunk of subSections) {
                if (!subChunk.trim()) continue;
                
                if (!subChunk.startsWith('###')) {
                    finalSections.push({
                        title: null,
                        content: subChunk,
                        isGeneratable: false
                    });
                    continue;
                }

                const subHeadingMatch = subChunk.match(/^###\s+(.*)/);
                const subChunkTitle = subHeadingMatch ? subHeadingMatch[1].trim() : null;
                const contentGenerationMarker = '<!-- GENERATE_CONTENT_HERE -->';
                
                if (subChunk.includes(contentGenerationMarker)) {
                    const parts = subChunk.split(contentGenerationMarker);
                    const mainContent = parts[0];
                    const uiContent = parts.length > 1 ? parts[1] : '';

                    if (mainContent.trim()) {
                         finalSections.push({
                            title: subChunkTitle,
                            content: mainContent,
                            isGeneratable: true,
                        });
                    }
                   
                    if (uiContent.trim()) {
                        finalSections.push({
                            title: null,
                            content: uiContent,
                            isGeneratable: false,
                        });
                    }
                } else {
                    finalSections.push({
                        title: subChunkTitle,
                        content: subChunk,
                        isGeneratable: false,
                    });
                }
            }
        } else {
            finalSections.push({
                title: chunkTitle,
                content: chunk,
                isGeneratable: false,
            });
        }
    }

    return finalSections;
};

const highlightSyntax = (code: string): string => {
  const htmlEscape = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const keywords = 'const|let|var|function|return|if|else|for|while|import|export|from|async|await|new|class|extends|super|this|true|false|null|try|catch|finally|switch|case|default|break|continue|delete|typeof|instanceof|interface|type';
  
  const tokenRegex = new RegExp([
      /(?<comment>\/\/.*|\/\*[\s\S]*?\*\/)/,
      /(?<string>['"`])(?:(?=(\\?))\2.)*?\1/,
      `(?<keyword>\\b(${keywords})\\b)`,
      /(?<function>[a-zA-Z0-9_]+)(?=\()/,
      /(?<number>\b\d+\b)/,
      /(?<punctuation>[{}()\[\].,:;=+\-*/%&|<>?!~])/,
    ]
    .map((r) => typeof r === 'string' ? `(${r})` : r.source)
    .join('|'),
  'g');
  
  const cleanedCode = code.replace(/^```tsx\n|```$/g, '').trim();

  return cleanedCode.replace(tokenRegex, (match, ...groups) => {
    const kind = groups[groups.length - 1];
    if(kind.comment) return `<span class="token-comment">${htmlEscape(kind.comment)}</span>`;
    if(kind.string) return `<span class="token-string">${htmlEscape(kind.string)}</span>`;
    if(kind.keyword) return `<span class="token-keyword">${htmlEscape(kind.keyword)}</span>`;
    if(kind.function) return `<span class="token-function">${htmlEscape(kind.function)}</span>`;
    if(kind.number) return `<span class="token-number">${htmlEscape(kind.number)}</span>`;
    if(kind.punctuation) return `<span class="token-punctuation">${htmlEscape(kind.punctuation)}</span>`;
    return htmlEscape(match);
  });
};


let MarkdownRenderer: React.FC<any>;
let CodeSnippetDisplay: React.FC<any>;
let AlternativePalettes: React.FC<any>;


export const GeneratedPageDisplay = forwardRef<HTMLDivElement, GeneratedPageDisplayProps>(({ 
  pagePlan, onGenerateMockup, isImageLoading, isPlanGenerated, checkedItems, onChecklistToggle,
  onGenerateContent, generatedContent, isContentLoading, contentError,
  onGenerateCode, generatedCode, isCodeLoading, codeError,
  onGeneratePalettes, altPalettes, isPalettesLoading, palettesError,
  smartActions, isSmartActionsLoading, smartActionsError, smartActionResults, onExecuteSmartAction
}, ref) => {
  const [copied, setCopied] = useState(false);
  const planContentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setCopied(false);
  }, [pagePlan]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pagePlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy plan to clipboard.");
    }
  }, [pagePlan]);

  const handleExport = useCallback(() => {
    try {
      const titleMatch = pagePlan.match(/Page Title Suggestion:\s*(.*)/);
      const safeTitle = titleMatch ? titleMatch[1].trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'web_page_plan';
      const filename = `${safeTitle || 'web_page_plan'}.md`;
  
      const blob = new Blob([pagePlan], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export file:", err);
      alert("Failed to export plan as Markdown file.");
    }
  }, [pagePlan]);

  const handleExportPDF = useCallback(() => {
    const planElement = planContentRef.current;
    if (!planElement) {
      console.error("Plan content element not found for PDF export.");
      alert("Could not export PDF. Content area not found.");
      return;
    }

    document.body.classList.add('light-theme-for-export');
    
    html2canvas(planElement, { 
        scale: 2,
        backgroundColor: '#ffffff',
        windowWidth: 1200
    }).then(canvas => {
        document.body.classList.remove('light-theme-for-export');
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const titleMatch = pagePlan.match(/Page Title Suggestion:\s*(.*)/);
        const safeTitle = titleMatch ? titleMatch[1].trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'web_page_plan';
        pdf.save(`${safeTitle || 'web_page_plan'}.pdf`);
    }).catch(err => {
        document.body.classList.remove('light-theme-for-export');
        console.error("Failed to export PDF:", err);
        alert("An error occurred while exporting the plan as a PDF.");
    });
  }, [pagePlan]);

  const sections = useMemo(() => parsePlanIntoSections(pagePlan), [pagePlan]);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-label="Generated web page plan content"
      className="mt-8 p-6 bg-[var(--color-surface-2)] bg-opacity-50 rounded-[var(--border-radius-lg)] shadow-inner border border-[var(--border-color-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-1)]"
    >
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-[var(--color-accent-400)]">Generated Web Page Plan:</h2>
        <div className="flex space-x-2 flex-wrap gap-2">
          <button
            onClick={handleCopy}
            title={copied ? "Copied to clipboard!" : "Copy plan to clipboard"}
            aria-label={copied ? "Plan copied to clipboard" : "Copy plan to clipboard"}
            className={`flex items-center px-4 py-2 border text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-2)]
                        ${copied 
                          ? 'bg-[var(--color-success-base)] border-[var(--color-success-border)] text-white hover:bg-[var(--color-success-hover)] focus:ring-[var(--color-success-border)]' 
                          : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-4)] focus:bg-[var(--color-surface-4)] focus:ring-[var(--color-accent-ring)]'}`}
          >
            <ClipboardIcon copied={copied} />
            {copied ? 'Copied!' : 'Copy Plan'}
          </button>
          <button
            onClick={handleExport}
            title="Export plan as a Markdown file"
            aria-label="Export plan as a Markdown file"
            className="flex items-center px-4 py-2 border text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-4)] focus:bg-[var(--color-surface-4)] focus:ring-[var(--color-accent-ring)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-2)] transition-colors duration-150 ease-in-out"
          >
            <ExportIcon />
            Export MD
          </button>
           <button
            onClick={handleExportPDF}
            title="Export plan as a PDF file"
            aria-label="Export plan as a PDF file"
            className="flex items-center px-4 py-2 border text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-4)] focus:bg-[var(--color-surface-4)] focus:ring-[var(--color-accent-ring)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-2)] transition-colors duration-150 ease-in-out"
          >
            <ExportPDFIcon />
            Export PDF
          </button>
          <button
            onClick={onGeneratePalettes}
            disabled={!isPlanGenerated || isPalettesLoading}
            title="Suggest alternative color palettes"
            className="flex items-center px-4 py-2 border text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-4)] focus:bg-[var(--color-surface-4)] focus:ring-[var(--color-accent-ring)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-2)] transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isPalettesLoading ? 'Generating...' : <><PaletteIcon /> Suggest Palettes</>}
          </button>
          <button
            onClick={onGenerateMockup}
            disabled={!isPlanGenerated || isImageLoading}
            title={isPlanGenerated ? "Generate a visual mockup from this plan" : "A plan must be generated first"}
            aria-label="Generate a visual mockup from this plan"
            className="flex items-center px-4 py-2 border text-sm font-medium rounded-[var(--border-radius-md)] shadow-sm bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-4)] focus:bg-[var(--color-surface-4)] focus:ring-[var(--color-accent-ring)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface-2)] transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImageLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <MockupIcon />
                Generate Mockup
              </>
            )}
          </button>
        </div>
      </div>
       <SmartActionsToolbar
        actions={smartActions}
        isLoading={isSmartActionsLoading}
        error={smartActionsError}
        results={smartActionResults}
        onExecuteAction={onExecuteSmartAction}
      />
      <div ref={planContentRef} className="prose prose-sm sm:prose-base max-w-none prose-custom">
        {sections.map((section, index) => {
            const sectionKey = `section-${index}-${section.title?.replace(/\s+/g, '-') || 'preamble'}`;
            return (
                <React.Fragment key={sectionKey}>
                    <MarkdownRenderer 
                      markdownChunk={section.content}
                      checkedItems={checkedItems}
                      onChecklistToggle={onChecklistToggle}
                      onGenerateCode={onGenerateCode}
                      generatedCode={generatedCode}
                      isCodeLoading={isCodeLoading}
                      codeError={codeError}
                    />
                    {section.isGeneratable && (
                        <ContentGenerator
                            sectionKey={sectionKey}
                            onGenerate={(instruction) => onGenerateContent(sectionKey, section.content, instruction)}
                            isLoading={isContentLoading[sectionKey]}
                            error={contentError[sectionKey]}
                            content={generatedContent[sectionKey]}
                        />
                    )}
                </React.Fragment>
            );
        })}
      </div>
      <AlternativePalettes
          palettes={altPalettes}
          isLoading={isPalettesLoading}
          error={palettesError}
        />
    </div>
  );
});

interface MarkdownRendererProps {
    markdownChunk: string;
    checkedItems: Record<string, boolean>;
    onChecklistToggle: (key: string) => void;
    onGenerateCode: (sectionKey: string, componentContext: string) => void;
    generatedCode: Record<string, string>;
    isCodeLoading: Record<string, boolean>;
    codeError: Record<string, string | null>;
}

MarkdownRenderer = ({ markdownChunk, checkedItems, onChecklistToggle, onGenerateCode, generatedCode, isCodeLoading, codeError }) => {
    const renderLineWithPlaceholders = (line: string, keyPrefix: string): React.ReactNode[] => {
        const placeholderRegex = /\[(?:Image|Icon|Illustration|Grid)(?::[^\]]*)?\]/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let i = 0;
        for (const match of line.matchAll(placeholderRegex)) {
            const placeholderText = match[0];
            const matchIndex = match.index as number;
            if (matchIndex > lastIndex) {
                parts.push(<React.Fragment key={`${keyPrefix}-txt-${i++}`}>{line.substring(lastIndex, matchIndex)}</React.Fragment>);
            }
            parts.push(<Placeholder key={`${keyPrefix}-ph-${i++}`} text={placeholderText} />);
            lastIndex = matchIndex + placeholderText.length;
        }
        if (lastIndex < line.length) {
            parts.push(<React.Fragment key={`${keyPrefix}-txt-${i++}`}>{line.substring(lastIndex)}</React.Fragment>);
        }
        return parts;
    };

    const lines = markdownChunk.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: React.ReactNode[] = [];
    
    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2">{listItems}</ul>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.trim().startsWith('```')) {
            flushList();
            if (inCodeBlock) {
                const rawCode = codeBlockContent.join('\n');
                const highlightedCode = highlightSyntax(rawCode);
                elements.push(
                  <div key={`code-container-${index}`} className="not-prose my-4 rounded-[var(--border-radius-md)] shadow-md">
                    <div className="bg-[var(--color-surface-3)] px-4 py-1 rounded-t-[var(--border-radius-md)] border-b border-[var(--border-color-soft)]">
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">Code Example</span>
                    </div>
                    <pre className="bg-[var(--color-surface-1)] p-4 rounded-b-[var(--border-radius-md)] text-[var(--color-text-soft)] font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                    </pre>
                  </div>
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

        const trimmedLine = line.trim();
        const isCheckbox = /^[*-]\s*\[[ x]\]\s/.test(trimmedLine);
        const isUIComponentCheckbox = isCheckbox && /\s*\*\*.*\*\*:\s/.test(trimmedLine);
        const isListItem = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');

        if (isCheckbox) {
            const key = `checklist-${trimmedLine}-${index}`;
            const isChecked = checkedItems[key];
            const labelText = trimmedLine.replace(/^[*-]\s*\[[ x]\]\s*/, '');
            listItems.push(
                <li key={key} className="flex flex-col items-start not-prose">
                    <div className="flex items-start">
                        <input type="checkbox" id={key} checked={!!isChecked} onChange={() => onChecklistToggle(key)} className="peer h-4 w-4 mt-1 rounded border-[var(--border-color-soft)] bg-[var(--color-surface-3)] text-[var(--color-primary-600)] focus:ring-[var(--color-accent-ring)] cursor-pointer" />
                        <label htmlFor={key} className="ml-3 text-sm cursor-pointer peer-checked:line-through peer-checked:text-[var(--color-text-muted)] transition-colors">
                            {renderLineWithPlaceholders(labelText, `li-desc-${index}`)}
                        </label>
                    </div>
                     {isUIComponentCheckbox && (
                        <div className="pl-7 mt-2 w-full">
                           <CodeSnippetDisplay
                                sectionKey={key}
                                onGenerate={() => onGenerateCode(key, line)}
                                isLoading={isCodeLoading[key]}
                                error={codeError[key]}
                                code={generatedCode[key]}
                            />
                        </div>
                    )}
                </li>
            );
        } else if (isListItem) {
            const content = trimmedLine.substring(2);
            listItems.push(<li key={index}>{renderLineWithPlaceholders(content, `li-${index}`)}</li>);
        } else {
            flushList();
            if (line.startsWith('# ')) elements.push(<h1 key={index}>{line.substring(2)}</h1>);
            else if (line.startsWith('## ')) elements.push(<h2 key={index}>{line.substring(3)}</h2>);
            else if (line.startsWith('### ')) elements.push(<h3 key={index}>{line.substring(4)}</h3>);
            else if (line.startsWith('---')) elements.push(<hr key={index} />);
            else if (line.trim() !== '') elements.push(<p key={index}>{renderLineWithPlaceholders(line, `p-${index}`)}</p>);
        }
    });

    flushList();
    if (inCodeBlock && codeBlockContent.length > 0) {
        const rawCode = codeBlockContent.join('\n');
        const highlightedCode = highlightSyntax(rawCode);
        elements.push(
            <div key="code-container-streaming" className="not-prose my-4 rounded-[var(--border-radius-md)] shadow-md">
              <div className="bg-[var(--color-surface-3)] px-4 py-1 rounded-t-[var(--border-radius-md)] border-b border-[var(--border-color-soft)]">
                <span className="text-xs font-mono text-[var(--color-text-muted)]">Code Example</span>
              </div>
              <pre className="bg-[var(--color-surface-1)] p-4 rounded-b-[var(--border-radius-md)] text-[var(--color-text-soft)] font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </div>
        );
    }
    return <>{elements}</>;
};

CodeSnippetDisplay = ({ sectionKey, onGenerate, isLoading, error, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (!code) return;
        const cleanedCode = code.replace(/^```tsx\n|```$/g, '').trim();
        navigator.clipboard.writeText(cleanedCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => console.error("Failed to copy code:", err));
    }, [code]);

    if (!code && !isLoading && !error) {
        return (
            <button onClick={onGenerate} className="text-xs text-[var(--color-accent-300)] hover:text-[var(--color-accent-400)] transition-colors underline">
                Generate Code Snippet
            </button>
        );
    }
    if (isLoading) {
        return <div className="text-xs text-[var(--color-text-muted)]">Generating code...</div>;
    }
    if (error) {
        return <div className="text-xs text-red-400">Error: {error}</div>;
    }
    if (code) {
        return (
            <div className="not-prose my-2 rounded-[var(--border-radius-md)] shadow-md">
              <div className="relative bg-[var(--color-surface-3)] px-4 py-1 rounded-t-[var(--border-radius-md)] border-b border-[var(--border-color-soft)] flex justify-between items-center">
                <span className="text-xs font-mono text-[var(--color-text-muted)]">React/TSX Example</span>
                 <button onClick={handleCopy} title={copied ? "Copied!" : "Copy code"} className="flex items-center text-xs text-[var(--color-text-soft)] hover:text-[var(--color-text-base)]">
                    <ClipboardIcon copied={copied} /> {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[var(--color-surface-1)] p-4 rounded-b-[var(--border-radius-md)] text-[var(--color-text-soft)] font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  <code dangerouslySetInnerHTML={{ __html: highlightSyntax(code) }} />
              </pre>
            </div>
        );
    }
    return null;
};

AlternativePalettes = ({ palettes, isLoading, error }) => {
    if (isLoading) {
        return <div className="text-center py-4">Generating palettes...</div>;
    }
    if (error) {
        return <div className="text-center py-4 text-red-400">Error: {error}</div>;
    }
    if (!palettes) {
        return null;
    }
    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-[var(--color-accent-400)] mb-4">Alternative Color Palettes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {palettes.map(palette => (
                    <div key={palette.name} className="bg-[var(--color-surface-1)] p-4 rounded-[var(--border-radius-lg)] border border-[var(--border-color-base)]">
                        <h4 className="font-bold text-[var(--color-accent-300)]">{palette.name}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] mb-3">{palette.description}</p>
                        <div className="space-y-2">
                            {palette.colors.map(color => (
                                <div key={color.hex}>
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 rounded-full mr-2 border border-[var(--border-color-soft)]" style={{ backgroundColor: color.hex }}></div>
                                        <span className="text-sm font-medium">{color.role}</span>
                                        <span className="ml-auto text-xs font-mono text-[var(--color-text-muted)]">{color.hex}</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-muted)] pl-7">{color.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};