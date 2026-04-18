'use client';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { MechanicalCheckup, Vehicle } from '@/lib/types';
import { getMechanicalLogs, getVehicleDropdown, getVehicles } from '@/services/fleetApi';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Filter,
  Plus,
  Truck,
  X,
  History,
  LayoutGrid,
  List
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import withAuth from '@/components/withAuth';
import { format } from 'date-fns';

const FleetReportsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'logs' | 'vehicles'>('logs');
  const [logs, setLogs] = useState<MechanicalCheckup[]>([]);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  // Filters
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { can } = useAuth();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchVehiclesForDropdown = async () => {
      try {
        const data = await getVehicleDropdown();
        setVehicles(data);
      } catch (error) {}
    };
    fetchVehiclesForDropdown();
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMechanicalLogs({
        page: currentPage,
        limit,
        vehicleId: vehicleFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(response.data.content);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, vehicleFilter, startDate, endDate]);

  const fetchVehicleDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVehicles({
        page: currentPage,
        limit,
      });
      setVehicleList(response.data.content);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    if (viewMode === 'logs') fetchLogs();
    else fetchVehicleDirectory();
  }, [viewMode, fetchLogs, fetchVehicleDirectory]);

  const logColumns: Column<MechanicalCheckup>[] = useMemo(() => [
    {
      accessor: 'date',
      header: 'Report Date',
      render: (log) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="font-bold text-gray-800">{format(new Date(log.date), 'dd MMM yyyy')}</span>
        </div>
      )
    },
    {
      accessor: 'vehicleId',
      header: 'Vehicle',
      render: (log) => {
          const v = log.vehicleId as any;
          return (
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{v?.name || 'Unknown'}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{v?.plateNo || '--'}</span>
            </div>
          )
      }
    },
    {
      accessor: 'status',
      header: 'Fitness',
      render: (log) => {
        const colors = {
          Fit: 'bg-green-50 text-green-600 border-green-100',
          'Needs Maintenance': 'bg-amber-50 text-amber-600 border-amber-100',
          Grounded: 'bg-red-50 text-red-600 border-red-100'
        };
        const Icon = log.status === 'Fit' ? CheckCircle2 : log.status === 'Grounded' ? AlertTriangle : AlertTriangle;
        return (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[log.status]}`}>
            <Icon size={12} />
            {log.status}
          </div>
        )
      }
    },
    {
      accessor: 'odometer',
      header: 'Odometer',
      render: (log) => <span className="font-mono text-gray-600 font-bold">{log.odometer.toLocaleString()} km</span>
    },
    {
      accessor: 'inspectorId',
      header: 'Checked By',
      render: (log) => (
        <span className="text-xs font-bold text-gray-600">{(log.inspectorId as any)?.name || 'System'}</span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (log) => (
        <div className="flex items-center gap-2">
           <button onClick={() => router.push(`/fleet/mechanical/${log._id}`)} className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors" title="View Manifest">
             <FileText size={18} />
           </button>
           <button onClick={() => router.push(`/fleet/reports/${(log.vehicleId as any)?._id || log.vehicleId}`)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors" title="View Vehicle History">
             <History size={18} />
           </button>
        </div>
      )
    }
  ], []);

  const vehicleColumns: Column<Vehicle>[] = useMemo(() => [
    {
       accessor: 'name',
       header: 'Vehicle',
       render: (v) => (
         <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Truck size={16} className="text-gray-600" />
            </div>
            <div className="flex flex-col">
               <span className="font-bold text-gray-900">{v.name}</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{v.plateNo}</span>
            </div>
         </div>
       )
    },
    { accessor: 'type', header: 'Type' },
    { accessor: 'model', header: 'Model/Year', render: (v) => <span>{v.model || '-'} {v.year ? `(${v.year})` : ''}</span> },
    { 
       accessor: 'odometer', 
       header: 'Current Odometer',
       render: (v) => <span className="font-mono text-emerald-600 font-bold">{v.odometer.toLocaleString()} km</span>
    },
    {
       header: 'History Diagnostic',
       accessor: '_id' as any,
       render: (v) => (
         <button 
           onClick={() => router.push(`/fleet/reports/${v._id}`)}
           className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 border border-indigo-100"
         >
           <History size={14} />
           View All Reports
         </button>
       )
    }
  ], []);

  return (
    <div className="min-h-screen w-full bg-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Fleet Diagnostic Centre"
        title="Inspection"
        highlight="Reports"
        description="Analyze vehicle health logs, performance history, and daily diagnostic manifest."
        actions={
          <div className="flex items-center gap-3">
             <div className="flex bg-gray-100 p-1 rounded-xl mr-2">
                <button 
                  onClick={() => { setViewMode('logs'); setCurrentPage(1); }}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'logs' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Audit Logs View"
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => { setViewMode('vehicles'); setCurrentPage(1); }}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'vehicles' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Vehicle History View"
                >
                  <LayoutGrid size={18} />
                </button>
             </div>
             {viewMode === 'logs' && (
               <button onClick={() => setShowFilters(!showFilters)} className="page-header-button secondary">
                 <Filter size={14} /> {showFilters ? 'Hide' : 'Filter'}
               </button>
             )}
             <button onClick={() => router.push('/fleet/mechanical')} className="page-header-button">
               <Plus size={16} /> New Checkup
             </button>
          </div>
        }
      />

      {viewMode === 'logs' && showFilters && (
        <div className="mt-8 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-2 min-w-[300px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Filter by Vehicle</label>
            <div className="relative">
              <select
                value={vehicleFilter}
                onChange={(e) => {
                  setVehicleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-12 pl-10 pr-10 bg-white border-2 border-transparent rounded-xl focus:border-teal-600 outline-none transition-all font-bold text-gray-800 appearance-none shadow-sm"
              >
                <option value="">All Registered Vehicles</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.name} ({v.plateNo})</option>
                ))}
              </select>
              <Truck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              {vehicleFilter && (
                <button 
                  onClick={() => {
                    setVehicleFilter('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-12 px-4 bg-white border-2 border-transparent rounded-xl focus:border-teal-600 outline-none transition-all font-bold text-gray-800 shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-12 px-4 bg-white border-2 border-transparent rounded-xl focus:border-teal-600 outline-none transition-all font-bold text-gray-800 shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 invisible">Clear</label>
            <button
               onClick={() => {
                 setVehicleFilter('');
                 setStartDate('');
                 setEndDate('');
                 setCurrentPage(1);
               }}
               className="h-12 px-6 bg-red-50 text-red-600 font-black rounded-xl border border-red-100 uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={(viewMode === 'logs' ? logColumns : vehicleColumns) as any}
            data={(viewMode === 'logs' ? logs : vehicleList) as any}
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

export default withAuth(FleetReportsPage, [{ module: 'fleet', action: 'view' }]);
