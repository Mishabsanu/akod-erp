'use client';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { useAuth } from '@/contexts/AuthContext';
import { Worker } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { HardHat, CheckCircle2, Camera } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { getFacilityDropdown } from '@/services/facilityApi';

const WorkerValidationSchema = Yup.object({
  workerId: Yup.string().required('Worker ID is required'),
  name: Yup.string().required('Full name is required'),
  qidNo: Yup.string().required('QID number is required'),
});

interface WorkerFormProps {
  initialData?: Partial<Worker>;
  onSubmit: (data: FormData, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const WorkerForm: React.FC<WorkerFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const { can } = useAuth();
  const [facilities, setFacilities] = useState<{ value: string, label: string }[]>([]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const data = await getFacilityDropdown();
        setFacilities(data.map((f: any) => ({ value: f._id, label: f.name })));
      } catch (error) {
        console.error('Failed to load facilities');
      }
    };
    fetchFacilities();
  }, []);

  const formik = useFormik({
    initialValues: {
      workerId: initialData?.workerId || '',
      name: initialData?.name || '',
      nationality: initialData?.nationality || '',
      designation: initialData?.designation || '',
      mobile: initialData?.mobile || '',
      passportNo: initialData?.passportNo || '',
      qidNo: initialData?.qidNo || '',
      joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
      facilityId: typeof initialData?.facilityId === 'object' ? (initialData.facilityId as any)._id : (initialData?.facilityId || ''),
      status: initialData?.status || 'active',
      remarks: initialData?.remarks || '',
    },
    validationSchema: WorkerValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, (values as any)[key]);
      });
      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-10 py-12 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-950/20">
            <HardHat size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              {isEditMode ? 'Modify' : 'Enroll'} <span className="text-teal-800">Worker</span>
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
              Workforce Personnel Registry
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          {/* Identity Section */}
          <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 block ml-1">Personal Identity</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormikInput label="Internal Worker ID" name="workerId" placeholder="e.g. W-1001" required />
                <FormikInput label="Full Name" name="name" placeholder="As per QID/Passport" required />
                <FormikInput label="Nationality" name="nationality" placeholder="e.g. Indian, Nepalese" />
                <FormikInput label="Designation" name="designation" placeholder="e.g. Driver, Helper" />
                <FormikInput label="Mobile Number" name="mobile" placeholder="+974 XXXX XXXX" />
                <FormikInput label="Joining Date" name="joinDate" type="date" />
             </div>
          </div>

          {/* Documentation Section */}
          <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 block ml-1">Legal Documents</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormikInput label="QID Number (Qatar ID)" name="qidNo" placeholder="2XXXXXXXXXX" required />
                <FormikInput label="Passport Number" name="passportNo" placeholder="PXXXXXXX" />
                
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700 mb-1">Accommodation Facility</label>
                    <FormikSelect label="" name="facilityId" options={facilities} />
                </div>
                
                <FormikSelect 
                  label="Employment Status" 
                  name="status" 
                  options={[
                    { value: 'active', label: 'Active Duty' },
                    { value: 'on_leave', label: 'On Leave / Vacation' },
                    { value: 'resigned', label: 'Resigned / Terminated' },
                  ]} 
                />
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Worker Remarks</label>
            <textarea 
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                placeholder="Background check notes, allergies, or previous experience..."
                className="w-full h-32 px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-gray-800 font-medium outline-none focus:bg-white focus:border-teal-800 transition-all resize-none"
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
              {formik.isSubmitting ? 'Enrolling...' : isEditMode ? 'Commit Changes' : 'Confirm Enrollment'}
              {!formik.isSubmitting && <CheckCircle2 size={16} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default WorkerForm;
