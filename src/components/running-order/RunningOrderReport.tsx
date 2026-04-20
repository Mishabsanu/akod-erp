'use client';

import React from 'react';
import { format } from 'date-fns';
import { 
  Truck, 
  RotateCcw as ReturnIcon,
  CheckCircle2
} from 'lucide-react';
import { RunningOrder } from '@/lib/types';

interface RunningOrderReportProps {
    order: RunningOrder;
    fulfillment: any;
    reportDate?: Date;
}

const RunningOrderReport = React.forwardRef<HTMLDivElement, RunningOrderReportProps>(({ order, fulfillment, reportDate = new Date() }, ref) => {
    const totalOrdered = order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
    const totalDelivered = fulfillment.items?.reduce((acc: number, item: any) => acc + (item.deliveredQty || 0), 0) || 0;
    const totalReturned = fulfillment.items?.reduce((acc: number, item: any) => acc + (item.returnedQty || 0), 0) || 0;
    const netAtSite = totalDelivered - totalReturned;
    const totalPending = Math.max(0, totalOrdered - totalDelivered);

    return (
        <div ref={ref} className="bg-white text-black w-[210mm] min-h-[297mm] px-12 py-12 relative overflow-hidden text-[10pt] border border-slate-100 font-sans print:border-none print:shadow-none">
            
            {/* --- DOCUMENT HEADER (PROSERVE BRANDING) --- */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
                <div className="text-[8pt] text-slate-700 space-y-0.5 pt-2">
                    <div className="flex items-center gap-1 mb-2">
                        <div className="w-1.5 h-1.5 bg-[#0f766e] rounded-full" />
                        <p className="font-black text-[10pt] text-slate-900 tracking-tighter uppercase">PROSERVE TRADING & SERVICES</p>
                    </div>
                    <p>Tel: +974 4421 4042 | C.R. No: 147701</p>
                    <p>Mob: +974 3030 3613 | P.O. Box: 9044</p>
                    <p className="font-black text-slate-900 mt-1 uppercase tracking-tight">Doha - State of Qatar</p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-40 h-16 mb-2">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>

                <div className="text-right">
                    <h1 className="text-2xl font-black uppercase text-[#0f766e] tracking-[0.05em] leading-none mb-2">Audit Report</h1>
                    <div className="text-[8pt] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded inline-block">
                       Fulfillment Lifecycle
                    </div>
                </div>
            </div>

            {/* --- AUDIT METADATA GRID --- */}
            <div className="grid grid-cols-2 gap-0 border border-slate-800 border-b-0 mb-8">
                <div className="p-4 border-r border-b border-slate-800 bg-slate-50/50">
                    <span className="text-[8pt] font-black text-slate-400 uppercase tracking-widest block mb-1">Order Number</span>
                    <div className="text-sm font-black text-slate-900 uppercase">{order.order_number}</div>
                </div>
                <div className="p-4 border-b border-slate-800">
                    <span className="text-[8pt] font-black text-slate-400 uppercase tracking-widest block mb-1">Customer / Client</span>
                    <div className="text-sm font-black text-slate-900 uppercase truncate">{order.client_name || order.company_name}</div>
                </div>
                <div className="p-4 border-r border-b border-slate-800">
                    <span className="text-[8pt] font-black text-slate-400 uppercase tracking-widest block mb-1">PO Reference</span>
                    <div className="text-sm font-black text-slate-800">{order.po_number || 'N/A'}</div>
                </div>
                <div className="p-4 border-b border-slate-800 bg-slate-50/50">
                    <span className="text-[8pt] font-black text-slate-400 uppercase tracking-widest block mb-1">Report Generation Date</span>
                    <div className="text-sm font-black text-slate-800 uppercase">{format(reportDate, 'dd MMMM yyyy (HH:mm)')}</div>
                </div>
            </div>

            {/* --- EXECUTIVE SUMMARY --- */}
            <div className="mb-8 overflow-hidden border-2 border-slate-900">
                <div className="bg-slate-900 text-white px-4 py-2 text-[8pt] font-black uppercase tracking-[0.1em] flex justify-between">
                    <span>Executive Fulfillment Summary</span>
                    <span>Inventory Audit Snapshot</span>
                </div>
                <div className="grid grid-cols-4 divide-x-2 divide-slate-900 bg-slate-50 text-center">
                    <div className="p-4">
                        <span className="block text-[7pt] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ordered</span>
                        <span className="text-xl font-black text-slate-900">{totalOrdered.toLocaleString()}</span>
                    </div>
                    <div className="p-4">
                        <span className="block text-[7pt] font-black text-slate-400 uppercase tracking-widest mb-1">Successfully Dispatched</span>
                        <span className="text-xl font-black text-emerald-700">{totalDelivered.toLocaleString()}</span>
                    </div>
                    <div className="p-4">
                        <span className="block text-[7pt] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding / Pending</span>
                        <span className="text-xl font-black text-amber-600">{totalPending.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-teal-800 text-white">
                        <span className="block text-[7pt] font-black text-teal-200 uppercase tracking-widest mb-1">Net Balance At Site</span>
                        <span className="text-xl font-black">{netAtSite.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* --- ITEM BREAKDOWN TABLE --- */}
            <div className="mb-10 min-h-[400px]">
                <h3 className="text-[10pt] font-black uppercase tracking-tight text-slate-900 mb-3 ml-1 flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#0f766e]" />
                    1. Inventory Lifecycle Breakdown
                </h3>
                <table className="w-full text-left border-collapse border-b border-slate-200 shadow-sm">
                    <thead>
                        <tr className="bg-slate-100 border-y-2 border-slate-900 text-[8pt] font-black text-slate-900 uppercase">
                            <th className="px-4 py-3 w-12 text-center">S/N</th>
                            <th className="px-4 py-3">Item Description</th>
                            <th className="px-4 py-3 text-center bg-slate-200/50">Ord.</th>
                            <th className="px-4 py-3 text-center">Disp.</th>
                            <th className="px-4 py-3 text-center text-amber-700">Outs.</th>
                            <th className="px-4 py-3 text-center">Ret.</th>
                            <th className="px-4 py-3 text-right bg-[#0f766e] text-white">Site Bal.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[9pt]">
                        {fulfillment.items.map((item: any, idx: number) => {
                            const siteBal = Math.max(0, item.deliveredQty - item.returnedQty);
                            const outBal = Math.max(0, item.orderedQty - item.deliveredQty);
                            return (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-black text-slate-900 uppercase">{item.name}</div>
                                        <div className="text-[7pt] font-bold text-slate-400 tracking-widest">{item.itemCode}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold bg-slate-50">{item.orderedQty}</td>
                                    <td className="px-4 py-3 text-center font-bold text-emerald-700">{item.deliveredQty}</td>
                                    <td className="px-4 py-3 text-center font-black text-amber-600 italic bg-amber-50/20">{outBal}</td>
                                    <td className="px-4 py-3 text-center font-bold text-rose-600">{item.returnedQty}</td>
                                    <td className="px-4 py-3 text-right font-black text-[#0f766e] bg-teal-50/50">{siteBal}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- LOGISTICS APPENDICES --- */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h4 className="text-[9pt] font-black uppercase text-emerald-800 mb-2 flex items-center gap-2">
                         <Truck size={14} /> Appendix A: Dispatch Records
                    </h4>
                    <div className="space-y-px border border-emerald-100 bg-emerald-50/20 rounded">
                        {fulfillment.tickets.deliveries.length > 0 ? fulfillment.tickets.deliveries.map((t: any, i:number) => (
                            <div key={i} className="flex justify-between p-2 text-[8pt] border-b border-emerald-100 bg-white">
                                <span className="font-bold text-slate-600 uppercase italic leading-none">{t.ticketNo}</span>
                                <span className="font-black text-emerald-700">+{t.qty} units</span>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-[8pt] text-slate-400 italic">No delivery records found</div>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-[9pt] font-black uppercase text-rose-800 mb-2 flex items-center gap-2">
                         <ReturnIcon size={14} /> Appendix B: Return History
                    </h4>
                     <div className="space-y-px border border-rose-100 bg-rose-50/20 rounded">
                        {fulfillment.tickets.returns.length > 0 ? fulfillment.tickets.returns.map((t: any, i:number) => (
                            <div key={i} className="flex justify-between p-2 text-[8pt] border-b border-rose-100 bg-white">
                                <span className="font-bold text-slate-600 uppercase italic leading-none">{t.ticketNo}</span>
                                <span className="font-black text-rose-700">-{t.qty} units</span>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-[8pt] text-slate-400 italic">No return records found</div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- FINAL CERTIFICATION --- */}
            <div className="mt-auto border-t-2 border-slate-900 pt-10 pb-6">
                <div className="grid grid-cols-2 gap-20">
                    <div className="text-center">
                        <div className="border-b-2 border-dotted border-slate-300 h-10 mb-2"></div>
                        <p className="text-[8pt] font-black uppercase text-slate-400 tracking-widest">Document Compiled By</p>
                        <p className="text-[10pt] font-black text-slate-900 mt-1">LOGISTICS DEPT.</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b-2 border-dotted border-slate-400 h-10 mb-2"></div>
                        <p className="text-[8pt] font-black uppercase text-slate-400 tracking-widest">Authorized Auditor Verification</p>
                        <p className="text-[10pt] font-black text-[#0f766e] mt-1 uppercase italic tracking-tighter underline">UN-AUDITED VERSION</p>
                    </div>
                </div>
                
                <div className="mt-12 flex justify-between items-end border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-[7pt] text-slate-400 font-bold uppercase tracking-widest">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Official Documentation • Confidential
                    </div>
                    <div className="text-[7pt] font-black text-slate-900">
                         PROSERVE &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED
                    </div>
                </div>
            </div>
        </div>
    );
});

RunningOrderReport.displayName = 'RunningOrderReport';

export default RunningOrderReport;
