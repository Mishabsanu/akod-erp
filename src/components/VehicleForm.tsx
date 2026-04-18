'use client';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { Truck, CheckCircle2 } from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';

const VehicleValidationSchema = Yup.object({
  name: Yup.string().required('Vehicle name is required'),
  plateNo: Yup.string().required('Plate number is required'),
  type: Yup.string().required('Vehicle type is required'),
  odometer: Yup.number().min(0, 'Must be positive').required('Initial odometer is required'),
});

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const { can } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      plateNo: initialData?.plateNo || '',
      type: initialData?.type || 'Pickup',
      model: initialData?.model || '',
      year: initialData?.year || '',
      engineNo: initialData?.engineNo || '',
      chassisNo: initialData?.chassisNo || '',
      odometer: initialData?.odometer || 0,
      status: initialData?.status || 'active',
      remarks: initialData?.remarks || '',
    },
    validationSchema: VehicleValidationSchema,
    onSubmit: async (values, helpers) => {
      await onSubmit(values as any, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-10 py-12 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-900/20">
            <Truck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              {isEditMode ? 'Modify' : 'Register'} <span className="text-teal-600">Vehicle</span>
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
              Fleet Asset Management
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormikInput label="Vehicle Name" name="name" placeholder="e.g. Toyota Hilux 4x4" required />
            <FormikInput label="Plate Number" name="plateNo" placeholder="REG-12345" required />
            <FormikSelect 
              label="Vehicle Type" 
              name="type" 
              options={[
                { value: 'Pickup', label: 'Pickup Truck' },
                { value: 'Truck', label: 'Heavy Truck' },
                { value: 'Van', label: 'Transit Van' },
                { value: 'Car', label: 'Sedan/SUV' },
                { value: 'Forklift', label: 'Forklift' },
                { value: 'Other', label: 'Other' },
              ]} 
              required 
            />
            
            <FormikInput label="Model" name="model" placeholder="e.g. SR5 Premium" />
            <FormikInput label="Year" name="year" type="number" placeholder="2024" />
            <FormikInput label="Current Odometer" name="odometer" type="number" placeholder="0" required />

            <FormikInput label="Engine Number" name="engineNo" placeholder="E-XXXXXXX" />
            <FormikInput label="Chassis Number" name="chassisNo" placeholder="C-XXXXXXX" />
            <FormikSelect 
              label="Asset Status" 
              name="status" 
              options={[
                { value: 'active', label: 'Active Service' },
                { value: 'maintenance', label: 'Under Maintenance' },
                { value: 'inactive', label: 'Decommissioned' },
              ]} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Remarks</label>
            <textarea 
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                placeholder="Notes about insurance, registration validity, or previous repairs..."
                className="w-full h-32 px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-gray-800 font-medium outline-none focus:bg-white focus:border-teal-600 transition-all resize-none"
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
              className="px-10 py-4 rounded-xl bg-teal-800 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-950/20 hover:bg-teal-900 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {formik.isSubmitting ? 'Processing...' : isEditMode ? 'Commit Changes' : 'Launch Asset'}
              {!formik.isSubmitting && <CheckCircle2 size={16} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default VehicleForm;
