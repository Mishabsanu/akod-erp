'use client';

import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number; // Not directly used for rendering, but helps conceptualize
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 7 }) => {
  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-[#11375d] text-white text-sm uppercase tracking-wider">
              {[...Array(5)].map((_, i) => ( // Assuming a max of 5 columns for skeleton header
                <th key={i} className="py-3 px-4 text-left font-semibold">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(5)].map((_, colIndex) => ( // Assuming a max of 5 columns for skeleton cells
                  <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
  );
};
