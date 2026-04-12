'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getExpenses, deleteExpense } from '@/services/financeApi';
import { Expense, ExpenseFilter, Account } from '@/lib/types';
import { DataTable, Column } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { ExpenseFilterBar } from '@/components/finance/ExpenseFilterBar';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Wallet, Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();
  const { can } = useAuth();

  const [filter, setFilter] = useState<ExpenseFilter>({
    search: '',
    category: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchExpenses = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getExpenses(filter, currentPage, limit, signal);
      setExpenses(data.expenses);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount || data.expenses.length);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchExpenses(controller.signal);
    return () => controller.abort();
  }, [fetchExpenses]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense record deleted successfully');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense record');
    }
  };

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const columns: Column<Expense>[] = useMemo(() => {
    const baseColumns: Column<Expense>[] = [
      { 
        header: 'Date', 
        accessor: 'date' as keyof Expense,
        render: (item: Expense) => <span className="text-gray-600 font-bold">{new Date(item.date).toLocaleDateString()}</span>
      },
      { 
        header: 'Category', 
        accessor: 'category' as keyof Expense,
        render: (item: Expense) => (
          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-purple-100">
            {item.category}
          </span>
        )
      },
      { 
        header: 'Details', 
        accessor: 'description' as keyof Expense,
        render: (item: Expense) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 truncate max-w-[200px]">{item.description || 'No description'}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Ref: {item.referenceNo || 'N/A'}</span>
          </div>
        )
      },
      { 
        header: 'Company', 
        accessor: 'companyName' as keyof Expense,
        render: (item: Expense) => (
          <span className="text-sm font-semibold text-[#11375d]">{item.companyName || '—'}</span>
        )
      },
      { 
        header: 'Net Amount', 
        accessor: 'totalAmount' as keyof Expense,
        render: (item: Expense) => (
          <span className="font-bold text-gray-900">
            QAR {item.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )
      },
      {
        header: 'Status',
        accessor: 'status' as keyof Expense,
        render: (item: Expense) => (
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            item.status === 'paid' ? 'bg-green-50 text-green-700' : item.status === 'pending' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
          }`}>
            {item.status}
          </span>
        )
      }
    ];

    baseColumns.push({
      accessor: '_id' as keyof Expense,
      header: 'Actions',
      render: (expense) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (expense._id) toggleActionMenu(expense._id);
            }}
            className="text-gray-600 hover:text-[#11375d] transition p-1 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {openMenu === expense._id && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/finance/expenses/edit/${expense._id}`);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 text-[#11375d]" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (expense._id) handleDelete(expense._id);
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
          <Wallet className="w-7 h-7 text-red-600" />
          <h1 className="text-3xl font-semibold text-gray-800">
            Expense Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/finance/expenses/add')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Expense
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
        <ExpenseFilterBar 
          onCategoryChange={useCallback((val) => setFilter(prev => ({ ...prev, category: val })), [])}
          onStatusChange={useCallback((val) => setFilter(prev => ({ ...prev, status: val })), [])}
          onStartDateChange={useCallback((val) => setFilter(prev => ({ ...prev, startDate: val })), [])}
          onEndDateChange={useCallback((val) => setFilter(prev => ({ ...prev, endDate: val })), [])}
          onCompanyNameChange={useCallback((val) => setFilter(prev => ({ ...prev, companyName: val })), [])}
          onClearFilters={useCallback(() => {
            setFilter({ search: '', companyName: undefined });
            setCurrentPage(1);
          }, [])}
          initialCategory={filter.category}
          initialStatus={filter.status}
          initialCompanyName={filter.companyName}
          initialStartDate={filter.startDate}
          initialEndDate={filter.endDate}
        />
      </div>

      {/* Persistent Search and Table Area */}
      <div className="mb-6">
        <SearchInput 
          placeholder="Search expenses..." 
          onSearchChange={useCallback((val: string) => setFilter(prev => ({ ...prev, search: val })), [])}
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={expenses}
          onRowClick={(item) => router.push(`/finance/expenses/edit/${item._id}`)}
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
