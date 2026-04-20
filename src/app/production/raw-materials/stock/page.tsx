'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Search, AlertTriangle, Layers, Plus, TrendingDown, History, Edit2, Trash2, Eye } from 'lucide-react';
import { getRawMaterials, adjustRawMaterialStock, deleteRawMaterial } from '@/services/rawMaterialApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import RawMaterialStockAdjustmentForm from '@/components/production/RawMaterialStockAdjustmentForm';

const RawMaterialStockPage = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            // ONLY fetch initialized materials for the Stock view
            const data = await getRawMaterials({ initialized: true });
            setMaterials(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const filteredMaterials = useMemo(() => {
        return materials.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [materials, searchTerm]);

    const lowStockCount = useMemo(() => {
        return materials.filter(m => m.availableQty <= m.reorderLevel).length;
    }, [materials]);

    const handleAdjustment = async (materialId: string, quantity: number, note?: string) => {
        try {
            await adjustRawMaterialStock(materialId, quantity, note);
            toast.success('Stock updated successfully');
            fetchMaterials();
        } catch (error) {
            throw error;
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this material? This will remove all stock history.')) return;
        try {
            await deleteRawMaterial(id);
            toast.success('Material deleted');
            fetchMaterials();
        } catch (error) {
            toast.error('Failed to delete material');
        }
    };

    const columns: Column<any>[] = [
        {
            accessor: 'itemCode',
            header: 'Item Code',
            render: (item) => <span className="font-bold text-teal-700 tracking-widest uppercase">{item.itemCode}</span>
        },
        {
            accessor: 'name',
            header: 'Material Name',
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-800 tracking-tight">{item.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{item.unit}</span>
                </div>
            )
        },
        {
            accessor: 'availableQty',
            header: 'Current Stock',
            render: (item) => {
                const isLow = item.availableQty <= item.reorderLevel;
                return (
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {item.availableQty.toLocaleString()}
                        </span>
                        {isLow && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100 animate-pulse">
                                <AlertTriangle size={12} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Critical Low</span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            accessor: 'status',
            header: 'Resource Health',
            render: (item) => {
                const ratio = item.availableQty / (item.reorderLevel || 1);
                let statusColor = 'bg-emerald-500';
                let label = 'Healthy';
                
                if (ratio <= 1) { statusColor = 'bg-rose-500'; label = 'Restock Needed'; }
                else if (ratio <= 2) { statusColor = 'bg-amber-500'; label = 'Monitoring'; }

                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                    </div>
                );
            }
        },
        {
            accessor: 'actions',
            header: 'Actions',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/production/raw-materials/view/${item._id}`); }} 
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all border border-gray-100"
                        title="View Report / History"
                    >
                        <History size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/production/raw-materials/edit/${item._id}`); }} 
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all border border-gray-100"
                        title="Edit Master Registry"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={(e) => handleDelete(item._id, e)} 
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-gray-100"
                        title="Delete Material"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
            <ListPageHeader
                eyebrow="Resource Monitoring"
                title="Stock"
                highlight="Management"
                description="Manage inventory levels and restock fabrication materials."
                actions={
                    <div className="flex gap-4">
                        <button onClick={() => router.push('/production/raw-materials')} className="page-header-button secondary">
                            <Layers size={16} />
                            Registry
                        </button>
                        <button 
                            onClick={() => router.push('/production/raw-materials/stock/add')} 
                            className="page-header-button"
                        >
                            <Plus size={16} />
                            Add Stock
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Layers size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Stocked Items</p>
                    <h3 className="text-3xl font-black text-teal-700">{materials.length}</h3>
                </div>

                <div className={`p-8 rounded-[2.5rem] border shadow-xl shadow-slate-200/40 relative overflow-hidden group ${lowStockCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-gray-100'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingDown size={80} className={lowStockCount > 0 ? 'text-rose-600' : 'text-gray-400'} />
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-gray-400'}`}>Under Threshold</p>
                    <h3 className={`text-3xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-teal-700'}`}>{lowStockCount}</h3>
                </div>
            </div>

            <div className="mb-8 relative max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search stock by material name or code..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] outline-none focus:border-teal-700 transition-all shadow-sm text-sm font-medium"
                />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredMaterials}
                    onRowClick={(item) => router.push(`/production/raw-materials/view/${item._id}`)}
                    serverSidePagination={false}
                />
            )}

        </div>
    );
};

export default withAuth(RawMaterialStockPage, [{ module: 'production', action: 'view' }]);
