'use client';

import React, { useState, useEffect } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { Column, DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { Plus, Edit3, Trash2, Building2, Package, Hash, Image as ImageIcon } from 'lucide-react';
import { getProductions, createProduction, updateProduction, deleteProduction } from '@/services/productionApi';
import FactoryForm from '@/components/FactoryForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { format } from 'date-fns';

function FactoryPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getProductions(page, limit, searchTerm);
      setData(result.productions);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error('Failed to load production logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm]);

  const handleCreate = () => {
    router.push('/production/factory/add');
  };

  const handleEdit = (item: any) => {
    router.push(`/production/factory/edit/${item._id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this production record?')) {
      try {
        await deleteProduction(id);
        toast.success('Record deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };



  const columns: Column<any>[] = [
    {
      accessor: 'productId',
      header: 'Catalog Item',
      render: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-[#b45309] border border-amber-100 shadow-sm transition-transform hover:scale-110">
             <Package size={20} />
          </div>
          <div>
            <div className="font-black text-[#0f172a] text-[15px] tracking-tight leading-none mb-1.5">{row.productId?.name || 'Unknown Item'}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
              <span className="text-[#b45309]">{row.productId?.itemCode || 'CODE-N/A'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessor: 'batchNumber',
      header: 'Cycle Metadata',
      render: (row) => (
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black w-fit mb-2 border border-gray-100 shadow-sm">
             <Hash size={12} className="text-[#b45309]" /> {row.batchNumber}
          </div>
          <div className="flex items-center gap-2">
             <div className="w-1 h-3 bg-[#b45309] rounded-full opacity-40" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{row.shift} OPERATIONAL</span>
          </div>
        </div>
      )
    },
    {
      accessor: 'quantity',
      header: 'Net Volume',
      render: (row) => (
        <div className="flex flex-col">
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0f172a] tracking-tighter tabular-nums">{row.quantity}</span>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{row.productId?.unit}</span>
           </div>
           <div className="w-8 h-1 bg-amber-500/20 rounded-full mt-1" />
        </div>
      )
    },
    {
      accessor: 'manufacturingDate',
      header: 'Timestamp',
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-[#0f172a] tracking-tight">{row.manufacturingDate ? format(new Date(row.manufacturingDate), 'PPP') : 'N/A'}</span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Operational Sync</span>
        </div>
      )
    },
    {
      accessor: 'image',
      header: 'Visual',
      render: (row) => (
        row.image ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-150 cursor-zoom-in">
             <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${row.image}`} alt="Production" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-dashed border-gray-200">
             <ImageIcon size={16} />
          </div>
        )
      )
    },
    {
      accessor: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-[#d97706] hover:bg-[#d97706]/5 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Operational Node"
        title="Production"
        highlight="Terminal"
        description="Real-time telemetry and ledger for manufacturing output and quality metrics."
        actions={
          <button
            onClick={handleCreate}
            className="page-header-button"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        }
      />

      <div className="mb-6 mt-10">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search items by batch number or metadata..."
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

export default withAuth(FactoryPage, [{ module: 'production', action: 'view' }]);
