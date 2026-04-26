'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { ReturnTicket } from '@/lib/types';
import { getReturnTicketById, updateReturnTicket } from '@/services/returnTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ReturnTicketPreview from '@/components/return-ticket/ReturnTicketPreview';
import { FileText, Upload, ArrowLeft, Edit2 } from 'lucide-react';
import ReturnAttachmentsTab from '@/components/return-ticket/ReturnAttachmentsTab';

const ViewReturnTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [ticket, setTicket] = useState<ReturnTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'document' | 'attachments'>('document');

  const fetchTicket = async () => {
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

  useEffect(() => {
    if (id) {
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

  const tabs = [
    { key: 'document', label: 'View Document', icon: FileText },
    { key: 'attachments', label: 'Manage Attachments', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* --- HEADER & NAVIGATION --- */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/return-ticket')}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Return Note: {ticket.ticketNo}</h1>
              <p className="text-xs text-slate-500 font-medium">{ticket.customerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a] text-white px-4 py-2 rounded-lg transition text-sm font-bold shadow-sm"
            >
              <Edit2 size={16} />
              Edit Ticket
            </button>
          </div>
        </div>

        {/* --- TAB BAR --- */}
        <div className="max-w-[1200px] mx-auto px-6 flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`relative flex items-center gap-2 py-3 text-sm font-bold transition-all px-1
                ${activeTab === tab.key ? 'text-[#0f766e] opacity-100' : 'text-slate-400 hover:text-slate-600 opacity-70'}
              `}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f766e] rounded-t-full shadow-[0_-2px_6px_rgba(15,118,110,0.3)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="w-full h-full p-6">
        <div className="max-w-[1200px] mx-auto">
          {activeTab === 'document' ? (
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <ReturnTicketPreview
                    data={ticket}
                    mode="view"
                    onBack={() => router.back()}
                    onEdit={handleEdit}
                />
            </div>
          ) : (
            <ReturnAttachmentsTab 
                ticket={ticket} 
                onRefresh={fetchTicket}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewReturnTicketPage;
