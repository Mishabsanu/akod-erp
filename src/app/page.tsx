'use client';

import { getDashboardData } from '@/services/dashboardApi';
import {
    Activity, Calendar, Clock,
    Layers,
    ShieldCheck, TrendingDown,
    TrendingUp,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart, Line,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis, YAxis
} from 'recharts';

import LoadingSpinner from '@/components/LoadingSpinner';

/* ------------------------ */
/*          TYPES           */
/* ------------------------ */

type DashboardData = {
    role: string;
    stats: {
        inventory: {
            totalProducts: number;
            totalDeliveryTickets: number;
            statusSummary: { [key: string]: number };
        };
        users: { totalStaff: number };
        finance: {
            totalRevenue: number;
            totalExpenses: number;
            netProfit: number;
            monthlyTrends: { month: string; income: number; expenses: number }[];
            categoryBreakdown: { name: string; value: number }[];
        };
        payroll: {
            totalSalariesProcessed: number;
            contribution: { avgBasic: number; avgHra: number; avgDeductions: number };
        };
        sales: {
            totalQuotes: number;
            totalSalesCount: number;
            approvalCount: number;
            pendingCount: number;
            recentActivity: { type: string; desc: string; amount: number; date: string; id: string }[];
            timeframes: { today: number; weekly: number; monthly: number; yearly: number };
        };
        hr: {
            attendanceToday: number;
        }
    }
};

const PIE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];
const STOCK_COLORS: { [key: string]: string } = {
    IN_STOCK: '#10b981',
    LOW_STOCK: '#f59e0b',
    OUT_OF_STOCK: '#ef4444'
};

function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const dashboard = await getDashboardData();
                setData(dashboard);
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        load();
    }, []);

    if (loading || !data) return <LoadingSpinner />;

    // Derived calculations
    const attendanceRatio = Math.round((data.stats.hr.attendanceToday / (data.stats.users.totalStaff || 1)) * 100);
    const stockLevels = [
        { name: 'Healthy', value: data.stats.inventory.statusSummary?.IN_STOCK || 0, color: '#10b981' },
        { name: 'Low', value: data.stats.inventory.statusSummary?.LOW_STOCK || 0, color: '#f59e0b' },
        { name: 'Out', value: data.stats.inventory.statusSummary?.OUT_OF_STOCK || 0, color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen w-full p-6 md:p-10 bg-[#f8fafc]">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white rounded-3xl shadow-xl shadow-red-600/5 border border-gray-100">
                        <ShieldCheck size={32} className="text-[#cc1518]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Corporate Intelligence Hub</p>
                            <span className="px-2 py-0.5 bg-blue-50 text-[8px] font-black text-blue-600 rounded-full uppercase tracking-tighter">Live v2.1</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#11375d] tracking-tight">
                            Welcome back, {data.role?.charAt(0).toUpperCase() || ''}{data.role?.slice(1) || ''}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Workforce</p>
                        <p className="text-sm font-black text-[#11375d]">{data.stats.hr.attendanceToday} / {data.stats.users.totalStaff} Present Today</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                        <div role="progressbar" aria-valuenow={attendanceRatio} className="relative w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-green-600" style={{ background: `conic-gradient(#10b981 ${attendanceRatio * 3.6}deg, #f1f5f9 0deg)` }}>
                            <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">{attendanceRatio}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {/* LEAD PERFORMANCE MATRIX */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 font-bold">Lead Pipeline Matrix</h2>
                        </div>
                        <button
                            onClick={() => router.push('/quote-track')}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                            View Full Funnel →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <TrendCard title="Today's Leads" value={data.stats.sales.timeframes.today} label="New Proposals" color="blue" icon={<Calendar />} />
                        <TrendCard title="Weekly Volume" value={data.stats.sales.timeframes.weekly} label="Week-to-Date" color="indigo" icon={<Activity />} />
                        <TrendCard title="Monthly Traffic" value={data.stats.sales.timeframes.monthly} label="Billing Period" color="purple" icon={<TrendingUp />} />
                        <TrendCard title="Yearly Gross" value={data.stats.sales.timeframes.yearly} label="Annual Total" color="slate" icon={<Layers />} />
                    </div>
                </section>

                {/* CORE ANALYTICS: FINANCE & CONVERSION */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* FINANCIAL TRENDS */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-[#11375d]">Financial Flux Intelligence</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Cross-Module Movement Trends</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Est. Net balance</p>
                                    <p className="text-xl font-black text-green-600">QAR {data.stats.finance.netProfit.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data.stats.finance.monthlyTrends}>
                                    <defs>
                                        <linearGradient id="fluxIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="income" fill="url(#fluxIn)" stroke="#3b82f6" strokeWidth={4} />
                                    <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
                                    <Line type="monotone" dataKey="income" stroke="#11375d" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* QUOTE STATUS & APPROVALS */}
                    <div className="bg-[#11375d] p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-black mb-1">Sales Conversion</h3>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Approval Metrics</p>
                        </div>

                        <div className="space-y-8 my-10">
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-400/20 text-yellow-400 rounded-2xl">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Waiting Action</p>
                                        <p className="text-2xl font-black">Pending leads: {data.stats.sales.pendingCount}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-green-500/20 rounded-3xl border border-green-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Revenue secured</p>
                                        <p className="text-2xl font-black">Approved leads: {data.stats.sales.approvalCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2 text-center">Conversion Velocity</p>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all duration-1000"
                                    style={{ width: `${Math.round((data.stats.sales.approvalCount / (data.stats.sales.totalQuotes || 1)) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* OPERATIONS & WORKFORCE PULSE */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* STOCK INTELLIGENCE */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-[#11375d]">Stock Intelligence</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Operational Health Status</p>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-2full">
                                <Layers size={24} />
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="flex items-end gap-1 h-20">
                                {stockLevels.map((lvl, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full rounded-t-xl transition-all duration-500 group relative"
                                            style={{ height: `${(lvl.value / (data.stats.inventory.totalProducts || 1)) * 100}%`, backgroundColor: lvl.color }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {lvl.value} SKUs
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{lvl.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total SKUs</p>
                                    <p className="text-lg font-black text-[#11375d]">{data.stats.inventory.totalProducts}</p>
                                </div>
                                <div className="text-center border-x border-gray-100">
                                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Tickets</p>
                                    <p className="text-lg font-black text-[#11375d]">{data.stats.inventory.totalDeliveryTickets}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-orange-600 uppercase mb-1">Wait Alert</p>
                                    <p className="text-lg font-black text-orange-600">{data.stats.inventory.statusSummary?.LOW_STOCK || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAYROLL & WORKFORCE PULSE */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-[#11375d]">Workforce Pulse</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Human Capital Deployment</p>
                            </div>
                            <Users className="text-purple-500" />
                        </div>
                        <div className="space-y-10">
                            <div className="flex items-center gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Payroll Composition</span>
                                        <span className="text-[10px] font-black text-gray-600 uppercase">Net Pay vs Deductions</span>
                                    </div>
                                    <div className="w-full h-8 flex rounded-xl overflow-hidden shadow-inner bg-gray-50">
                                        <div className="h-full bg-indigo-500" style={{ width: '75%' }} />
                                        <div className="h-full bg-red-400" style={{ width: '25%' }} />
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[8px] font-bold text-gray-400 uppercase">Gross</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[8px] font-bold text-gray-400 uppercase">PF/ESI/TDS</span></div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Total Payroll</p>
                                    <p className="text-xl font-black text-indigo-600">QAR {Math.round(data.stats.payroll.totalSalariesProcessed / 1000)}k</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LIVE RECORD STREAM */}
                <section className="pb-20">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 lg:col-span-2">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-[#11375d]">Live Operations Stream</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Global Record Monitoring</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full">
                                <Activity size={16} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase">Monitoring Live...</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(data.stats.sales.recentActivity || []).map((activity, idx) => (
                                <div key={idx} className="flex flex-col justify-between p-6 bg-gray-50/50 hover:bg-gray-50 transition-all hover:-translate-y-1 rounded-3xl border border-transparent hover:border-gray-200 group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-2xl ${activity.type.includes('Expense') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                                            } group-hover:scale-110 transition-transform`}>
                                            {activity.type.includes('Expense') || activity.type.includes('Payment Paid') ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                        </div>
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{activity.date}</span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">{activity.type}</p>
                                        <p className="text-sm font-black text-[#11375d] line-clamp-1">{activity.desc}</p>
                                        <p className={`text-lg font-black mt-2 ${activity.type.includes('Expense') || activity.type.includes('Payment Paid') ? 'text-red-500' : 'text-green-500'
                                            }`}>
                                            QAR {activity.amount?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

/* ------------------------ */
/*    HELPER COMPONENTS     */
/* ------------------------ */

const TrendCard = ({ title, value, label, color, icon }: any) => {
    const themes = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        slate: 'text-slate-600 bg-slate-50 border-slate-100',
    };
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${themes[color as keyof typeof themes]}`}>
                    {icon}
                </div>
                <div className="flex items-center gap-1 text-[8px] font-black text-green-500 uppercase">
                    <TrendingUp size={10} /> Trend Tracking
                </div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-3xl font-black text-[#11375d]">{value || 0}</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">{label}</p>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#11375d] p-4 rounded-2xl shadow-2xl border border-white/10">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">{label}</p>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-400 flex items-center justify-between gap-6">
                        <span className="uppercase text-[9px] tracking-tighter">Inflow:</span>
                        QAR {payload[0]?.value?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm font-bold text-red-400 flex items-center justify-between gap-6">
                        <span className="uppercase text-[9px] tracking-tighter">Outflow:</span>
                        QAR {payload[1]?.value?.toLocaleString() || 0}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default Dashboard;
