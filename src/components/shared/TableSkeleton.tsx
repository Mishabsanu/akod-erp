'use client';

import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number; // Not directly used for rendering, but helps conceptualize
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 7 }) => {
  return (
    <div className="akod-table-shell animate-pulse">
      <div className="akod-table-scroll">
        <table className="akod-table">
          <thead>
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i}>
                  <div className="h-3 w-3/4 rounded bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(5)].map((_, colIndex) => (
                  <td key={colIndex}>
                    <div className="h-4 rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="akod-table-footer">
        <div className="h-4 w-1/4 rounded bg-slate-100" />
        <div className="h-4 w-1/6 rounded bg-slate-100" />
      </div>
    </div>
  );
};
