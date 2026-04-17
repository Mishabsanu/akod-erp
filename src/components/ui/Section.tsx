
import React from 'react';

interface SectionProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ 
  eyebrow, 
  title, 
  highlight, 
  children, 
  className = '' 
}) => (
  <div className={`p-6 bg-white rounded-3xl shadow-xl shadow-teal-700/5 border border-gray-100 ${className}`}>
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-3 bg-[#0f766e] rounded-full" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{eyebrow || 'Information'}</p>
      </div>
      <h3 className="text-xl font-black text-[#0f766e] tracking-tight">
        {title} {highlight && <span className="gradient-text">{highlight}</span>}
      </h3>
    </div>
    {children}
  </div>
);
