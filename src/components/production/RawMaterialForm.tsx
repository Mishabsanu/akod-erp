'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikProvider, useFormik } from 'formik';
import { Package, Hash, Layers, CheckCircle2, X } from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';

const RawMaterialValidationSchema = Yup.object({
  name: Yup.string().required('Material name is required'),
  itemCode: Yup.string().required('Item code is required'),
  unit: Yup.string().required('Unit is required (e.g. KG, PC)'),
  reorderLevel: Yup.number().required('Reorder level is required').min(0),
});

interface RawMaterialFormProps {
  initialData?: any;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isEditMode: boolean;
}

const RawMaterialForm: React.FC<RawMaterialFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      itemCode: initialData?.itemCode || '',
      unit: initialData?.unit || '',
      reorderLevel: initialData?.reorderLevel || 10,
      description: initialData?.description || '',
    },
    validationSchema: RawMaterialValidationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-700 rounded-2xl flex items-center justify-center text-white">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">
            {isEditMode ? 'Modify' : 'Register'} <span className="text-teal-700">Raw Material</span>
          </h2>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormikInput label="Material Name" name="name" icon={<Package size={16} />} placeholder="e.g. Mild Steel Plate" required />
            <FormikInput label="Internal Item Code" name="itemCode" icon={<Hash size={16} />} placeholder="e.g. RM-001" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormikInput label="Measurement Unit" name="unit" placeholder="e.g. KG, Meter" required />
            <FormikInput label="Reorder Alarm Level" name="reorderLevel" type="number" placeholder="10" required />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Material Specifications / Notes</label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              rows={4}
              className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-teal-700 transition-all resize-none text-sm font-medium"
              placeholder="Detail grade, dimensions, or vendor specifics..."
            />
          </div>

          <div className="flex justify-end gap-6 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-10 py-4 bg-teal-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all disabled:opacity-50"
            >
              {formik.isSubmitting ? 'Synchronizing...' : isEditMode ? 'Authorize Update' : 'Finalize Registration'}
              {!formik.isSubmitting && <CheckCircle2 size={16} />}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default RawMaterialForm;
