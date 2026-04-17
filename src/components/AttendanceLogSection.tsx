'use client';

import {
    AttendanceRecord,
    getAttendanceHistory,
    getAttendanceStatus,
    getRegularizationRequestsApi,
    RegularizationRequest
} from '@/services/attendanceApi';

import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    CheckCircle,
    Edit3,
    Filter,
    MessageSquare
} from 'lucide-react';

import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isFuture,
    isSameDay,
    isToday,
    subMonths,
    startOfMonth
} from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

import { getHoliday } from '@/data/holidays';
import AttendanceMapModal from './AttendanceMapModal';
import AttendanceRegularizationModal from './AttendanceRegularizationModal';
import RegularizationDrawer from './RegularizationDrawer';

const parseSafeDate = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') return new Date(val);
    if (val.$date) return new Date(val.$date);
    return new Date(val);
};

export default function AttendanceLogSection() {
    const [activeTab, setActiveTab] = useState<'log' | 'requests'>('log');
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<Date | null>(null);

    // Modals
    const [isRegularizationOpen, setIsRegularizationOpen] = useState(false);
    const [selectedDateForRegularization, setSelectedDateForRegularization] = useState<Date | null>(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [selectedDateForMap, setSelectedDateForMap] = useState<Date | null>(null);
    const [selectedSessionsForMap, setSelectedSessionsForMap] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Requests
    const [requests, setRequests] = useState<RegularizationRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    // Generate last 6 months for filter
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i));

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            const data = await getRegularizationRequestsApi();
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setRequestsLoading(false);
        }
    };

    const fetchHistoryAndStatus = async () => {
        setLoading(true);
        try {
            const status = await getAttendanceStatus();
            setStartDate(status.attendanceStartDate ? new Date(status.attendanceStartDate) : null);

            const start = startOfMonth(selectedMonth);
            const end = endOfMonth(selectedMonth);

            const data = await getAttendanceHistory(start.toISOString(), end.toISOString());
            setHistory(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAll = async () => {
        await Promise.all([fetchHistoryAndStatus(), fetchRequests()]);
    };

    useEffect(() => {
        fetchAll();
        const handleUpdate = () => fetchAll();
        window.addEventListener('attendance-updated', handleUpdate);
        return () => window.removeEventListener('attendance-updated', handleUpdate);
    }, [selectedMonth]);

    const daysInterval = { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
    const displayDays = eachDayOfInterval(daysInterval).reverse().filter(d => {
        if (isFuture(d) && !isToday(d)) return false; // Show today
        if (!startDate) return true; // Default to showing if no start date
        const sd = new Date(startDate);
        sd.setHours(0, 0, 0, 0);
        return d >= sd;
    });

    const handleViewRequest = (req: any) => {
        setSelectedRequest(req);
        setIsDrawerOpen(true);
    };

    // DataTable Columns for Requests
    const requestColumns: Column<RegularizationRequest>[] = useMemo(() => [
        {
            accessor: 'date',
            header: 'Date',
            render: (row) => (
                <span className="font-bold text-gray-800 tracking-tight">
                    {format(parseSafeDate(row.date)!, 'd MMM yyyy')}
                </span>
            )
        },
        {
            accessor: 'type',
            header: 'Type',
            render: (row) => (
                <div className="text-gray-500 font-bold text-xs text-center uppercase tracking-tighter bg-gray-50 px-3 py-1 rounded-md border border-gray-100 inline-block w-full">
                    {row.type}
                </div>
            )
        },
        {
            accessor: 'requestedOn',
            header: 'Requested On',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-gray-800 font-bold tracking-tight">{format(parseSafeDate(row.requestedOn)!, 'd MMM yyyy')}</span>
                    <span className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">by {row.user?.name || 'Self'}</span>
                </div>
            )
        },
        {
            accessor: 'note',
            header: 'Note',
            render: (row) => (
                <div className="text-gray-500 text-sm leading-relaxed max-w-[200px] line-clamp-2 font-medium italic opacity-80">
                    "{row.note}"
                </div>
            )
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (row) => (
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm ${row.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' :
                    row.status === 'Rejected' ? 'bg-teal-50 text-teal-500 border-teal-100' :
                        'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            accessor: 'lastActionBy',
            header: 'Last Action',
            render: (row) => (
                <div className="flex flex-col gap-0.5 min-w-[140px]">
                    <span className="text-gray-800 font-bold tracking-tight">{row.lastActionBy?.name || '--'}</span>
                    {row.lastActionOn && (
                        <span className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">on {format(parseSafeDate(row.lastActionOn)!, 'd MMM yyyy')}</span>
                    )}
                </div>
            )
        },
        {
            accessor: '_id',
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center justify-end">
                    <button
                        onClick={() => handleViewRequest(row)}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-xl transition-all border border-transparent hover:border-[#0f766e]/10"
                    >
                        <MessageSquare size={18} strokeWidth={2.5} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="flex flex-col gap-6 font-sans">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {/* TABS AREA */}
                <div className="flex border-b border-gray-100 bg-white px-8">
                    <button
                        onClick={() => setActiveTab('log')}
                        className={`group flex items-center gap-3 py-6 border-b-2 transition-all duration-300 relative ${activeTab === 'log'
                            ? 'border-[#5e50d1] text-[#5e50d1]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Calendar size={18} className={`${activeTab === 'log' ? 'text-[#5e50d1]' : 'text-gray-300'} transition-colors`} />
                        <span className="text-sm font-black uppercase tracking-widest">Attendance Log</span>
                        {activeTab === 'log' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5e50d1] shadow-[0_0_10px_rgba(94,80,209,0.3)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`group flex items-center gap-3 py-6 border-b-2 ml-10 transition-all duration-300 relative ${activeTab === 'requests'
                            ? 'border-[#5e50d1] text-[#5e50d1]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <MessageSquare size={18} className={`${activeTab === 'requests' ? 'text-[#5e50d1]' : 'text-gray-300'} transition-colors`} />
                        <span className="text-sm font-black uppercase tracking-widest">Requests</span>
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5e50d1] shadow-[0_0_10px_rgba(94,80,209,0.3)]" />}
                    </button>
                </div>

                {activeTab === 'log' ? (
                    <>
                        {/* MONTH FILTER BAR */}
                        <div className="flex flex-col md:flex-row justify-between items-center px-10 py-6 bg-[#fafafa]/30 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-400">
                                    <Filter size={16} />
                                </div>
                                <span className="text-xs font-black text-gray-500 uppercase tracking-[0.15em] ml-1">Select Month:</span>
                            </div>

                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                                {months.map((m) => {
                                    const isSelected = isSameDay(startOfMonth(m), startOfMonth(selectedMonth));
                                    return (
                                        <button
                                            key={m.toISOString()}
                                            onClick={() => setSelectedMonth(m)}
                                            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-tight transition-all duration-200 ${isSelected
                                                ? 'bg-[#0f766e] text-white shadow-lg'
                                                : 'bg-white text-gray-400 hover:text-[#0f766e] border border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {format(m, 'MMMM yyyy')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-white relative">
                            {displayDays.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center py-40 text-center px-8">
                                    <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">No logs found</h3>
                                </div>
                            ) : (
                                <table className="akod-table text-left">
                                    <thead>
                                        <tr className="bg-[#f9fafc] border-b border-gray-100">
                                            <th className="px-8 py-5 text-gray-400">Date</th>
                                            <th className="px-4 py-5 text-gray-400">Attendance Visual</th>
                                            <th className="px-4 py-5 text-gray-400 text-center">Effective Hours</th>
                                            <th className="px-4 py-5 text-gray-400 text-center">Gross Hours</th>
                                            <th className="px-4 py-5 text-gray-400 text-center">Arrival</th>
                                            <th className="px-4 py-5 text-gray-400 text-center">Log</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {displayDays.map((day) => {
                                            const record = history.find((h) => isSameDay(new Date(h.date), day));
                                            const isWO = day.getDay() === 0;
                                            const holiday = getHoliday(day);

                                            // Default Values
                                            let effectiveHoursStr = '--';
                                            let grossHoursStr = '--';
                                            let arrivalContent = <span className="text-gray-300">--</span>;
                                            let logIcon = <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-full"></div></div>;
                                            let statusLabel = 'No Data';

                                            // Timeline Data
                                            let timelineLeft = 0;
                                            let timelineWidth = 0;
                                            let startTimeStr = '';
                                            let endTimeStr = '';
                                            let hasRecord = false;

                                            if (record) {
                                                hasRecord = true;

                                                // 1. Calculate Hours
                                                if (record.totalDuration) {
                                                    const h = Math.floor(record.totalDuration / 3600000);
                                                    const m = Math.floor((record.totalDuration % 3600000) / 60000);
                                                    effectiveHoursStr = `${h}h ${m}m`;
                                                    grossHoursStr = `${h}h ${m}m`; // Assuming Gross = Effective for now
                                                }

                                                // 2. Timeline Logic (Base on 8:00 AM to 9:00 PM window approx)
                                                if (record.sessions?.[0]?.startTime) {
                                                    const start = parseSafeDate(record.sessions[0].startTime);
                                                    let end = record.sessions[record.sessions.length - 1].endTime
                                                        ? parseSafeDate(record.sessions[record.sessions.length - 1].endTime)
                                                        : new Date();

                                                    // Clamping for visualization 8am - 9pm
                                                    const startOfDay = new Date(day);
                                                    startOfDay.setHours(8, 0, 0, 0);
                                                    const totalWindowMs = 13 * 60 * 60 * 1000;

                                                    if (start && end) {
                                                        const startOffsetMs = start.getTime() - startOfDay.getTime();
                                                        let durationMs = end.getTime() - start.getTime();

                                                        // Adjust if starts before 8am
                                                        let adjustedStartOffset = startOffsetMs;
                                                        if (adjustedStartOffset < 0) {
                                                            durationMs += adjustedStartOffset; // Reduce duration visible
                                                            adjustedStartOffset = 0;
                                                        }

                                                        timelineLeft = (adjustedStartOffset / totalWindowMs) * 100;
                                                        if (timelineLeft < 0) timelineLeft = 0;
                                                        if (timelineLeft > 100) timelineLeft = 100;

                                                        const widthPc = (durationMs / totalWindowMs) * 100;
                                                        timelineWidth = widthPc;
                                                        if (timelineLeft + timelineWidth > 100) {
                                                            timelineWidth = 100 - timelineLeft;
                                                        }
                                                        if (timelineWidth < 0) timelineWidth = 0;

                                                        startTimeStr = format(start, 'h:mm a');
                                                        endTimeStr = format(end, 'h:mm a');
                                                    }
                                                }

                                                // 3. Arrival
                                                if (record.sessions?.[0]?.startTime) {
                                                    const sTime = parseSafeDate(record.sessions[0].startTime)!;
                                                    const limit = new Date(sTime);
                                                    limit.setHours(9, 15, 0, 0);

                                                    if (sTime <= limit) {
                                                        arrivalContent = (
                                                            <div className="flex items-center gap-2 justify-center text-[#0f766e]">
                                                                <CheckCircle size={14} className="text-green-500" />
                                                                <span className="font-medium text-[#0f766e]">On Time</span>
                                                            </div>
                                                        );
                                                    } else {
                                                        arrivalContent = (
                                                            <div className="flex items-center gap-2 justify-center">
                                                                <AlertCircle size={14} className="text-teal-500" />
                                                                <span className="font-medium text-teal-500">Late</span>
                                                            </div>
                                                        );
                                                    }
                                                }

                                                // 4. Log Icon Logic
                                                if (record.sessions?.some(s => !s.endTime) && isToday(day)) {
                                                    // Active
                                                    logIcon = <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>;
                                                    statusLabel = 'Active';
                                                } else if (record.sessions?.every(s => s.endTime)) {
                                                    // Completed
                                                    logIcon = <CheckCircle size={20} className="text-green-500" />;
                                                    statusLabel = 'Present';
                                                } else {
                                                    // Missing Punch
                                                    logIcon = <AlertCircle size={20} className="text-amber-500" />;
                                                    statusLabel = 'Missing Swipe';
                                                }
                                            } else {
                                                // No Record
                                                if (!isFuture(day) && !isToday(day) && !isWO && !holiday) {
                                                    logIcon = <div className="w-5 h-5 rounded-full border border-teal-200 flex items-center justify-center"><div className="w-2 h-2 bg-teal-400 rounded-full"></div></div>;
                                                    statusLabel = 'Absent';
                                                } else if (isWO) {
                                                    statusLabel = 'Weekly Off';
                                                } else if (holiday) {
                                                    statusLabel = 'Holiday';
                                                }
                                            }

                                            return (
                                                <tr key={day.toISOString()} className="hover:bg-gray-50/50 transition-colors group">
                                                    {/* DATE */}
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className="text-gray-700 font-medium">
                                                            {format(day, 'EEE, d MMM')}
                                                        </span>
                                                        {isWO && <span className="ml-2 text-[11px] bg-teal-50 text-teal-500 px-1 py-0.5 rounded border border-teal-100 uppercase tracking-wide">W-Off</span>}
                                                        {holiday && <span className="ml-2 text-[11px] bg-purple-50 text-purple-500 px-1 py-0.5 rounded border border-purple-100 uppercase tracking-wide">Holiday</span>}
                                                    </td>

                                                    {/* ATTENDANCE VISUAL */}
                                                    <td className="px-4 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 h-8 relative flex items-center">
                                                                {/* Grid Lines */}
                                                                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                                                                    {Array.from({ length: 14 }).map((_, i) => (
                                                                        <div key={i} className="w-[1px] h-full bg-gray-400"></div>
                                                                    ))}
                                                                </div>

                                                                {/* Timeline Bar */}
                                                                {hasRecord ? (
                                                                    <div
                                                                        className="absolute h-2.5 bg-[#4cc9f0] rounded-full group/bar relative cursor-help"
                                                                        style={{ left: `${timelineLeft}%`, width: `${timelineWidth}%` }}
                                                                    >
                                                                        {/* Dropdown Tooltip */}
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:block z-[40]">
                                                                            <div className="bg-[#475569] text-white text-[10px] px-3 py-1.5 rounded-md whitespace-nowrap font-bold shadow-lg flex flex-col items-center">
                                                                                <span>Logged In {startTimeStr} - {endTimeStr}</span>
                                                                            </div>
                                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#475569] rotate-45"></div>
                                                                        </div>

                                                                        {/* Start Marker & Label */}
                                                                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 group/start z-[30]">
                                                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-500 whitespace-nowrap bg-white/80 backdrop-blur-sm px-1 rounded">
                                                                                {startTimeStr}
                                                                            </div>
                                                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-[#4cc9f0] mx-auto"></div>
                                                                        </div>

                                                                        {/* End Marker & Label */}
                                                                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 group/end z-[30]">
                                                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-500 whitespace-nowrap bg-white/80 backdrop-blur-sm px-1 rounded">
                                                                                {endTimeStr}
                                                                            </div>
                                                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-[#4cc9f0] mx-auto"></div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-full text-center text-[11px] text-red-400 italic group-hover:text-red-500 transition-colors">
                                                                        {isWO ? 'Weekly Off' : 'Absent'}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Map Pin Removed from Visual */}
                                                        </div>
                                                    </td>

                                                    {/* EFFECTIVE HOURS */}
                                                    <td className="px-4 py-5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {hasRecord && <div className="w-2 h-2 rounded-full bg-[#4cc9f0]"></div>}
                                                            <span className="font-medium text-gray-600 font-mono">
                                                                {effectiveHoursStr}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* GROSS HOURS */}
                                                    <td className="px-4 py-5 text-center">
                                                        <span className="font-medium text-gray-600 font-mono">
                                                            {grossHoursStr}
                                                        </span>
                                                    </td>

                                                    {/* ARRIVAL */}
                                                    <td className="px-4 py-5 text-center">
                                                        {arrivalContent}
                                                    </td>

                                                    {/* LOG */}
                                                    <td className="px-4 py-5 text-center relative overflow-visible">
                                                        <div className="flex justify-center group/log cursor-pointer">
                                                            {logIcon}

                                                            {/* DETAILED POPOVER */}
                                                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 z-50 w-[280px] hidden group-hover/log:block animate-in fade-in zoom-in-95 duration-200">
                                                                <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] border border-gray-100 text-left overflow-hidden ring-1 ring-black/5">

                                                                    {/* Header */}
                                                                    <div className="bg-[#f8f9fc] p-4 border-b border-gray-100">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="font-bold text-gray-800 text-sm">General Shift</span>
                                                                            <span className={`text-[10px] border px-1.5 py-0.5 rounded font-bold uppercase ${statusLabel === 'Present' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                                statusLabel === 'Absent' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                                    statusLabel === 'Missing Swipe' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                                        'bg-white text-gray-500 border-gray-200'}`}>
                                                                                {statusLabel}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-gray-500 text-[11px] font-medium flex items-center gap-1.5">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                                                                            09:00 AM - 06:00 PM
                                                                        </div>
                                                                    </div>

                                                                    {/* Regularization Option inside Popover */}
                                                                    <div className="p-2 border-b border-gray-50 bg-white">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedDateForRegularization(day);
                                                                                setIsRegularizationOpen(true);
                                                                            }}
                                                                            className="w-full flex items-center gap-3 p-2 hover:bg-[#0f766e]/5 rounded-lg transition-colors group/btn"
                                                                        >
                                                                            <div className="w-8 h-8 rounded-lg bg-[#0f766e]/10 flex items-center justify-center text-[#0f766e] group-hover/btn:bg-[#0f766e] group-hover/btn:text-white transition-all">
                                                                                <Edit3 size={14} />
                                                                            </div>
                                                                            <div className="flex flex-col text-left">
                                                                                <span className="text-sm font-bold text-gray-800">Regularize</span>
                                                                                <span className="text-xs text-gray-400">Raise a request for this day</span>
                                                                            </div>
                                                                        </button>
                                                                    </div>

                                                                    {/* Web Clock Activity */}
                                                                    {record && record.sessions?.length ? (
                                                                        <div className="p-4 bg-white max-h-[200px] overflow-y-auto">
                                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                                                                Web Clock Activity
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                {record.sessions.map((s, idx) => (
                                                                                    <div key={idx} className="flex flex-col gap-1 border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0">
                                                                                        <div className="flex items-center justify-between text-[13px] font-mono font-medium">
                                                                                            <div className="flex items-center gap-2 text-emerald-600">
                                                                                                <ArrowDownLeft size={16} />
                                                                                                <span>IN {format(parseSafeDate(s.startTime)!, 'h:mm:ss a')}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex items-center justify-between text-[13px] font-mono font-medium pl-6">
                                                                                            <div className="flex items-center gap-2 text-rose-500">
                                                                                                <ArrowUpRight size={16} />
                                                                                                {s.endTime ? (
                                                                                                    <span>OUT {format(parseSafeDate(s.endTime)!, 'h:mm:ss a')}</span>
                                                                                                ) : (
                                                                                                    <span className="italic text-gray-400 text-xs">Running...</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-6 text-center text-gray-400">
                                                                            <p className="text-xs italic">No punch activity recorded.</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {/* Arrow */}
                                                                <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-t border-r border-gray-100 rotate-45 transform shadow-sm"></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                ) : (
                    /* PREMIUM REQUESTS TABLE */
                    <div className="flex-1 overflow-auto bg-white p-4">
                        {requestsLoading && requests.length === 0 ? (
                            <TableSkeleton />
                        ) : (
                            <DataTable
                                columns={requestColumns}
                                data={requests}
                                serverSidePagination={false}
                                totalCount={requests.length}
                                currentPage={1}
                                limit={10}
                                totalPages={Math.ceil(requests.length / 10)}
                                onPageChange={() => {}}
                                onLimitChange={() => {}}
                            />
                        )}
                    </div>
                )
                }

                {/* OVERLAYS & MODALS */}
                <AttendanceRegularizationModal
                    isOpen={isRegularizationOpen}
                    onClose={() => setIsRegularizationOpen(false)}
                    date={selectedDateForRegularization}
                    requests={requests}
                />

                <AttendanceMapModal
                    isOpen={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                    date={selectedDateForMap}
                    sessions={selectedSessionsForMap}
                />

                <RegularizationDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    request={selectedRequest}
                />
            </div >
        </div >
    );
}
