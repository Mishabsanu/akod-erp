'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  totalCount: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  totalPages: number;
}

const Pagination = ({
  totalCount,
  page,
  limit,
  setPage,
  setLimit,
  totalPages,
}: PaginationProps) => {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);

  return (
    <div className="flex justify-between items-center gap-3 px-6 py-4 bg-white shadow-md rounded-lg border border-gray-200 mt-6">
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
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-teal-500"
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
  );
};

export default Pagination;