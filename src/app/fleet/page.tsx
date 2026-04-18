'use client';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/lib/types';
import { deleteVehicle, getVehicles } from '@/services/fleetApi';
import {
  Edit2,
  Filter,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState(false);
  const { can } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVehicles({
        search: searchTerm || undefined,
        page: currentPage,
        limit,
      });
      setVehicles(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load fleet data.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, limit]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle from fleet?')) return;
    try {
      await deleteVehicle(id);
      toast.success('Vehicle removed successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  const columns: Column<Vehicle>[] = useMemo(() => [
    { 
      accessor: 'name', 
      header: 'Vehicle Name',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Truck size={16} className="text-gray-600" />
          </div>
          <span className="font-bold text-gray-800">{v.name}</span>
        </div>
      )
    },
    { accessor: 'plateNo', header: 'Plate Number', render: (v) => <span className="font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">{v.plateNo}</span> },
    { accessor: 'type', header: 'Type' },
    { accessor: 'model', header: 'Model/Year', render: (v) => <span>{v.model || '-'} {v.year ? `(${v.year})` : ''}</span> },
    { 
      accessor: 'odometer', 
      header: 'Last Odometer',
      render: (v) => <span className="font-mono text-emerald-600 font-bold">{v.odometer.toLocaleString()} km</span>
    },
    {
      accessor: 'status',
      header: 'Status',
      render: (v) => {
        const colors = {
          active: 'bg-green-100 text-green-800',
          maintenance: 'bg-amber-100 text-amber-800',
          inactive: 'bg-red-100 text-red-800'
        };
        return <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full ${colors[v.status]}`}>{v.status}</span>
      }
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (v) => (
        <div className="flex items-center gap-2">
          {can('fleet', 'update') && (
            <button onClick={() => router.push(`/fleet/edit/${v._id}`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-teal-600 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
          {can('fleet', 'delete') && (
            <button onClick={() => handleDelete(v._id!)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
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
        eyebrow="Fleet Management"
        title="Vehicle"
        highlight="Registry"
        description="Manage company vehicles, track condition, and maintenance status."
        actions={
          <>
            {can('fleet', 'create') && (
              <button onClick={() => router.push('/fleet/add')} className="page-header-button">
                <Plus size={16} /> Add Vehicle
              </button>
            )}
            <button
               onClick={() => setShowFilters(!showFilters)}
               className="page-header-button secondary"
            >
              <Filter size={16} /> Filters
            </button>
          </>
        }
      />

      <div className="mb-6">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, plate number or model..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={vehicles}
          serverSidePagination={true}
          totalCount={totalCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
};

export default withAuth(FleetPage, [{ module: 'fleet', action: 'view' }]);
