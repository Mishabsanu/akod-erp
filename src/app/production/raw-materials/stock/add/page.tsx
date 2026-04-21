'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adjustRawMaterialStock } from '@/services/rawMaterialApi';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import RawMaterialStockAdjustmentForm from '@/components/production/RawMaterialStockAdjustmentForm';
import { ArrowLeft } from 'lucide-react';

const StockAdjustmentPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedId = searchParams.get('materialId') || undefined;

    const handleAdjustment = async (materialId: string, quantity: number, note?: string) => {
        try {
            await adjustRawMaterialStock(materialId, quantity, note);
            toast.success('Stock adjusted successfully');
            
            // Navigate back to history if we came from one, otherwise to the main stock list
            if (preselectedId) {
                router.push(`/production/raw-materials/view/${preselectedId}`);
            } else {
                router.push('/production/raw-materials/stock');
            }
        } catch (error) {
            throw error; // Re-throw so the form can handle the error state
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-teal-700 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-gray-50">
                    <RawMaterialStockAdjustmentForm 
                        onSubmit={handleAdjustment}
                        onCancel={() => router.back()}
                        initialMaterialId={preselectedId}
                    />
                </div>
                
                <div className="px-10 py-6 bg-teal-50/30 rounded-3xl border border-teal-50 flex items-start gap-4">
                    <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                        <ArrowLeft size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-1">Administrative Note</p>
                        <p className="text-xs text-teal-600/80 font-medium leading-relaxed">
                            Authorized personnel only. Every adjustment made on this page is logged with your user ID and timestamp for the monthly inventory audit report.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StockAdjustmentPage = () => (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">Loading procurement environment...</div>}>
        <StockAdjustmentPageContent />
    </Suspense>
);

export default withAuth(StockAdjustmentPage, [{ module: 'production', action: 'update' }]);
