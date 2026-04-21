'use client';

import { ReturnTicket } from '@/lib/types';
import { updateReturnTicket } from '@/services/returnTicketApi';
import { FileText, Plus, Trash2, Eye, Download, X, Paperclip, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface ReturnAttachmentsTabProps {
  ticket: ReturnTicket;
  onRefresh: () => void;
}

const ReturnAttachmentsTab = ({ ticket, onRefresh }: ReturnAttachmentsTabProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  
  const signedInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    if (!signedFile && supportingDocs.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading attachments...');

    try {
      const formData = new FormData();
      
      if (signedFile) {
        formData.append('signedTicket', signedFile);
      }
      
      supportingDocs.forEach((file) => {
        formData.append('supportingDocs', file);
      });

      // Partial update - only sending files
      const res = await updateReturnTicket(ticket._id!, formData as any);

      if (res.success) {
        toast.success('Attachments updated successfully');
        setSignedFile(null);
        setSupportingDocs([]);
        onRefresh();
      } else {
        toast.error(res.message || 'Failed to upload attachments');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while uploading. Please try again.');
    } finally {
      setIsUploading(false);
      toast.dismiss(loadingToast);
    }
  };

  const removeNewDoc = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- LEFT: CURRENT FILES --- */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Paperclip className="text-[#0f766e]" size={20} />
                Current Attachments
              </h2>
              <p className="text-sm text-slate-400 mt-1">Files currently associated with this return note.</p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
              {((ticket.attachments?.signedTicket ? 1 : 0) + (ticket.attachments?.supportingDocs?.length || 0))} Files Total
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signed Ticket */}
            <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${ticket.attachments?.signedTicket ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 border-dashed opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <FileText className={ticket.attachments?.signedTicket ? 'text-emerald-600' : 'text-slate-400'} size={24} />
                </div>
                {ticket.attachments?.signedTicket && (
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-white px-2 py-0.5 rounded shadow-sm">Signed Note</span>
                )}
              </div>
              
              <h3 className="font-bold text-slate-800 text-sm mb-1">Official Signed Ticket</h3>
              <p className="text-xs text-slate-500 mb-4 truncate italic">
                {ticket.attachments?.signedTicket ? 'Verification document attached' : 'No signed document uploaded yet'}
              </p>

              {ticket.attachments?.signedTicket && (
                <div className="flex gap-2">
                  <a 
                    href={ticket.attachments.signedTicket} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-emerald-200 text-emerald-700 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition shadow-sm"
                  >
                    <Eye size={14} /> View
                  </a>
                  <a 
                    href={ticket.attachments.signedTicket} 
                    download
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-900/10"
                  >
                    <Download size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Supporting Documents Count */}
            <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${ticket.attachments?.supportingDocs?.length ? 'border-sky-100 bg-sky-50/30' : 'border-slate-100 bg-slate-50/50 border-dashed opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Paperclip className={ticket.attachments?.supportingDocs?.length ? 'text-sky-600' : 'text-slate-400'} size={24} />
                </div>
                <span className="text-[9px] font-black text-sky-600 uppercase tracking-tighter bg-white px-2 py-0.5 rounded shadow-sm">
                  {ticket.attachments?.supportingDocs?.length || 0} Assets
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 text-sm mb-1">Additional Documents</h3>
              <p className="text-xs text-slate-500 mb-4 truncate italic">
                {ticket.attachments?.supportingDocs?.length ? 'Supporting evidence uploaded' : 'No supplementary files attached'}
              </p>

              {ticket.attachments?.supportingDocs?.length ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {ticket.attachments.supportingDocs.map((url: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-sky-100 shadow-sm group">
                      <span className="text-[10px] font-medium text-slate-600 truncate ml-2">Document {i + 1}</span>
                      <div className="flex gap-1.5 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                        <a href={url} target="_blank" className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><Eye size={14} /></a>
                        <a href={url} download className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><Download size={14} /></a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT: UPLOAD BOX --- */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-[#0f766e]/20 p-8 shadow-xl shadow-teal-900/5 sticky top-[132px]">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Upload className="text-[#0f766e]" size={18} />
            Quick Upload
          </h2>

          <div className="space-y-5">
            {/* Signed Ticket Upload */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Signed Ticket Copy</label>
              <div 
                onClick={() => signedInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center
                  ${signedFile ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 hover:border-[#0f766e]/30 hover:bg-slate-50'}
                `}
              >
                <input 
                  type="file" 
                  ref={signedInputRef} 
                  className="hidden" 
                  onChange={(e) => setSignedFile(e.target.files?.[0] || null)}
                  accept="image/*,application/pdf"
                />
                {signedFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="text-emerald-600 mb-2" size={24} />
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-full">{signedFile.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSignedFile(null); }}
                      className="mt-2 text-[9px] font-black text-rose-500 uppercase hover:underline"
                    >Remove</button>
                  </div>
                ) : (
                  <>
                    <FileText className="text-slate-300 group-hover:text-[#0f766e]/50 mb-2 transition-colors" size={24} />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Select Signed Note</span>
                  </>
                )}
              </div>
            </div>

            {/* Supporting Docs Upload */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Additional Docs</label>
              <div 
                 onClick={() => docsInputRef.current?.click()}
                 className="cursor-pointer border-2 border-dashed border-slate-100 rounded-2xl p-4 hover:border-[#0f766e]/30 hover:bg-slate-50 transition-all flex flex-col items-center justify-center group"
              >
                <input 
                  type="file" 
                  ref={docsInputRef} 
                  className="hidden" 
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setSupportingDocs(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
                <Paperclip className="text-slate-300 group-hover:text-[#0f766e]/50 mb-2 transition-colors" size={24} />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Attach More Files</span>
              </div>
              
              {supportingDocs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {supportingDocs.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-600 truncate flex-1 ml-1">{file.name}</span>
                      <button onClick={() => removeNewDoc(idx)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg ml-2">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleFileUpload}
              disabled={isUploading || (!signedFile && supportingDocs.length === 0)}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2
                ${isUploading || (!signedFile && supportingDocs.length === 0)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#0f766e] text-white hover:bg-[#134e4a] shadow-teal-900/20 active:scale-95'
                }
              `}
            >
              {isUploading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnAttachmentsTab;
