'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getExpenses, deleteExpense } from '@/services/financeApi';
import { Expense, ExpenseFilter } from '@/lib/types';
import { DataTable, Column } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { ExpenseFilterBar } from '@/components/finance/ExpenseFilterBar';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { Plus, Filter, MoreVertical, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { approveExpense } from '@/services/financeApi';

function ExpensesPage() {
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

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense record deleted successfully');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense record');
    }
  }, [fetchExpenses]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await approveExpense(id);
      toast.success('Expense record approved and added to ledger');
      fetchExpenses();
    } catch {
      toast.error('Failed to approve expense record');
    }
  }, [fetchExpenses]);

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
          <span className="text-sm font-semibold text-[#0f766e]">{item.companyName || '—'}</span>
        )
      },
      { 
        header: 'Net Amount', 
        accessor: 'totalAmount' as keyof Expense,
        render: (item: Expense) => (
          <span className="font-bold text-[#0f766e]">
            {item.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )
      },
      {
        header: 'Status',
        accessor: 'status' as keyof Expense,
        render: (item: Expense) => (
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-center ${
              item.status === 'paid' ? 'bg-[#0f766e] text-white' : item.status === 'pending' ? 'bg-orange-50 text-orange-700' : 'bg-teal-50 text-teal-800'
            }`}>
              {item.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-center border ${
               item.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
            }`}>
               {item.isApproved ? 'Approved' : 'Unverified'}
            </span>
          </div>
        )
      },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (item: Expense) => (
          <span className="text-sm font-medium text-gray-600">
            {typeof item.createdBy === 'object' ? item.createdBy.name : item.createdBy || '--'}
          </span>
        ),
      },
      {
        accessor: 'createdAt',
        header: 'Date Created',
        render: (item: Expense) => (
          <span className="text-sm font-medium text-gray-600">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
          </span>
        ),
      },
    ];

    baseColumns.push({
      accessor: '_id' as keyof Expense,
      header: 'Actions',
      render: (expense) => (
        <div className="flex items-center gap-2">
           {can('expense', 'update') && !expense.isApproved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (expense._id) handleApprove(expense._id);
              }}
              className="w-9 h-9 flex items-center justify-center text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-gray-100 hover:border-emerald-200"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {can('expense', 'update') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/finance/expenses/edit/${expense._id}`);
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {can('expense', 'delete') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (expense._id) handleDelete(expense._id);
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
        eyebrow="Expense Ledger"
        title="Expense"
        highlight="Management"
        description="Log, review, and reconcile outgoing company expenses."
        actions={
          <>
          {can('expense', 'create') && (
            <button 
              onClick={() => router.push('/finance/expenses/add')}
              className="page-header-button"
            >
              <Plus className="w-4 h-4" />
              Add Expense
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
          onRowClick={(item) => {
            if (can('expense', 'update')) {
              router.push(`/finance/expenses/edit/${item._id}`);
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

export default withAuth(ExpensesPage, [{ module: 'expense', action: 'view' }]);
