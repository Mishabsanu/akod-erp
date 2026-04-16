'use client';

import { DeliveryTicketFilterBar } from '@/components/delivery-ticket/DeliveryTicketFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { DeliveryTicket, DeliveryTicketFilter } from '@/lib/types';
import {
  deleteDeliveryTicket,
  getDeliveryTickets,
} from '@/services/deliveryTicketApi';
import {
  Edit2,
  Filter,
  MoreVertical, // Appropriate icon for Delivery Ticket
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const DeliveryTicketPage = () => {
  // Rename component
  const [deliveryTickets, setDeliveryTickets] = useState<DeliveryTicket[]>([]); // State for delivery tickets
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<DeliveryTicketFilter['status']>(undefined);
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

  const fetchDeliveryTickets = useCallback(async () => {
    // Rename fetch function
    setLoading(true);
    try {
      const filterParams: DeliveryTicketFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
      };

      const response = await getDeliveryTickets(
        filterParams,
        currentPage,
        limit
      ); // Use DeliveryTicket API
      const {
        deliveryTickets: fetchedTickets, // Get deliveryTickets from response
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = response;

      setDeliveryTickets(fetchedTickets || []);
      setTotalTicketsPages(fetchedTotalPages || 1);
      setTotalTicketsCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Failed to fetch delivery tickets:', error);
      toast.error('Failed to load delivery tickets.');
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
    fetchDeliveryTickets();
  }, [fetchDeliveryTickets]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this delivery ticket?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              toast.info('Delivery ticket deletion cancelled.', {
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
              const loadingId = toast.loading('Deleting delivery ticket...');
              try {
                const response = await deleteDeliveryTicket(id); // Use DeliveryTicket API
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(
                    response.message || 'Delivery ticket deleted successfully!'
                  );
                  fetchDeliveryTickets(); // Re-fetch data
                } else {
                  toast.error(
                    response.message || 'Failed to delete delivery ticket.'
                  );
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(
                  error.response?.data?.message ||
                  'Something went wrong while deleting delivery ticket.'
                );
              }
            }}
            className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleAdd = () => router.push('/delivery-ticket/add'); // Update path
  const handleEdit = (id: string) => router.push(`/delivery-ticket/edit/${id}`); // Update path
  const handleRowClick = (ticket: DeliveryTicket) => {
    if (ticket._id) {
      router.push(`/delivery-ticket/${ticket._id}`);
    }
  };

  const columns: Column<DeliveryTicket>[] = useMemo(() => {
    const baseColumns: Column<DeliveryTicket>[] = [
      { accessor: 'ticketNo', header: 'Ticket No' },
      { accessor: 'ticketType', header: 'Ticket Type' },
      { accessor: 'customerName', header: 'Customer' },
      { accessor: 'poNo', header: 'Po No' },
      { accessor: 'invoiceNo', header: 'Invoice No' },
      { accessor: 'noteCategory', header: 'Category' },
      {
        accessor: 'deliveryDate',
        header: 'Delivery Date',
        render: (ticket) => (
          <span>{new Date(ticket.deliveryDate).toLocaleDateString()}</span>
        ),
      },
      {
        accessor: '_id',
        header: 'Items',
        render: (ticket) => (
          <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
            {ticket.items.length} {ticket.items.length === 1 ? 'Item' : 'Items'}
          </span>
        ),
      },
    ];

    if (can('delivery_ticket', 'update') || can('delivery_ticket', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof DeliveryTicket,
        header: 'Actions',
        render: (ticket: DeliveryTicket) => (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (ticket._id) toggleActionMenu(ticket._id);
              }}
              className="text-gray-600 hover:text-[#0f766e] transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenu === ticket._id && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {can('delivery_ticket', 'update') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ticket._id) handleEdit(ticket._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-[#0f766e]" />
                    Edit
                  </button>
                )}
                {can('delivery_ticket', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ticket._id) handleDelete(ticket._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#0f766e] hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
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
      <ListPageHeader
        eyebrow="Inventory Dispatch"
        title="Delivery"
        highlight="Tickets"
        description="Track delivery challans, dispatch records, and customer handovers."
        actions={
          <>
          {can('delivery_ticket', 'create') && (
            <button
              onClick={handleAdd}
              className="page-header-button"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="page-header-button secondary"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          </>
        }
      />

      {showFilters ? (
        <>
          {/* Filters */}
          <DeliveryTicketFilterBar
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
              placeholder="Search delivery tickets..."
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
              placeholder="Search delivery tickets..."
            />
          </div>
        </>
      )}

      {/* Delivery Tickets Display */}
      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={deliveryTickets}
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

export default DeliveryTicketPage;
