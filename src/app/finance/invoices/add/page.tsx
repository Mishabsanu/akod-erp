'use client';

import { useState } from 'react';
import InvoiceForm from '@/components/finance/InvoiceForm';
import { createInvoice } from '@/services/financeApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { Invoice } from '@/lib/types';

const AddInvoicePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: Invoice) => {
    setIsLoading(true);
    try {
      await createInvoice(values);
      toast.success('Tax invoice generated and posted successfully');
      router.push('/finance/invoices');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push('/finance/invoices');

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default withAuth(AddInvoicePage, [{ module: 'invoice', action: 'create' }]);
