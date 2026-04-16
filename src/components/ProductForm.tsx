'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { Product } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { Edit3, PackagePlus } from 'lucide-react';
import React, { useEffect } from 'react';
import * as Yup from 'yup';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (
    productData: Product,
    imageFile: File | null, // Assume imageFile is always passed, even if null
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => void;
  onCancel: () => void;
  isEditMode: boolean;
  backendErrors?: { [key: string]: string };
  isLoading: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Product Name is required'),
  itemCode: Yup.string().required('Item Code is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
  unit: Yup.string().required('Unit is required'),
  description: Yup.string().required('Description is required'),
});

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
  backendErrors,
  isLoading,
}) => {
  const formik = useFormik({
    initialValues: {
      // --- Basic Info ---
      name: initialData?.name || '',
      itemCode: initialData?.itemCode || '',
      status: initialData?.status || 'active',
      unit: initialData?.unit || '',
      description: initialData?.description || '',
    },
    validationSchema, // Enable validation here
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting, setErrors }) => {
      const transformedValues: Product = {
        ...values,
      } as Product;
      // Pass null for imageFile for now, as it's not handled in this form's state
      onSubmit(transformedValues, null, { setErrors, setSubmitting });
    },
  });

  useEffect(() => {
    if (backendErrors) {
      formik.setErrors(backendErrors);
    }
  }, [backendErrors]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Edit3 className="text-teal-700 w-6 h-6" />
          ) : (
            <PackagePlus className="text-teal-700 w-6 h-6" />
          )}
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        <span className="text-sm text-gray-500 italic">
          {isEditMode
            ? 'Update existing product information'
            : 'Fill all required fields to create a new product'}
        </span>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          {/* 🧱 Section 1: Basic Product Info */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormikInput
                label="Product Name"
                name="name"
                placeholder="e.g. Aluminium Ladder"
                required
              />
              <FormikInput
                label="Item Code"
                name="itemCode"
                placeholder="e.g. A-123"
                required
              />
              <FormikInput
                label="Unit"
                name="unit"
                required
                placeholder="e.g. Pieces"
              />
              <FormikInput
                label="Description"
                name="description"
                required
                placeholder="e.g. High quality plastic storage container"
              />
              <FormikSelect
                label="Status"
                name="status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                required
              />
            </div>
          </Section>
          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-sm transition ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              {isLoading
                ? isEditMode
                  ? 'Updating...'
                  : 'Adding...'
                : isEditMode
                  ? 'Update Product'
                  : 'Add Product'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ProductForm;
