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
      accessor: 'registrationExpiry',
      header: 'Registration',
      render: (v) => {
        if (!v.registrationExpiry) return <span className="text-gray-300 text-[10px] font-black uppercase">Not Set</span>;
        const expiry = new Date(v.registrationExpiry);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let colorClass = "text-gray-500 bg-gray-50 border-gray-100";
        if (diffDays < 0) colorClass = "text-rose-600 bg-rose-50 border-rose-100 animate-pulse";
        else if (diffDays < 30) colorClass = "text-amber-600 bg-amber-50 border-amber-100";

        return (
          <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-0.5 ${colorClass}`}>
            <span className="uppercase tracking-widest text-[8px] opacity-70">{diffDays < 0 ? 'Expired' : 'Expiry'}</span>
            <span>{new Date(v.registrationExpiry).toLocaleDateString()}</span>
          </div>
        );
      }
    },
    {
      accessor: 'insuranceExpiry',
      header: 'Insurance',
      render: (v) => {
        if (!v.insuranceExpiry) return <span className="text-gray-300 text-[10px] font-black uppercase">Not Set</span>;
        const expiry = new Date(v.insuranceExpiry);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let colorClass = "text-gray-500 bg-gray-50 border-gray-100";
        if (diffDays < 0) colorClass = "text-rose-600 bg-rose-50 border-rose-100 animate-pulse";
        else if (diffDays < 30) colorClass = "text-amber-600 bg-amber-50 border-amber-100";

        return (
          <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-0.5 ${colorClass}`}>
            <span className="uppercase tracking-widest text-[8px] opacity-70">{diffDays < 0 ? 'Expired' : 'Expiry'}</span>
            <span>{new Date(v.insuranceExpiry).toLocaleDateString()}</span>
          </div>
        );
      }
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
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-full mx-auto space-y-10">
        <ListPageHeader
          eyebrow="Logistics Node"
          title="Vehicle"
          highlight="Registry"
          description="Centralized fleet telemetry and asset management for company logistics."
          actions={
            <div className="flex items-center gap-4">
              {can('fleet', 'create') && (
                <button
                  onClick={() => router.push('/fleet/add')}
                  className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-amber-900/20 hover:shadow-amber-900/30 hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95"
                >
                  <Plus size={20} strokeWidth={3} />
                  Add Vehicle
                </button>
              )}
              <button
                 onClick={() => setShowFilters(!showFilters)}
                 className="px-8 py-4 bg-white text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border-2 border-gray-100/80 hover:bg-gray-50 transition-all flex items-center gap-3 active:scale-95"
              >
                <Filter size={20} /> Filters
              </button>
            </div>
          }
        />

        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-gray-100">
          <div className="mb-10 w-full max-w-md">
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
      </div>
    </div>
  );
};

export default withAuth(FleetPage, [{ module: 'fleet', action: 'view' }]);
