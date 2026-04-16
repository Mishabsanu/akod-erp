'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { Invoice, Payment } from '@/lib/types';
import { getInvoices } from '@/services/financeApi';
import { FormikProvider, useFormik } from 'formik';
import { CreditCard, Edit3, PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  type: Yup.string().required('Payment type is required'),
  amount: Yup.number().required('Amount is required').min(0.01, 'Minimum 0.01 required'),
  paymentMethod: Yup.string().required('Method is required'),
});

interface PaymentFormProps {
  initialData?: Payment;
  onSubmit: (values: Payment) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'Other'];

const PaymentForm: React.FC<PaymentFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData?._id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invData] = await Promise.all([

          getInvoices({ status: 'Sent' }, 1, 200)
        ]);
        setInvoices(invData.invoices);
      } catch (error) {
        toast.error('Failed to load  invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik<Payment>({
    initialValues: (initialData || {
      date: new Date().toISOString().split('T')[0],
      type: 'Received',
      amount: 0,
      paymentMethod: 'Bank Transfer',
      companyName: '',
      referenceId: '',
      referenceType: 'Invoice',
      transactionId: '',
      remarks: '',
      status: 'completed',
    }) as Payment,
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

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      {/* Header matching Sales module */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Edit3 className="text-teal-700 w-6 h-6" />
          ) : (
            <PlusCircle className="text-teal-700 w-6 h-6" />
          )}
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Payment' : 'Post New Payment'}
          </h2>
        </div>
        <span className="text-sm text-gray-500 italic">
          Treasury & Fund Allocation
        </span>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section title="Payment Classification">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                name="paymentMethod"
                label="Financial Instrument"
                options={paymentMethods.map(m => ({ label: m, value: m }))}
                required
              />
              <FormikInput
                name="transactionId"
                label="Bank Ref / Transaction ID"
                placeholder="e.g. TRN-998877"
              />
              <FormikInput
                name="companyName"
                label="Company / Client Name"
                placeholder="Enter company or client name"
              />
            </div>
          </Section>

          <Section title="Settlement & Ledger Allocation">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormikInput
                name="amount"
                label="Principal Amount (QAR)"
                type="number"
                required
              />

              <div className="flex flex-col gap-2">
                <FormikSelect
                  name="referenceId"
                  label="Link to Source (Invoice)"
                  options={invoices.map(inv => ({
                    label: `${inv.invoiceNo} - (QAR ${inv.totalAmount.toLocaleString()})`,
                    value: inv._id!
                  }))}
                  disabled={loading}
                  onChange={(e) => {
                    const invId = e.target.value;
                    const inv = invoices.find(i => i._id === invId);
                    formik.setFieldValue('referenceId', invId);
                    if (inv && formik.values.amount === 0) {
                      formik.setFieldValue('amount', inv.totalAmount);
                    }
                  }}
                />
                <span className="text-[10px] text-sky-500 font-bold uppercase tracking-tighter px-2 italic">
                  * Linking pre-fills principal from invoice
                </span>
              </div>
            </div>
          </Section>

          <Section title="Notes & Remarks">
            <FormikTextarea
              name="remarks"
              label="Internal Audit Notes"
              placeholder="Narrative summary of this treasury movement..."
              rows={5}
            />
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
              className={`px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-teal-700/10 transition-all active:scale-95 flex items-center gap-2 ${formik.isSubmitting || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800'
                }`}
            >
              <CreditCard size={18} />
              {isEditMode ? 'Update Payment' : 'Save Payment'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};



export default PaymentForm;
