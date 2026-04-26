'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFileUrl } from '@/app/utils/fileUtils';
import { 
  User, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Phone, 
  Globe, 
  Briefcase,
  Plus,
  Trash2,
  AlertCircle,
  HardHat,
  Package,
  History,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Minus,
  ShieldAlert,
  DollarSign,
  ChevronRight,
  CreditCard,
  Award
} from 'lucide-react';
import { getWorker } from '@/services/workerApi';
import { getWorkerUtilities, issueBulkUtilities, deleteUtility, updateUtilityStatus } from '@/services/workerUtilityApi';
import { Worker, WorkerUtility } from '@/lib/types';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/app/utils/formatDate';
import { getSlips } from '@/services/payrollApi';

const calculateTenure = (joinDate: string) => {
  if (!joinDate) return 'N/A';
  const start = new Date(joinDate);
  const end = new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} Days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} Months`;
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  return `${years} Year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} Month${months > 1 ? 's' : ''}` : ''}`;
};

const getExpiryStatus = (date: string | undefined) => {
  if (!date) return { label: 'Not Set', color: 'text-gray-400', bg: 'bg-gray-50' };
  const expiry = new Date(date);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Expired', color: 'text-rose-600', bg: 'bg-rose-50' };
  if (diffDays <= 30) return { label: `${diffDays} Days Left`, color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: `${diffDays} Days Left`, color: 'text-emerald-600', bg: 'bg-emerald-50' };
};

function WorkerProfilePage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();
  const { can } = useAuth();
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [utilities, setUtilities] = useState<WorkerUtility[]>([]);
  const [latestSlip, setLatestSlip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'utilities'>('overview');
  
  // Modal states
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [forceIssue, setForceIssue] = useState(false);
  const [utilityItems, setUtilityItems] = useState([
    { itemName: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0], expiryDate: '', autoExpiry: true }
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [workerData, utilsData, slipsData] = await Promise.all([
        getWorker(id as string),
        getWorkerUtilities(id as string),
        getSlips({ user: id as string })
      ]);
      setWorker(workerData);
      setUtilities(utilsData);
      // Get the most recent slip
      if (slipsData && slipsData.length > 0) {
         setLatestSlip(slipsData[0]);
      }
    } catch (error) {
      console.error('Error fetching worker data:', error);
      toast.error('Failed to load personnel profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addUtilityRow = () => {
    setUtilityItems([...utilityItems, { 
      itemName: '', 
      quantity: 1, 
      cost: 0, 
      isRecoverable: false, 
      issueDate: new Date().toISOString().split('T')[0], 
      expiryDate: '',
      autoExpiry: true
    }]);
  };

  const removeUtilityRow = (index: number) => {
    if (utilityItems.length === 1) return;
    setUtilityItems(utilityItems.filter((_, i) => i !== index));
  };

  const updateUtilityRow = (index: number, field: string, value: any) => {
    const updated = [...utilityItems];
    (updated[index] as any)[field] = value;
    
    // Auto-expiry logic
    if (field === 'autoExpiry' && value === true) {
      const issueDate = new Date(updated[index].issueDate);
      issueDate.setFullYear(issueDate.getFullYear() + 1);
      updated[index].expiryDate = issueDate.toISOString().split('T')[0];
    } else if (field === 'issueDate' && updated[index].autoExpiry) {
      const issueDate = new Date(value);
      issueDate.setFullYear(issueDate.getFullYear() + 1);
      updated[index].expiryDate = issueDate.toISOString().split('T')[0];
    }
    
    setUtilityItems(updated);
  };

  const handleIssueBulk = async () => {
    if (utilityItems.some(i => !i.itemName)) return toast.error('Check item names');
    
    try {
      await issueBulkUtilities(id as string, utilityItems, forceIssue);
      toast.success('Utilities issued successfully');
      setIsUtilityModalOpen(false);
      setUtilityItems([{ itemName: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0], expiryDate: '', autoExpiry: true }]);
      setForceIssue(false);
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Conflict detected: Some items are still valid. Enable "Force Issuance" to proceed.');
      } else {
        toast.error('Failed to issue utilities');
      }
    }
  };

  const handleDeleteUtility = async (utilId: string) => {
    if (!confirm('Remove this utility record?')) return;
    try {
      await deleteUtility(utilId);
      toast.success('Utility record removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove record');
    }
  };

  if (loading) return <div className="p-10"><TableSkeleton /></div>;
  if (!worker) return <div className="p-10 text-center text-gray-400">Worker profile not found.</div>;

  const handleWhatsAppShare = () => {
    let salaryText = '';
    if (latestSlip) {
      const monthName = new Date(latestSlip.year, latestSlip.month - 1).toLocaleString('default', { month: 'long' });
      salaryText = `\n*Latest Salary Slip (${monthName} ${latestSlip.year})*\nNet Salary: ${latestSlip.netSalary} QAR\nStatus: ${latestSlip.status.toUpperCase()}`;
    }

    const text = `*Personnel Profile Report - Akod ERP*\n\nName: ${worker.name}\nID: ${worker.workerId}\nDesignation: ${worker.designation}\nJoin Date: ${formatDate(worker.joinDate)}\nTenure: ${calculateTenure(worker.joinDate || '')}${salaryText}\n\n_Generated via Akod ERP System_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <div className="flex items-center gap-4 mb-10 group">
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-amber-600 border border-gray-100 shadow-sm transition-all group-hover:-translate-x-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Personnel Node / Profile</p>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Personnel <span className="text-teal-700">ID: {worker.workerId}</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Profile Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-600 border-4 border-white shadow-xl overflow-hidden">
                {worker.photo ? (
                  <img src={getFileUrl(worker.photo)} alt={worker.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} strokeWidth={1.5} />
                )}
              </div>
              <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${worker.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <h2 className="text-2xl font-black text-[#0f172a] mb-1">{worker.name}</h2>
            <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-6">{worker.designation || 'Staff Member'}</p>
            
            <div className="flex flex-col gap-3 text-left pt-6 border-t border-gray-50">
              <div className="flex items-center gap-3 text-gray-500">
                <Globe size={14} />
                <span className="text-xs font-bold">{worker.nationality || 'Not Specified'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <Phone size={14} />
                <span className="text-xs font-bold">{worker.mobile || '--'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <MapPin size={14} />
                <span className="text-xs font-bold">{(worker.facilityId as any)?.name || 'Out of Camp'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 px-1">Engagement Details</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-center group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Calendar size={14} />
                      </div>
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Join Date</span>
                   </div>
                   <span className="text-xs font-black text-gray-800">{formatDate(worker.joinDate)}</span>
                </div>
                <div className="flex justify-between items-center group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Clock size={14} />
                      </div>
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Tenure</span>
                   </div>
                   <span className="text-xs font-black text-emerald-700">{calculateTenure(worker.joinDate || '')}</span>
                </div>
                <div className="flex justify-between items-center group pt-4 border-t border-gray-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                         <FileText size={14} />
                      </div>
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">QID No</span>
                   </div>
                   <span className="text-xs font-black text-gray-800">{worker.qidNo || '--'}</span>
                </div>
                {worker.qidNo && (
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-11">QID Expiry</span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getExpiryStatus(worker.qidExpiryDate).bg} ${getExpiryStatus(worker.qidExpiryDate).color}`}>
                         {getExpiryStatus(worker.qidExpiryDate).label}
                      </span>
                   </div>
                )}
                <div className="flex justify-between items-center group pt-4 border-t border-gray-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                         <CreditCard size={14} />
                      </div>
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Passport No</span>
                   </div>
                   <span className="text-xs font-black text-gray-800">{worker.passportNo || '--'}</span>
                </div>
                {worker.passportNo && (
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-11">Passport Expiry</span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getExpiryStatus(worker.passportExpiryDate).bg} ${getExpiryStatus(worker.passportExpiryDate).color}`}>
                         {getExpiryStatus(worker.passportExpiryDate).label}
                      </span>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-10">
           {/* Tab Navigation */}
           <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-[1.8rem] border border-gray-100 shadow-inner w-fit">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'overview' ? 'bg-white text-amber-600 shadow-xl shadow-amber-950/5 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Briefcase size={14} /> Overview
              </button>
              <button 
                onClick={() => setActiveTab('utilities')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'utilities' ? 'bg-white text-amber-600 shadow-xl shadow-amber-950/5 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Package size={14} /> Work Utilities
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'documents' ? 'bg-white text-amber-600 shadow-xl shadow-amber-950/5 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ShieldCheck size={14} /> Legal Vault
              </button>
           </div>

           {/* Tab Content: OVERVIEW */}
           {activeTab === 'overview' && (
             <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-slate-200/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-10">
                   <div className="w-1.5 h-6 bg-amber-600 rounded-full" />
                   <h3 className="text-[12px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Personnel Summary</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Nationality</p>
                      <p className="text-sm font-black text-slate-700 uppercase">{worker.nationality || 'Not Specified'}</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Number</p>
                      <p className="text-sm font-black text-slate-700">{worker.mobile || 'No Contact Record'}</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Facility</p>
                      <p className="text-sm font-black text-slate-700">{(worker.facilityId as any)?.name || 'Out of Camp'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Remarks & History</p>
                      <div className="p-8 bg-gray-50 rounded-[2.5rem] text-sm text-gray-600 font-medium leading-relaxed min-h-[150px]">
                        {worker.remarks || 'No internal audit logs or personnel remarks recorded for this member.'}
                      </div>
                   </div>
                   
                   <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 border-dashed">
                      <div className="flex items-center gap-3 mb-6">
                         <History size={18} className="text-amber-600" />
                         <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Recent Activity</span>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                            <Clock size={14} /> 
                            <span>Account Initialized: {formatDate(worker.createdAt)}</span>
                         </div>
                         <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                            <CheckCircle2 size={14} className="text-green-500" /> 
                            <span>Primary Identification Verified</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* Tab Content: UTILITIES */}
           {activeTab === 'utilities' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end">
                   <div>
                      <div className="flex items-center gap-3 mb-3">
                         <div className="w-1.5 h-6 bg-amber-600 rounded-full" />
                         <h3 className="text-[12px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Operational Gear Ledger</h3>
                      </div>
                      <p className="text-gray-400 text-xs font-medium px-4">Tracking uniforms, safety equipment, and industrial tools issued to this member.</p>
                   </div>
                   <button 
                      onClick={() => setIsUtilityModalOpen(true)}
                      className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-950/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                   >
                     <Plus size={16} strokeWidth={3} /> Issue Item(s)
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {utilities.length === 0 ? (
                     <div className="col-span-full p-20 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-4">
                        <Package className="mx-auto text-gray-200" size={48} />
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No gear records found in the registry.</p>
                     </div>
                   ) : utilities.map((util) => (
                     <div key={util._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/30 group hover:border-amber-100 transition-all">
                        <div className="flex justify-between items-start mb-6">
                           <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                              <Package size={20} />
                           </div>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDeleteUtility(util._id!)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </div>
                        <h4 className="text-lg font-black text-[#0f172a] tracking-tight mb-1">{util.itemName}</h4>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-1 h-3 bg-amber-600 rounded-full opacity-40" />
                           <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Qty: {util.quantity} unit(s)</span>
                           {(util as any).cost > 0 && (
                             <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                               — Val: {(util as any).cost} QAR {(util as any).isRecoverable && '(Recoverable)'}
                             </span>
                           )}
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-gray-50 relative">
                           <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-gray-400 uppercase">Issued:</span>
                              <span className="text-gray-700">{formatDate(util.issueDate)}</span>
                           </div>
                           {util.expiryDate && (
                             <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-400 uppercase">Expiry:</span>
                                <span className={new Date(util.expiryDate) < new Date() ? 'text-rose-500' : 'text-amber-600 underline'}>
                                   {formatDate(util.expiryDate)}
                                </span>
                             </div>
                           )}
                           <div className="flex justify-between items-center mt-2">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                util.status === 'issued' ? 'bg-green-50 text-green-600 border border-green-100' : 
                                util.status === 'expired' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {util.status}
                              </span>
                              {util.expiryDate && new Date(util.expiryDate) < new Date() && (
                                <div className="flex items-center gap-1 text-rose-500 animate-pulse">
                                   <AlertCircle size={12} />
                                   <span className="text-[8px] font-black uppercase">Expired</span>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* Tab Content: DOCUMENTS */}
           {activeTab === 'documents' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {worker.qidDoc && <DocCard title="Qatar ID" path={worker.qidDoc} />}
                   {worker.passportDoc && <DocCard title="International Passport" path={worker.passportDoc} />}
                    {worker.cv && <DocCard title="Work CV" path={worker.cv} />}
                   {worker.insuranceDoc && <DocCard title="Insurance Health" path={worker.insuranceDoc} />}
                   {worker.healthCardDoc && <DocCard title="Hamad Health Card" path={worker.healthCardDoc} />}
                </div>

                {worker.skills?.length > 0 && (
                  <div className="pt-10 border-t border-gray-100">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-teal-600 rounded-full" />
                        <h3 className="text-[12px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Skill Certifications</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {worker.skills.map((skill: any, idx: number) => (
                           skill.certificateDoc ? (
                              <DocCard key={idx} title={skill.skillName || 'Certification'} path={skill.certificateDoc} />
                           ) : skill.skillName ? (
                              <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm">
                                    <Award size={20} />
                                 </div>
                                 <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certification</h4>
                                    <p className="text-sm font-black text-slate-700">{skill.skillName}</p>
                                 </div>
                              </div>
                           ) : null
                        ))}
                     </div>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* ADVANCED BULK UTILITY MODAL */}
      {isUtilityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-amber-950/20">
           <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl border border-gray-100 p-12 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-2xl font-black text-[#0f172a] mb-2 uppercase tracking-tight">Bulk Utility <span className="text-amber-600">Issuance</span></h3>
                  <p className="text-gray-400 text-sm font-medium">Provisioning gear and recording financial recovery details for personnel ledger.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Force Issuance</span>
                    <button 
                      onClick={() => setForceIssue(!forceIssue)}
                      className={`w-12 h-6 rounded-full transition-all relative ${forceIssue ? 'bg-rose-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${forceIssue ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  {forceIssue && <span className="text-[8px] font-black text-rose-500 uppercase">Warning: Conflict checks disabled</span>}
                </div>
              </div>
              
              <div className="space-y-6">
                 {utilityItems.map((item, idx) => (
                   <div key={idx} className="grid grid-cols-12 gap-4 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 group animate-in slide-in-from-left duration-300">
                      <div className="col-span-3 space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Item Description</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Uniform Shirt" 
                           className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 outline-none focus:border-amber-600 transition-all"
                           value={item.itemName}
                           onChange={(e) => updateUtilityRow(idx, 'itemName', e.target.value)}
                         />
                      </div>
                      <div className="col-span-1 space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1 text-center block">Qty</label>
                         <input 
                           type="number" 
                           className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 outline-none focus:border-amber-600 transition-all text-center"
                           value={item.quantity}
                           onChange={(e) => updateUtilityRow(idx, 'quantity', parseInt(e.target.value))}
                         />
                      </div>
                      <div className="col-span-2 space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Value (QAR)</label>
                         <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="number" 
                              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 outline-none focus:border-amber-600 transition-all"
                              value={item.cost}
                              onChange={(e) => updateUtilityRow(idx, 'cost', parseFloat(e.target.value))}
                            />
                         </div>
                      </div>
                      <div className="col-span-2 space-y-2 text-center">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Recoverable?</label>
                         <div className="h-[46px] flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-amber-600 cursor-pointer"
                              checked={item.isRecoverable}
                              onChange={(e) => updateUtilityRow(idx, 'isRecoverable', e.target.checked)}
                            />
                         </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Issue Date</label>
                         <input 
                           type="date" 
                           className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-700 outline-none focus:border-amber-600 transition-all"
                           value={item.issueDate}
                           onChange={(e) => updateUtilityRow(idx, 'issueDate', e.target.value)}
                         />
                      </div>
                      <div className="col-span-2 space-y-2 flex flex-col items-center">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Validity Cycle</label>
                        <div className="flex items-center gap-2 mt-2">
                           <input type="checkbox" checked={item.autoExpiry} onChange={(e) => updateUtilityRow(idx, 'autoExpiry', e.target.checked)} className="accent-teal-600" />
                           <span className="text-[8px] font-black text-gray-500 uppercase">1Y Auto</span>
                           {!item.autoExpiry && (
                             <input type="date" className="px-2 py-1 text-[8px] border rounded" value={item.expiryDate} onChange={(e) => updateUtilityRow(idx, 'expiryDate', e.target.value)} />
                           )}
                        </div>
                      </div>
                      
                      <div className="col-span-12 flex justify-end">
                        <button 
                          onClick={() => removeUtilityRow(idx)}
                          className="text-rose-400 hover:text-rose-600 transition-colors py-1 flex items-center gap-2 opacity-0 group-hover:opacity-100"
                        >
                          <Minus size={12} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase">Remove Row</span>
                        </button>
                      </div>
                   </div>
                 ))}

                 <button 
                    onClick={addUtilityRow}
                    className="w-full py-6 bg-white border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-3 text-gray-400 hover:border-amber-200 hover:text-amber-600 transition-all group"
                 >
                    <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                      <Plus size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Append Item Specification</span>
                 </button>

                 <div className="flex gap-4 pt-10 border-t border-gray-100">
                    <button 
                      onClick={() => setIsUtilityModalOpen(false)}
                      className="flex-1 px-8 py-5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors text-left"
                    >
                       Discard Session
                    </button>
                    <button 
                      onClick={handleIssueBulk}
                      className="px-16 py-5 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-950/20 hover:scale-105 transition-all flex items-center gap-3"
                    >
                       Confirm Issuance {utilityItems.length > 1 && `(${utilityItems.length} Items)`}
                       <ChevronRight size={16} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

const DocCard = ({ title, path }: { title: string, path: string }) => {
  const isImage = path?.match(/\.(jpg|jpeg|png|gif)$/i);
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden h-[300px]">
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-4 bg-amber-600 rounded-full" />
             <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.2em]">{title}</h4>
          </div>
          <a href={getFileUrl(path)} target="_blank" className="p-3 bg-gray-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm">
             <FileText size={14} />
          </a>
       </div>
       <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner">
          {isImage ? (
            <img src={getFileUrl(path)} alt={title} className="w-full h-full object-cover" />
          ) : (
            <FileText size={48} className="text-gray-200" />
          )}
       </div>
    </div>
  );
};
;

export default withAuth(WorkerProfilePage, [{ module: 'worker', action: 'view' }]);
