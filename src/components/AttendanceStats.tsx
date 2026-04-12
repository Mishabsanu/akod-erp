'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
    AttendanceStatusResponse,
    getAttendanceStatus,
    getAttendanceHistory,
    signInApi,
    signOutApi,
} from '@/services/attendanceApi';
import { triggerAttendanceUpdate } from '@/utils/attendanceEvents';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { Briefcase, Calendar, LogIn, LogOut, ShieldCheck, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AttendanceStats() {
    const { user } = useAuth();
    const [status, setStatus] = useState<AttendanceStatusResponse['status']>('not_signed_in');
    const [data, setData] = useState<AttendanceStatusResponse['data']>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [liveDuration, setLiveDuration] = useState<number>(0);
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const [weeklyHistory, setWeeklyHistory] = useState<any[]>([]);

    // Calculate Week Days
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    // Clock tick & Live Duration
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            if (status === 'signed_in' && data?.sessions) {
                const lastSession = data.sessions[data.sessions.length - 1];
                if (lastSession && lastSession.startTime && !lastSession.endTime) {
                    const start = new Date(lastSession.startTime).getTime();
                    const current = now.getTime();
                    const sessionDuration = current - start;
                    const previousDuration = data.sessions.slice(0, -1).reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
                    setLiveDuration(previousDuration + sessionDuration);
                }
            } else if (data?.totalDuration) {
                setLiveDuration(data.totalDuration);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [status, data]);

    // Load status & Weekly History
    const loadStatus = async () => {
        try {
            // 1. Get Today's Status
            const res = await getAttendanceStatus();
            setStatus(res.status);
            setData(res.data);
            if (res.data?.totalDuration) {
                setLiveDuration(res.data.totalDuration);
            }

            // 2. Get Weekly History for Chart
            const start = startOfCurrentWeek.toISOString();
            const end = addDays(startOfCurrentWeek, 6).toISOString();
            const history = await getAttendanceHistory(start, end);
            setWeeklyHistory(history);

        } catch (error) {
            console.error('Failed to load status/history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();

        const handleUpdate = () => loadStatus();
        window.addEventListener('attendance-updated', handleUpdate);
        return () => window.removeEventListener('attendance-updated', handleUpdate);
    }, []);

    const handleSignIn = async () => {
        setActionLoading(true);
        try {
            const newData = await signInApi();
            setStatus('signed_in');
            setData(newData);
            const currentHour = new Date().getHours();
            const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
            toast.success(`${timeGreeting}! You are now clocked in.`);
            triggerAttendanceUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to sign in');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSignOut = async () => {
        setActionLoading(true);
        try {
            const newData = await signOutApi();
            setStatus('signed_out');
            setData(newData);
            setConfirmSignOut(false);
            toast.success('You have clocked out.');
            triggerAttendanceUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to sign out');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDuration = (ms: number) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h}h ${m}m ${s}s`;
    };

    if (loading) return <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>;

    const isOnline = status === 'signed_in';
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: STATUS CARD */}
            <div className={`col-span-1 lg:col-span-2 rounded-2xl p-10 bg-white text-gray-800 shadow-sm border border-gray-100 relative group min-h-[280px] flex items-center`}>

                {/* Background Pattern */}
                {isOnline && (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-8">
                    <div className="flex-1">
                        <div className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-gray-400 opacity-70">
                            <Calendar size={14} /> {format(currentTime, 'EEEE, d MMMM yyyy')}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#11375d] tracking-tight mb-3">
                            {greeting}, {user?.name?.split(' ')[0] || 'User'}
                        </h2>
                        <p className="font-bold text-xl text-gray-400">
                            {isOnline ? 'You are currently clocked in.' : 'Ready to start your work session?'}
                        </p>

                        <div className="mt-10">
                            {!isOnline ? (
                                <button
                                    onClick={handleSignIn}
                                    disabled={actionLoading}
                                    className="px-10 py-4 bg-[#11375d] text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-4 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {actionLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={24} />}
                                    Clock In Now
                                </button>
                            ) : (
                                !confirmSignOut ? (
                                    <button
                                        onClick={() => setConfirmSignOut(true)}
                                        className="px-10 py-4 bg-[#cc1518] text-white rounded-xl font-black text-lg shadow-lg hover:bg-[#a51214] transition-all flex items-center gap-4 active:scale-95"
                                    >
                                        <LogOut size={24} />
                                        Clock Out
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => setConfirmSignOut(false)}
                                            className="px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            disabled={actionLoading}
                                            className="px-8 py-4 bg-[#cc1518] text-white rounded-xl font-black text-sm shadow-lg transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut size={18} />}
                                            Confirm Sign Out
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end justify-center">
                        <div className="text-7xl font-black text-[#11375d] tracking-tighter mb-4 tabular-nums flex items-baseline gap-1">
                            {format(currentTime, 'h:mm')}
                            <span className="text-4xl text-gray-300 ml-1 font-bold">{format(currentTime, ':ss')}</span>
                            <span className="text-2xl text-gray-400 ml-2 font-black uppercase">{format(currentTime, 'aa')}</span>
                        </div>

                        {/* Live Timer if Online */}
                        {isOnline && (
                            <div className="bg-[#cc1518]/5 px-6 py-3 rounded-xl border border-[#cc1518]/10 flex items-center gap-3 animate-pulse">
                                <Timer size={20} className="text-[#cc1518]" />
                                <span className="font-mono font-black tracking-widest tabular-nums text-2xl text-[#cc1518]">{formatDuration(liveDuration)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: WEEKLY SUMMARY CHART */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col min-h-[280px]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-[#11375d] uppercase tracking-widest text-xs flex items-center gap-2 opacity-60">
                        <Briefcase size={16} />
                        This Week
                    </h3>
                    <div className="text-[11px] font-black text-[#5e50d1] bg-[#5e50d1]/10 px-3 py-1.5 rounded-lg border border-[#5e50d1]/10">
                        {format(startOfCurrentWeek, 'd MMM')} - {format(addDays(startOfCurrentWeek, 6), 'd MMM')}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-end gap-2 h-32 pb-2">
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day, today);
                            const dayStr = format(day, 'yyyy-MM-dd');

                            // Find record in history
                            const record = weeklyHistory.find((r: any) => isSameDay(new Date(r.date), day));

                            // Calculate Height (Max 12h = 100%)
                            let duration = record?.totalDuration || 0;
                            // Add live duration if today
                            if (isToday && isOnline) {
                                duration = liveDuration;
                            }

                            const hours = duration / 3600000;
                            const percentage = Math.min((hours / 12) * 100, 100);

                            return (
                                <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" title={`${hours.toFixed(1)} hrs`}>
                                    <div className="w-full bg-gray-50 rounded-lg relative flex items-end overflow-hidden h-full">
                                        <div
                                            className={`w-full rounded-lg transition-all duration-500 ${isToday ? (isOnline ? 'bg-[#6ccac9]' : (percentage > 0 ? 'bg-[#11375d]' : 'bg-gray-200')) : (percentage > 0 ? 'bg-[#11375d]' : 'bg-gray-200')}`}
                                            style={{ height: `${Math.max(percentage, 5)}%`, opacity: percentage > 0 ? 1 : 0.3 }}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#11375d]' : 'text-gray-300'}`}>
                                        {format(day, 'EEE')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-start gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#11375d]" />
                        Present
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-100" />
                        Absent
                    </div>
                </div>
            </div>
        </div>
    );
}
