'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { UtilityItem } from '@/services/utilityItemApi';
import { FormikProvider, useFormik } from 'formik';
import { Package, CheckCircle2, DollarSign, Layers, Hash, Info } from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';

const UtilityItemSchema = Yup.object({
  name: Yup.string().required('Item name is required'),
  category: Yup.string().required('Category is required'),
  rate: Yup.number().required('Rate is required').min(0),
  quantity: Yup.number().required('Quantity is required').min(0),
});

interface UtilityItemFormProps {
  initialData?: Partial<UtilityItem>;
  onSubmit: (data: Partial<UtilityItem>, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const UtilityItemForm: React.FC<UtilityItemFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'Safety Gear',
      size: initialData?.size || 'N/A',
      rate: initialData?.rate || 0,
      quantity: initialData?.quantity || 0,
      minStockLevel: initialData?.minStockLevel || 5,
      sku: initialData?.sku || '',
      description: initialData?.description || '',
    },
    validationSchema: UtilityItemSchema,
    onSubmit: async (values, helpers) => {
      await onSubmit(values, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Master Inventory Ledger</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Authorize' : 'Initialize'} <span className="gradient-text">Safety Gear Node</span>
          </h1>
          <p className="page-header-description">
            {isEditMode
              ? `Refining technical specifications and valuation for Inventory Node: ${formik.values.sku}.`
              : 'Capture a new operational asset for the company inventory. Define nomenclature, logistics parameters, and initial valuation.'}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Section eyebrow="Asset Identity" title="Operational" highlight="Nomenclature">
                <div className="space-y-6">
                   <FormikInput label="Gear Name" name="name" placeholder="e.g. Industrial Safety Helmet" required />
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Category</label>
                        <FormikSelect 
                          label="" 
                          name="category" 
                          options={[
                            { value: 'Safety Gear', label: 'Safety Gear' },
                            { value: 'Uniform', label: 'Uniform' },
                            { value: 'Tools', label: 'Tools' },
                            { value: 'Industrial Gear', label: 'Industrial Gear' },
                            { value: 'Other', label: 'Other' },
                          ]} 
                           
                        />
                      </div>
                      <FormikInput label="Size Node" name="size" placeholder="e.g. XL / 42" />
                   </div>
                   <FormikInput label="SKU / Identifier" name="sku" placeholder="e.g. SAF-HELM-01" icon={<Hash size={16} />} />
                </div>
             </Section>

             <Section eyebrow="Valuation Node" title="Logistics" highlight="Metadata">
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <FormikInput label="Unit Rate (QAR)" name="rate" type="number" icon={<DollarSign size={16} />} required />
                      <FormikInput label="Initial Quantity" name="quantity" type="number" icon={<Layers size={16} />} required />
                   </div>
                   <FormikInput label="Min Alert Level" name="minStockLevel" type="number" placeholder="5" />
                   <div className="space-y-4">
                      <FormikTextarea 
                        label="Technical Specifications"
                        name="description"
                        placeholder="Detail material safety data, compliance standards, etc..."
                        rows={4}
                      />
                   </div>
                </div>
             </Section>
          </div>

          <div className="flex justify-end gap-4 pt-10 border-t border-gray-200">
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
              {isEditMode ? 'Authorize Update' : 'Finalize Stock Intake'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default UtilityItemForm;
