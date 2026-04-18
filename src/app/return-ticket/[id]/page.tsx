'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { ReturnTicket } from '@/lib/types';
import { getReturnTicketById } from '@/services/returnTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ReturnTicketPreview from '@/components/return-ticket/ReturnTicketPreview';

const ViewReturnTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<ReturnTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTicket = async () => {
        setLoading(true);
        try {
          const fetchedTicket = await getReturnTicketById(id);
          setTicket(fetchedTicket);
        } catch (error) {
          toast.error('Failed to fetch return ticket data.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/return-ticket/edit/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Return ticket not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      <ReturnTicketPreview
        data={ticket}
        mode="view"
        onBack={() => router.back()}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ViewReturnTicketPage;
