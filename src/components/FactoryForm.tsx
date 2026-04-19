'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { getProductDropdown } from '@/services/catalogApi';
import { FormikProvider, useFormik } from 'formik';
import { Building2, CheckCircle2, Camera, Package, Hash, Calendar as CalendarIcon, Clock, Edit3, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

const ProductionValidationSchema = Yup.object({
  productId: Yup.string().required('Product is required'),
  quantity: Yup.number().required('Quantity is required').min(1, 'Minimum 1 unit'),
  batchNumber: Yup.string().required('Batch number is required'),
  shift: Yup.string().required('Shift is required'),
});

interface FactoryFormProps {
  initialData?: any;
  onSubmit: (data: FormData, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const FactoryForm: React.FC<FactoryFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [products, setProducts] = useState<{ value: string, label: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductDropdown();
        setProducts(data.map((p: any) => ({ value: p._id, label: p.name })));
      } catch (error) {
        console.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  const formik = useFormik({
    initialValues: {
      productId: initialData?.productId?._id || initialData?.productId || '',
      quantity: initialData?.quantity || '',
      batchNumber: initialData?.batchNumber || '',
      manufacturingDate: initialData?.manufacturingDate ? new Date(initialData.manufacturingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      shift: initialData?.shift || 'Day',
      remarks: initialData?.remarks || '',
    },
    validationSchema: ProductionValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, (values as any)[key]);
      });
      if (imageFile) {
        formData.append('image', imageFile);
      }
      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-screen bg-white px-8 py-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
      {/* Premium Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-50/40 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-50/30 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-amber-700 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(180,83,9,0.4)] transition-transform hover:rotate-6">
            <Building2 size={36} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-4 bg-amber-700 rounded-full" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Operational Intelligence</p>
            </div>
            <h2 className="text-4xl font-black text-[#0f172a] tracking-tight">
              {isEditMode ? 'Authorize' : 'Initialize'} <span className="text-amber-700">Production Node</span>
            </h2>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Core Details */}
            <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm space-y-10">
               <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-amber-700 rounded-full shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
                  <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Material Specifications</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Catalog Item / Asset</label>
                     <FormikSelect label="" name="productId" options={products} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormikInput label="Batch Serial" name="batchNumber" icon={<Hash size={16} />} placeholder="e.g. B-2024-001" required />
                    <FormikInput label="Net Quantity" name="quantity" type="number" icon={<Package size={16} />} placeholder="0" required />
                  </div>
               </div>
            </div>

            {/* Logistics */}
            <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm space-y-10">
               <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-amber-700 rounded-full shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
                  <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Uptime & Scheduling</h3>
               </div>
               
               <div className="space-y-6">
                  <FormikInput label="Operational Date" name="manufacturingDate" type="date" icon={<CalendarIcon size={16} />} required />
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Production Shift Cycle</label>
                     <FormikSelect 
                        label="" 
                        name="shift" 
                        options={[
                        { value: 'Day', label: 'Alpha Shift (08:00 - 18:00)' },
                        { value: 'Night', label: 'Beta Shift (20:00 - 06:00)' }
                        ]} 
                        required 
                     />
                  </div>
               </div>
            </div>
          </div>

          {/* Media & Remarks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Image Upload */}
            <div className="lg:col-span-1 space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4 mb-2 block">Output Verification Visual</label>
              <div className="relative group min-h-[200px] h-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className={`w-full h-full rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${imageFile ? 'bg-amber-50/50 border-amber-700 shadow-lg shadow-amber-100' : 'bg-white border-gray-100 hover:border-amber-700'}`}>
                  {imageFile ? (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-amber-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-900/20">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="text-[10px] font-black text-amber-900 uppercase line-clamp-1 px-4 tracking-widest">{imageFile.name}</p>
                      <div className="mt-2 text-[9px] font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-tighter inline-block">
                        Asset Synchronized
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 group-hover:bg-amber-700 group-hover:text-white transition-all shadow-inner">
                         <Camera size={32} />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-amber-700">Capture Visual Node</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="lg:col-span-2 flex flex-col gap-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4 block">Operational Metadata / Remarks</label>
              <textarea 
                  name="remarks"
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  placeholder="Note any abnormalities, environmental conditions, or quality metrics detected during this production cycle..."
                  className="flex-1 w-full p-10 bg-gray-50 border-2 border-transparent rounded-[3rem] text-gray-800 font-medium outline-none focus:bg-white focus:border-amber-700 transition-all resize-none shadow-inner min-h-[200px]"
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-10 pt-12 border-t border-gray-100">
            <button
               type="button"
               onClick={onCancel}
               className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-16 py-6 rounded-[1.5rem] bg-amber-700 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-5px_rgba(180,83,9,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(180,83,9,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-4 active:scale-95"
            >
              {formik.isSubmitting ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditMode ? 'Authorize Update' : 'Finalize Production Log'}
              {!formik.isSubmitting && <CheckCircle2 size={18} strokeWidth={3} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default FactoryForm;
