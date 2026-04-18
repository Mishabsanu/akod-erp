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

  name: Yup.string()
    .trim()
    .min(3, 'Minimum 3 characters')
    .required('Customer name is required'),
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
      name: initialData?.name || '',
      company: initialData?.company || '',
      email: initialData?.email || '',
      mobile: initialData?.mobile || '',
      status: initialData?.status || 'active',
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
          name: values.name.trim(),
          company: values.company.trim(),
          email: values.email.trim().toLowerCase(),
        } as Customer,
        { setErrors, setSubmitting }
      );
    },
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        {isEditMode ? (
          <Edit3 className="text-[#0f766e] w-6 h-6" />
        ) : (
          <UserPlus className="text-[#0f766e] w-6 h-6" />
        )}
        <h2 className="text-2xl font-semibold">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h2>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <Section eyebrow="Relationship" title="Basic" highlight="Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormikInput
                label="Customer Name"
                name="name"
                placeholder="John Doe"
                required
              />
              <FormikInput
                label="Company Name"
                name="company"
                placeholder="Acme Pvt Ltd"
                required
              />
              <FormikPhoneInput
                label="Mobile Number"
                name="mobile"
                placeholder="+91 9876543210"
                required
              />
              <FormikInput
                label="Email"
                name="email"
                placeholder="john@company.com"
              />
              <FormikSelect
                label="Status"
                name="status"
                required
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
          </Section>


          {/* Contact Person */}
          <Section title="Contact Person Information (Optional)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormikInput
                label="Contact Person Name"
                name="contactPersonName"
                placeholder="Jane Smith"
                required
              />
              <FormikPhoneInput
                label="Contact Person Mobile"
                name="contactPersonMobile"
                placeholder="+91 9123456789"
                required
              />
              <FormikInput
                label="Contact Person Email"
                name="contactPersonEmail"
                placeholder="jane@company.com"
              />
            </div>
          </Section>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-2 bg-[#0f766e] text-white rounded-lg"
            >
              {isEditMode ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default CustomerForm;
