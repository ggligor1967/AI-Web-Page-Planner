import React from 'react';
import { ErrorMessage } from './ErrorMessage';

interface GeneratedImageViewProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const ImageLoadingSpinner: React.FC = () => (
  <div className="flex flex-col justify-center items-center my-8 p-6 bg-[var(--color-surface-2)] bg-opacity-50 rounded-[var(--border-radius-lg)] shadow-inner border border-[var(--border-color-soft)]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--color-secondary-500)]"></div>
    <p className="mt-4 text-lg text-[var(--color-text-soft)]">Generating visual mockup...</p>
    <p className="text-sm text-[var(--color-text-muted)]">This can take up to a minute.</p>
  </div>
);

export const GeneratedImageView: React.FC<GeneratedImageViewProps> = ({ imageUrl, isLoading, error }) => {
  if (isLoading) {
    return <ImageLoadingSpinner />;
  }

  if (error) {
    // We want the error to be inside the main container, so we return it from App.tsx conditionally.
    // However, if we want component-level errors, we can use this:
    return <div className="mt-8"><ErrorMessage message={error} /></div>;
  }

  if (!imageUrl) {
    return null; // Don't render anything if there's no image, error, or loading state
  }

  return (
    <div
      aria-label="Generated visual mockup"
      className="mt-8 p-6 bg-[var(--color-surface-2)] bg-opacity-50 rounded-[var(--border-radius-lg)] shadow-inner border border-[var(--border-color-soft)]"
    >
      <h2 className="text-2xl font-semibold text-[var(--color-accent-400)] mb-4">Visual Mockup:</h2>
      <div className="flex justify-center items-center bg-black/20 rounded-[var(--border-radius-md)] p-2 sm:p-4">
        <a href={imageUrl} target="_blank" rel="noopener noreferrer" title="Click to open full-size image in a new tab">
          <img
            src={imageUrl}
            alt="AI-generated visual mockup of the web page plan"
            className="max-w-full h-auto rounded-[var(--border-radius-md)] shadow-lg"
          />
        </a>
      </div>
    </div>
  );
};
