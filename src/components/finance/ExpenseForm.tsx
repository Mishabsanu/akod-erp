'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { Expense } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { DollarSign, Edit3, Paperclip, PlusCircle } from 'lucide-react';
import React, { useState } from 'react';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  category: Yup.string().required('Category is required'),
  amount: Yup.number().required('Amount is required').min(0.01, 'Amount must be greater than zero'),
  paymentMethod: Yup.string().required('Payment Method is required'),
  status: Yup.string().required('Status is required'),
});

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const expenseCategories = [
  'Utilities', 'Rent', 'Salary', 'Office Supplies', 
  'Marketing', 'Maintenance', 'Travel', 'Communication', 
  'Professional Fees', 'Taxes & Licenses', 'Insurance', 'Miscellaneous'
];

const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'Other'];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isEditMode = !!initialData?._id;

  const formik = useFormik<Expense>({
    initialValues: (initialData || {
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: 0,
      taxAmount: 0,
      paymentMethod: 'Bank Transfer',
      referenceNo: '',
      description: '',
      companyName: '',
      status: 'paid',
    }) as Expense,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const totalAmount = Number(values.amount) + Number(values.taxAmount);
      try {
        await onSubmit({ ...values, totalAmount });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      {/* Header matching Sales module */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Edit3 className="text-red-600 w-6 h-6" />
          ) : (
            <PlusCircle className="text-red-600 w-6 h-6" />
          )}
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Expense' : 'Create New Expense'}
          </h2>
        </div>
        <span className="text-sm text-gray-500 italic">
          {isEditMode 
            ? `Updating Audit Trail for Entry #${initialData?.referenceNo || 'N/A'}`
            : 'Record business outflows and attach receipts for auditing'}
        </span>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section title="Transaction Classification">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormikInput 
                  name="date" 
                  label="Expense Date" 
                  type="date" 
                  required 
                />
                <FormikSelect 
                  name="category" 
                  label="Expense Category" 
                  options={expenseCategories.map(c => ({ label: c, value: c }))} 
                  required 
                />
                <FormikInput 
                  name="referenceNo" 
                  label="Reference / Bill No." 
                  placeholder="e.g. BILL-2024-001"
                />
                <FormikInput 
                  name="companyName" 
                  label="Company / Vendor Name" 
                  placeholder="Enter vendor or company name"
                />
             </div>
          </Section>

          <Section title="Financial & Settlement">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormikInput 
                  name="amount" 
                  label="Base Amount (QAR)" 
                  type="number" 
                  required 
                />
                <FormikInput 
                  name="taxAmount" 
                  label="Tax / VAT Amount" 
                  type="number" 
                />
          
                <FormikSelect 
                  name="paymentMethod" 
                  label="Instrument Method" 
                  options={paymentMethods.map(m => ({ label: m, value: m }))} 
                  required 
                />
                <FormikSelect 
                  name="status" 
                  label="Registry Status" 
                  options={[
                    { label: 'Cleared (Paid)', value: 'paid' },
                    { label: 'Accrued (Pending)', value: 'pending' },
                    { label: 'Voided (Cancelled)', value: 'cancelled' }
                  ]} 
                />
             </div>
             
             {/* Calculations Summary */}
             <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold">
                      <DollarSign size={20} />
                   </div>
                   <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">Net Settlement Amount</span>
                </div>
                <span className="text-2xl font-bold text-[#11375d]">
                  QAR {(Number(formik.values.amount) + Number(formik.values.taxAmount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
             </div>
          </Section>

          <Section title="Auditing Artifacts">
             <div className="space-y-8">
                <FormikTextarea 
                  name="description" 
                  label="Administrative Notes / Description" 
                  placeholder="Provide detailed context for this expenditure..."
                  rows={4}
                />

                <div className="p-10 border-2 border-dashed border-gray-200 rounded-3xl bg-white hover:border-red-600 transition-all group relative cursor-pointer"
                     onClick={() => document.getElementById('receipt-upload')?.click()}>
                   <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-red-600 transition-all mb-4">
                         <Paperclip size={24} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                         {selectedFile ? selectedFile.name : 'Upload Electronic Receipt'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold mt-2 italic">PDF, JPEG, or PNG formats up to 5MB</span>
                   </div>
                   <input 
                      id="receipt-upload"
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                </div>
             </div>
          </Section>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className={`px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-red-600/10 transition-all active:scale-95 ${
                formik.isSubmitting || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isEditMode ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};


export default ExpenseForm;
