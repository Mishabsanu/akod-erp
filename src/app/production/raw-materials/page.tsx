'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Plus, Search, Edit2, Trash2, Layers, PackageSearch } from 'lucide-react';
import { getRawMaterials, deleteRawMaterial } from '@/services/rawMaterialApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';

const RawMaterialRegistryPage = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRawMaterials();
            setMaterials(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to load raw materials');
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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Delete this raw material definition?')) return;
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
            render: (item) => <span className="font-black text-gray-800 tracking-tight">{item.name}</span>
        },
        {
            accessor: 'unit',
            header: 'Unit',
            render: (item) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{item.unit}</span>
        },
        {
            accessor: 'reorderLevel',
            header: 'Alert Qty',
            render: (item) => <span className="font-bold text-rose-600">{item.reorderLevel.toLocaleString()}</span>
        },
        {
            accessor: 'description',
            header: 'Specifications',
            render: (item) => <span className="text-xs text-gray-500 font-medium line-clamp-1 max-w-[250px]">{item.description || '—'}</span>
        },
        {
            accessor: 'actions',
            header: 'Actions',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/production/raw-materials/edit/${item._id}`); }} className="p-2 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all border border-gray-50">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(item._id, e)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-gray-50">
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
            <ListPageHeader
                eyebrow="Production Hub"
                title="Material"
                highlight="Registry"
                description="Define resource blueprints and fabrication specifications."
                actions={
                    <div className="flex gap-4">
                        <button onClick={() => router.push('/production/raw-materials/stock')} className="page-header-button secondary">
                            <PackageSearch size={16} />
                            View Stock
                        </button>
                        <button onClick={() => router.push('/production/raw-materials/add')} className="page-header-button">
                            <Plus size={16} />
                            Register Material
                        </button>
                    </div>
                }
            />

            <div className="mb-8 relative max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search registry by name or code..." 
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
                    onRowClick={(item) => router.push(`/production/raw-materials/edit/${item._id}`)}
                    serverSidePagination={false}
                />
            )}
        </div>
    );
};

export default withAuth(RawMaterialRegistryPage, [{ module: 'production', action: 'view' }]);
