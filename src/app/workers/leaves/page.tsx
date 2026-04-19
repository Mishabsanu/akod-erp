'use client';

import React, { useState, useEffect } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { Column, DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { Plus, Edit3, Trash2, Calendar, User, FileText, CheckCircle, XCircle, Clock, Paperclip, Filter } from 'lucide-react';
import { getLeaves, createLeave, updateLeave, deleteLeave } from '@/services/leaveApi';
import LeaveForm from '@/components/LeaveForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { format } from 'date-fns';

function LeavePage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getLeaves(page, limit, searchTerm, statusFilter);
      setData(result.leaves);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm, statusFilter]);

  const handleCreate = () => {
    router.push('/workers/leaves/add');
  };

  const handleEdit = (item: any) => {
    router.push(`/workers/leaves/edit/${item._id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      try {
        await deleteLeave(id);
        toast.success('Record deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 shadow-sm shadow-emerald-500/5 transition-all hover:scale-105 active:scale-95 cursor-default">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Authorized
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100 shadow-sm shadow-rose-500/5 transition-all hover:scale-105 active:scale-95 cursor-default">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100 shadow-sm shadow-amber-500/5 transition-all hover:scale-105 active:scale-95 cursor-default">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Pending
          </span>
        );
    }
  };

  const columns: Column<any>[] = [
    {
      accessor: 'workerId',
      header: 'Staff Member',
      render: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-11 h-11 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-900/10">
             {row.workerId?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-black text-[#0f172a] text-[0.9rem] tracking-tight leading-none mb-1.5">{row.workerId?.name || 'Unknown Staff'}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
              <span className="text-[#0f766e]">{row.workerId?.workerId || 'N/A'}</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              {row.workerId?.designation || 'Staff'}
            </div>
          </div>
        </div>
      )
    },
    {
      accessor: 'type',
      header: 'Classification',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[15px] font-black text-[#0f172a] tracking-tight mb-1">{row.type}</span>
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-[#0f766e] rounded-full opacity-40" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Usage Category</span>
          </div>
        </div>
      )
    },
    {
      accessor: 'dates',
      header: 'Temporal Window',
      render: (row) => (
        <div className="flex flex-col">
          <div className="text-[13px] font-black text-[#0f172a] flex items-center gap-2 tracking-tight">
             <Calendar size={14} className="text-[#0f766e]" strokeWidth={2.5} />
             {row.startDate && row.endDate ? (
               `${format(new Date(row.startDate), 'MMM dd')} — ${format(new Date(row.endDate), 'MMM dd, yyyy')}`
             ) : (
               'Indeterminate'
             )}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1.5 opacity-60">Absence Cycle</p>
        </div>
      )
    },
    {
      accessor: 'status',
      header: 'Verification',
      render: (row) => getStatusBadge(row.status)
    },
    {
      accessor: 'attachment',
      header: 'Registry',
      render: (row) => (
        <div className="flex justify-center">
          {row.attachment ? (
            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${row.attachment}`} target="_blank" className="w-10 h-10 bg-gray-50 text-[#0f766e] rounded-2xl hover:bg-[#0f766e] hover:text-white transition-all duration-500 flex items-center justify-center border border-gray-100 shadow-sm active:scale-90">
               <Paperclip size={18} strokeWidth={2.5} />
            </a>
          ) : (
            <div className="w-10 h-10 bg-gray-50/50 text-gray-200 rounded-2xl flex items-center justify-center border border-dashed border-gray-100 italic font-black text-[9px] uppercase">
               Empty
            </div>
          )}
        </div>
      )
    },
    {
      accessor: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(row)} className="p-2.5 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors shadow-sm">
            <Edit3 size={16} />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Workforce Node"
        title="Presence"
        highlight="Registry"
        description="Centralized ledger for managing personnel absences and vacation cycles."
        actions={
          <>
            <button
              onClick={handleCreate}
              className="page-header-button"
            >
              <Plus className="w-4 h-4" />
              Register Leave
            </button>
            <button
               onClick={() => setShowFilters(!showFilters)}
               className="page-header-button secondary"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide States' : 'Filter States'}
            </button>
          </>
        }
      />

      {showFilters && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl mb-8 animate-in slide-in-from-top-2 duration-300">
           <div className="flex flex-wrap items-center gap-2">
              {['', 'Pending', 'Approved', 'Rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${statusFilter === s ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-amber-50'}`}
                >
                  {s || 'All States'}
                </button>
              ))}
           </div>
        </div>
      )}

      <div className="mb-6 mt-10">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by worker name..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          totalCount={totalCount}
          currentPage={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          serverSidePagination={true}
        />
      )}
    </div>
  );
}

export default withAuth(LeavePage, [{ module: 'leave', action: 'view' }]);
