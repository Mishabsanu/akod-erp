'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getInvoices, deleteInvoice } from '@/services/financeApi';
import { Invoice, InvoiceFilter, Customer } from '@/lib/types';
import { DataTable, Column } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { InvoiceFilterBar } from '@/components/finance/InvoiceFilterBar';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';

function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();
  const { can } = useAuth();

  const [filter, setFilter] = useState<InvoiceFilter>({
    search: '',
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchInvoices = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getInvoices(filter, currentPage, limit, signal);
      setInvoices(data.invoices);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount || data.invoices.length);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchInvoices(controller.signal);
    return () => controller.abort();
  }, [fetchInvoices]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch {
      toast.error('Failed to delete invoice');
    }
  }, [fetchInvoices]);

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const columns: Column<Invoice>[] = useMemo(() => {
    const baseColumns: Column<Invoice>[] = [
      {
        header: 'Invoice #',
        accessor: 'invoiceNo' as keyof Invoice,
        render: (item: Invoice) => <span className="font-bold text-[#0f766e] uppercase tracking-wider">{item.invoiceNo}</span>
      },
      {
        header: 'Customer',
        accessor: 'customerId' as keyof Invoice,
        render: (item: Invoice) => {
          const val = item.customerId;
          const customer = typeof val === 'object' ? val as Customer : null;
          return (
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{customer ? customer.company : 'N/A'}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{customer?.name}</span>
            </div>
          );
        }
      },
      {
        header: 'Registry Date',
        accessor: 'date' as keyof Invoice,
        render: (item: Invoice) => <span className="text-gray-600 font-bold">{new Date(item.date).toLocaleDateString()}</span>
      },
      {
        header: 'Net Total',
        accessor: 'totalAmount' as keyof Invoice,
        render: (item: Invoice) => (
          <span className="font-bold text-[#0f766e]">
            QAR {item.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )
      },
      {
        header: 'Status',
        accessor: 'status' as keyof Invoice,
        render: (item: Invoice) => {
          const val = item.status;

          const colors: Record<string, string> = {
            Paid: 'bg-[#0f766e] text-white',
            Draft: 'bg-gray-100 text-gray-600',
            Sent: 'bg-sky-50 text-sky-700',
            Overdue: 'bg-teal-50 text-teal-800',
            'Partially Paid': 'bg-orange-50 text-orange-700',
          };

          return (
            <span
              className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors[val] || 'bg-gray-50 text-gray-600'
                }`}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (item: Invoice) => (
          <span className="text-sm font-medium text-gray-600">
            {typeof item.createdBy === 'object' ? item.createdBy.name : item.createdBy || '--'}
          </span>
        ),
      },
      {
        accessor: 'createdAt',
        header: 'Date Created',
        render: (item: Invoice) => (
          <span className="text-sm font-medium text-gray-600">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
          </span>
        ),
      },
    ];

    baseColumns.push({
      accessor: '_id' as keyof Invoice,
      header: 'Actions',
      render: (invoice) => (
        <div className="flex items-center gap-2">
          {can('invoice', 'update') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (invoice._id) router.push(`/finance/invoices/edit/${invoice._id}`);
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {can('invoice', 'delete') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (invoice._id) handleDelete(invoice._id);
              }}
              className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    });

    return baseColumns;
  }, [openMenu, router, can, handleDelete]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Finance Registry"
        title="Invoice"
        highlight="Management"
        description="Track customer invoices, due status, and billing records."
        actions={
          <>
            {can('invoice', 'create') && (
              <button
                onClick={() => router.push('/finance/invoices/add')}
                className="page-header-button"
              >
                <Plus className="w-4 h-4" />
                Create Invoice
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="page-header-button secondary"
            >
              <Filter size={18} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </>
        }
      />

      {/* Persistent Filters Section */}
      <div className={showFilters ? 'block mb-6' : 'hidden'}>
        <InvoiceFilterBar
          onStatusChange={useCallback((status) => setFilter(prev => ({ ...prev, status })), [])}
          onStartDateChange={useCallback((val) => setFilter(prev => ({ ...prev, startDate: val })), [])}
          onEndDateChange={useCallback((val) => setFilter(prev => ({ ...prev, endDate: val })), [])}
          onClearFilters={useCallback(() => {
            setFilter({ search: '' });
            setCurrentPage(1);
          }, [])}
          initialStatus={filter.status}
          initialStartDate={filter.startDate}
          initialEndDate={filter.endDate}
        />
      </div>

      {/* Persistent Search Input */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search invoices..."
          onSearchChange={useCallback((val: string) => setFilter(prev => ({ ...prev, search: val })), [])}
        />
      </div>

      {/* Main Table Area */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          onRowClick={(item) => {
            if (can('invoice', 'update')) {
              router.push(`/finance/invoices/edit/${item._id}`);
            }
          }}
          serverSidePagination={true}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
}

export default withAuth(InvoicesPage, [{ module: 'invoice', action: 'view' }]);
