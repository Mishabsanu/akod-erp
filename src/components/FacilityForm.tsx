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
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-10 py-12 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              {isEditMode ? 'Modify' : 'Architect'} <span className="text-indigo-600">Facility</span>
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
              Infrastructure & Housing Management
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormikInput label="Facility Name" name="name" placeholder="e.g. Main HQ / Camp Al-Khor" required />
            <FormikSelect 
              label="Facility Type" 
              name="type" 
              options={[
                { value: 'Office', label: 'Corporate Office' },
                { value: 'Camp', label: 'Labor Camp' },
                { value: 'Room', label: 'Individual Room' },
                { value: 'Warehouse', label: 'Inventory Warehouse' },
                { value: 'Workshop', label: 'Mechanical Workshop' },
              ]} 
              required 
            />
            
            <FormikInput label="Geographic Location" name="location" placeholder="e.g. Street 10, Industrial Area" />
            <FormikInput label="Max Occupancy / Capacity" name="capacity" type="number" placeholder="50" />

            <FormikSelect 
              label="Operational Status" 
              name="status" 
              options={[
                { value: 'active', label: 'Operational' },
                { value: 'inactive', label: 'Closed / Under Renovation' },
              ]} 
              required 
            />
          </div>

          <div className="flex justify-end items-center gap-4 pt-8 border-t border-gray-100">
            <button
               type="button"
               onClick={onCancel}
               className="px-8 py-4 rounded-xl border-2 border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-10 py-4 rounded-xl bg-indigo-800 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-950/20 hover:bg-indigo-900 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {formik.isSubmitting ? 'Architecting...' : isEditMode ? 'Commit Structure' : 'Launch Facility'}
              {!formik.isSubmitting && <CheckCircle2 size={16} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default FacilityForm;
