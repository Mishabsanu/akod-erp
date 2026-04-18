'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { DeliveryTicket } from '@/lib/types';
import { getDeliveryTicketById } from '@/services/deliveryTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import DeliveryTicketPreview from '@/components/delivery-ticket/DeliveryTicketPreview';

const ViewDeliveryTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<DeliveryTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTicket = async () => {
        setLoading(true);
        try {
          const fetchedTicket = await getDeliveryTicketById(id);
          setTicket(fetchedTicket);
        } catch (error) {
          toast.error('Failed to fetch delivery ticket data.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/delivery-ticket/edit/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Delivery ticket not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      <DeliveryTicketPreview
        data={ticket}
        mode="view"
        onBack={() => router.back()}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ViewDeliveryTicketPage;
