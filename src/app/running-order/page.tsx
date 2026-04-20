'use client';

import { RunningOrderFilterBar } from '@/components/running-order/RunningOrderFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { RunningOrder } from '@/lib/types';
import { deleteRunningOrder, getRunningOrders, updateRunningOrderStatusApi } from '@/services/runningOrderApi';
import { format } from 'date-fns';
import {
  Filter,
  Edit2,
  BarChart2,
  Eye,
  Trash2,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Order placed': return '#f59e0b';
        case 'Production going on': return '#2563eb';
        case 'Ready to dispatch': return '#8b5cf6';
        case 'Loaded': return '#3b82f6';
        case 'On the way to port': return '#06b6d4';
        case 'Arrive at port': return '#0d9488';
        case 'Depart from port': return '#0f766e';
        case 'In transit to destination': return '#6366f1';
        case 'Arrived at destination': return '#10b981';
        case 'Completed': return '#047857';
        default: return '#6b7280';
    }
};

const RunningOrdersPage = () => {
    const [orders, setOrders] = useState<RunningOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const { can } = useAuth();

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();

    const toggleActionMenu = (id: string) => {
        setOpenMenu(openMenu === id ? null : id);
    };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const {
                result,
                totalPages: fetchedTotalPages,
                totalCount: fetchedTotalCount,
            } = await getRunningOrders(
                searchTerm,
                currentPage,
                limit,
                statusFilter
            );

            setOrders(result ?? []);
            setTotalPages(fetchedTotalPages ?? 1);
            setTotalCount(fetchedTotalCount ?? 0);
        } catch (err) {
            console.error('Fetch orders error', err);
            setOrders([]);
            toast.error('Failed to load orders.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage, limit, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleDelete = async (id: string) => {
        toast.custom((t) => (
            <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <p className="font-medium text-gray-800">Are you sure you want to delete this running order?</p>
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => toast.dismiss(t)} className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">Cancel</button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t);
                            const loadingId = toast.loading('Deleting...');
                            try {
                                await deleteRunningOrder(id);
                                toast.dismiss(loadingId);
                                toast.success('Deleted successfully!');
                                fetchOrders();
                            } catch {
                                toast.dismiss(loadingId);
                                toast.error('Failed to delete.');
                            }
                        }}
                        className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        ));
    };

    const columns: Column<RunningOrder>[] = useMemo(() => {
        const baseColumns: Column<RunningOrder>[] = [
            {
                accessor: 'order_number',
                header: 'Order #',
                render: (order) => (
                    <span className="font-black text-[#0f766e] tracking-tight text-sm uppercase">{order.order_number}</span>
                )
            },
            {
                accessor: 'invoice_number',
                header: 'Invoice #',
                render: (order) => (
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{order.invoice_number || '---'}</span>
                )
            },
            {
                accessor: 'po_number',
                header: 'PO Number',
                render: (order) => (
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{order.po_number || '---'}</span>
                )
            },
            { 
                accessor: 'ordered_date', 
                header: 'Order Date',
                render: (order) => (
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">
                            {order.ordered_date ? format(new Date(order.ordered_date), 'dd MMM yyyy') : '--'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Scheduled Date</span>
                    </div>
                )
            },
            {
                accessor: 'transaction_type',
                header: 'Type',
                render: (order) => (
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border 
                        ${order.transaction_type === 'Sale' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          order.transaction_type === 'Hire' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          'bg-purple-50 text-purple-700 border-purple-100'}`}>
                        {order.transaction_type || 'Sale'}
                    </span>
                )
            },
            {
                accessor: 'items' as any,
                header: 'Inventory Metrics',
                render: (order) => {
                    const totalQty = order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 min-w-[60px]">
                                <span className="text-[10px] font-black text-[#0f766e]">{order.items?.length || 0}</span>
                                <span className="text-[7px] font-black text-gray-300 uppercase">Items</span>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-[#0f766e]/5 border border-[#0f766e]/10 rounded-lg px-2 py-1 min-w-[60px]">
                                <span className="text-[10px] font-black text-[#0f766e]">{totalQty}</span>
                                <span className="text-[7px] font-black text-[#0f766e]/30 uppercase">Total Qty</span>
                            </div>
                        </div>
                    );
                }
            },

            {
                accessor: 'createdAt' as any,
                header: 'Created Date',
                render: (order: RunningOrder) => (
                    <span className="text-xs font-bold text-gray-500">
                        {(order as any).createdAt ? format(new Date((order as any).createdAt), 'dd MMM yyyy') : '--'}
                    </span>
                ),
            },
            {
                accessor: 'createdBy' as any,
                header: 'Created By',
                render: (order: RunningOrder) => (
                    <span className="text-[9px] text-[#0f766e] font-black uppercase tracking-widest">
                        {typeof (order as any).createdBy === 'object' ? (order as any).createdBy.name : ((order as any).createdBy || 'System')}
                    </span>
                ),
            },
        ];

        baseColumns.push({
            accessor: 'actions' as keyof RunningOrder,
            header: 'Actions',
            render: (order) => (
                <div className="flex items-center gap-2">
                    {can('running_order', 'view') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/running-order/${(order as any)._id}/report`);
                            }}
                            className="w-9 h-9 flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all border border-gray-100 hover:border-emerald-200"
                            title="Lifecycle Report"
                        >
                            <BarChart2 className="w-4 h-4" />
                        </button>
                    )}
                    {can('running_order', 'view') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/running-order/${(order as any)._id}`);
                            }}
                            className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
                            title="View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                    {can('running_order', 'update') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/running-order/edit/${(order as any)._id}`);
                            }}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {can('running_order', 'delete') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if ((order as any)._id) handleDelete((order as any)._id);
                            }}
                            className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        });

    return baseColumns;
  }, [orders, router, handleDelete, can]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
            <ListPageHeader
                eyebrow="Production Tracker"
                title="Active"
                highlight="Orders"
                description="Track manufacturing status, shipping milestones, and logistics dates."
                actions={
                    <>
                    <button
                        onClick={() => router.push('/running-order/add')}
                        className="page-header-button"
                    >
                        <Plus className="w-4 h-4" /> New Tracker
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="page-header-button secondary"
                    >
                        <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Filter'}
                    </button>
                    </>
                }
            />

            {showFilters && (
                <RunningOrderFilterBar
                    onStatusChange={setStatusFilter}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setStatusFilter(undefined);
                        setCurrentPage(1);
                    }}
                    initialStatus={statusFilter}
                />
            )}

            <div className="mb-6">
                <SearchInput
                    initialSearchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by client, invoice or company..."
                />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable
                    columns={columns}
                    data={orders}
                    onRowClick={(order) => {
                        if (can('running_order', 'view')) {
                            router.push(`/running-order/${(order as any)._id}`);
                        }
                    }}
                    serverSidePagination={true}
                    totalCount={totalCount}
                    currentPage={currentPage}
                    limit={limit}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onLimitChange={setLimit}
                />
            )}
        </div>
    );
};

export default withAuth(RunningOrdersPage, [{ module: 'running_order', action: 'view' }]);
