'use client';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Facility } from '@/lib/types';
import { getFacilities, deleteFacility } from '@/services/facilityApi';
import {
  Building2,
  Edit2,
  Plus,
  Trash2,
  MapPin,
  Home,
  Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { can } = useAuth();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFacilities({
        page: currentPage,
        limit,
      });
      setFacilities(response.data.content);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    try {
      await deleteFacility(id);
      toast.success('Facility deleted');
      fetchFacilities();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const columns: Column<Facility>[] = useMemo(() => [
    {
      accessor: 'name',
      header: 'Infrastructure Asset',
      render: (f) => (
        <div className="flex items-center gap-4 py-2">
          <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border transition-all hover:scale-110 shadow-sm ${f.type === 'Office' ? 'bg-[#0f766e]/5 border-[#0f766e]/20 text-[#0f766e]' : 'bg-[#d97706]/5 border-[#d97706]/20 text-[#d97706]'}`}>
            {f.type === 'Office' ? <Briefcase size={22} strokeWidth={2.5} /> : <Home size={22} strokeWidth={2.5} />}
          </div>
          <div>
            <div className="font-black text-[#0f172a] text-[15px] tracking-tight leading-none mb-1.5">{f.name}</div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
              <span className={f.type === 'Office' ? 'text-[#0f766e]' : 'text-[#d97706]'}>{f.type} NODE</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      accessor: 'type', 
      header: 'Logistics Type',
      render: (f) => (
        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border ${f.type === 'Office' ? 'bg-[#0f766e]/5 text-[#0f766e] border-[#0f766e]/10' : 'bg-[#d97706]/5 text-[#d97706] border-[#d97706]/10'}`}>
           {f.type} UNIT
        </span>
      )
    },
    { 
      accessor: 'location', 
      header: 'Location',
      render: (f) => (
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin size={12} />
          <span className="text-xs">{f.location || 'Not Specified'}</span>
        </div>
      )
    },
    { accessor: 'capacity', header: 'Capacity', render: (f) => <span className="font-bold text-gray-600">{f.capacity || '--'}</span> },
    {
      accessor: 'status',
      header: 'Status',
      render: (f) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${f.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${f.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {f.status}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (f) => (
        <div className="flex items-center gap-2 justify-end">
          {can('facility', 'update') && (
            <button
               onClick={() => router.push(`/facilities/edit/${f._id}`)}
               className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-[#d97706] hover:bg-[#d97706]/5 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
            >
              <Edit2 size={16} />
            </button>
          )}
          {can('facility', 'delete') && (
            <button
               onClick={() => handleDelete(f._id!)}
               className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ], [can]);

  return (
    <div className="min-h-screen w-full bg-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Facilities & Infrastructure"
        title="Offices"
        highlight="& Camps"
        description="Manage company locations, worker camps, and administrative offices."
        actions={
          <button onClick={() => router.push('/facilities/add')} className="page-header-button">
            <Plus size={16} /> Add Facility
          </button>
        }
      />

      <div className="mt-12 bg-white/30 backdrop-blur-sm">
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={facilities}
            serverSidePagination={true}
            totalCount={totalCount}
            currentPage={currentPage}
            limit={limit}
            totalPages={Math.ceil(totalCount / limit)}
            onPageChange={setCurrentPage}
            onLimitChange={setLimit}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(FacilitiesPage, [{ module: 'facility', action: 'view' }]);
