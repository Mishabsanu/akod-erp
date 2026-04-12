'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getInvoices, deleteInvoice } from '@/services/financeApi';
import { Invoice, InvoiceFilter, Customer } from '@/lib/types';
import { DataTable, Column } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { InvoiceFilterBar } from '@/components/finance/InvoiceFilterBar';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { FileText, Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function InvoicesPage() {
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const columns: Column<Invoice>[] = useMemo(() => {
    const baseColumns: Column<Invoice>[] = [
      { 
        header: 'Invoice #', 
        accessor: 'invoiceNo' as keyof Invoice,
        render: (item: Invoice) => <span className="font-bold text-[#11375d] uppercase">{item.invoiceNo}</span>
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
          <span className="font-bold text-gray-950">
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
            Paid: 'bg-green-50 text-green-700',
            Draft: 'bg-gray-100 text-gray-600',
            Sent: 'bg-blue-50 text-blue-700',
            Overdue: 'bg-red-50 text-red-700',
            'Partially Paid': 'bg-orange-50 text-orange-700',
          };
          return (
            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors[val] || 'bg-gray-50 text-gray-600'}`}>
              {val}
            </span>
          );
        }
      }
    ];

    baseColumns.push({
      accessor: '_id' as keyof Invoice,
      header: 'Actions',
      render: (invoice) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (invoice._id) toggleActionMenu(invoice._id);
            }}
            className="text-gray-600 hover:text-[#11375d] transition p-1 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {openMenu === invoice._id && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/finance/invoices/edit/${invoice._id}`);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 text-[#11375d]" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (invoice._id) handleDelete(invoice._id);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#cc1518] hover:bg-gray-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    });

    return baseColumns;
  }, [openMenu, router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      {/* Header matching Sales module */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <FileText className="w-7 h-7 text-red-600" />
          <h1 className="text-3xl font-semibold text-gray-800">
            Invoice Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/finance/invoices/add')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

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
          onRowClick={(item) => router.push(`/finance/invoices/edit/${item._id}`)}
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
