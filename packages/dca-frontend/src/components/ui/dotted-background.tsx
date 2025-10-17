import React from 'react';

export const DottedBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 bg-white"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255, 66, 5, 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
};
