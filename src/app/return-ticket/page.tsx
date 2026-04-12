'use client';

import { ReturnTicketFilterBar } from '@/components/return-ticket/ReturnTicketFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { ReturnTicket, ReturnTicketFilter } from '@/lib/types';
import {
  deleteReturnTicket,
  getReturnTickets,
} from '@/services/returnTicketApi';
import {
  Edit2,
  Filter,
  MoreVertical, // Appropriate icon for Return Ticket
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const ReturnTicketPage = () => {
  // Rename component
  const [returnTickets, setReturnTickets] = useState<ReturnTicket[]>([]); // State for return tickets
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ReturnTicketFilter['status']>(undefined);
  const [startDateFilter, setStartDateFilter] = useState<string | undefined>(
    undefined
  );
  const [endDateFilter, setEndDateFilter] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalTicketsCount, setTotalTicketsCount] = useState(0);
  const [totalTicketsPages, setTotalTicketsPages] = useState(1);

  const router = useRouter();
  const { can } = useAuth();
  const toggleActionMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const fetchReturnTickets = useCallback(async () => {
    // Rename fetch function
    setLoading(true);
    try {
      const filterParams: ReturnTicketFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
      };

      const response = await getReturnTickets(filterParams, currentPage, limit); // Use ReturnTicket API
      const {
        returnTickets: fetchedTickets, // Get returnTickets from response
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = response;

      setReturnTickets(fetchedTickets || []);
      setTotalTicketsPages(fetchedTotalPages || 1);
      setTotalTicketsCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Failed to fetch return tickets:', error);
      toast.error('Failed to load return tickets.');
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    statusFilter,
    startDateFilter,
    endDateFilter,
    currentPage,
    limit,
  ]);

  useEffect(() => {
    fetchReturnTickets();
  }, [fetchReturnTickets]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this return ticket?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              toast.info('Return ticket deletion cancelled.', {
                duration: 2000,
              });
            }}
            className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              const loadingId = toast.loading('Deleting return ticket...');
              try {
                const response = await deleteReturnTicket(id); // Use ReturnTicket API
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(
                    response.message || 'Return ticket deleted successfully!'
                  );
                  fetchReturnTickets(); // Re-fetch data
                } else {
                  toast.error(
                    response.message || 'Failed to delete return ticket.'
                  );
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(
                  error.response?.data?.message ||
                  'Something went wrong while deleting return ticket.'
                );
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleAdd = () => router.push('/return-ticket/add'); // Update path
  const handleEdit = (id: string) => router.push(`/return-ticket/edit/${id}`); // Update path
  const handleRowClick = (ticket: ReturnTicket) => {
    if (ticket._id) {
      router.push(`/return-ticket/${ticket._id}`);
    }
  };

  const columns: Column<ReturnTicket>[] = useMemo(() => {
    const baseColumns: Column<ReturnTicket>[] = [
      { accessor: 'ticketNo', header: 'Ticket No' },
      { accessor: 'ticketType', header: 'Ticket Type' },
      { accessor: 'customerName', header: 'Customer' },
      { accessor: 'poNo', header: 'PO No' },
      { accessor: 'invoiceNo', header: 'Invoice No' },
      { accessor: 'noteCategory', header: 'Category' },

      // ✅ Derived columns
      {
        accessor: 'returnDate',
        header: 'Return Date',
        render: (ticket) => (
          <span>{new Date(ticket.returnDate).toLocaleDateString()}</span>
        ),
      },
      {
        accessor: '_id',
        header: 'Items',
        render: (ticket) => (
          <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
            {ticket.items?.length || 0} {ticket.items?.length === 1 ? 'Item' : 'Items'}
          </span>
        ),
      },
    ];

    if (can('return_ticket', 'update') || can('return_ticket', 'delete')) {
      baseColumns.push({
        accessor: '_id',
        header: 'Actions',
        render: (ticket) => (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (ticket._id) toggleActionMenu(ticket._id);
              }}
              className="text-gray-600 hover:text-[#11375d]"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {openMenu === ticket._id && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border rounded-lg shadow-lg z-10">
                {can('return_ticket', 'update') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ticket._id) handleEdit(ticket._id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                )}
                {can('return_ticket', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ticket._id) handleDelete(ticket._id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ),
      });
    }
    return baseColumns;
  }, [openMenu, can]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <RotateCcw className="w-7 h-7 text-red-600" />
          <h1 className="text-3xl font-semibold text-gray-800">
            Return Tickets
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {' '}
          {/* Group Add and Filter buttons */}
          {can('return_ticket', 'create') && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {showFilters ? (
        <>
          {/* Filters */}
          <ReturnTicketFilterBar
            onStatusChange={setStatusFilter}
            onStartDateChange={setStartDateFilter}
            onEndDateChange={setEndDateFilter}
            onClearFilters={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
              setStartDateFilter(undefined);
              setEndDateFilter(undefined);
              setCurrentPage(1); // Reset page on clear
            }}
            initialStatus={statusFilter}
            initialStartDate={startDateFilter}
            initialEndDate={endDateFilter}
          />
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search return tickets..."
            />
          </div>
        </>
      ) : (
        <>
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search return tickets..."
            />
          </div>
        </>
      )}

      {/* Return Tickets Display */}
      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={returnTickets}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalTicketsCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalTicketsPages}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
};

export default ReturnTicketPage;
