'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { DeliveryTicket } from '@/lib/types';
import { getDeliveryTicketById, updateDeliveryTicket } from '@/services/deliveryTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import DeliveryTicketPreview from '@/components/delivery-ticket/DeliveryTicketPreview';
import { Section } from '@/components/ui/Section';
import { FileText, Upload, Trash2, Eye, Download } from 'lucide-react';

const ViewDeliveryTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [ticket, setTicket] = useState<DeliveryTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'attachments'>('preview');
  const [uploading, setUploading] = useState(false);

  /* ---------------- UPLOAD STATE ---------------- */
  const [signedTicketFile, setSignedTicketFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);

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

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/delivery-ticket/edit/${id}`);
  };

  const handleUpload = async () => {
    if (!signedTicketFile && supportingDocs.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (signedTicketFile) formData.append('signedTicket', signedTicketFile);
      supportingDocs.forEach(file => formData.append('supportingDocs', file));
      
      await updateDeliveryTicket(id, formData as any);
      toast.success('Attachments updated successfully!');
      setSignedTicketFile(null);
      setSupportingDocs([]);
      fetchTicket(); // Refresh data
    } catch (error) {
      toast.error('Failed to upload attachments.');
      console.error(error);
    } finally {
      setUploading(false);
    }
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'preview' 
            ? 'bg-sky-600 text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Preview
          </div>
        </button>
        <button
          onClick={() => setActiveTab('attachments')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'attachments' 
            ? 'bg-sky-600 text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Attachments & Uploads
          </div>
        </button>
      </div>

      <div className="w-full max-w-[1000px]">
        {activeTab === 'preview' ? (
          <DeliveryTicketPreview
            data={ticket}
            mode="view"
            onBack={() => router.back()}
            onEdit={handleEdit}
          />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Section title="Uploaded Attachments" eyebrow="Inventory Tracking">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Signed Ticket */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText className="w-12 h-12 text-sky-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                    Signed Delivery Note
                  </h3>
                  {ticket.attachments?.signedTicket ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-gray-500 italic">This is the verified physical copy signed by the receiver.</p>
                      <a 
                        href={ticket.attachments.signedTicket} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-600 font-bold hover:underline bg-sky-50 p-3 rounded-xl border border-sky-100 w-fit"
                      >
                         <Eye className="w-4 h-4" />
                         View Document
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-sm text-amber-700 font-medium italic">No signed document uploaded yet.</p>
                    </div>
                  )}
                </div>

                {/* Supporting Docs */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Upload className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Supporting Documents
                  </h3>
                  {(ticket.attachments?.supportingDocs?.length ?? 0) > 0 ? (
                    <div className="space-y-3">
                      {ticket.attachments?.supportingDocs?.map((url, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <span className="text-xs font-bold text-emerald-700 uppercase">Document {i + 1}</span>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white text-emerald-600 rounded-lg hover:shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-sm text-gray-500 font-medium italic">No supporting documents found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Form */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                <h2 className="text-xl font-black text-gray-950 mb-6 flex items-center gap-3">
                   Upload <span className="text-sky-600">New Files</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Signed Ticket</label>
                      <input 
                        type="file" 
                        onChange={(e) => setSignedTicketFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Supporting Docs (Multiple)</label>
                      <input 
                        type="file" 
                        multiple
                        onChange={(e) => setSupportingDocs(Array.from(e.target.files || []))}
                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                   </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-50">
                   <button 
                    onClick={handleUpload}
                    disabled={uploading || (!signedTicketFile && supportingDocs.length === 0)}
                    className="px-8 py-3 bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-100 hover:bg-sky-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                   >
                     {uploading ? 'Processing...' : 'Upload Attachments'}
                   </button>
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(ViewDeliveryTicketPage, [{ module: 'delivery_ticket', action: 'view' }]);
