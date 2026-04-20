'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { Invoice, Payment, PODropdownItem } from '@/lib/types';
import { getInvoices, getNextPaymentId } from '@/services/financeApi';
import { getProductDropdown } from '@/services/catalogApi';
import { FormikProvider, useFormik } from 'formik';
import { CreditCard, Edit3, PlusCircle, Building2, Wallet, Landmark, History, Activity } from 'lucide-react';
import React, { useEffect, useState, Suspense } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  type: Yup.string().required('Collection type is required'),
  amount: Yup.number().required('Amount is required').min(0.01, 'Minimum 0.01 required'),
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

const COLLECTION_CATEGORIES = [
  'Products',
  'Service Fees',
  'Project Payment',
  'Consultancy',
  'Rental Income',
  'Consultation',
  'Sale of Assets',
  'Advance Payment',
  'Refund',
  'Other Income'
];

interface PaymentFormProps {
  initialData?: Partial<Payment>;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PaymentFormInner: React.FC<PaymentFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [nextId, setNextId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const isEditMode = !!initialData?._id;

  const formik = useFormik<any>({
    initialValues: (initialData || {
      date: new Date().toISOString().split('T')[0],
      type: 'Received',
      category: '',
      amount: 0,
      modeOfPayment: 'Bank Transfer',
      companyName: '',
      referenceId: '',
      referenceType: 'General',
      remarks: '',
      status: 'completed',
      chequeNo: '',
      chequeDate: '',
      bank: '',
      transactionId: '',
      voucherNo: '',
    }),
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = { ...values };
      if (!payload.referenceId || payload.referenceId === '') {
        delete (payload as any).referenceId;
        payload.referenceType = 'General';
      }
      await onSubmit(payload);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invData] = await Promise.all([
          getInvoices({ status: 'Sent' }, 1, 200)
        ]);
        setInvoices(invData.invoices);
      } catch (error) {
        toast.error('Failed to load necessary data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (!isEditMode) {
      getNextPaymentId().then(setNextId).catch(console.error);
      
      const refId = searchParams.get('refId');
      const refType = searchParams.get('refType');
      const company = searchParams.get('company');
      const amount = searchParams.get('amount');

      if (refId) formik.setFieldValue('referenceId', refId);
      if (refType) {
          formik.setFieldValue('referenceType', refType);
          if (refType === 'Expense') {
              formik.setFieldValue('type', 'Paid'); // Default to Paid when settling an expense
          }
      }
      if (company) formik.setFieldValue('companyName', company);
      if (amount && Number(amount) > 0) formik.setFieldValue('amount', Number(amount));
    }
  }, [isEditMode, searchParams]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-8 py-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-slate-900/5 transition-all duration-500">
      <div className="flex items-center justify-between mb-12 border-b border-gray-50 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 shadow-inner">
            {isEditMode ? <Edit3 size={28} /> : <PlusCircle size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isEditMode ? 'Modify' : 'Post'} <span className="text-emerald-700">Collection</span>
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Treasury & Fund Allocation Audit</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isEditMode ? (
              <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 text-right">Collection ID</span>
                <span className="font-mono font-bold text-emerald-700 text-lg">{(initialData as any)?.paymentId || 'COL-AUTO'}</span>
              </div>
           ) : (
             <div className="bg-emerald-50/50 px-6 py-3 rounded-2xl border border-emerald-100 flex flex-col items-end animate-pulse">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1 text-right italic">Drafting ID</span>
                <span className="font-mono font-bold text-emerald-700 text-lg">{nextId || 'COL-...'}</span>
             </div>
           )}
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-12">
          <Section title="Entity & Source Identification">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <FormikInput 
                    name="companyName" 
                    label="Company / Payer Name" 
                    placeholder="Enter the source entity name..."
                    required
                  />
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest px-1">
                    <Building2 size={12} />
                    <span>Entity tracking for treasury history</span>
                  </div>
                </div>
                <FormikSelect
                  name="referenceId"
                  label="Link to Source (Invoice) - Optional"
                  options={[
                    { label: 'General / No Invoice', value: '' },
                    ...invoices.map(inv => ({
                      label: `${inv.invoiceNo} - (QAR ${inv.totalAmount.toLocaleString()})`,
                      value: inv._id!
                    }))
                  ]}
                  disabled={loading}
                  onChange={(e) => {
                    const invId = e.target.value;
                    const inv = invoices.find(i => i._id === invId);
                    formik.setFieldValue('referenceId', invId);
                    formik.setFieldValue('referenceType', invId ? 'Invoice' : 'General');
                    if (inv && formik.values.amount === 0) {
                      formik.setFieldValue('amount', inv.totalAmount);
                    }
                  }}
                />
             </div>
          </Section>

          <Section title="Collection Classification">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <FormikInput 
                  name="date" 
                  label="Transaction Date" 
                  type="date" 
                  required 
                />
                <FormikSelect 
                  name="type" 
                  label="Payment Logic" 
                  options={[
                    { label: 'Received (Accounts Receivable)', value: 'Received' },
                    { label: 'Paid (Accounts Payable)', value: 'Paid' }
                  ]} 
                  required 
                />
                <FormikSelect 
                  name="category" 
                  label="Collection Category" 
                  options={COLLECTION_CATEGORIES.map(c => ({ label: c, value: c }))} 
                  required 
                />
             </div>
          </Section>

          <Section title="Settlement & Instrument">
             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   <FormikInput 
                    name="amount" 
                    label="Principal Amount (QAR)" 
                    type="number" 
                    required 
                  />
                   <FormikSelect 
                    name="modeOfPayment" 
                    label="Mode of Payment" 
                    options={paymentMethods.map(m => ({ label: m, value: m }))} 
                    required 
                  />
                  <FormikSelect 
                    name="status" 
                    label="Settlement Status" 
                    options={[
                      { label: 'Completed (Verified)', value: 'completed' },
                      { label: 'Pending (Uncleared)', value: 'pending' },
                      { label: 'Failed (Returned)', value: 'failed' }
                    ]} 
                  />
                </div>

                {/* Conditional Fields based on Mode of Payment */}
                <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm animate-in fade-in duration-500">
                  {formik.values.modeOfPayment === 'Cheque' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <FormikInput name="chequeNo" label="Cheque Number" placeholder="e.g. 102938" required />
                       <FormikInput name="chequeDate" label="Cheque Date" type="date" required />
                       <FormikInput name="bank" label="Drawn Bank Name" placeholder="e.g. QNB" required />
                    </div>
                  )}

                  {formik.values.modeOfPayment === 'Bank Transfer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormikInput name="transactionId" label="Transaction ID / Ref" placeholder="e.g. TRN-7766" required />
                       <FormikInput name="bank" label="Payer Bank" placeholder="e.g. CBQ" />
                    </div>
                  )}

                  {formik.values.modeOfPayment === 'Cash' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormikInput name="voucherNo" label="Voucher Number" placeholder="e.g. VCH-99" required />
                    </div>
                  )}
                </div>
             </div>
          </Section>

          <Section title="Narrative & Remarks">
             <FormikTextarea 
               name="remarks" 
               label="Internal Audit Notes" 
               placeholder="Detailed summary of this treasury movement..."
               rows={4}
             />
          </Section>

          <div className="flex justify-end items-center gap-6 pt-10 border-t border-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 border border-transparent hover:border-rose-100"
            >
              Cancel Entry
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className={`px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 flex items-center gap-4 ${
                formik.isSubmitting || isLoading
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              <Activity size={18} />
              {isEditMode ? 'Update Collection' : 'Register Collection'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">Initializing treasury environment...</div>}>
        <PaymentFormInner {...props} />
    </Suspense>
);

export default PaymentForm;
