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
import { Briefcase, Calendar, LogIn, LogOut, Timer, MapPin, Activity } from 'lucide-react';
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
            const res = await getAttendanceStatus();
            setStatus(res.status);
            setData(res.data);
            if (res.data?.totalDuration) {
                setLiveDuration(res.data.totalDuration);
            }

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

    if (loading) return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 h-72 bg-gray-100 animate-pulse rounded-3xl" />
            <div className="h-72 bg-gray-100 animate-pulse rounded-3xl" />
        </div>
    );

    const isOnline = status === 'signed_in';
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: STATUS CARD */}
            <div className={`col-span-1 lg:col-span-2 rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex items-center bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100`}>
                
                {/* Visual Accent */}
                <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full transition-all duration-700 ${isOnline ? 'bg-[#0f766e]/5' : 'bg-gray-50'}`} />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                            <Calendar size={14} className="text-[#0f766e]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                {format(currentTime, 'EEEE, d MMMM yyyy')}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-6xl font-black text-[#0f172a] tracking-tight leading-tight">
                                {greeting}, <span className="text-[#0f766e]">{user?.name?.split(' ')[0] || 'Member'}</span>
                            </h2>
                            <p className="text-lg md:text-xl font-bold text-gray-400 max-w-md">
                                {isOnline ? "Work session active. Let's make it a productive day." : "Ready to begin? Start your session below."}
                            </p>
                        </div>

                        <div className="pt-4">
                            {!isOnline ? (
                                <button
                                    onClick={handleSignIn}
                                    disabled={actionLoading}
                                    className="group relative px-10 py-5 bg-[#0f766e] text-white rounded-2xl font-black text-lg shadow-[0_15px_30px_rgba(15,118,110,0.3)] hover:shadow-[0_20px_40px_rgba(15,118,110,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 active:scale-95 disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <div className="relative flex items-center gap-4">
                                        {actionLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <div className="p-1.5 bg-black/10 rounded-lg"><LogIn size={20} /></div>}
                                        <span>Start Recording</span>
                                    </div>
                                </button>
                            ) : (
                                !confirmSignOut ? (
                                    <button
                                        onClick={() => setConfirmSignOut(true)}
                                        className="px-10 py-5 bg-white text-[#0f766e] border-2 border-[#0f766e] rounded-2xl font-black text-lg shadow-sm hover:bg-[#0f766e] hover:text-white transition-all duration-300 flex items-center gap-4 active:scale-95"
                                    >
                                        <div className="p-1.5 bg-[#0f766e]/10 rounded-lg group-hover:bg-white/10"><LogOut size={20} /></div>
                                        <span>Stop Tracking</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                        <button
                                            onClick={() => setConfirmSignOut(false)}
                                            className="px-8 py-5 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all border border-gray-100"
                                        >
                                            Stay Online
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            disabled={actionLoading}
                                            className="px-8 py-5 bg-red-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-3 active:scale-95"
                                        >
                                            {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut size={18} />}
                                            End Session
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex flex-col items-center md:items-end">
                            <div className="text-7xl font-black text-[#0f172a] tracking-tighter tabular-nums flex items-baseline drop-shadow-sm">
                                {format(currentTime, 'h:mm')}
                                <span className="text-4xl text-gray-300 ml-1 font-bold">{format(currentTime, ':ss')}</span>
                                <span className="text-2xl text-[#0f766e] ml-4 font-black tracking-widest uppercase">{format(currentTime, 'aa')}</span>
                            </div>
                        </div>

                        {/* Live Timer if Online */}
                        {isOnline ? (
                            <div className="bg-[#0f766e] px-8 py-4 rounded-3xl shadow-[0_15px_30px_rgba(15,118,110,0.2)] flex items-center gap-4 animate-pulse">
                                <Activity size={20} className="text-white ml-[-4px]" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Live Uptime</span>
                                    <span className="font-mono font-black tracking-widest tabular-nums text-2xl text-white">{formatDuration(liveDuration)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="px-8 py-4 rounded-3xl bg-gray-50 border border-gray-100 flex items-center gap-4 grayscale opacity-50">
                                <Timer size={22} className="text-gray-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Today</span>
                                    <span className="font-mono font-black tracking-widest tabular-nums text-2xl text-gray-400">{formatDuration(liveDuration)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: WEEKLY SUMMARY CHART */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between overflow-hidden relative group">
                
                {/* Top Info */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0f766e]/10 rounded-xl flex items-center justify-center text-[#0f766e]">
                                <Briefcase size={20} />
                            </div>
                            <h3 className="font-black text-[#0f172a] text-sm uppercase tracking-widest">Weekly Activity</h3>
                        </div>
                    </div>
                    
                    <div className="bg-[#0f172a] p-4 rounded-2xl flex items-center justify-between shadow-lg">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Timeline</span>
                            <span className="text-[11px] font-bold text-white">
                                {format(startOfCurrentWeek, 'd MMM')} — {format(addDays(startOfCurrentWeek, 6), 'd MMM')}
                            </span>
                        </div>
                        <MapPin size={16} className="text-[#0f766e]" />
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 flex flex-col justify-center mt-12">
                    <div className="flex justify-between items-end gap-3 h-32 pb-2">
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day, today);
                            const record = weeklyHistory.find((r: any) => isSameDay(new Date(r.date), day));
                            let duration = record?.totalDuration || 0;
                            if (isToday && isOnline) duration = liveDuration;

                            const hours = duration / 3600000;
                            const percentage = Math.min((hours / 12) * 100, 100);

                            return (
                                <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-3 group relative" title={`${hours.toFixed(1)} hrs`}>
                                    <div className="w-full bg-gray-50 rounded-xl relative flex items-end overflow-hidden h-full border border-gray-50 group-hover:border-[#0f766e]/20 transition-all duration-300">
                                        <div
                                            className={`w-full rounded-lg transition-all duration-700 ease-out shadow-[0_4px_10px_rgba(15,118,110,0.2)] ${isToday ? 'bg-gradient-to-t from-[#0f766e] to-[#14b8a6]' : (percentage > 0 ? 'bg-gradient-to-t from-[#0f766e] to-[#0f766e]' : 'bg-gray-200')}`}
                                            style={{ height: `${Math.max(percentage, 8)}%`, opacity: percentage > 0 ? 1 : 0.2 }}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors duration-300 ${isToday ? 'text-[#0f766e] scale-110' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                        {format(day, 'EEE')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0f766e] shadow-sm shadow-[#0f766e]/40" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0f172a]">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Idle</span>
                        </div>
                    </div>
                    <div className="p-1 px-3 bg-gray-50 rounded-lg text-[9px] font-black text-[#0f766e]/60 border border-gray-100 uppercase tracking-widest">
                        8h Std.
                    </div>
                </div>
            </div>
        </div>
    );
}
