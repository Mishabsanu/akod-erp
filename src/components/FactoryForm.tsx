'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { 
  Building2, 
  CheckCircle2, 
  Camera, 
  Package, 
  Hash, 
  Calendar as CalendarIcon, 
  Clock, 
  Minus, 
  Plus, 
  Layers,
  ChevronRight,
  PlusCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { getRawMaterialDropdown } from '@/services/rawMaterialApi';
import { getProductDropdown } from '@/services/catalogApi';
import { FormikProvider, useFormik, FieldArray } from 'formik';
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import ItemDiscoveryModal from './shared/ItemDiscoveryModal';

const ProductionValidationSchema = Yup.object({
  productId: Yup.string().required('Product is required'),
  quantity: Yup.number().required('Quantity is required').min(1, 'Minimum 1 unit'),
  batchNumber: Yup.string().required('Batch number is required'),
});

interface FactoryFormProps {
  initialData?: any;
  onSubmit: (data: FormData, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const FactoryForm: React.FC<FactoryFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, rawData] = await Promise.all([
          getProductDropdown(),
          getRawMaterialDropdown()
        ]);
        setProducts(prodData);
        setRawMaterials(rawData);
      } catch (error) {
        console.error('Failed to load metadata');
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      productId: initialData?.productId?._id || initialData?.productId || '',
      productName: initialData?.productId?.name || '',
      productCode: initialData?.productId?.itemCode || '',
      quantity: initialData?.quantity || '',
      batchNumber: initialData?.batchNumber || '',
      manufacturingDate: initialData?.manufacturingDate ? new Date(initialData.manufacturingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      remarks: initialData?.remarks || '',
      rawMaterials: initialData?.rawMaterials?.map((rm: any) => ({ 
        material: rm.material?._id || rm.material,
        name: rm.material?.name || '',
        itemCode: rm.material?.itemCode || '',
        availableQty: rm.material?.availableQty || 0,
        unit: rm.material?.unit || '',
        quantity: rm.quantity 
      })) || [{ material: '', name: '', itemCode: '', availableQty: 0, unit: '', quantity: '' }],
    },
    validationSchema: ProductionValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'rawMaterials') {
          // Clean up for backend (remove extra labels used for UI)
          const cleanedMaterials = values.rawMaterials.map(rm => ({
            material: rm.material,
            quantity: rm.quantity
          }));
          formData.append(key, JSON.stringify(cleanedMaterials));
        } else if (key !== 'productName' && key !== 'productCode') {
          formData.append(key, (values as any)[key]);
        }
      });
      if (imageFile) {
        formData.append('image', imageFile);
      }
      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-6 lg:p-12 flex flex-col gap-10">
      
      {/* 1. HERO HEADER AREA */}
      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-white flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-[80px] -mr-48 -mt-48 opacity-40 pointer-events-none" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-teal-700 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-teal-900/20">
             <Building2 size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1 h-3 bg-teal-700 rounded-full" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Manufacturing Intelligence</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize">
               {isEditMode ? 'Authorize' : 'Initialize'} <span className="text-teal-700">Production Report</span>
            </h1>
          </div>
        </div>

        {/* Product Selector Hero */}
        <div className="w-full lg:w-96 relative z-10">
           <button 
             type="button"
             onClick={() => setIsProductModalOpen(true)}
             className={`w-full p-6 bg-slate-900 rounded-[2rem] text-left transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-slate-900/10 group ${formik.errors.productId ? 'ring-4 ring-rose-500/20 border-rose-500' : ''}`}
           >
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Target Production Item</span>
                 <PlusCircle size={16} className="text-teal-500 group-hover:rotate-90 transition-transform" />
              </div>
              {formik.values.productId ? (
                <div>
                   <h2 className="text-sm font-black text-white uppercase tracking-tight mb-1">{formik.values.productName}</h2>
                   <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{formik.values.productCode}</p>
                </div>
              ) : (
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest py-2 italic font-sans flex items-center gap-2">
                   Open Product Registry <ChevronRight size={14} className="text-teal-700" />
                </p>
              )}
           </button>
           {formik.errors.productId && <p className="absolute -bottom-6 left-6 text-[10px] font-black text-rose-500 uppercase tracking-widest">{formik.errors.productId as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
          {/* 2. SIDEBAR (LOGISTICS) */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/40 border border-white h-full">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                   <Clock size={14} className="text-teal-700" />
                   Logistics Chronology
                </h3>

                <div className="space-y-8">
                  <FormikInput label="Batch Number" name="batchNumber" icon={<Hash size={16} />} placeholder="e.g. B-2024-001" required />
                  <FormikInput label="Total Output Quantity" name="quantity" type="number" icon={<Package size={16} />} placeholder="0" required />
                  <FormikInput label="Manufacturing Date" name="manufacturingDate" type="date" icon={<CalendarIcon size={16} />} required />
                  
                  <div className="pt-10 border-t border-gray-50">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Batch Visual Note</label>
                    <div className="relative group h-48">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className={`w-full h-full rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${imageFile ? 'bg-teal-50/50 border-teal-700' : 'bg-gray-50 border-gray-100 hover:border-teal-700'}`}>
                        {imageFile ? (
                          <div className="text-center p-6">
                            <CheckCircle2 size={32} className="text-teal-700 mx-auto mb-2" />
                            <p className="text-[9px] font-black text-teal-900 uppercase truncate px-4">{imageFile.name}</p>
                          </div>
                        ) : (
                          <>
                             <Camera size={24} className="text-gray-300 mb-2" />
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-sans">Sync Visual</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* 3. MAIN WORKSPACE (CONSUMPTION) */}
          <div className="lg:col-span-8 flex flex-col gap-10 h-full">
             <div className="bg-[#0f172a] rounded-[3rem] p-10 shadow-2xl shadow-slate-900/20 text-white flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-10 -mr-32 -mt-32 pointer-events-none" />
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div>
                      <h3 className="text-xl font-black tracking-tight mb-1">Consumption Manifest</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={12} className="text-teal-500" />
                        Synchronized Resource Depletion
                      </p>
                   </div>
                   <button 
                      type="button"
                      onClick={() => {
                        formik.setFieldValue('rawMaterials', [...formik.values.rawMaterials, { material: '', name: '', itemCode: '', availableQty: 0, unit: '', quantity: '' }]);
                      }}
                      className="w-12 h-12 rounded-2xl bg-teal-700 hover:bg-teal-600 transition-all flex items-center justify-center text-white shadow-xl shadow-teal-900/40 active:scale-90"
                   >
                     <Plus size={24} strokeWidth={3} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar relative z-10 max-h-[600px]">
                   <FieldArray name="rawMaterials">
                      {({ remove }) => (
                        <>
                          {formik.values.rawMaterials.map((rm: any, idx: number) => (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center gap-8 transition-all hover:bg-slate-800 animate-in slide-in-from-bottom-4 duration-300">
                               <div className="flex-1 space-y-4">
                                  <button 
                                    type="button"
                                    onClick={() => setActiveMaterialIndex(idx)}
                                    className="w-full text-left bg-slate-900/50 p-6 rounded-3xl border border-slate-700 hover:border-teal-500 transition-all group"
                                  >
                                     <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Material Node</span>
                                        <ChevronRight size={14} className="text-teal-700 group-hover:translate-x-1 transition-transform" />
                                     </div>
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                                           <Hash size={18} />
                                        </div>
                                        <div>
                                           {rm.material ? (
                                              <>
                                                <h4 className="text-sm font-black text-white uppercase truncate">{rm.name}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                   <span className="text-[9px] font-bold text-teal-400 tracking-widest">{rm.itemCode}</span>
                                                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${rm.availableQty > 10 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                      {rm.availableQty} {rm.unit} Available
                                                   </span>
                                                </div>
                                              </>
                                           ) : (
                                              <span className="text-xs font-black text-slate-600 uppercase tracking-widest italic">Identify Source Material...</span>
                                           )}
                                        </div>
                                     </div>
                                  </button>
                               </div>

                               <div className="w-full md:w-48 space-y-2">
                                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-2">Depletion Quantity</label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      name={`rawMaterials[${idx}].quantity`}
                                      value={rm.quantity}
                                      onChange={formik.handleChange}
                                      placeholder="0.00"
                                      className={`w-full h-14 bg-slate-900 border border-slate-700 rounded-2xl px-6 text-sm font-black text-white outline-none focus:border-teal-500 transition-all ${rm.quantity > rm.availableQty ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : ''}`}
                                    />
                                    {rm.quantity > rm.availableQty && (
                                       <AlertCircle size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" title="Exceeds Available Stock" />
                                    )}
                                  </div>
                               </div>

                               <div className="flex items-center justify-center pt-5">
                                  <button 
                                    type="button"
                                    onClick={() => remove(idx)}
                                    disabled={formik.values.rawMaterials.length === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-0"
                                  >
                                     <Minus size={20} strokeWidth={3} />
                                  </button>
                               </div>
                            </div>
                          ))}
                        </>
                      )}
                   </FieldArray>
                </div>

                {/* Remarks & Footer within Dark Section */}
                <div className="mt-8 pt-8 border-t border-slate-800/50 space-y-6 relative z-10">
                   <div className="flex flex-col gap-2">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">Internal Operational Remarks</label>
                      <textarea 
                        name="remarks"
                        value={formik.values.remarks}
                        onChange={formik.handleChange}
                        className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-[1.5rem] p-6 text-xs text-slate-300 outline-none focus:border-teal-500 transition-all resize-none"
                        placeholder="Environmental notes, abnormalities, or batch metrics..."
                      />
                   </div>

                   <div className="flex justify-between items-center gap-6 pt-4">
                      <button 
                        type="button"
                        onClick={onCancel}
                        className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
                      >
                         Discard Session
                      </button>
                      <button 
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="px-12 py-5 bg-teal-700 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-teal-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                      >
                         {formik.isSubmitting ? <Clock size={16} className="animate-spin" /> : <FileText size={16} />}
                         {isEditMode ? 'Authorize Update' : 'Finalize Module'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
      </div>

      {/* --- MODALS --- */}
      <ItemDiscoveryModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Produced Item Registry"
        placeholder="Search Catalog..."
        items={products}
        type="product"
        onSelect={(item) => {
          formik.setFieldValue('productId', item._id);
          formik.setFieldValue('productName', item.name);
          formik.setFieldValue('productCode', item.itemCode);
        }}
      />

      <ItemDiscoveryModal 
        isOpen={activeMaterialIndex !== null}
        onClose={() => setActiveMaterialIndex(null)}
        title="Material Consumption Registry"
        placeholder="Identify Raw Materials..."
        items={rawMaterials}
        type="material"
        onSelect={(item) => {
          if (activeMaterialIndex !== null) {
            formik.setFieldValue(`rawMaterials[${activeMaterialIndex}].material`, item._id);
            formik.setFieldValue(`rawMaterials[${activeMaterialIndex}].name`, item.name);
            formik.setFieldValue(`rawMaterials[${activeMaterialIndex}].itemCode`, item.itemCode);
            formik.setFieldValue(`rawMaterials[${activeMaterialIndex}].availableQty`, item.availableQty || 0);
            formik.setFieldValue(`rawMaterials[${activeMaterialIndex}].unit`, item.unit || '');
          }
        }}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

    </div>
  );
};

export default FactoryForm;
