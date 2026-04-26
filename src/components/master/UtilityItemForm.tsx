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
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* HEADER AREA */}
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e]">
            <Package size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isEditMode ? 'Authorize Update' : 'Initialize Asset'}
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              Master Ledger &bull; Operational Inventory Node
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
            {isEditMode ? 'Authorize Sync' : 'Finalize Ledger Entry'}
          </button>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CORE SPECIFICATIONS */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
                Asset Identity
              </h3>

              <div className="space-y-6">
                <FormikInput label="Gear / Item Name" name="name" placeholder="e.g. Industrial Safety Helmet" required />
                <div className="grid grid-cols-2 gap-6">
                  <FormikSelect 
                    label="Item Category" 
                    name="category" 
                    options={[
                      { value: 'Safety Gear', label: 'Safety Gear' },
                      { value: 'Uniform', label: 'Uniform' },
                      { value: 'Tools', label: 'Tools' },
                      { value: 'Industrial Gear', label: 'Industrial Gear' },
                      { value: 'Other', label: 'Other' },
                    ]} 
                  />
                  <FormikInput label="Min Alert Level" name="minStockLevel" type="number" placeholder="5" />
                </div>
                
                {!isEditMode && (
                  <div className="flex items-center gap-3 p-4 bg-teal-50/50 rounded-xl border border-teal-100/50 group hover:border-teal-200 transition-all">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600 group-hover:scale-110 transition-transform">
                      <Settings2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">Manage Multiple Sizes?</p>
                      <p className="text-[10px] text-gray-500 font-medium italic">Add variants like M, L, XL at once.</p>
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f766e]"></div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* TECHNICAL DETAILS */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Info size={14} />
                Logistics & Metadata
              </h3>
              <textarea 
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                rows={8}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 outline-none focus:border-[#0f766e] transition-all resize-none shadow-inner"
                placeholder="Detail material safety data, compliance standards, or usage instructions..."
              />
            </div>
          </div>

          {!hasVariants || isEditMode ? (
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8 mt-8">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                 <span className="w-2 h-6 bg-teal-600/40 rounded-full" />
                 Valuation Specifications
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormikInput label="Size / Variant" name="size" placeholder="e.g. XL / 42" />
                  <FormikInput label="SKU Identifier" name="sku" placeholder="e.g. SAF-HELM-01" icon={<Hash size={16} />} />
                  <FormikInput label="Unit Rate (QAR)" name="rate" type="number" icon={<DollarSign size={16} />} required />
                  <FormikInput label="Initial Quantity" name="quantity" type="number" icon={<Layers size={16} />} required />
               </div>
            </div>
          ) : (
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8 mt-8 overflow-hidden">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                 <span className="w-2 h-6 bg-teal-600/40 rounded-full" />
                 Variant Matrix
               </h3>
               <div className="border border-slate-100 rounded-3xl overflow-hidden">
                  <FieldArray name="variants">
                    {({ push, remove }) => (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate (QAR)</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Qty</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {formik.values.variants.map((_, index) => (
                              <tr key={index} className="group hover:bg-teal-50/30 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-slate-300">{index + 1}</td>
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
                                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all mx-auto"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                           <p className="text-[10px] text-slate-400 font-bold uppercase ml-2">Total Variants: {formik.values.variants.length}</p>
                           <button 
                             type="button" 
                             onClick={() => push({ size: '', sku: '', rate: formik.values.rate, quantity: 1 })}
                             className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                           >
                             <Plus size={14} /> Add Size Variant
                           </button>
                        </div>
                      </div>
                    )}
                  </FieldArray>
               </div>
            </div>
          ) }
        </form>
      </FormikProvider>
    </div>
  );
};

export default UtilityItemForm;
