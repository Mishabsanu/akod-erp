
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => (
  <div className={`p-6 rounded-xl shadow-sm ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 mb-5 border-l-4 border-teal-500 pl-3">
      {title}
    </h3>
    {children}
  </div>
);
