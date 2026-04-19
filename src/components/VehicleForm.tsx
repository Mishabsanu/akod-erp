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
      insuranceExpiry: initialData?.insuranceExpiry ? new Date(initialData.insuranceExpiry).toISOString().split('T')[0] : '',
      registrationExpiry: initialData?.registrationExpiry ? new Date(initialData.registrationExpiry).toISOString().split('T')[0] : '',
    },
    validationSchema: VehicleValidationSchema,
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
          <div className="w-20 h-20 bg-amber-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] transition-transform hover:rotate-6">
            <Truck size={36} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-4 bg-amber-600 rounded-full" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Logistics Intelligence</p>
            </div>
            <h2 className="text-4xl font-black text-[#0f172a] tracking-tight">
              {isEditMode ? 'Authorize' : 'Initialize'} <span className="text-amber-600">Asset Node</span>
            </h2>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10 relative z-10">
          {/* Identity Section */}
          <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm">
             <div className="flex items-center gap-3 mb-10">
                <div className="w-1 h-5 bg-amber-600 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Technical Specifications</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FormikInput label="Vehicle Name" name="name" placeholder="e.g. Toyota Hilux 4x4" required />
                <FormikInput label="Plate Number" name="plateNo" placeholder="REG-12345" required />
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Vehicle Type</label>
                  <FormikSelect 
                    label="" 
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
                </div>
                
                <FormikInput label="Model Reference" name="model" placeholder="e.g. SR5 Premium" />
                <FormikInput label="Year of Manufacture" name="year" type="number" placeholder="2024" />
                <FormikInput label="Initial Odometer" name="odometer" type="number" placeholder="0" required />

                <FormikInput label="Engine Reference" name="engineNo" placeholder="E-XXXXXXX" />
                <FormikInput label="Chassis Reference" name="chassisNo" placeholder="C-XXXXXXX" />
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Operational Status</label>
                  <FormikSelect 
                    label="" 
                    name="status" 
                    options={[
                      { value: 'active', label: 'Active Service' },
                      { value: 'maintenance', label: 'Under Maintenance' },
                      { value: 'inactive', label: 'Decommissioned' },
                    ]} 
                    required 
                  />
                </div>
             </div>
          </div>

          {/* Compliance & Legal Section */}
          <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-amber-100/50 -mr-6 -mt-6">
                <CheckCircle2 size={100} strokeWidth={1} />
             </div>
             <div className="flex items-center gap-3 mb-10">
                <div className="w-1 h-5 bg-amber-600 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Compliance & Authorizations</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Insurance Coverage</p>
                         <p className="text-xs font-bold text-gray-700">Policy Validity End Date</p>
                      </div>
                   </div>
                   <FormikInput label="" name="insuranceExpiry" type="date" />
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                         <Truck size={20} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Legal Registration</p>
                         <p className="text-xs font-bold text-gray-700">Istimara / Renewal Date</p>
                      </div>
                   </div>
                   <FormikInput label="" name="registrationExpiry" type="date" />
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Logistics Remarks / Maintenance Logs</label>
            <textarea 
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                placeholder="Enter internal logistics logs, insurance details, or maintenance history..."
                className="w-full h-40 px-10 py-8 bg-gray-50 border-2 border-transparent rounded-[3rem] text-gray-800 font-medium outline-none focus:bg-white focus:border-amber-600 transition-all resize-none shadow-inner"
            />
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
              className="px-16 py-6 rounded-[1.5rem] bg-amber-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-5px_rgba(245,158,11,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-4 active:scale-95"
            >
              {formik.isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditMode ? 'Authorize Update' : 'Finalize Registration'}
              {!formik.isSubmitting && <CheckCircle2 size={18} strokeWidth={3} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default VehicleForm;
