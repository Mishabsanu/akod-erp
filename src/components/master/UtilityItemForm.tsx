'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { UtilityItem, createBulkUtilityItems } from '@/services/utilityItemApi';
import { FormikProvider, useFormik, FieldArray } from 'formik';
import { Package, CheckCircle2, DollarSign, Layers, Hash, Info, Plus, Trash2, Settings2 } from 'lucide-react';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { toast } from 'sonner';

const UtilityItemSchema = Yup.object({
  name: Yup.string().required('Item name is required'),
  category: Yup.string().required('Category is required'),
  // If not in multi-variant mode, these are required
  rate: Yup.number().when('hasVariants', {
    is: false,
    then: (schema) => schema.required('Rate is required').min(0),
    otherwise: (schema) => schema.nullable(),
  }),
  quantity: Yup.number().when('hasVariants', {
    is: false,
    then: (schema) => schema.required('Quantity is required').min(0),
    otherwise: (schema) => schema.nullable(),
  }),
  variants: Yup.array().when('hasVariants', {
    is: true,
    then: (schema) => schema.of(
      Yup.object({
        size: Yup.string().required('Size is required'),
        sku: Yup.string().required('SKU is required'),
        rate: Yup.number().required('Rate is required').min(0),
        quantity: Yup.number().required('Quantity is required').min(0),
      })
    ).min(1, 'At least one variant is required'),
    otherwise: (schema) => schema.nullable(),
  }),
});

interface UtilityItemFormProps {
  initialData?: Partial<UtilityItem>;
  onSubmit: (data: Partial<UtilityItem>, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const UtilityItemForm: React.FC<UtilityItemFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [hasVariants, setHasVariants] = useState(false);

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
      hasVariants: false,
      variants: [
        { size: '', sku: '', rate: initialData?.rate || 0, quantity: 1 }
      ],
    },
    validationSchema: UtilityItemSchema,
    onSubmit: async (values, helpers) => {
      if (hasVariants && !isEditMode) {
        try {
          const payload = {
            baseItem: {
              name: values.name,
              category: values.category,
              description: values.description,
              minStockLevel: values.minStockLevel,
            },
            variants: values.variants
          };
          const res = await createBulkUtilityItems(payload);
          if (res.success) {
            toast.success('All variants created successfully');
            onCancel(); // Redirect back
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to create variants');
        }
      } else {
        await onSubmit(values, helpers);
      }
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
                      <FormikInput label="Min Alert Level" name="minStockLevel" type="number" placeholder="5" />
                   </div>
                   
                   {!isEditMode && (
                     <div className="flex items-center gap-3 p-4 bg-teal-50/50 rounded-xl border border-teal-100/50 group hover:border-teal-200 transition-all">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600 group-hover:scale-110 transition-transform">
                           <Settings2 size={18} />
                        </div>
                        <div className="flex-1">
                           <p className="text-xs font-bold text-gray-900">Manage Multiple Sizes?</p>
                           <p className="text-[10px] text-gray-500 font-medium">Enable this to add variants like M, L, XL at once.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={hasVariants}
                            onChange={(e) => {
                              setHasVariants(e.target.checked);
                              formik.setFieldValue('hasVariants', e.target.checked);
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                     </div>
                   )}
                </div>
             </Section>

             <Section eyebrow="Technical Details" title="Logistics" highlight="Metadata">
                <div className="space-y-6">
                   <FormikTextarea 
                      label="Technical Specifications"
                      name="description"
                      placeholder="Detail material safety data, compliance standards, etc..."
                      rows={6}
                   />
                </div>
             </Section>
          </div>

          {!hasVariants || isEditMode ? (
            <Section eyebrow="Valuation Node" title="Individual" highlight="Specifications" className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormikInput label="Size / Variant" name="size" placeholder="e.g. XL / 42" />
                  <FormikInput label="SKU Identifier" name="sku" placeholder="e.g. SAF-HELM-01" icon={<Hash size={16} />} />
                  <FormikInput label="Unit Rate (QAR)" name="rate" type="number" icon={<DollarSign size={16} />} required />
                  <FormikInput label="Initial Quantity" name="quantity" type="number" icon={<Layers size={16} />} required />
               </div>
            </Section>
          ) : (
            <Section eyebrow="Variant Matrix" title="Multi-Size" highlight="Management" className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500 text-teal-600">
               <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <FieldArray name="variants">
                    {({ push, remove }) => (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate (QAR)</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial Qty</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {formik.values.variants.map((_, index) => (
                              <tr key={index} className="group hover:bg-teal-50/30 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-gray-400">{index + 1}</td>
                                <td className="px-4 py-2">
                                  <FormikInput label="" name={`variants[${index}].size`} placeholder="M, 42..." wrapperClassName="mb-0" className="h-10 text-xs font-bold" />
                                </td>
                                <td className="px-4 py-2">
                                  <FormikInput label="" name={`variants[${index}].sku`} placeholder="SKU-001" wrapperClassName="mb-0" className="h-10 text-xs font-bold uppercase" />
                                </td>
                                <td className="px-4 py-2">
                                  <FormikInput label="" name={`variants[${index}].rate`} type="number" wrapperClassName="mb-0" className="h-10 text-xs font-bold" />
                                </td>
                                <td className="px-4 py-2">
                                  <FormikInput label="" name={`variants[${index}].quantity`} type="number" wrapperClassName="mb-0" className="h-10 text-xs font-bold" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {formik.values.variants.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => remove(index)}
                                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="p-4 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center">
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Total Variants: {formik.values.variants.length}</p>
                           <button 
                             type="button" 
                             onClick={() => push({ size: '', sku: '', rate: formik.values.rate, quantity: 1 })}
                             className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-200 text-teal-600 rounded-xl text-xs font-bold hover:bg-teal-50 transition-all shadow-sm"
                           >
                             <Plus size={14} /> Add Size Variant
                           </button>
                        </div>
                      </div>
                    )}
                  </FieldArray>
               </div>
            </Section>
          ) }

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
