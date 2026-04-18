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
      header: 'Facility Name',
      render: (f) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            {f.type === 'Office' ? <Briefcase size={16} className="text-blue-600" /> : <Home size={16} className="text-orange-600" />}
          </div>
          <span className="font-bold text-gray-800">{f.name}</span>
        </div>
      )
    },
    { 
      accessor: 'type', 
      header: 'Type',
      render: (f) => <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">{f.type}</span>
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
        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${f.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {f.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (f) => (
        <div className="flex items-center gap-2">
          {can('facility', 'update') && (
            <button onClick={() => router.push(`/facilities/edit/${f._id}`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
          {can('facility', 'delete') && (
            <button onClick={() => handleDelete(f._id!)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
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

      <div className="mt-8">
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
