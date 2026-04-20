'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { Expense, PODropdownItem } from '@/lib/types';
import { getProductDropdown } from '@/services/catalogApi';
import { getNextExpenseId, getPayments } from '@/services/financeApi';
import { FormikProvider, useFormik } from 'formik';
import { DollarSign, Edit3, Paperclip, PlusCircle, Building2, Wallet, CreditCard, Landmark, History, Activity, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  category: Yup.string().required('Category is required'),
  amount: Yup.number().required('Amount is required').min(0.01, 'Amount must be greater than zero'),
  modeOfPayment: Yup.string().required('Mode of Payment is required'),
  status: Yup.string().required('Status is required'),
  chequeNo: Yup.string().when('modeOfPayment', {
    is: 'Cheque',
    then: (schema) => schema.required('Cheque number is required'),
    otherwise: (schema) => schema.optional()
  }),
  transactionId: Yup.string().when('modeOfPayment', {
    is: 'Bank Transfer',
    then: (schema) => schema.required('Transaction ID is required'),
    otherwise: (schema) => schema.optional()
  }),
  voucherNo: Yup.string().when('modeOfPayment', {
    is: 'Cash',
    then: (schema) => schema.required('Voucher number is required'),
    otherwise: (schema) => schema.optional()
  })
});

const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'Other'];

const EXPENSE_CATEGORIES = [
  'Products',
  'Utilities',
  'Rent',
  'Salary',
  'Office Supplies',
  'Marketing',
  'Maintenance',
  'Travel',
  'Communication',
  'Professional Fees',
  'Taxes & Licenses',
  'Insurance',
  'Production',
  'Miscellaneous'
];

interface ExpenseFormProps {
  initialData?: Partial<Expense>;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
    bill: null,
    receipt: null,
    proof: null
  });
  const [nextId, setNextId] = useState<string>('');
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);

  const isEditMode = !!initialData?._id;

  const formik = useFormik<any>({
    initialValues: (initialData || {
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: 0,
      modeOfPayment: 'Bank Transfer',
      referenceNo: '',
      description: '',
      companyName: '',
      status: 'paid',
      chequeNo: '',
      chequeDate: '',
      bank: '',
      transactionId: '',
      voucherNo: '',
    }),
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const totalAmount = Number(values.amount);
      try {
        await onSubmit({ ...values, totalAmount });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!isEditMode) {
      getNextExpenseId().then(setNextId).catch(console.error);
    } else if (initialData?._id) {
       setLoadingSettlements(true);
       getPayments({ search: '', type: 'Paid' }, 1, 100)
        .then(data => {
            const linked = data.payments.filter((p: any) => p.referenceId === initialData._id);
            setSettlements(linked);
        })
        .finally(() => setLoadingSettlements(false));
    }
  }, [isEditMode, initialData?._id]);

  const handleFileChange = (type: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-8 py-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-slate-900/5 transition-all duration-500">
      <div className="flex items-center justify-between mb-12 border-b border-gray-50 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 shadow-inner">
            {isEditMode ? <Edit3 size={28} /> : <PlusCircle size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isEditMode ? 'Modify' : 'Register'} <span className="text-teal-700">Expenditure</span>
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Audit Trail & Fund Outflow Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isEditMode ? (
              <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 text-right">Expense ID</span>
                <span className="font-mono font-bold text-teal-700 text-lg">{(initialData as any)?.expenseId || 'EXP-AUTO'}</span>
              </div>
           ) : (
             <div className="bg-teal-50/50 px-6 py-3 rounded-2xl border border-teal-100 flex flex-col items-end animate-pulse">
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block mb-1 text-right italic">Drafting ID</span>
                <span className="font-mono font-bold text-teal-700 text-lg">{nextId || 'EXP-...'}</span>
             </div>
           )}
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-12">
          <Section title="Entity Identification">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <FormikInput 
                    name="companyName" 
                    label="Company / Vendor Name" 
                    placeholder="Enter the beneficiary entity name..."
                    required
                  />
                  <div className="flex items-center gap-2 text-[10px] text-teal-600 font-bold uppercase tracking-widest px-1">
                    <Building2 size={12} />
                    <span>Beneficiary detail for ledger indexing</span>
                  </div>
                </div>
                <FormikInput 
                  name="referenceNo" 
                  label="Internal Reference / Bill No." 
                  placeholder="e.g. INV/2024/001"
                />
             </div>
          </Section>

          <Section title="Categorization & Valuation">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <FormikInput 
                  name="date" 
                  label="Transaction Date" 
                  type="date" 
                  required 
                />
                <div className="relative group">
                  <FormikSelect 
                    name="category" 
                    label="Expenditure Category" 
                    options={EXPENSE_CATEGORIES.map(c => ({ label: c, value: c }))} 
                    required 
                  />
                </div>
                <FormikInput 
                  name="amount" 
                  label="Settlement Amount (QAR)" 
                  type="number" 
                  required 
                />
             </div>

             {isEditMode && (
               <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1 text-right italic text-left">Total Paid</span>
                    <span className="font-black text-emerald-700 text-xl tracking-tight">QAR {(initialData as any)?.paidTotal?.toLocaleString() || '0.00'}</span>
                  </div>
                  <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1 text-right italic text-left">Outstanding Balance</span>
                    <span className="font-black text-rose-700 text-xl tracking-tight">QAR {(initialData as any)?.balance?.toLocaleString() || '0.00'}</span>
                  </div>
               </div>
             )}
          </Section>

          <Section title="Payment Instrument & Settlement">
             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   <FormikSelect 
                    name="modeOfPayment" 
                    label="Mode of Payment" 
                    options={paymentMethods.map(m => ({ label: m, value: m }))} 
                    required 
                  />
                  <FormikSelect 
                    name="status" 
                    label="Accounting Status" 
                    options={[
                      { label: 'Cleared (Paid)', value: 'paid' },
                      { label: 'Accrued (Partially Paid)', value: 'partially_paid' },
                      { label: 'Outstanding (Pending)', value: 'pending' },
                      { label: 'Voided (Cancelled)', value: 'cancelled' }
                    ]} 
                  />
                </div>

                <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm animate-in fade-in duration-500">
                  {formik.values.modeOfPayment === 'Cheque' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <FormikInput name="chequeNo" label="Cheque Number" placeholder="e.g. 102938" required />
                       <FormikInput name="chequeDate" label="Cheque Date" type="date" required />
                       <FormikInput name="bank" label="Drawn Bank Name" placeholder="e.g. Qatar National Bank" required />
                    </div>
                  )}

                  {formik.values.modeOfPayment === 'Bank Transfer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormikInput name="transactionId" label="Transaction ID / Ref" placeholder="e.g. TRN-990022" required />
                       <FormikInput name="bank" label="Beneficiary Bank" placeholder="e.g. Doha Bank" />
                    </div>
                  )}

                  {formik.values.modeOfPayment === 'Cash' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormikInput name="voucherNo" label="Voucher Number" placeholder="e.g. VCH-001" required />
                    </div>
                  )}

                  {['Credit Card', 'Other'].includes(formik.values.modeOfPayment) && (
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center py-4">No additional details required for this mode</p>
                  )}
                </div>
             </div>
          </Section>

          <Section title="Audit Artifacts (Attachments)">
             <div className="space-y-10">
                <FormikTextarea 
                  name="description" 
                  label="Administrative Narrative / Notes" 
                  placeholder="Provide comprehensive details for future auditing..."
                  rows={4}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { id: 'bill', label: 'Vendor Bill', icon: Landmark },
                     { id: 'receipt', label: 'Payment Receipt', icon: History },
                     { id: 'proof', label: 'Proof of Payment', icon: CreditCard }
                   ].map((type) => (
                     <div 
                        key={type.id}
                        onClick={() => document.getElementById(`upload-${type.id}`)?.click()}
                        className="relative p-6 bg-white border-2 border-dashed border-gray-100 rounded-2xl hover:border-teal-700 hover:bg-teal-50/10 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col items-center gap-3">
                           <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-teal-700 group-hover:text-white transition-all">
                              <type.icon size={20} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-teal-700">{type.label}</span>
                           <span className="text-[9px] font-bold text-gray-300 italic group-hover:text-gray-500">
                             {uploadedFiles[type.id] ? uploadedFiles[type.id]?.name : 'Required for audit'}
                           </span>
                        </div>
                        <input 
                          id={`upload-${type.id}`} 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(type.id, e.target.files?.[0] || null)}
                        />
                     </div>
                   ))}
                </div>
             </div>
          </Section>

          {isEditMode && (
            <Section title="Settlement History (Partial Closures)">
                <div className="overflow-hidden rounded-3xl border border-gray-100">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-black tracking-widest text-gray-400">
                          <th className="px-6 py-4">Ref ID</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4">Instrument</th>
                          <th className="px-6 py-4">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {loadingSettlements ? (
                           <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic font-bold">Retrieving ledger entries...</td></tr>
                        ) : settlements.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No historical settlements found for this expenditure.</td></tr>
                        ) : (
                          settlements.map((s, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-all font-bold text-sm text-gray-700">
                              <td className="px-6 py-4 font-mono text-xs text-teal-600">#{s.paymentId}</td>
                              <td className="px-6 py-4 text-xs">{new Date(s.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right text-emerald-600">QAR {s.amount?.toLocaleString()}</td>
                              <td className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">{s.modeOfPayment}</td>
                              <td className="px-6 py-4 text-xs font-medium italic text-gray-400">{s.transactionId || s.chequeNo || s.remarks || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                   </table>
                </div>
            </Section>
          )}

          <div className="flex justify-end items-center gap-6 pt-10 border-t border-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 border border-transparent hover:border-rose-100"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className={`px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 flex items-center gap-4 ${
                formik.isSubmitting || isLoading
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/30'
              }`}
            >
              <Wallet size={18} />
              {isEditMode ? 'Authorize Update' : 'Register Expense'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ExpenseForm;
