'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import React from 'react';

export interface Column<T> {
  accessor: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
}

interface ReusableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  totalPages: number;
  onRowClick?: (item: T) => void;
  isView?: boolean;
}

const NewTable = <T extends { _id?: string; [key: string]: any }>({
  columns,
  data,
  totalCount,
  page,
  limit,
  setPage,
  setLimit,
  totalPages,
  onRowClick,
  isView = false,
}: ReusableTableProps<T>) => {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
      <table className="min-w-full">
        <thead>
          <tr
            className="text-white text-sm uppercase tracking-wider"
            style={{ backgroundColor: '#11375d' }}
          >
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className={`py-3 px-4 font-semibold ${
                  col.nowrap ? 'whitespace-nowrap' : ''
                } ${
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-gray-500 text-sm italic"
              >
                No data found.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item._id}
                onClick={() => onRowClick && onRowClick(item)}
                className={`border-b hover:bg-gray-50 transition-all duration-150 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.accessor)}
                    className={`px-4 py-3 text-gray-700 ${
                      col.nowrap ? 'whitespace-nowrap' : ''
                    } ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : item[col.accessor] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center gap-3 px-6 py-4">
        {/* Left Side: "Showing X to Y of Z" */}
        <div className="text-sm text-gray-600">
          {totalCount > 0 ? (
            <>
              Showing <span className="font-semibold">{from}</span> to{' '}
              <span className="font-semibold">{to}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> entries
            </>
          ) : (
            'No entries'
          )}
        </div>

        {/* Right Side: Limit Selector and Page Buttons */}
        <div className="flex items-center gap-6">
          {/* Limit Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-sm text-gray-600">
              Rows per page:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTable;
