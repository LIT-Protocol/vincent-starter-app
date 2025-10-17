import React from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  /** The title text to display in the header */
  title: string;
  /** Optional additional buttons or content to display on the right side */
  rightButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, rightButton }) => {
  return (
    <div
      className="px-3 sm:px-6 py-3 border-b border-gray-200 bg-white"
      style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          <img
            src="/vincent-logo.svg"
            alt="Vincent by Lit Protocol"
            className="h-4 w-4 flex-shrink-0"
          />
          <span className="text-sm font-medium text-gray-900 truncate mt-0.5 min-w-0">{title}</span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {rightButton}
          <Button
            variant="secondary-outline"
            size="sm"
            onClick={() => window.open('https://dashboard.heyvincent.ai/user/apps', '_blank')}
            className="px-2 sm:px-3"
            title="Open Vincent Dashboard"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
