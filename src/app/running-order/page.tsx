'use client';

import { RunningOrderFilterBar } from '@/components/running-order/RunningOrderFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { RunningOrder } from '@/lib/types';
import { deleteRunningOrder, getRunningOrders, updateRunningOrderStatusApi } from '@/services/runningOrderApi';
import { format } from 'date-fns';
import {
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pending': return '#f59e0b'; // Amber
        case 'Production': return '#2563eb'; // Blue
        case 'Shipped': return '#8b5cf6'; // Purple
        case 'Delivered': return '#16a34a'; // Green
        case 'Closed': return '#11375d'; // Navy
        default: return '#6b7280';
    }
};

const RunningOrdersPage = () => {
    const [orders, setOrders] = useState<RunningOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();
    const { can } = useAuth();

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
                            } catch (error: any) {
                                toast.dismiss(loadingId);
                                toast.error('Failed to delete.');
                            }
                        }}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
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
                accessor: 'client_name', 
                header: 'Client & Company',
                render: (order) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{order.client_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{order.company_name}</span>
                    </div>
                )
            },
            {
                accessor: 'invoice_number',
                header: 'Order Details',
                render: (order) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">INV: {order.invoice_number}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">PO: {order.po_number}</span>
                    </div>
                )
            },
            {
                accessor: 'invoice_amount',
                header: 'Financials',
                render: (order) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-[#11375d]">
                            {order.currency === 'USD' ? '$' : '₹'}
                            {Number(order.invoice_amount).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            Due: {Number(order.balance_due).toLocaleString()}
                        </span>
                    </div>
                )
            },
            {
                accessor: 'etd',
                header: 'Logistics (ETD/ETA)',
                render: (order) => (
                    <div className="flex gap-4 items-center">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">ETD</span>
                            <span className="text-[10px] font-bold text-gray-600">{order.etd ? format(new Date(order.etd), 'dd MMM') : '-'}</span>
                        </div>
                        <div className="w-px h-6 bg-gray-100"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">ETA</span>
                            <span className="text-[10px] font-bold text-gray-600">{order.eta ? format(new Date(order.eta), 'dd MMM') : '-'}</span>
                        </div>
                    </div>
                )
            },
            {
                accessor: 'status',
                header: 'Status',
                render: (order) => (
                    <div onClick={e => e.stopPropagation()} className="relative">
                        <select
                            value={order.status}
                            onChange={async (e) => {
                                const newStatus = e.target.value;
                                const loadingId = toast.loading('Updating...');
                                try {
                                    await updateRunningOrderStatusApi((order as any)._id, newStatus);
                                    order.status = newStatus;
                                    setOrders([...orders]);
                                    toast.success('Status updated!');
                                } catch {
                                    toast.error('Update failed');
                                } finally {
                                    toast.dismiss(loadingId);
                                }
                            }}
                            className="appearance-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border-0 cursor-pointer shadow-sm transition-transform active:scale-95 outline-none"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Production">Production</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                ),
            },
        ];

        baseColumns.push({
            accessor: 'actions' as keyof RunningOrder,
            header: 'Actions',
            render: (order) => (
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if ((order as any)._id) toggleActionMenu((order as any)._id);
                        }}
                        className="text-gray-600 hover:text-[#11375d] transition"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === (order as any)._id && (
                        <div className="absolute right-0 top-[calc(100%+8px)] w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/running-order/edit/${(order as any)._id}`);
                                }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Edit2 className="w-4 h-4 text-[#11375d]" /> Edit Order
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if ((order as any)._id) handleDelete((order as any)._id);
                                }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-xs font-semibold text-[#cc1518] hover:bg-red-50 transition-colors border-t border-gray-50"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            ),
        });

        return baseColumns;
    }, [openMenu, orders]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#11375d] to-[#0a2339] flex items-center justify-center text-white shadow-lg">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Active Orders</h1>
                        <p className="text-gray-400 text-sm font-medium">Track manufacturing & shipping logistics</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <button
                        onClick={() => router.push('/running-order/add')}
                        className="flex items-center gap-2 bg-[#cc1518] hover:bg-[#b01215] text-white font-bold py-2.5 px-6 rounded-xl shadow shadow-red-500/20 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4" /> New Tracker
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-6 rounded-xl shadow shadow-gray-200/20 transition-all text-xs uppercase tracking-widest"
                    >
                        <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Filter'}
                    </button>
                </div>
            </div>

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
                    onRowClick={(order) => router.push(`/running-order/${(order as any)._id}`)}
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
