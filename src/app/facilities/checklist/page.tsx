'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClipboardCheck, Camera, CheckCircle2, Home, MapPin, Zap, Droplets } from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { getFacilityDropdown, createAuditReport } from '@/services/facilityApi';
import withAuth from '@/components/withAuth';

const FacilityAuditPage = () => {
  const router = useRouter();
  const [facilities, setFacilities] = useState<{ _id: string, name: string, type: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    facilityId: '',
    date: new Date().toISOString().split('T')[0],
    checkFrequency: 'Daily',
    isClean: true,
    isWaterAvailable: true,
    isElectricityOK: true,
    remarks: ''
  });

  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const data = await getFacilityDropdown();
        setFacilities(data);
      } catch (error) {
        toast.error('Failed to load facilities');
      }
    };
    fetchFacilities();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.facilityId) return toast.error('Please select a facility');
    
    setSubmitting(true);
    const data = new FormData();
    data.append('facilityId', formData.facilityId);
    data.append('date', formData.date);
    data.append('checkFrequency', formData.checkFrequency);
    data.append('isClean', String(formData.isClean));
    data.append('isWaterAvailable', String(formData.isWaterAvailable));
    data.append('isElectricityOK', String(formData.isElectricityOK));
    data.append('remarks', formData.remarks);
    
    photos.forEach(photo => data.append('photos', photo));

    try {
      await createAuditReport(data);
      toast.success('Cleanliness report submitted');
      router.push('/facilities');
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <ListPageHeader
        eyebrow="Facilities & Infrastructure"
        title="Housekeeping"
        highlight="Audit"
        description="Daily/Weekly cleanliness and utility maintenance verification."
      />

      <form onSubmit={handleSubmit} className="mt-8 max-w-4xl space-y-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Home size={20} />
             </div>
             <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Facility Selection</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Facility *</label>
              <select 
                name="facilityId" 
                value={formData.facilityId} 
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-800"
                required
              >
                <option value="">Choose Facility</option>
                {facilities.map(f => (
                  <option key={f._id} value={f._id}>{f.name} ({f.type})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Audit Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-800"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Frequency</label>
              <select
                name="checkFrequency"
                value={formData.checkFrequency}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-800"
              >
                <option value="Daily">Daily Check</option>
                <option value="Weekly">Weekly Deep Clean</option>
              </select>
            </div>
          </div>
        </div>

        {/* CHECKLIST MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-[2rem] border transition-all duration-300 ${formData.isClean ? 'bg-white border-green-100 shadow-xl shadow-green-900/5' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.isClean ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-red-600 text-white shadow-lg'}`}>
                       <ClipboardCheck size={24} />
                    </div>
                    <input 
                      type="checkbox" 
                      name="isClean" 
                      checked={formData.isClean} 
                      onChange={handleInputChange}
                      className="w-6 h-6 rounded-lg border-2 border-gray-200 text-green-600 focus:ring-green-600"
                    />
                </div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Cleanliness</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">General Hygiene Audit</p>
                <p className={`mt-4 text-xs font-bold ${formData.isClean ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.isClean ? 'SANITIZED & TIDY' : 'NEEDS CLEANING'}
                </p>
            </div>

            <div className={`p-8 rounded-[2rem] border transition-all duration-300 ${formData.isWaterAvailable ? 'bg-white border-indigo-100 shadow-xl shadow-blue-900/5' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.isWaterAvailable ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-red-600 text-white shadow-lg'}`}>
                       <Droplets size={24} />
                    </div>
                    <input 
                      type="checkbox" 
                      name="isWaterAvailable" 
                      checked={formData.isWaterAvailable} 
                      onChange={handleInputChange}
                      className="w-6 h-6 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-blue-600"
                    />
                </div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Water Supply</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Utility Verification</p>
                <p className={`mt-4 text-xs font-bold ${formData.isWaterAvailable ? 'text-blue-600' : 'text-red-600'}`}>
                    {formData.isWaterAvailable ? 'RUNNING WATER OK' : 'NO WATER SUPPLY'}
                </p>
            </div>

            <div className={`p-8 rounded-[2rem] border transition-all duration-300 ${formData.isElectricityOK ? 'bg-white border-amber-100 shadow-xl shadow-amber-900/5' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.isElectricityOK ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/20' : 'bg-red-600 text-white shadow-lg'}`}>
                       <Zap size={24} />
                    </div>
                    <input 
                      type="checkbox" 
                      name="isElectricityOK" 
                      checked={formData.isElectricityOK} 
                      onChange={handleInputChange}
                      className="w-6 h-6 rounded-lg border-2 border-gray-200 text-amber-500 focus:ring-amber-500"
                    />
                </div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Electricity</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Utility Verification</p>
                <p className={`mt-4 text-xs font-bold ${formData.isElectricityOK ? 'text-amber-600' : 'text-red-600'}`}>
                    {formData.isElectricityOK ? 'POWER SUPPLY OK' : 'ELECTRICAL ISSUE'}
                </p>
            </div>
        </div>

        {/* PHOTOS & REMARKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1">Visual Evidence</h3>
                <div className="relative group border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all">
                    <Camera className="text-gray-300 group-hover:text-indigo-500 mb-2" size={32} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center italic">Snap facility condition</p>
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Inspector Notes</label>
                    <textarea 
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        placeholder="Detail any maintenance required or issues found..."
                        className="w-full h-24 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-800 font-medium outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none"
                    />
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                    <button 
                        type="button" 
                        onClick={() => router.back()} 
                        className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="flex-[2] py-4 rounded-xl bg-indigo-800 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-950/20 hover:bg-indigo-900 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Commit Audit'}
                    </button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
};

export default withAuth(FacilityAuditPage, [{ module: 'facility', action: 'create' }]);
