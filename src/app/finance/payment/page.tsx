'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getPayments, deletePayment } from '@/services/financeApi';
import { Payment, PaymentFilter, Account } from '@/lib/types';
import { DataTable, Column } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { PaymentFilterBar } from '@/components/finance/PaymentFilterBar';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { CreditCard, Plus, Filter, MoreVertical, Edit2, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();
  const { can } = useAuth();

  const [filter, setFilter] = useState<PaymentFilter>({
    search: '',
    type: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchPayments = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getPayments(filter, currentPage, limit, signal);
      setPayments(data.payments);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount || data.payments.length);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPayments(controller.signal);
    return () => controller.abort();
  }, [fetchPayments]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await deletePayment(id);
      toast.success('Payment record deleted successfully');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to delete payment record');
    }
  };

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const columns: Column<Payment>[] = useMemo(() => {
    const baseColumns: Column<Payment>[] = [
      { 
        header: 'Date', 
        accessor: 'date' as keyof Payment,
        render: (item: Payment) => <span className="text-gray-600 font-bold">{new Date(item.date).toLocaleDateString()}</span>
      },
      { 
        header: 'Flow Type', 
        accessor: 'type' as keyof Payment,
        render: (item: Payment) => (
          <div className={`flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
            item.type === 'Received' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {item.type === 'Received' ? <ArrowDownCircle size={10} /> : <ArrowUpCircle size={10} />}
            {item.type}
          </div>
        )
      },
      { 
        header: 'Reference', 
        accessor: 'transactionId' as keyof Payment,
        render: (item: Payment) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.transactionId || 'GENERAL'}</span>
      },
      { 
        header: 'Company', 
        accessor: 'companyName' as keyof Payment,
        render: (item: Payment) => (
          <span className="text-sm font-semibold text-[#11375d]">{item.companyName || '—'}</span>
        )
      },
      { 
        header: 'Amount', 
        accessor: 'amount' as keyof Payment,
        render: (item: Payment) => (
          <span className={`text-sm font-bold ${item.type === 'Received' ? 'text-green-600' : 'text-red-600'}`}>
            {item.type === 'Received' ? '+' : '-'} QAR {item.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )
      },
      {
        header: 'Method',
        accessor: 'paymentMethod' as keyof Payment,
        render: (item: Payment) => <span className="text-xs font-bold text-gray-500 italic">{item.paymentMethod}</span>
      }
    ];

    baseColumns.push({
      accessor: '_id' as keyof Payment,
      header: 'Actions',
      render: (payment) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (payment._id) toggleActionMenu(payment._id);
            }}
            className="text-gray-600 hover:text-[#11375d] transition p-1 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {openMenu === payment._id && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/finance/payment/edit/${payment._id}`);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 text-[#11375d]" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (payment._id) handleDelete(payment._id);
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
          <CreditCard className="w-7 h-7 text-red-600" />
          <h1 className="text-3xl font-semibold text-gray-800">
            Payment Registry
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/finance/payment/add')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Post Payment
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
        <PaymentFilterBar 
          onTypeChange={useCallback((val) => setFilter(prev => ({ ...prev, type: val })), [])}
          onStartDateChange={useCallback((val) => setFilter(prev => ({ ...prev, startDate: val })), [])}
          onEndDateChange={useCallback((val) => setFilter(prev => ({ ...prev, endDate: val })), [])}
          onCompanyNameChange={useCallback((val) => setFilter(prev => ({ ...prev, companyName: val })), [])}
          onClearFilters={useCallback(() => {
            setFilter({ search: '', companyName: undefined });
            setCurrentPage(1);
          }, [])}
          initialType={filter.type}
          initialCompanyName={filter.companyName}
          initialStartDate={filter.startDate}
          initialEndDate={filter.endDate}
        />
      </div>

      {/* Persistent Search Input */}
      <div className="mb-6">
        <SearchInput 
          placeholder="Search payments..." 
          onSearchChange={useCallback((val: string) => setFilter(prev => ({ ...prev, search: val })), [])}
        />
      </div>

      {/* Main Table Area */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          onRowClick={(item) => router.push(`/finance/payment/edit/${item._id}`)}
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


