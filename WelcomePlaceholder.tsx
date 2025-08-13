import React from 'react';
import { CompassIcon, LayoutGridIcon } from './icons';

const WelcomePlaceholder: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center h-full bg-[var(--color-bg-secondary)]">
      <div className="text-center p-8">
        <div className="inline-block bg-[var(--color-bg-tertiary)]/50 p-6 rounded-full border-2 border-[var(--color-border)]">
          <CompassIcon className="w-24 h-24 text-[var(--color-text-tertiary)]" />
        </div>
        <h2 className="mt-8 text-4xl font-extrabold text-white tracking-tight">Welcome to PathFinder</h2>
        <p className="mt-3 max-w-md mx-auto text-lg text-[var(--color-text-secondary)]">
          Your adventure planning starts here.
        </p>
        <div className="mt-8 flex justify-center items-center gap-4 text-[var(--color-text-secondary)]">
            <LayoutGridIcon className="w-6 h-6 text-[var(--color-accent)]" />
            <span>Select a trip from the sidebar to view its details or plan a new one.</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomePlaceholder;