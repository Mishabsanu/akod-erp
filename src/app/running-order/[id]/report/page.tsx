'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getRunningOrderById, 
  getRunningOrderFulfillment 
} from '@/services/runningOrderApi';
import { RunningOrder } from '@/lib/types';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { 
  Package, 
  Truck, 
  RotateCcw, 
  BarChart, 
  ArrowLeft,
  Printer,
  Calendar,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const ReportPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<RunningOrder | null>(null);
    const [fulfillment, setFulfillment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [orderRes, fulfillmentRes] = await Promise.all([
                getRunningOrderById(id as string),
                getRunningOrderFulfillment(id as string)
            ]);
            setOrder(orderRes);
            setFulfillment(fulfillmentRes);
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="p-10"><TableSkeleton /></div>;
    if (!order || !fulfillment) return <div className="p-10 text-center">Order not found.</div>;

    const totalOrdered = order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
    const totalDelivered = fulfillment.items?.reduce((acc: number, item: any) => acc + (item.deliveredQty || 0), 0) || 0;
    const totalReturned = fulfillment.items?.reduce((acc: number, item: any) => acc + (item.returnedQty || 0), 0) || 0;
    const netAtSite = totalDelivered - totalReturned;
    const totalPending = Math.max(0, totalOrdered - totalDelivered);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white md:bg-gray-50/50 p-4 md:p-10 font-sans print:p-0 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-wider">Back to Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchData}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                            title="Refresh Data"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
                        >
                            <Printer className="w-5 h-5" />
                            Print Report
                        </button>
                    </div>
                </div>

                {/* Report Content Container */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    
                    {/* Brand Banner */}
                    <div className="bg-[#0f766e] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <BarChart className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-teal-200 font-bold tracking-[0.2em] uppercase text-[10px] mb-2">
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                                    Lifecycle Audit Report
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mb-1">
                                    {order.invoice_number}
                                </h1>
                                <p className="text-teal-50/70 text-sm font-medium">Fulfillment & Inventory Status</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[140px]">
                                    <span className="block text-[8px] font-black text-teal-200 uppercase tracking-widest mb-1">Order Status</span>
                                    <span className="text-lg font-black">{order.status}</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[140px]">
                                    <span className="block text-[8px] font-black text-teal-200 uppercase tracking-widest mb-1">Transaction</span>
                                    <span className="text-lg font-black">{order.transaction_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-100 bg-gray-50/30">
                        <div className="p-6 border-r border-gray-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-teal-700">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Client Name</span>
                                <span className="text-sm font-bold text-gray-800">{order.client_name || order.company_name}</span>
                            </div>
                        </div>
                        <div className="p-6 border-r border-gray-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-teal-700">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">PO Reference</span>
                                <span className="text-sm font-bold text-gray-800">{order.po_number || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="p-6 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-teal-700">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Order Date</span>
                                <span className="text-sm font-bold text-gray-800">{order.ordered_date ? format(new Date(order.ordered_date), 'dd MMM yyyy') : '--'}</span>
                            </div>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-sky-50/50 border border-sky-100 rounded-[1.5rem] p-6 group hover:bg-sky-600 transition-all duration-500 cursor-default">
                             <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-sky-600 transition-colors">
                                    <Package className="w-5 h-5" />
                                </div>
                             </div>
                             <span className="block text-[9px] font-black text-sky-400 uppercase tracking-widest group-hover:text-sky-100">Total Ordered</span>
                             <span className="text-3xl font-black text-sky-900 group-hover:text-white">{totalOrdered.toLocaleString()}</span>
                        </div>

                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] p-6 group hover:bg-emerald-600 transition-all duration-500 cursor-default">
                             <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-emerald-600 uppercase">
                                    {totalOrdered > 0 ? ((totalDelivered/totalOrdered)*100).toFixed(0) : 0}% Dispatched
                                </div>
                             </div>
                             <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-widest group-hover:text-emerald-100">Total Delivered</span>
                             <span className="text-3xl font-black text-emerald-900 group-hover:text-white">{totalDelivered.toLocaleString()}</span>
                        </div>

                        <div className="bg-amber-50/50 border border-amber-100 rounded-[1.5rem] p-6 group hover:bg-amber-600 transition-all duration-500 cursor-default">
                             <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-amber-600 transition-colors">
                                    <Clock className="w-5 h-5" />
                                </div>
                             </div>
                             <span className="block text-[9px] font-black text-amber-400 uppercase tracking-widest group-hover:text-amber-100">Pending Dispatch</span>
                             <span className="text-3xl font-black text-amber-900 group-hover:text-white">{totalPending.toLocaleString()}</span>
                        </div>

                        <div className="bg-rose-50/50 border border-rose-100 rounded-[1.5rem] p-6 group hover:bg-rose-600 transition-all duration-500 cursor-default">
                             <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-rose-600 transition-colors">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                             </div>
                             <span className="block text-[9px] font-black text-rose-400 uppercase tracking-widest group-hover:text-rose-100">Current Site Balance</span>
                             <span className="text-3xl font-black text-rose-900 group-hover:text-white">{netAtSite.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Lifecycle Breakdown Table */}
                    <div className="px-8 pb-8">
                        <div className="bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm">
                            <div className="bg-gray-50/50 border-b border-gray-100 p-4 px-6 flex items-center justify-between">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Inventory Lifecycle Breakdown</h3>
                                <span className="text-[10px] font-bold text-gray-400">Values in Units</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">S/N</th>
                                            <th className="px-6 py-4">Product Component</th>
                                            <th className="px-6 py-4 text-center bg-sky-50/30">Ordered</th>
                                            <th className="px-6 py-4 text-center bg-emerald-50/30 text-emerald-600">Delivered</th>
                                            <th className="px-6 py-4 text-center text-amber-600 bg-amber-50/30 font-black italic">Outstanding</th>
                                            <th className="px-6 py-4 text-center bg-rose-50/30 text-rose-600">Returned</th>
                                            <th className="px-6 py-4 text-center bg-sky-600 text-white shadow-inner font-black">Site Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {fulfillment.items.map((item: any, idx: number) => {
                                            const siteBalance = Math.max(0, item.deliveredQty - item.returnedQty);
                                            const dispatchBal = Math.max(0, item.orderedQty - item.deliveredQty);
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-5 text-[11px] font-bold text-gray-400">{idx + 1}</td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{item.name}</span>
                                                            <span className="text-[10px] font-medium text-gray-400">{item.itemCode} • {item.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center font-bold text-gray-600 bg-sky-50/10">{item.orderedQty}</td>
                                                    <td className="px-6 py-5 text-center font-bold text-emerald-600 bg-emerald-50/10">{item.deliveredQty}</td>
                                                    <td className="px-6 py-5 text-center font-black text-amber-600 bg-amber-50/10 italic">{dispatchBal}</td>
                                                    <td className="px-6 py-5 text-center font-bold text-rose-600 bg-rose-50/10">{item.returnedQty}</td>
                                                    <td className="px-6 py-5 text-center font-black text-sky-800 bg-sky-100/50 text-base">{siteBalance}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Logistics Timeline Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 border-t border-gray-100 bg-gray-50/30">
                        {/* Deliveries */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                                    <Truck className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Dispatch Summary</h3>
                            </div>
                            <div className="space-y-3">
                                {fulfillment.tickets.deliveries.length > 0 ? fulfillment.tickets.deliveries.map((d: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full border-2 border-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">#{i+1}</div>
                                            <div>
                                                <span className="block text-sm font-black text-gray-800 group-hover:text-emerald-700 transition-colors uppercase">{d.ticketNo}</span>
                                                <span className="text-[10px] font-bold text-gray-400 capitalize">{format(new Date(d.date), 'dd MMM yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-teal-700">{d.qty} Units</span>
                                                <span className="text-[8px] font-black text-gray-400 uppercase">Shipped</span>
                                            </div>
                                            <button 
                                                onClick={() => router.push(`/delivery-ticket/${d._id}`)}
                                                className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No deliveries recorded</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Returns */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-rose-600 text-white rounded-lg flex items-center justify-center">
                                    <RotateCcw className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Return History</h3>
                            </div>
                            <div className="space-y-3">
                                {fulfillment.tickets.returns.length > 0 ? fulfillment.tickets.returns.map((r: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full border-2 border-rose-50 text-rose-600 flex items-center justify-center font-black text-xs">#{i+1}</div>
                                            <div>
                                                <span className="block text-sm font-black text-gray-800 group-hover:text-rose-700 transition-colors uppercase">{r.ticketNo}</span>
                                                <span className="text-[10px] font-bold text-gray-400 capitalize">{format(new Date(r.date), 'dd MMM yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-rose-700">{r.qty} Units</span>
                                                <span className="text-[8px] font-black text-gray-400 uppercase">Reverted</span>
                                            </div>
                                            <button 
                                                onClick={() => router.push(`/return-ticket/${r._id}`)}
                                                className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-600 hover:text-white transition-all"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No returns recorded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Certification */}
                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Automated Lifecycle Audit Report Generated on {format(new Date(), 'dd MMMM yyyy HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AKOD ERP SYSTEM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles Overlay */}
            <style jsx global>{`
                @media print {
                    body { background: white !important; padding: 0 !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border-none { border: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:rounded-none { border-radius: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default withAuth(ReportPage, [{ module: 'running_order', action: 'view' }]);
