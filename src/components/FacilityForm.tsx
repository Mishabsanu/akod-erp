'use client';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { useAuth } from '@/contexts/AuthContext';
import { Facility } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { Building2, CheckCircle2 } from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';

const FacilityValidationSchema = Yup.object({
  name: Yup.string().required('Facility name is required'),
  type: Yup.string().required('Facility type is required'),
});

interface FacilityFormProps {
  initialData?: Partial<Facility>;
  onSubmit: (data: Partial<Facility>, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const FacilityForm: React.FC<FacilityFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const { can } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'Office',
      location: initialData?.location || '',
      capacity: initialData?.capacity || '',
      status: initialData?.status || 'active',
    },
    validationSchema: FacilityValidationSchema,
    onSubmit: async (values, helpers) => {
      await onSubmit(values as any, helpers);
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
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Infrastructure Ledger</p>
            </div>
            <h2 className="text-4xl font-black text-[#0f172a] tracking-tight uppercase">
              {isEditMode ? 'Modify' : 'Architect'} <span className="text-amber-700">Personnel Hub</span>
            </h2>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Core Identity */}
             <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm space-y-10">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-5 bg-amber-700 rounded-full shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
                   <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Identity & Logic</h3>
                </div>
                
                <div className="space-y-6">
                   <FormikInput label="Unit Nomenclature" name="name" placeholder="e.g. Al-Rayyan HQ / Site 42" required />
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Functional Class</label>
                      <FormikSelect 
                        label="" 
                        name="type" 
                        options={[
                          { value: 'Office', label: 'Corporate Office' },
                          { value: 'Camp', label: 'Labor Housing' },
                          { value: 'Warehouse', label: 'Strategic Warehouse' },
                          { value: 'Workshop', label: 'Technical Workshop' },
                        ]} 
                        required 
                      />
                   </div>
                </div>
             </div>

             {/* Logistics */}
             <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm space-y-10">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-5 bg-amber-700 rounded-full shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
                   <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Logistical Coordinates</h3>
                </div>
                
                <div className="space-y-6">
                   <FormikInput label="Geographic Coordinate" name="location" placeholder="e.g. Street 302, Industrial Node" />
                   <FormikInput label="Operational Capacity" name="capacity" type="number" placeholder="0" />
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Operational Lifecycle</label>
                      <FormikSelect 
                        label="" 
                        name="status" 
                        options={[
                          { value: 'active', label: 'Operational (ONLINE)' },
                          { value: 'inactive', label: 'Decommissioned (OFFLINE)' },
                        ]} 
                        required 
                      />
                   </div>
                </div>
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
              ) : isEditMode ? 'Authorize Update' : 'Finalize Hub Creation'}
              {!formik.isSubmitting && <CheckCircle2 size={18} strokeWidth={3} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default FacilityForm;
