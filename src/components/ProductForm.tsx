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
  reorderLevel: Yup.number().min(0, 'Minimum 0').required('Reorder level is required'),
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
      reorderLevel: initialData?.reorderLevel || 0,
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
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* HEADER AREA */}
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e]">
            {isEditMode ? <Edit3 size={28} /> : <PackagePlus size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isEditMode ? 'Authorize Update' : 'Register Product'}
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              Catalog Management &bull; Asset Lifecycle Registry
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
            disabled={isLoading}
            className="px-8 py-2.5 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Syncing...' : (isEditMode ? 'Update' : 'Save')}
          </button>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
              Product Identity
            </h3>

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
                label="Unit of Measure"
                name="unit"
                required
                placeholder="e.g. Pieces, Meters"
              />
              <div className="lg:col-span-2">
                <FormikInput
                  label="Technical Description"
                  name="description"
                  required
                  placeholder="e.g. High quality industrial-grade aluminum storage solution..."
                />
              </div>
              <FormikInput
                label="Min Stock Alert Level"
                name="reorderLevel"
                type="number"
                required
                placeholder="0"
              />
              <FormikSelect
                label="Operational Status"
                name="status"
                options={[
                  { value: 'active', label: 'Active (Functional)' },
                  { value: 'inactive', label: 'Inactive (Archived)' },
                ]}
                required
              />
            </div>
          </div>

          {/* POLICY NOTE */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-teal-500/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400 mb-2">Registry Protocol</h4>
                <p className="text-lg font-bold leading-snug">Every modification is synchronized across the entire supply chain.</p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed font-medium">
                  Ensure all technical specifications are accurate. Catalog data directly impacts procurement, sales quotations, and inventory valuation metrics.
                </p>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                    {i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ProductForm;
