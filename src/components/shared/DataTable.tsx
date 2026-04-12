'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface Column<T> {
  accessor: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;

  // Server-side pagination props
  serverSidePagination: boolean;
  totalCount?: number;
  currentPage?: number;
  limit?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTable<T extends { _id?: string; [key: string]: any }>({
  columns,
  data,
  onRowClick,
  serverSidePagination,
  totalCount,
  currentPage,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  // Internal state for client-side pagination (no longer used for search)
  const [internalPage, setInternalPage] = useState(1);
  const [internalLimit, setInternalLimit] = useState(10);

  // Determine which state to use for pagination
  const actualPage = (serverSidePagination ? currentPage : internalPage) || 1;
  const actualLimit = (serverSidePagination ? limit : internalLimit) || 10;

  const handlePageChange = (page: number) => {
    if (serverSidePagination) {
      onPageChange?.(page);
    } else {
      setInternalPage(page);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (serverSidePagination) {
      onLimitChange?.(newLimit);
      onPageChange?.(1); // Reset to first page on limit change
    } else {
      setInternalLimit(newLimit);
      setInternalPage(1); // Reset to first page on limit change
    }
  };

  // Data for display
  const displayData = useMemo(() => {
    if (serverSidePagination) return data;
    const from = (actualPage - 1) * actualLimit;
    const to = from + actualLimit;
    return data.slice(from, to);
  }, [data, serverSidePagination, actualPage, actualLimit]);

  // Determine effective values for rendering pagination controls
  const displayTotalCount = (serverSidePagination ? totalCount : data.length) || 0;
  const displayTotalPages = (serverSidePagination ? totalPages : Math.ceil(data.length / actualLimit)) || 0;
  const displayFrom = displayTotalCount > 0 ? (actualPage - 1) * actualLimit + 1 : 0;
  const displayTo = Math.min(actualPage * actualLimit, displayTotalCount);


  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr
              className="text-white text-sm uppercase tracking-wider"
              style={{ backgroundColor: '#11375d' }}
            >
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  className="py-3 px-4 text-left font-semibold"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-gray-500 text-sm italic"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              displayData.map((item, index) => (
                <tr
                  key={item._id || index}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`border-b hover:bg-gray-50 transition-all duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.accessor)}
                      className="px-4 py-3 text-gray-700"
                    >
                      {col.render
                        ? col.render(item)
                        : (item[col.accessor] as any)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center gap-3 px-6 py-4">
        <div className="text-sm text-gray-600">
          {displayTotalCount > 0 ? (
            <>
              Showing <span className="font-semibold">{displayFrom}</span> to{' '}
              <span className="font-semibold">{displayTo}</span> of{' '}
              <span className="font-semibold">{displayTotalCount}</span> entries
            </>
          ) : (
            'No entries'
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-sm text-gray-600">
              Rows per page:
            </label>
            <select
              id="limit-select"
              value={actualLimit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={actualPage === 1}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(actualPage - 1)}
              disabled={actualPage === 1}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-700">
              Page {actualPage || 0} of {displayTotalPages || 0}
            </span>

            <button
              onClick={() => handlePageChange(actualPage + 1)}
              disabled={actualPage === displayTotalPages || displayTotalPages === 0}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(displayTotalPages)}
              disabled={actualPage === displayTotalPages || displayTotalPages === 0}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
