'use client';

import React from 'react';
import Image from 'next/image';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 7 }) => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 🚀 Brand Loading Indicator */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping" />
          <div className="relative bg-white rounded-full p-2 shadow-xl border-2 border-teal-500/30 overflow-hidden w-24 h-24 flex items-center justify-center">
            <Image 
              src="/loading.jpeg" 
              alt="Loading..." 
              width={80} 
              height={80} 
              className="object-contain rounded-md animate-pulse"
            />
          </div>
        </div>
        <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] animate-pulse">
          Processing Data...
        </p>
      </div>

      <div className="akod-table-shell">
        <div className="akod-table-scroll">
          <table className="akod-table">
            <thead>
              <tr>
                {[...Array(5)].map((_, i) => (
                  <th key={i}>
                    <div className="h-3 w-3/4 rounded bg-teal-50" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(5)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="h-4 rounded bg-gray-50" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="akod-table-footer">
          <div className="h-4 w-1/4 rounded bg-gray-100" />
          <div className="h-4 w-1/6 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
};
