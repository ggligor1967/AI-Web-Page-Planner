import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center my-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--color-accent-ring)]"></div>
      <p className="ml-4 text-lg text-[var(--color-text-soft)]">Generating your page plan...</p>
    </div>
  );
};