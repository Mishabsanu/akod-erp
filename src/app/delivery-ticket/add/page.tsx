'use client';

import DeliveryTicketForm from '@/components/DeliveryTicketForm';
import { handleApiError } from '@/app/utils/errorHandler';
import { DeliveryTicket } from '@/lib/types';
import { createDeliveryTicket } from '@/services/deliveryTicketApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddDeliveryTicketPage = () => {
  const router = useRouter();

  const handleSubmit = async (
    ticketData: Partial<DeliveryTicket>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Creating delivery ticket...');
    setSubmitting(true);
    try {
      const response = await createDeliveryTicket(ticketData);
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success(response.message);
        router.push('/delivery-ticket');
      } else {
        toast.error(response.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const handledError = handleApiError(error);
      if (handledError.fields) {
        setErrors(handledError.fields);
        toast.error(handledError.message);
      } else {
        toast.error(handledError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/delivery-ticket');
  };

  return (
    <DeliveryTicketForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={false}
      isLoading={false}
    />
  );
};

export default AddDeliveryTicketPage;
