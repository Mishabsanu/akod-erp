'use client';

import React from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Edit3, UserPlus } from 'lucide-react';
import { Vendor } from '@/lib/types';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { FormikPhoneInput } from '@/components/shared/FormikPhoneInput';

const VendorValidationSchema = Yup.object({
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

  // Address Details

  address: Yup.string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address cannot exceed 200 characters')
    .required('Address is required'),

  pincode: Yup.string()
    .matches(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode')
    .required('Pincode is required'),

  city: Yup.string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City cannot exceed 50 characters')
    .required('City is required'),

  district: Yup.string()
    .trim()
    .min(2, 'District must be at least 2 characters')
    .max(50, 'District cannot exceed 50 characters')
    .required('District is required'),

  state: Yup.string()
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State cannot exceed 50 characters')
    .required('State is required'),
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
interface VendorFormProps {
  initialData?: Vendor;
  onSubmit: (
    vendorData: Vendor,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const VendorForm: React.FC<VendorFormProps> = ({
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
      address: initialData?.address || '',
      pincode: initialData?.pincode || '',
      city: initialData?.city || '',
      district: initialData?.district || '',
      state: initialData?.state || '',

      // Contact person (optional)
      contactPersonName: initialData?.contactPersonName || '',
      contactPersonEmail: initialData?.contactPersonEmail || '',
      contactPersonMobile: initialData?.contactPersonMobile || '',
    },
    validationSchema: VendorValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      await onSubmit(
        {
          ...values,
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
        } as Vendor,
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
          {isEditMode ? 'Edit Vendor' : 'Add New Vendor'}
        </h2>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          {/* Basic Information */}
          <Section eyebrow="Supply Chain" title="Basic" highlight="Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormikInput
                label="Vendor Name"
                name="name"
                placeholder="Global Tech Pvt Ltd"
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
                label="Email Address"
                name="email"
                placeholder="info@globaltech.com"
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

          {/* Address Details */}
          <Section eyebrow="Commerce" title="Quotation" highlight="Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormikInput
                label="Address"
                name="address"
                placeholder="Street, Area"
                required
              />
              <FormikInput
                label="Pincode"
                name="pincode"
                placeholder="560001"
                required
              />
              <FormikInput
                label="City"
                name="city"
                placeholder="Bengaluru"
                required
              />
              <FormikInput
                label="District"
                name="district"
                placeholder="Bangalore Urban"
                required
              />
              <FormikInput
                label="State"
                name="state"
                placeholder="Karnataka"
                required
              />
            </div>
          </Section>

          {/* Contact Person */}
          <Section title="Contact Person Information (Optional)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormikInput
                label="Contact Person Name"
                name="contactPersonName"
                placeholder="John Doe"
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
                placeholder="john@vendor.com"
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
              {isEditMode ? 'Update Vendor' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default VendorForm;
