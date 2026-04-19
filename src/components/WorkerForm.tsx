'use client';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { useAuth } from '@/contexts/AuthContext';
import { Worker } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { HardHat, CheckCircle2, Camera, FileText, Fingerprint, CreditCard, ShieldPlus, Heart, Award, Upload, Package, ShieldAlert, Clock, Calendar, Plus, Minus, DollarSign, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { getFacilityDropdown } from '@/services/facilityApi';
import { getUtilityDropdown } from '@/services/utilityItemApi';
import { Section } from '@/components/ui/Section';
import { FormikTextarea } from '@/components/shared/FormikTextarea';

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
  const [utilityMaster, setUtilityMaster] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facData, utilData] = await Promise.all([
          getFacilityDropdown(),
          getUtilityDropdown()
        ]);
        setFacilities(facData.map((f: any) => ({ value: f._id, label: f.name })));
        setUtilityMaster(utilData.data);
      } catch (error) {
        console.error('Failed to load metadata');
      }
    };
    fetchData();
  }, []);

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    photo: null,
    cv: null,
    qidDoc: null,
    passportDoc: null,
    insuranceDoc: null,
    healthCardDoc: null,
    certificateDoc: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
    }
  };

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
      certificateName: initialData?.certificateName || '',
      utilities: [{ utilityItemId: '', itemName: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0] }],
    },
    validationSchema: WorkerValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'utilities') {
          formData.append(key, JSON.stringify((values as any)[key]));
        } else {
          formData.append(key, (values as any)[key]);
        }
      });

      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formData.append(key, files[key] as File);
        }
      });

      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Workforce Intelligence</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Authorize' : 'Initialize'} <span className="gradient-text">Personnel Node</span>
          </h1>
          <p className="page-header-description">
            {isEditMode
              ? `Refining credentials for Personnel Node ID: ${formik.values.workerId}. Ensure legal documentation is synchronized.`
              : 'Enroll a new operational asset into the workforce matrix. Define identity, legal documentation, and initial asset allocation.'}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10 relative z-10">
          <Section eyebrow="Asset Enrollment" title="Personnel" highlight="Identity">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormikInput label="Internal Worker ID" name="workerId" placeholder="e.g. W-1001" required />
                <FormikInput label="Full Name" name="name" placeholder="As per QID/Passport" required />
                <FormikInput label="Nationality" name="nationality" placeholder="e.g. Indian, Nepalese" />
                <FormikInput label="Contact Number" name="mobile" placeholder="+974 XXXX XXXX" />
                <FormikInput label="Designation" name="designation" placeholder="e.g. Driver, Helper" />
                <FormikInput label="Enrollment Date" name="joinDate" type="date" />
             </div>
          </Section>

          <Section eyebrow="Legal Compliance" title="Commercial" highlight="Status">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormikInput label="QID Number" name="qidNo" placeholder="2XXXXXXXXXX" required />
                <FormikInput label="Passport Number" name="passportNo" placeholder="PXXXXXXX" />
                
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Housing Facility</label>
                    <FormikSelect label="" name="facilityId" options={facilities} />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Engagement Status</label>
                  <FormikSelect 
                    label="" 
                    name="status" 
                    options={[
                      { value: 'active', label: 'Active Service' },
                      { value: 'on_leave', label: 'Vacation Period' },
                      { value: 'resigned', label: 'Resigned / Off-boarded' },
                    ]} 
                  />
                </div>
             </div>
          </Section>

          <Section eyebrow="Digital Repository" title="Evidence" highlight="Management">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FileUploadCard 
                  label="Personnel Photo" 
                  icon={<Camera size={20} />} 
                  fieldName="photo" 
                  file={files.photo} 
                  onChange={(e) => handleFileChange(e, 'photo')} 
                />
                <FileUploadCard 
                  label="Work CV" 
                  icon={<FileText size={20} />} 
                  fieldName="qidDoc" // Logic says this was QID doc in user version maybe? No, let's keep original fields.
                  file={files.cv} 
                  onChange={(e) => handleFileChange(e, 'cv')} 
                />
                <FileUploadCard 
                  label="Qatar ID" 
                  icon={<Fingerprint size={20} />} 
                  fieldName="qidDoc" 
                  file={files.qidDoc} 
                  onChange={(e) => handleFileChange(e, 'qidDoc')} 
                />
                <FileUploadCard 
                  label="Passport" 
                  icon={<CreditCard size={20} />} 
                  fieldName="passportDoc" 
                  file={files.passportDoc} 
                  onChange={(e) => handleFileChange(e, 'passportDoc')} 
                />
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100 border-dashed">
                <FileUploadCard 
                  label="Health Insurance" 
                  icon={<ShieldPlus size={20} />} 
                  fieldName="insuranceDoc" 
                  file={files.insuranceDoc} 
                  onChange={(e) => handleFileChange(e, 'insuranceDoc')} 
                />
                <FileUploadCard 
                  label="Hamad Health Card" 
                  icon={<Heart size={20} />} 
                  fieldName="healthCardDoc" 
                  file={files.healthCardDoc} 
                  onChange={(e) => handleFileChange(e, 'healthCardDoc')} 
                />
                <div className="bg-teal-50/30 p-6 rounded-2xl border border-teal-100/50">
                   <div className="flex items-center gap-2 mb-4">
                       <Award size={16} className="text-teal-700" />
                       <span className="text-[10px] font-black uppercase text-teal-900 tracking-widest">Skill Certification</span>
                   </div>
                   <FormikInput label="" name="certificateName" placeholder="Certification Name" />
                   <div className="mt-4">
                     <FileUploadCard 
                      label="Attach Certificate" 
                      icon={<Upload size={18} />} 
                      fieldName="certificateDoc" 
                      file={files.certificateDoc} 
                      onChange={(e) => handleFileChange(e, 'certificateDoc')} 
                    />
                   </div>
                </div>
             </div>
          </Section>

          <Section eyebrow="Gear Lifecycle" title="Asset" highlight="Allocation">
             <div className="space-y-4">
                {(formik.values as any).utilities.map((item: any, idx: number) => (
                   <div key={idx} className="grid grid-cols-12 gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all shadow-sm">
                     <div className="col-span-4 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Inventory Node</label>
                        <select 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-sm text-gray-700 underline-none focus:bg-white focus:border-teal-600 transition-all appearance-none cursor-pointer"
                          value={item.utilityItemId}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const masterItem = utilityMaster.find(m => m._id === selectedId);
                            const utils = [...(formik.values as any).utilities];
                            utils[idx].utilityItemId = selectedId;
                            utils[idx].itemName = masterItem?.name || '';
                            utils[idx].cost = masterItem?.rate || 0;
                            if (masterItem?.category === 'Safety Gear' || masterItem?.category === 'Tools') {
                               utils[idx].isRecoverable = true;
                            }
                            formik.setFieldValue('utilities', utils);
                          }}
                        >
                          <option value="">Select Gear...</option>
                          {utilityMaster.map(um => (
                            <option key={um._id} value={um._id}>{um.name} ({um.size}) - {um.quantity} Qty</option>
                          ))}
                        </select>
                     </div>
                     <div className="col-span-1 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1 text-center block">Qty</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-sm text-gray-700 focus:bg-white focus:border-teal-600 transition-all text-center"
                          value={item.quantity}
                          onChange={(e) => {
                            const utils = [...(formik.values as any).utilities];
                            utils[idx].quantity = parseInt(e.target.value);
                            formik.setFieldValue('utilities', utils);
                          }}
                        />
                     </div>
                     <div className="col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Cost (QAR)</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-sm text-gray-700 focus:bg-white focus:border-teal-600 transition-all"
                          value={item.cost}
                          onChange={(e) => {
                            const utils = [...(formik.values as any).utilities];
                            utils[idx].cost = parseFloat(e.target.value);
                            formik.setFieldValue('utilities', utils);
                          }}
                        />
                     </div>
                     <div className="col-span-2 space-y-2 text-center">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deduct?</label>
                        <div className="h-[46px] flex items-center justify-center">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 accent-teal-700"
                             checked={item.isRecoverable}
                             onChange={(e) => {
                               const utils = [...(formik.values as any).utilities];
                               utils[idx].isRecoverable = e.target.checked;
                               formik.setFieldValue('utilities', utils);
                             }}
                           />
                        </div>
                     </div>
                     <div className="col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Issue Date</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-xs text-gray-700 focus:bg-white focus:border-teal-700 transition-all"
                          value={item.issueDate}
                          onChange={(e) => {
                            const utils = [...(formik.values as any).utilities];
                            utils[idx].issueDate = e.target.value;
                            formik.setFieldValue('utilities', utils);
                          }}
                        />
                     </div>
                     
                     <div className="col-span-1 flex items-end pb-1.5 justify-center">
                        <button 
                          type="button"
                          onClick={() => {
                            const utils = (formik.values as any).utilities.filter((_: any, i: number) => i !== idx);
                            formik.setFieldValue('utilities', utils);
                          }}
                          disabled={(formik.values as any).utilities.length === 1}
                          className="p-2 text-rose-300 hover:text-rose-600 disabled:opacity-0 transition-all"
                        >
                           <Minus size={18} strokeWidth={3} />
                        </button>
                     </div>
                   </div>
                ))}

                <button 
                   type="button"
                   onClick={() => {
                     const utils = [...(formik.values as any).utilities, { utilityItemId: '', itemName: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0] }];
                     formik.setFieldValue('utilities', utils);
                   }}
                   className="w-full py-4 bg-white/50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-3 text-gray-400 hover:border-teal-200 hover:text-teal-700 transition-all group mt-2"
                >
                   <Plus size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Register New Asset Allocation</span>
                </button>
             </div>
          </Section>

          <Section eyebrow="Audit Records" title="Personnel" highlight="Remarks">
            <FormikTextarea 
                name="remarks"
                label=""
                placeholder="Enter internal audit logs, disciplinary records, or medical notes..."
            />
          </Section>

          <div className="flex justify-end items-center gap-4 pt-10 border-t border-gray-200">
            <button
               type="button"
               onClick={onCancel}
               className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-teal-700/10 transition-all active:scale-95 ${formik.isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800'
                }`}
            >
              {isEditMode ? 'Authorize Update' : 'Finalize Enrollment'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

const FileUploadCard = ({ label, icon, fieldName, file, onChange }: { label: string, icon: React.ReactNode, fieldName: string, file: File | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="relative group cursor-pointer h-full min-h-[120px]">
    <input
      type="file"
      id={fieldName}
      name={fieldName}
      onChange={onChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
    />
    <div className={`h-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${file ? 'bg-teal-50/50 border-teal-700 shadow-sm' : 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50/5'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${file ? 'bg-teal-700 text-white shadow-sm' : 'bg-gray-50 text-gray-400 group-hover:bg-teal-700 group-hover:text-white'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest text-center px-1 ${file ? 'text-teal-900' : 'text-gray-400'}`}>
        {file ? file.name.substring(0, 15) + (file.name.length > 15 ? '...' : '') : label}
      </span>
    </div>
  </div>
);

export default WorkerForm;
