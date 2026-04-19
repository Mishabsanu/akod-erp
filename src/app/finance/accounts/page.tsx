'use client';

import React, { useState, useEffect } from 'react';
import { getFinanceStats } from '@/services/financeApi';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, 
  Building2, ArrowUpRight, ArrowDownRight, Activity 
} from 'lucide-react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

function FinanceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getFinanceStats();
        setData(stats);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  const chartColors = ['#0f766e', '#0ea5e9', '#059669', '#d97706', '#7c3aed', '#db2777'];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Financial Intelligence"
        title="Finance"
        highlight="Dashboard"
        description="Real-time overview of your company's performance."
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-900/5 relative overflow-hidden group hover:shadow-2xl transition-all h-full flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Revenue</span>
              <div className="p-2.5 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform"><TrendingUp size={20} /></div>
           </div>
           <div>
             <p className="text-4xl font-black text-[#0f766e] tracking-tighter mb-1">
               QAR {data?.summary?.totalRevenue?.toLocaleString()}
             </p>
             <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase tracking-widest">
                <ArrowUpRight size={14} />
                <span>Overall Income</span>
             </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-900/5 relative overflow-hidden group hover:shadow-2xl transition-all h-full flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Expenses</span>
              <div className="p-2.5 bg-teal-50 rounded-xl text-teal-700 group-hover:scale-110 transition-transform"><TrendingDown size={20} /></div>
           </div>
           <div>
             <p className="text-4xl font-black text-[#0f766e] tracking-tighter mb-1">
               QAR {data?.summary?.totalExpenses?.toLocaleString()}
             </p>
             <div className="flex items-center gap-1 text-teal-700 font-bold text-[10px] uppercase tracking-widest">
                <ArrowDownRight size={14} />
                <span>Overall Spending</span>
             </div>
           </div>
        </div>

        <div className="bg-[#0f766e] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all h-full flex flex-col justify-between text-white border-0">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-teal-100 uppercase tracking-[0.2em]">Net Balance</span>
              <div className="p-2.5 bg-white/10 rounded-xl text-teal-100 group-hover:rotate-12 transition-transform"><DollarSign size={20} /></div>
           </div>
           <div>
             <p className="text-4xl font-black text-white tracking-tighter mb-1">
               QAR {data?.summary?.totalRevenue - data?.summary?.totalExpenses?.toLocaleString()}
             </p>
             <div className="flex items-center gap-1 text-teal-100 font-bold text-[10px] uppercase tracking-widest">
                <Activity size={14} />
                <span>Corporate Liquidity</span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-900/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-[#0f766e] tracking-tight">Financial Performance Flux</h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0f766e]" /> Inflow</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-800" /> Outflow</div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyTrends || []}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  cursor={{stroke: '#0f766e', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="income" stroke="#0f766e" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#1f2937" strokeWidth={4} fill="transparent" strokeDasharray="8 8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Breakdown */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-900/5 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-6 h-6 text-[#0f766e]" />
            <h3 className="text-2xl font-black text-[#0f766e] tracking-tight">Revenue by Entity</h3>
          </div>
          
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.incomeByCompany || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 700}} width={80} />
                <Tooltip 
                   cursor={{fill: '#f9fafb'}}
                   contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {data?.incomeByCompany?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Top Sources</h4>
            <div className="space-y-3">
              {data?.incomeByCompany?.slice(0, 4).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                    <span className="font-bold text-gray-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{item.name}</span>
                  </div>
                  <span className="font-black text-gray-900 text-sm">{item.value?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(FinanceDashboard, [{ module: 'ledger', action: 'view' }]);
