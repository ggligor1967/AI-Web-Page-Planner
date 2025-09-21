import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-400)] to-[var(--color-secondary-500)]">
          AI Web Page Planner
        </span>
      </h1>
      <p className="mt-3 text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
        Describe your ideal web page, and let AI draft a conceptual plan for you.
      </p>
    </header>
  );
};