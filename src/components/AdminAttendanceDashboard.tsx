'use client';

import {
    getAdminAttendanceRange,
    getAdminAttendanceStatus
} from '@/services/attendanceApi';
import {
    Calendar,
    Clock,
    Filter,
    RefreshCw,
    Users,
    UserCheck
} from 'lucide-react';
import {
    endOfMonth,
    format,
    startOfMonth
} from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
import { SearchInput } from '@/components/shared/SearchInput';
import { Column, DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

export default function AdminAttendanceDashboard() {
    // View State
    const [viewMode, setViewMode] = useState<'day' | 'range'>('day');

    // Day View State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [report, setReport] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, present: 0, online: 0, absent: 0 });

    // Range View State
    const [rangeStart, setRangeStart] = useState<Date>(startOfMonth(new Date()));
    const [rangeEnd, setRangeEnd] = useState<Date>(endOfMonth(new Date()));
    const [rangeReport, setRangeReport] = useState<any[]>([]);
    const [rangeDates, setRangeDates] = useState<any[]>([]);

    // Shared
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Day Report
    const fetchDayReport = async () => {
        setLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const data = await getAdminAttendanceStatus(dateStr);
            setReport(data.data);
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch admin day report', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Range Report
    const fetchRangeReport = async () => {
        setLoading(true);
        try {
            const startStr = format(rangeStart, 'yyyy-MM-dd');
            const endStr = format(rangeEnd, 'yyyy-MM-dd');
            const data = await getAdminAttendanceRange(startStr, endStr);
            setRangeReport(data.data);
            setRangeDates(data.range || []);
        } catch (error) {
            console.error('Failed to fetch admin range report', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'day') {
            fetchDayReport();
        } else {
            fetchRangeReport();
        }
    }, [viewMode, selectedDate, rangeStart, rangeEnd]);


    const formatDuration = (ms: number) => {
        if (!ms) return '--';
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${m}m`;
    };

    const safeFormat = (date: any, formatStr: string) => {
        if (!date) return '--';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '--';
            return format(d, formatStr);
        } catch (e) {
            return '--';
        }
    };

    // Filter Logic
    const filteredDayReport = report.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRangeReport = rangeReport.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // DataTable Columns for Day View
    const columns: Column<any>[] = useMemo(() => [
        {
            accessor: 'user',
            header: 'Staff Member',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#11375d] to-[#2a507d] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {row.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800">{row.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400 font-medium">{row.user?.role || 'N/A'}</div>
                    </div>
                </div>
            )
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (row) => (
                <div className="text-center">
                    {row.isOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-black uppercase tracking-wide border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
                        </span>
                    ) : row.status === 'present' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-black uppercase tracking-wide border border-gray-200">
                            Checked Out
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-black uppercase tracking-wide border border-red-100">
                            Absent
                        </span>
                    )}
                </div>
            )
        },
        {
            accessor: 'loginTime',
            header: 'In Time',
            render: (row) => (
                <div className="text-center text-sm font-semibold text-gray-600">
                    {safeFormat(row.loginTime, 'h:mm a')}
                </div>
            )
        },
        {
            accessor: 'logoutTime',
            header: 'Out Time',
            render: (row) => (
                <div className="text-center text-sm font-semibold text-gray-600">
                    {row.logoutTime ? safeFormat(row.logoutTime, 'h:mm a') : (row.isOnline ? <span className="text-green-500 text-xs font-bold uppercase tracking-wider">Active</span> : '--')}
                </div>
            )
        },
        {
            accessor: 'totalDuration',
            header: 'Total Hours',
            render: (row) => (
                <div className="text-center">
                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md text-xs">
                        {formatDuration(row.totalDuration)}
                    </span>
                </div>
            )
        },
        {
            accessor: 'isOnline',
            header: 'Activity',
            render: (row) => (
                <div className="text-right flex justify-end">
                    {row.isOnline ? (
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                    ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                    )}
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">

            {/* Header / Stats Cards - Only Show in Day View */}
            {viewMode === 'day' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard label="Total Staff" value={stats.total} icon={Users} color="blue" />
                    <StatsCard label="Present" value={stats.present} icon={UserCheck} color="green" />
                    <StatsCard label="Online Now" value={stats.online} icon={Clock} color="cyan" />
                    <StatsCard label="Absent" value={stats.absent} icon={Users} color="red" />
                </div>
            )}

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">

                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                    {/* View Switcher */}
                    <div className="flex bg-gray-100/80 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'day'
                                ? 'bg-white text-[#11375d] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Day Report
                        </button>
                        <button
                            onClick={() => setViewMode('range')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'range'
                                ? 'bg-white text-[#11375d] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Attendance Register
                        </button>
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                        {/* Day Picker */}
                        {viewMode === 'day' && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Calendar size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    value={format(selectedDate, 'yyyy-MM-dd')}
                                    onChange={(e) => e.target.valueAsDate && setSelectedDate(e.target.valueAsDate)}
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#11375d] focus:ring-2 focus:ring-red-500/20 outline-none hover:border-gray-300 transition-all cursor-pointer"
                                />
                            </div>
                        )}

                        {/* Range Pickers */}
                        {viewMode === 'range' && (
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                                <span className="text-xs font-bold text-gray-500 ml-2">FROM</span>
                                <input
                                    type="date"
                                    value={format(rangeStart, 'yyyy-MM-dd')}
                                    onChange={(e) => e.target.valueAsDate && setRangeStart(e.target.valueAsDate)}
                                    className="bg-white border text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                                <span className="text-xs font-bold text-gray-500">TO</span>
                                <input
                                    type="date"
                                    value={format(rangeEnd, 'yyyy-MM-dd')}
                                    onChange={(e) => e.target.valueAsDate && setRangeEnd(e.target.valueAsDate)}
                                    className="bg-white border text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 mr-1"
                                />
                            </div>
                        )}

                        <div className="w-full lg:w-64">
                            <SearchInput
                                initialSearchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                placeholder="Search staff..."
                            />
                        </div>

                        <button
                            onClick={viewMode === 'day' ? fetchDayReport : fetchRangeReport}
                            disabled={loading}
                            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-auto">

                    {/* --- DAY VIEW TABLE --- */}
                    {viewMode === 'day' && (
                        <div className="p-4">
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={filteredDayReport}
                                    serverSidePagination={false}
                                    totalCount={filteredDayReport.length}
                                    currentPage={1}
                                    limit={10}
                                    totalPages={Math.ceil(filteredDayReport.length / 10)}
                                    onPageChange={() => {}}
                                    onLimitChange={() => {}}
                                />
                            )}
                        </div>
                    )}

                    {/* --- RANGE VIEW (REGISTER) --- */}
                    {viewMode === 'range' && (
                        <div className="w-full relative overflow-hidden">
                             {loading ? (
                                <div className="p-8"><TableSkeleton /></div>
                            ) : (
                                <div className="overflow-auto max-h-[700px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-30">
                                            <tr className="bg-[#f9fafc] text-gray-400 border-b border-gray-100">
                                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest sticky left-0 z-40 bg-[#f9fafc] border-r border-gray-100 w-[240px] shadow-[2px_0_5px_rgba(0,0,0,0.05)] text-gray-400">
                                                    Staff Member
                                                </th>
                                                {rangeDates.map((dateStr: string) => (
                                                    <th key={dateStr} className="px-3 py-4 text-center border-r border-gray-100 min-w-[60px] hover:bg-gray-50 transition-colors">
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-[10px] font-black opacity-50 uppercase tracking-tighter">{format(new Date(dateStr), 'EEE')}</span>
                                                            <span className="text-[14px] font-black text-[#11375d]">{format(new Date(dateStr), 'dd')}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredRangeReport.length === 0 ? (
                                                <tr><td colSpan={rangeDates.length + 1} className="py-20 text-center text-gray-400 font-bold italic">No records matching your search.</td></tr>
                                            ) : (
                                                filteredRangeReport.map((row: any) => (
                                                    <tr key={row.user._id} className="hover:bg-gray-50/80 transition-all group">
                                                        <td className="px-6 py-4 sticky left-0 z-20 bg-white border-r border-gray-100 group-hover:bg-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-[14px] text-[#11375d] tracking-tight">{row.user.name}</span>
                                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-0.5">{row.user.role}</span>
                                                            </div>
                                                        </td>
                                                        {rangeDates.map((dateStr: string) => {
                                                            const key = format(new Date(dateStr), 'yyyy-MM-dd');
                                                            const cellData = row.attendance[key] || { status: 'NA' };
        
                                                            let badge = (<span className="w-9 h-9 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center text-[10px] font-black">-</span>);
        
                                                            if (cellData.status === 'P') {
                                                                badge = (
                                                                    <div 
                                                                        className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-[13px] font-black border border-green-200 shadow-sm hover:scale-110 transition-transform cursor-help" 
                                                                        title={`In: ${format(new Date(cellData.inTime), 'h:mm a')} | Out: ${cellData.outTime ? format(new Date(cellData.outTime), 'h:mm a') : 'Active'}`}
                                                                    >
                                                                        P
                                                                    </div>
                                                                );
                                                            } else if (cellData.status === 'A') {
                                                                badge = (
                                                                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-[13px] font-black border border-red-100 shadow-sm">
                                                                        A
                                                                    </div>
                                                                );
                                                            } else if (cellData.status === 'WO') {
                                                                badge = (
                                                                    <div className="w-9 h-9 rounded-xl bg-gray-100/50 text-gray-400 flex items-center justify-center text-[10px] font-black border border-gray-200">
                                                                        WO
                                                                    </div>
                                                                );
                                                            } else if (cellData.status === 'HOL') {
                                                                badge = (
                                                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-[11px] font-black border border-amber-100">
                                                                        H
                                                                    </div>
                                                                );
                                                            }
        
                                                            return (
                                                                <td key={dateStr} className="px-2 py-3 text-center border-r border-gray-50/50">
                                                                    <div className="flex justify-center">
                                                                        {badge}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

const StatsCard = ({ label, value, icon: Icon, color }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        cyan: 'bg-cyan-50 text-cyan-600',
        red: 'bg-red-50 text-red-600',
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 group hover:border-[#cc1518]/20 transition-all hover:shadow-md">
            <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div className="text-center">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-[#11375d] tracking-tight">{value}</p>
            </div>
        </div>
    );
};
