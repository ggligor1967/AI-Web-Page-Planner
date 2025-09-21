import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="my-6 p-4 bg-[var(--color-danger-base)] bg-opacity-80 border border-[var(--color-danger-border)] rounded-[var(--border-radius-md)] shadow-lg" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-[var(--color-danger-text)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-md font-medium text-[var(--color-danger-text-strong)]">Error</h3>
          <div className="mt-1 text-sm text-[var(--color-danger-text)]">
            <p className="whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};