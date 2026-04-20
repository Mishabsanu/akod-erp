'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RawMaterialForm from '@/components/production/RawMaterialForm';
import { getRawMaterialById, updateRawMaterial } from '@/services/rawMaterialApi';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';

const EditRawMaterialPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const data = await getRawMaterialById(id as string);
                setMaterial(data);
            } catch (error) {
                toast.error('Failed to load material details');
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchMaterial();
    }, [id, router]);

    const handleSubmit = async (values: any) => {
        try {
            await updateRawMaterial(id as string, values);
            toast.success('Material definition updated');
            router.back();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update material');
        }
    };

    if (loading) return <div className="p-10"><TableSkeleton /></div>;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
            <div className="flex items-center gap-4 mb-10 group">
                <button 
                onClick={() => router.back()}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-teal-700 border border-gray-100 shadow-sm transition-all group-hover:-translate-x-1"
                >
                <ArrowLeft size={20} />
                </button>
                <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Production / Registry</p>
                <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Modify <span className="text-teal-700">Material Specification</span></h1>
                </div>
            </div>

            <div className="w-full">
                <RawMaterialForm 
                    initialData={material}
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    isEditMode={true}
                />
            </div>
        </div>
    );
};

export default withAuth(EditRawMaterialPage, [{ module: 'production', action: 'update' }]);
