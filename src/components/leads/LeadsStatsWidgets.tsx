'use client';

import React from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUpIcon
} from 'lucide-react';

interface StatsProps {
  stats: Record<string, number>;
  loading: boolean;
}

const LeadsStatsWidgets: React.FC<StatsProps> = ({ stats, loading }) => {
  const cards = [
    {
      label: 'Total Leads',
      value: stats['All Statuses'] || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'New Leads',
      value: stats['New Lead'] || 0,
      icon: MessageSquare,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      label: 'Contacted',
      value: stats['Contacted'] || 0,
      icon: CheckCircle2,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      label: 'Quoted',
      value: stats['Quotation Sent'] || 0,
      icon: FileText,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Interested',
      value: stats['Interested'] || 0,
      icon: TrendingUpIcon, // I'll use a specific icon
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
  ];

  // Map icon names to actual components if TrendingUpIcon is not found
  const TrendingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, i) => (
        <div 
          key={i}
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all hover:shadow-md bg-white ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-1">
              {card.label}
            </p>
            <h3 className="text-2xl font-black text-gray-900 leading-none">
              {loading ? '...' : card.value}
            </h3>
          </div>
          <div className={`p-2.5 rounded-lg border ${card.color}`}>
            {card.label === 'Interested' ? <TrendingIcon /> : <card.icon className="w-5 h-5" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadsStatsWidgets;
