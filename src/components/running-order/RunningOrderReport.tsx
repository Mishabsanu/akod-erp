'use client';

import React from 'react';
import { format } from 'date-fns';
import {
    Truck,
    RotateCcw as ReturnIcon,
} from 'lucide-react';
import { RunningOrder } from '@/lib/types';

interface RunningOrderReportProps {
    order: RunningOrder;
    fulfillment: any;
    reportDate?: Date;
}

const RunningOrderReport = React.forwardRef<HTMLDivElement, RunningOrderReportProps>(({ order, fulfillment, reportDate = new Date() }, ref) => {
    return (
        <div ref={ref} className="bg-white text-black w-[210mm] min-h-[297mm] px-12 py-12 relative overflow-hidden text-[10pt] font-sans print:border-none print:shadow-none flex flex-col border border-slate-200">

            {/* --- DOCUMENT HEADER --- */}
            <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
                <div className="flex-1">
                    <h2 className="font-black text-[14pt] text-slate-900 uppercase tracking-tighter mb-2 leading-none">Proserve Trading & Services WLL</h2>
                    <div className="text-[10pt] text-slate-500 font-medium space-y-1">
                        <p>Tel: <span className="text-slate-700 font-bold">+974 4421 4042</span></p>
                        <p>Mob: <span className="text-slate-700 font-bold">+974 3030 3613</span></p>
                        <p className="text-[#0f766e] font-bold">info@proservets.com</p>
                    </div>
                </div>

                <div className="flex flex-col items-center flex-1">
                    <div className="w-56 h-24">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>

                <div className="text-right flex-1">
                    <h1 className="text-3xl font-black uppercase text-slate-900 mb-1 tracking-tight">Order Report</h1>
                    <div className="text-[8pt] font-black text-[#0f766e] uppercase tracking-[0.2em] bg-teal-50 px-3 py-1 rounded inline-block">
                        Fulfillment Lifecycle
                    </div>
                </div>
            </div>

            {/* --- METADATA SECTION --- */}
            <div className="grid grid-cols-2 gap-12 mb-12 border-y border-slate-200 py-8">
                <div className="space-y-6">
                    <div>
                        <span className="text-[8.5pt] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">Client Entity / Consignee</span>
                        <div className="text-[14pt] font-black text-slate-900 uppercase leading-none border-l-4 border-[#0f766e] pl-4 py-1">
                            {order.company_name || '---'}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                        <span className="text-[8pt] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</span>
                        <span className="text-sm font-black text-slate-900">{order.invoice_number || '---'}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                        <span className="text-[8pt] font-bold text-slate-400 uppercase tracking-widest">Purchase Order</span>
                        <span className="text-sm font-black text-slate-900 uppercase">{order.po_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                        <span className="text-[8pt] font-bold text-slate-400 uppercase tracking-widest">Order Status</span>
                        <span className="text-sm font-black text-[#0f766e] uppercase tracking-tighter">{order.status}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                        <span className="text-[8pt] font-bold text-slate-400 uppercase tracking-widest">Service Type</span>
                        <span className="text-sm font-black text-slate-900 uppercase">{order.transaction_type}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                        <span className="text-[8pt] font-bold text-slate-400 uppercase tracking-widest">Project Location</span>
                        <span className="text-sm font-black text-slate-900 uppercase truncate max-w-[200px]" title={order.project_location}>{order.project_location || '---'}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                        <span className="text-[8pt] font-bold text-slate-400 uppercase tracking-widest">Report Date</span>
                        <span className="text-sm font-black text-slate-900 uppercase">{format(reportDate, 'dd MMMM yyyy')}</span>
                    </div>
                </div>
            </div>

            {/* --- ITEM BREAKDOWN TABLE --- */}
            <div className="mb-10 flex-grow">
                <table className="w-full text-left border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-900 text-[8.5pt] font-black text-slate-900 uppercase">
                            <th className="px-4 py-4 w-16 text-center border-r border-slate-300">S/N</th>
                            <th className="px-4 py-4 border-r border-slate-300">Product & Specifications</th>
                            <th className="px-4 py-4 text-center border-r border-slate-300">Ordered</th>
                            <th className="px-4 py-4 text-center border-r border-slate-300">Dispatched</th>
                            <th className="px-4 py-4 text-center border-r border-slate-300">Balance</th>
                            <th className="px-4 py-4 text-center border-r border-slate-300">Returned</th>
                            <th className="px-4 py-4 text-right bg-slate-50/80">Site Stock</th>
                        </tr>
                    </thead>
                    <tbody className="text-[10pt]">
                        {fulfillment.items.map((item: any, idx: number) => {
                            const siteBal = Math.max(0, item.deliveredQty - item.returnedQty);
                            const outBal = Math.max(0, item.orderedQty - item.deliveredQty);
                            return (
                                <tr key={idx} className="border-b border-slate-200">
                                    <td className="px-4 py-4 text-center border-r border-slate-300 font-bold text-slate-400">0{idx + 1}</td>
                                    <td className="px-4 py-4 border-r border-slate-300">
                                        <div className="font-black text-slate-900 uppercase leading-none mb-1">{item.name}</div>
                                        <div className="text-[7.5pt] font-black text-slate-400 tracking-widest uppercase">{item.itemCode}</div>
                                    </td>
                                    <td className="px-4 py-4 text-center border-r border-slate-300 font-bold">{item.orderedQty}</td>
                                    <td className="px-4 py-4 text-center border-r border-slate-300 font-black text-[#0f766e]">+{item.deliveredQty}</td>
                                    <td className="px-4 py-4 text-center border-r border-slate-300 font-black text-amber-600 italic">
                                        {outBal > 0 ? outBal : '-'}
                                    </td>
                                    <td className="px-4 py-4 text-center border-r border-slate-300 font-bold text-rose-500">
                                        {item.returnedQty > 0 ? `-${item.returnedQty}` : '-'}
                                    </td>
                                    <td className="px-4 py-4 text-right font-black text-[#0f766e] bg-[#0f766e]/5">{siteBal}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- LOGISTICS APPENDICES --- */}
            <div className="grid grid-cols-2 gap-12 mb-16">
                <div>
                    <h4 className="text-[9pt] font-black uppercase text-[#0f766e] mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                        <Truck size={14} /> Historical Delivery Logs
                    </h4>
                    <div className="space-y-1">
                        {fulfillment.tickets.deliveries.length > 0 ? fulfillment.tickets.deliveries.map((t: any, i: number) => (
                            <div key={i} className="flex justify-between items-center px-3 py-2 bg-slate-50/50 rounded border border-slate-100">
                                <span className="text-[8pt] font-bold text-slate-500 uppercase tracking-tight">{t.ticketNo}</span>
                                <span className="text-[9pt] font-black text-[#0f766e]">+{t.qty} units</span>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-[8pt] text-slate-400 italic bg-slate-50/30 rounded border border-dashed border-slate-200">No delivery transactions</div>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-[9pt] font-black uppercase text-rose-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                        <ReturnIcon size={14} /> Historical Return Logs
                    </h4>
                    <div className="space-y-1">
                        {fulfillment.tickets.returns.length > 0 ? fulfillment.tickets.returns.map((t: any, i: number) => (
                            <div key={i} className="flex justify-between items-center px-3 py-2 bg-slate-50/50 rounded border border-slate-100">
                                <span className="text-[8pt] font-bold text-slate-500 uppercase tracking-tight">{t.ticketNo}</span>
                                <span className="text-[9pt] font-black text-rose-600">-{t.qty} units</span>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-[8pt] text-slate-400 italic bg-slate-50/30 rounded border border-dashed border-slate-200">No return transactions</div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- FINAL SIGNATURE --- */}
            <div className="mt-auto border-t-2 border-slate-900 pt-10 pb-6">
                <div className="flex justify-between items-end px-4">
                    <div className="space-y-1">
                        <p className="text-[10pt] font-black text-slate-900">Received above items in good condition</p>
                        <p className="text-[9pt] font-bold text-slate-400">(E & O.E)</p>
                    </div>
                    <div className="text-center w-64">
                        <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
                        <p className="text-[9pt] font-black uppercase text-slate-900">Prepared by supervisor</p>
                        <p className="text-[8pt] font-bold text-slate-400 uppercase mt-1">Sign & Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

RunningOrderReport.displayName = 'RunningOrderReport';

export default RunningOrderReport;
