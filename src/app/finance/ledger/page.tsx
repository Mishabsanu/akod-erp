'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getLedger } from '@/services/financeApi';
import { LedgerEntry, LedgerFilter } from '@/lib/types';
import { DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { LedgerFilterBar } from '@/components/finance/LedgerFilterBar';
import { Database, Filter, Download, Printer, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    openingBalance: 0,
    closingBalance: 0
  });

  const [filter, setFilter] = useState<LedgerFilter>({
    search: '',
    companyName: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchLedger = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getLedger(filter, currentPage, 10, signal);
      setEntries(data.entries);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setStats({
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
        openingBalance: data.openingBalance || 0,
        closingBalance: data.closingBalance || 0
      });
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      toast.error('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLedger(controller.signal);
    return () => controller.abort();
  }, [fetchLedger]);

  const columns = [
    {
      header: 'Date',
      accessor: 'date' as keyof LedgerEntry,
      render: (item: LedgerEntry) => <span className="text-gray-600 font-medium">{item.date}</span>
    },
    {
      header: 'Company / Project',
      accessor: 'companyName' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <span className="text-sm font-semibold text-[#0f766e]">{item.companyName || '—'}</span>
      )
    },
    {
      header: 'Description',
      accessor: 'description' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">{item.description}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.referenceType}: {item.referenceId || 'Manual'}</span>
        </div>
      )
    },
    {
      header: 'Debit',
      accessor: 'debit' as keyof LedgerEntry,
      render: (item: LedgerEntry) => item.debit > 0 ? (
        <span className="font-semibold text-teal-700">
          QAR {item.debit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ) : <span className="text-gray-300">—</span>
    },
    {
      header: 'Credit',
      accessor: 'credit' as keyof LedgerEntry,
      render: (item: LedgerEntry) => item.credit > 0 ? (
        <span className="font-semibold text-green-600">
          QAR {item.credit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ) : <span className="text-gray-300">—</span>
    },
    {
      header: 'Balance',
      accessor: 'balance' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
          QAR {item.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Finance Audit"
        title="General"
        highlight="Ledger"
        description="Audit debits, credits, references, and closing balance history."
        actions={
          <>
          <button className="page-header-button secondary">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="page-header-button secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
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

      {/* Persistent Summary Stats */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Opening Balance</span>
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><Database size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">QAR {stats.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-t-4 border-t-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Total In (Credit)</span>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><PieChart size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">QAR {stats.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-t-4 border-t-teal-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Total Out (Debit)</span>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-700"><PieChart size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">QAR {stats.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-sky-500 bg-sky-50/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Closing Balance</span>
            <div className="p-2 bg-sky-50 rounded-lg text-sky-600"><Database size={16} /></div>
          </div>
          <p className={`text-2xl font-bold ${stats.closingBalance >= 0 ? 'text-green-600' : 'text-teal-700'}`}>
            QAR {stats.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className={showFilters ? 'block mb-6' : 'hidden'}>
        <LedgerFilterBar
          onCompanyChange={useCallback((val) => setFilter(prev => ({ ...prev, companyName: val })), [])}
          onStartDateChange={useCallback((val) => setFilter(prev => ({ ...prev, startDate: val })), [])}
          onEndDateChange={useCallback((val) => setFilter(prev => ({ ...prev, endDate: val })), [])}
          onClearFilters={useCallback(() => {
            setFilter({ search: '', companyName: undefined, startDate: undefined, endDate: undefined });
            setCurrentPage(1);
          }, [])}
          initialCompanyName={filter.companyName}
          initialStartDate={filter.startDate}
          initialEndDate={filter.endDate}
        />
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search auditing trail by description, reference type or ID..."
          onSearchChange={useCallback((val: string) => setFilter(prev => ({ ...prev, search: val })), [])}
        />
      </div>

      {/* Main Table Area */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl w-full" />)}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={entries}
          serverSidePagination={true}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          limit={10}
          onPageChange={setCurrentPage}
          onLimitChange={() => { }}
        />
      )}
    </div>
  );
}

export default withAuth(LedgerPage, [{ module: 'ledger', action: 'view' }]);
