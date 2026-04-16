'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { ReturnTicket } from '@/lib/types';
import { getReturnTicketById } from '@/services/returnTicketApi';
import { Edit2, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

  // Calculate totals
  const totalItems = ticket.items.length;
  const totalReturnedQty = ticket.items.reduce(
    (sum, item) => sum + (Number(item.returnQty) || 0),
    0
  );

  return (
    <div className="min-h-screen w-full bg-slate-50/50 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {ticket.ticketNo}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created on {formatDateTime(ticket.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={handleEdit}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition-all"
        >
          <Edit2 className="w-4 h-4" /> Edit Ticket
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total Items" value={totalItems} />
        <SummaryCard label="Total Returned Qty" value={totalReturnedQty} />
        <SummaryCard label="Type" value={ticket.ticketType || 'N/A'} />
        <SummaryCard label="Status" value={ticket.status || 'Pending'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN - MAIN INFO */}
        <div className="xl:col-span-2 space-y-8">
          {/* ITEMS TABLE */}
          <Section title="Returned Items" className="border-none shadow-sm ring-1 ring-gray-900/5">
            <div className="overflow-hidden rounded-lg">
              <table className="akod-table">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-900">Product</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-900">Code</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-900">Unit</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-900">Delivered</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-900">Previous Return</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-900">Return Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ticket.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.itemCode}</td>
                      <td className="py-3 px-4 text-gray-600">{item.unit}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.totalReturnedQty}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {item.returnQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right font-semibold text-gray-700">
                      Total Return Qty
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {totalReturnedQty}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>

          <Section title="Notes & Info" className="border-none shadow-sm ring-1 ring-gray-900/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <Detail label="Reason" value={ticket.reason} />
              <Detail label="Subject" value={ticket.subject} />
              <Detail label="Project Location" value={ticket.projectLocation} />
              <Detail label="Reference No" value={ticket.referenceNo} />
              <Detail label="PO No" value={ticket.poNo} />
              <Detail label="Invoice No" value={ticket.invoiceNo} />
              <Detail label="Vehicle No" value={ticket.vehicleNo} />
            </div>
          </Section>
        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="space-y-6">
          <Section title="Customer Info" className="border-none shadow-sm ring-1 ring-gray-900/5">
            <div className="space-y-4">
              <Detail label="Customer" value={ticket.customerName} />
              <Detail label="Category" value={ticket.noteCategory} />
              <Detail label="Return Date" value={new Date(ticket.returnDate).toLocaleDateString()} />
            </div>
          </Section>

          <Section title="Logistics" className="border-none shadow-sm ring-1 ring-gray-900/5">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Delivered By</h4>
                <div className="bg-gray-50 rounded p-3 space-y-2">
                  <Detail label="Name" value={ticket.deliveredBy.deliveredByName} compact />
                  <Detail label="Mobile" value={ticket.deliveredBy.deliveredByMobile} compact />
                  <Detail label="Date" value={ticket.deliveredBy.deliveredDate ? new Date(ticket.deliveredBy.deliveredDate).toLocaleDateString() : '-'} compact />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Received By</h4>
                <div className="bg-gray-50 rounded p-3 space-y-2">
                  <Detail label="Name" value={ticket.receivedBy.receivedByName} compact />
                  <Detail label="Mobile" value={ticket.receivedBy.receivedByMobile} compact />
                  <Detail label="Qatar ID" value={ticket.receivedBy.qatarId} compact />
                  <Detail label="Date" value={ticket.receivedBy.receivedDate ? new Date(ticket.receivedBy.receivedDate).toLocaleDateString() : '-'} compact />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

/* ================= Sub-Components ================= */

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <div className="text-sm text-gray-500 mb-1">{label}</div>
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
  </div>
);

const Detail = ({ label, value, compact = false }: { label: string; value?: string | null, compact?: boolean }) => (
  <div className={compact ? "flex justify-between items-center text-sm" : ""}>
    <div className={`text-gray-500 ${compact ? "" : "text-xs uppercase tracking-wide font-semibold mb-1"}`}>
      {label}
    </div>
    <div className={`font-medium ${compact ? "text-gray-900" : "text-gray-900"}`}>
      {value || '-'}
    </div>
  </div>
);

export default ViewReturnTicketPage;
