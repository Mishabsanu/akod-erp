'use client';

import React from 'react';
import RawMaterialForm from '@/components/production/RawMaterialForm';
import { createRawMaterial } from '@/services/rawMaterialApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import withAuth from '@/components/withAuth';

const AddRawMaterialPage = () => {
    const router = useRouter();

    const handleSubmit = async (values: any) => {
        try {
            await createRawMaterial(values);
            toast.success('Raw material registered successfully');
            router.push('/production/raw-materials');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to register material');
        }
    };

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
                <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">New <span className="text-teal-700">Material Definition</span></h1>
                </div>
            </div>

            <div className="w-full">
                <RawMaterialForm 
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    isEditMode={false}
                />
            </div>
        </div>
    );
};

export default withAuth(AddRawMaterialPage, [{ module: 'production', action: 'create' }]);
