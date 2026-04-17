'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Banknote, 
  ReceiptText, 
  PieChart, 
  TrendingUp, 
  Users, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import withAuth from '@/components/withAuth';

const PayrollLandingPage = () => {
  const router = useRouter();

  const cards = [
    {
      title: 'Salary Breakups',
      description: 'Define and manage employee salary structures, bonuses, and deductions.',
      icon: PieChart,
      href: '/hr/payroll/breakups',
      color: 'bg-teal-600',
      stats: '14 Active Templates'
    },
    {
      title: 'Salary Slips',
      description: 'Generate, view, and authorize monthly payment slips for all staff members.',
      icon: ReceiptText,
      href: '/hr/payroll/slips',
      color: 'bg-[#0f172a]',
      stats: 'Monthly Cycle Active'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <ListPageHeader
        eyebrow="Financial Operations"
        title="Payroll"
        highlight="Management"
        description="Oversee employee compensation, tax compliance, and automated salary disbursement."
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Total Disbursements</span>
            <p className="text-3xl font-black text-gray-900 tracking-tight">QAR 142,500</p>
            <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
              <TrendingUp size={14} />
              <span>+4.2% from last month</span>
            </div>
          </div>
          <Banknote size={80} className="absolute -right-4 -bottom-4 text-gray-50 group-hover:text-teal-50 transition-colors" />
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Active Workforce</span>
            <p className="text-3xl font-black text-gray-900 tracking-tight">42 Employees</p>
            <div className="mt-4 flex items-center gap-2 text-teal-600 font-bold text-xs bg-teal-50 w-fit px-3 py-1 rounded-full border border-teal-100">
              <Users size={14} />
              <span>Full compliance verified</span>
            </div>
          </div>
          <ShieldCheck size={80} className="absolute -right-4 -bottom-4 text-gray-50 group-hover:text-teal-50 transition-colors" />
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Next Payout Cycle</span>
            <p className="text-3xl font-black text-gray-900 tracking-tight">30 Apr 2026</p>
            <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold text-xs bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
              <Clock size={14} />
              <span>12 days remaining</span>
            </div>
          </div>
          <TrendingUp size={80} className="absolute -right-4 -bottom-4 text-gray-50 group-hover:text-amber-50 transition-colors" />
        </div>
      </div>

      {/* Navigation Grid */}
      <h2 className="text-xl font-black text-gray-900 mb-6 px-2 flex items-center gap-3">
        System <span className="text-[#0f766e]">Modules</span>
        <div className="h-px bg-gray-100 flex-1" />
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => router.push(card.href)}
            className="flex items-stretch group text-left transition-all hover:-translate-y-1"
          >
            <div className={`${card.color} w-3 rounded-l-3xl shadow-lg shadow-teal-900/10`} />
            <div className="flex-1 bg-white p-10 rounded-r-3xl border border-gray-100 shadow-xl shadow-slate-200/30 flex justify-between items-center group-hover:border-teal-100">
              <div className="max-w-md">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#0f766e] group-hover:text-white transition-all mb-6">
                  <card.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-[#0f766e] transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">
                  {card.description}
                </p>
                <div className="inline-flex items-center gap-2 text-[10px] font-black text-[#0f766e] uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
                  {card.stats}
                </div>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-gray-50 flex items-center justify-center text-gray-300 group-hover:scale-110 group-hover:border-[#0f766e] group-hover:text-[#0f766e] transition-all">
                <ArrowRight size={24} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Policy Reminder */}
      <div className="mt-12 p-8 bg-[#0f172a] rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
        <div className="relative z-10 flex-1">
          <h3 className="text-xl font-black tracking-tight mb-2">Automated Compliance Monitoring</h3>
          <p className="text-slate-400 font-medium leading-relaxed max-w-2xl">
            All payroll operations are logged and audited in real-time. Please ensure all variable inputs like overtime and deductions are verified before cycle authorization.
          </p>
        </div>
        <div className="relative z-10">
          <button className="px-8 py-4 bg-[#0f766e] hover:bg-[#115e59] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#0f766e]/20 active:scale-95">
            View Policy Manual
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-none" />
      </div>
    </div>
  );
};

export default withAuth(PayrollLandingPage, [{ module: 'payroll', action: 'view' }]);
