'use client';

import React from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Edit3, UserPlus } from 'lucide-react';
import { Customer } from '@/lib/types';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '../ui/Section';
import { FormikPhoneInput } from '../shared/FormikPhoneInput';

const CustomerValidationSchema = Yup.object({
  // Basic Info
  company: Yup.string()
    .trim()
    .min(3, 'Minimum 3 characters')
    .required('Company name is required'),
  email: Yup.string().email('Enter a valid email').nullable(),
  mobile: Yup.string()
    .matches(/^\+?[1-9]\d{6,14}$/, 'Enter a valid mobile number')
    .required('Mobile number is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
  name: Yup.string().trim().nullable(),
  address: Yup.string().trim().nullable(),
  // Contact Person Details
  contactPersonName: Yup.string()
    .trim()
    .min(3, 'Minimum 3 characters')
    .required('Contact person name is required'),
  contactPersonEmail: Yup.string().email('Enter a valid email').nullable(),
  contactPersonMobile: Yup.string()
    .matches(/^\+?[1-9]\d{6,14}$/, 'Enter a valid mobile number')
    .required('Contact person mobile number is required'),
});

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (
    customerData: Customer,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
}) => {
  const formik = useFormik({
    initialValues: {
      company: initialData?.company || '',
      email: initialData?.email || '',
      mobile: initialData?.mobile || '',
      status: initialData?.status || 'active',
      name: initialData?.name || '',
      address: initialData?.address || '',
      // Contact person (optional)
      contactPersonName: initialData?.contactPersonName || '',
      contactPersonEmail: initialData?.contactPersonEmail || '',
      contactPersonMobile: initialData?.contactPersonMobile || '',
    },
    validationSchema: CustomerValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      await onSubmit(
        {
          ...values,
          company: values.company.trim(),
          email: values.email.trim().toLowerCase(),
        } as Customer,
        { setErrors, setSubmitting }
      );
    },
  });

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* HEADER SECTION */}
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e]">
            {isEditMode ? <Edit3 size={28} /> : <UserPlus size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isEditMode ? 'Edit Customer' : 'New Customer Onboarding'}
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              CRM Master &bull; Client Lifecycle Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            className="px-8 py-2.5 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50"
          >
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CORE PROFILE */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
                Customer Identity
              </h3>

              <div className="space-y-6">
                <FormikInput 
                  label="Company / Client Name" 
                  name="company" 
                  placeholder="e.g. Acme Global Industries" 
                  required 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormikPhoneInput 
                    label="Primary Mobile" 
                    name="mobile" 
                    placeholder="+1 234 567 890" 
                    required 
                  />
                  <FormikSelect
                    label="Lifecycle Status"
                    name="status"
                    required
                    options={[
                      { value: 'active', label: 'Active (Engaged)' },
                      { value: 'inactive', label: 'Inactive (Paused)' },
                    ]}
                  />
                </div>
                <FormikInput 
                  label="General Correspondence Email" 
                  name="email" 
                  placeholder="hello@client.com" 
                />
                <FormikInput 
                  label="Customer Display Name" 
                  name="name" 
                  placeholder="e.g. Acme HQ" 
                />
                <FormikInput 
                  label="Full Address" 
                  name="address" 
                  placeholder="e.g. 123 Business Bay, Doha, Qatar" 
                />
              </div>
            </div>

            {/* CONTACT PERSON */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <span className="w-2 h-6 bg-teal-600/40 rounded-full" />
                Point of Contact
              </h3>

              <div className="space-y-6">
                <FormikInput 
                  label="Representative Name" 
                  name="contactPersonName" 
                  placeholder="e.g. Sarah Jenkins" 
                  required 
                />
                <FormikPhoneInput 
                  label="Direct Extension / Mobile" 
                  name="contactPersonMobile" 
                  placeholder="+1 234 567 890" 
                  required 
                />
                <FormikInput 
                  label="Direct Business Email" 
                  name="contactPersonEmail" 
                  placeholder="sarah@client.com" 
                />
              </div>
            </div>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default CustomerForm;
