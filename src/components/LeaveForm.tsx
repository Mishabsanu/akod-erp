'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { getWorkersDropdown } from '@/services/workerApi';
import { FormikProvider, useFormik } from 'formik';
import { Calendar, CheckCircle2, FileText, User, Type, MessageSquare, Paperclip, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

const LeaveValidationSchema = Yup.object({
  workerId: Yup.string().required('Worker is required'),
  type: Yup.string().required('Leave type is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
  reason: Yup.string().required('Reason is required'),
});

interface LeaveFormProps {
  initialData?: any;
  onSubmit: (data: FormData, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [workers, setWorkers] = useState<{ value: string, label: string }[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await getWorkersDropdown();
        setWorkers(data.map((w: any) => ({ value: w._id, label: `${w.name} (${w.workerId})` })));
      } catch (error) {
        console.error('Failed to load workers');
      }
    };
    fetchWorkers();
  }, []);

  const formik = useFormik({
    initialValues: {
      workerId: initialData?.workerId?._id || initialData?.workerId || '',
      type: initialData?.type || 'Annual',
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reason: initialData?.reason || '',
      status: initialData?.status || 'Pending',
      remarks: initialData?.remarks || '',
    },
    validationSchema: LeaveValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, (values as any)[key]);
      });
      if (attachment) {
        formData.append('attachment', attachment);
      }
      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-screen bg-white px-8 py-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
      {/* Premium Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-50/40 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-50/30 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-teal-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(13,148,136,0.4)] transition-transform hover:rotate-6">
            <Calendar size={36} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-4 bg-teal-600 rounded-full" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Workforce Presence</p>
            </div>
            <h2 className="text-4xl font-black text-[#0f172a] tracking-tight">
              {isEditMode ? 'Authorize' : 'Initialize'} <span className="text-teal-600">Leave Node</span>
            </h2>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Personnel & Type */}
            <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm space-y-10">
               <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-teal-600 rounded-full shadow-[0_0_10px_rgba(13,148,136,0.5)]" />
                  <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Institutional Personnel</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Institutional Worker</label>
                     <FormikSelect label="" name="workerId" options={workers} required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Absence Classification</label>
                    <FormikSelect 
                        label="" 
                        name="type" 
                        options={[
                        { value: 'Annual', label: 'Annual Leave / Vacation' },
                        { value: 'Sick', label: 'Sick Leave (Medical)' },
                        { value: 'Emergency', label: 'Emergency Leave' },
                        { value: 'Unpaid', label: 'LWP (Leave Without Pay)' },
                        { value: 'Other', label: 'Other Leave Types' },
                        ]} 
                        required 
                    />
                  </div>
               </div>
            </div>

            {/* Durations */}
            <div className="bg-gray-50/30 p-10 rounded-[3rem] border border-gray-100/50 backdrop-blur-sm shadow-sm space-y-10">
               <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-teal-600 rounded-full shadow-[0_0_10px_rgba(13,148,136,0.5)]" />
                  <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Temporal Delta & Status</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormikInput label="Commence Date" name="startDate" type="date" icon={<Calendar size={16} />} required />
                    <FormikInput label="Resumption Date" name="endDate" type="date" icon={<Calendar size={16} />} required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Authorization Status</label>
                    <FormikSelect 
                        label="" 
                        name="status" 
                        options={[
                        { value: 'Pending', label: 'Verification Pending' },
                        { value: 'Approved', label: 'Authorized / Active' },
                        { value: 'Rejected', label: 'Declined' },
                        ]} 
                        required 
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Formal Justification */}
            <div className="lg:col-span-2 flex flex-col gap-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4 block">Formal Justification / Context</label>
              <textarea 
                  name="reason"
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                  placeholder="Provide detailed context for this leave request, including any institutional requirements..."
                  className="flex-1 w-full p-10 bg-gray-50 border-2 border-transparent rounded-[3rem] text-gray-800 font-medium outline-none focus:bg-white focus:border-teal-600 transition-all resize-none shadow-inner min-h-[220px]"
              />
            </div>

            {/* Document Attachment */}
            <div className="lg:col-span-1 space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4 mb-2 block">Supporting Assets</label>
              <div className="relative group min-h-[220px] h-full">
                <input
                  type="file"
                  onChange={(e) => e.target.files && setAttachment(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className={`w-full h-full rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${attachment ? 'bg-teal-50/50 border-teal-600 shadow-lg shadow-teal-100' : 'bg-white border-gray-100 hover:border-teal-600'}`}>
                  {attachment ? (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-900/20">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="text-[10px] font-black text-teal-900 uppercase line-clamp-1 px-4 tracking-widest">{attachment.name}</p>
                      <div className="mt-2 text-[9px] font-black text-teal-600 bg-teal-100 px-3 py-1 rounded-full uppercase tracking-tighter inline-block">
                        Asset Synchronized
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-inner">
                         <Paperclip size={32} />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-teal-600">Attach Documentation</p>
                    </>
                  )}
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
              className="px-16 py-6 rounded-[1.5rem] bg-teal-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-5px_rgba(13,148,136,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(13,148,136,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-4 active:scale-95"
            >
              {formik.isSubmitting ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditMode ? 'Authorize Update' : 'Finalize Leave Entry'}
              {!formik.isSubmitting && <CheckCircle2 size={18} strokeWidth={3} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default LeaveForm;
