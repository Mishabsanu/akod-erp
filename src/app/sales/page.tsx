'use client';

import { SalesFilterBar } from '@/components/sales/SalesFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { Sale, SaleFilter } from '@/lib/types';
import { deleteSale, getSales } from '@/services/salesApi';
import {
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
  TrendingUp,
  Upload,
} from 'lucide-react';

import ImportSheetModal from '@/components/Modal/ImportSheetModal';
import StatusUpdateModal from '@/components/StatusUpdateModal';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'New Lead': '#2563eb',
    'Call Required': '#0ea5e9',
    Contacted: '#8b5cf6',
    'Follow-Up': '#d946ef',
    'Quotation Sent': '#f59e0b',
    Negotiation: '#f97316',
    Interested: '#16a34a',
    'Not Interested': '#ef4444',
    'On Hold': '#64748b',
    'PO Received': '#059669',
    'Payment Pending': '#eab308',
    Processing: '#06b6d4',
    Shipped: '#6366f1',
    Delivered: '#10b981',
    'Request to Developer': '#8b5cf6',
  };
  return colors[status] || '#6b7280';
};

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const { can } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filter, setFilter] = useState<SaleFilter>({
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    nextFollowUpDate: undefined,
  });

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const {
        sales: fetchedSales,
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = await getSales(
        { ...filter, search: debouncedSearchTerm || undefined },
        currentPage,
        limit
      );
      setSales(fetchedSales || []);
      setTotalPages(fetchedTotalPages || 1);
      setTotalCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast.error('Failed to load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleDelete = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">
            Are you sure you want to delete this enquiry record?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                const loadingId = toast.loading('Deleting enquiry...');
                try {
                  const response = await deleteSale(id);
                  toast.dismiss(loadingId);
                  if (response.success) {
                    toast.success('Enquiry deleted successfully!');
                    fetchSales();
                  } else {
                    toast.error(response.message || 'Failed to delete enquiry.');
                  }
                } catch (error: any) {
                  toast.dismiss(loadingId);
                  toast.error(
                    error.response?.data?.message ||
                    'Something went wrong while deleting.'
                  );
                }
              }}
              className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      { id: 'delete-confirm', duration: Infinity, position: 'top-right' }
    );
  };

  const columns: Column<Sale>[] = useMemo(() => {
    const baseColumns: Column<Sale>[] = [
      { accessor: 'ticketNo', header: 'Ticket No' },
      { accessor: 'companyName', header: 'Company' },
      { accessor: 'name', header: 'Contact Person' },
      { accessor: 'contactPersonMobile', header: 'Mobile' },
      {
        accessor: 'platform',
        header: 'Platform',
        render: (sale) => (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-gray-100 text-gray-700 border border-gray-200">
            {sale.platform || '-'}
          </span>
        ),
      },
      { accessor: 'date', header: 'Enquiry Date' },
      {
        accessor: 'status',
        header: 'Status',
        render: (sale) => (
          <span
            className="px-3 py-1 text-[11px] font-bold rounded-full text-white inline-block shadow-sm"
            style={{ backgroundColor: getStatusColor(sale.status || '') }}
          >
            {sale.status}
          </span>
        ),
      },
    ];

    if (can('sales', 'update') || can('sales', 'delete')) {
      baseColumns.push({
        accessor: '_id' as keyof Sale,
        header: 'Actions',
        render: (sale) => (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (sale._id) toggleActionMenu(sale._id);
              }}
              className="text-gray-600 hover:text-[#0f766e] transition p-1 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenu === sale._id && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSale(sale);
                    setShowStatusModal(true);
                    setOpenMenu(null);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-sky-700 hover:bg-gray-50"
                >
                  <TrendingUp className="w-4 h-4" />
                  Update Status
                </button>
                {can('sales', 'update') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/sales/edit/${sale._id}`);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-[#0f766e]" />
                    Edit
                  </button>
                )}
                {can('sales', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sale._id) handleDelete(sale._id);
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
  }, [openMenu, can, router]);

  const handleRowClick = (sale: Sale) => {
    if (sale._id) router.push(`/sales/${sale._id}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="CRM Pipeline"
        title="Enquiry"
        highlight="Management"
        description="Track leads, follow-ups, enquiry status, and customer conversations."
        actions={
          <>
          <button
            onClick={() => setShowImport(true)}
            className="page-header-button secondary"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          {can('sales', 'create') && (
            <button
              onClick={() => router.push('/sales/add')}
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

      {/* Persistent Filters Section */}
      <div className={showFilters ? 'block mb-6' : 'hidden'}>
        <SalesFilterBar
          onStatusChange={useCallback((status) => setFilter(prev => ({ ...prev, status })), [])}
          onStartDateChange={useCallback((startDate) => setFilter(prev => ({ ...prev, startDate })), [])}
          onEndDateChange={useCallback((endDate) => setFilter(prev => ({ ...prev, endDate })), [])}
          onFollowUpDateChange={useCallback((nextFollowUpDate) => setFilter(prev => ({ ...prev, nextFollowUpDate })), [])}
          onClearFilters={useCallback(() => {
            setFilter({
              status: undefined,
              startDate: undefined,
              endDate: undefined,
              nextFollowUpDate: undefined,
            });
            setSearchTerm('');
            setCurrentPage(1);
          }, [])}
          initialStatus={filter.status}
          initialStartDate={filter.startDate}
          initialEndDate={filter.endDate}
          initialFollowUpDate={filter.nextFollowUpDate}
        />
      </div>

      {/* Persistent Search Input */}
      <div className="mb-6">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={useCallback((val: string) => setSearchTerm(val), [])}
          placeholder="Search enquiries by company, name, email or mobile..."
        />
      </div>

      {/* Main Table Area */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={sales}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}

      {showStatusModal && selectedSale && (
        <StatusUpdateModal
          sale={selectedSale}
          onClose={() => setShowStatusModal(false)}
          onUpdated={fetchSales}
        />
      )}

      {showImport && (
        <ImportSheetModal
          onClose={() => setShowImport(false)}
          onImported={fetchSales}
        />
      )}
    </div>
  );
};

export default withAuth(SalesPage, [{ module: 'sales', action: 'view' }]);
