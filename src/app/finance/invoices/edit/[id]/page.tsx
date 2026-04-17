'use client';

import { useState, useEffect } from 'react';
import InvoiceForm from '@/components/finance/InvoiceForm';
import { getInvoiceById, updateInvoice } from '@/services/financeApi';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Invoice } from '@/lib/types';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';

const EditInvoicePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (typeof id === 'string') {
          const data = await getInvoiceById(id);
          setInvoice(data);
        }
      } catch (error) {
        toast.error('Failed to load invoice data');
        router.push('/finance/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, router]);

  const handleSubmit = async (values: Invoice) => {
    setIsSaving(true);
    try {
      if (typeof id === 'string') {
        await updateInvoice(id, values);
        toast.success('Invoice record updated successfully');
        router.push('/finance/invoices');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => router.push('/finance/invoices');

  if (loading) return <div className="p-10"><TableSkeleton /></div>;
  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <InvoiceForm
        initialData={invoice}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
};

export default withAuth(EditInvoicePage, [{ module: 'invoice', action: 'update' }]);
