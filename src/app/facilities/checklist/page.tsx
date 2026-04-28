'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ClipboardCheck, 
  Camera, 
  CheckCircle2, 
  Home, 
  MapPin, 
  Zap, 
  Droplets, 
  ShieldAlert, 
  Wind, 
  Settings, 
  Wifi, 
  Bug, 
  HardHat 
} from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { getFacilityDropdown, createAuditReport } from '@/services/facilityApi';
import withAuth from '@/components/withAuth';

const FacilityAuditPage = () => {
  const router = useRouter();
  const [facilities, setFacilities] = useState<{ _id: string, name: string, type: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<{ _id: string, name: string, type: string } | null>(null);

  const [formData, setFormData] = useState({
    facilityId: '',
    date: new Date().toISOString().split('T')[0],
    checkFrequency: 'Daily',
    isClean: true,
    isWaterAvailable: true,
    isElectricityOK: true,
    isFireSafetyOK: true,
    isACVentilationOK: true,
    isEquipmentOK: true,
    isInternetOK: true,
    isPestControlOK: true,
    isPPEComplianceOK: true,
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
      if (name === 'facilityId') {
        const facility = facilities.find(f => f._id === value);
        setSelectedFacility(facility || null);
      }
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
    
    // Append all boolean checks
    Object.keys(formData).forEach(key => {
      if (key.startsWith('is')) {
        data.append(key, String((formData as any)[key]));
      }
    });
    
    data.append('remarks', formData.remarks);
    photos.forEach(photo => data.append('photos', photo));

    try {
      await createAuditReport(data);
      toast.success('Facility audit report submitted');
      router.push('/facilities');
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCheckItem = (id: string, label: string, icon: any, color: string) => {
    const Icon = icon;
    const isActive = (formData as any)[id];
    return (
      <div key={id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-rose-50 border-rose-100'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'}`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">{label}</h4>
            <p className={`text-xs font-bold mt-0.5 ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isActive ? 'STATUS: NOMINAL' : 'STATUS: ISSUE DETECTED'}
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          name={id}
          checked={isActive}
          onChange={handleInputChange}
          className="w-6 h-6 rounded-lg text-emerald-600 border-slate-300 focus:ring-emerald-600 transition-all cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans" style={{ '--primary': '#059669', '--primary-dark': '#047857' } as React.CSSProperties}>
      <div className="w-full mx-auto">
        {/* COMPACT HEADER */}
        <div className="flex items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Facility Asset Audit</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Health, Safety & Environment Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              form="audit-form"
              disabled={submitting}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : 'Commit Audit'}
            </button>
          </div>
        </div>

        <form id="audit-form" onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-8 md:p-10 space-y-10">
          {/* TOP SECTION: TARGET & LOGISTICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-100 pb-10">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Facility *</label>
              <select
                name="facilityId"
                value={formData.facilityId}
                onChange={handleInputChange}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-bold text-slate-900 transition-all"
                required
              >
                <option value="">Choose Facility</option>
                {facilities.map(f => (
                  <option key={f._id} value={f._id}>{f.name} ({f.type})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Audit Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-bold text-slate-900 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency</label>
              <select
                name="checkFrequency"
                value={formData.checkFrequency}
                onChange={handleInputChange}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-bold text-slate-900 transition-all"
              >
                <option value="Daily">Daily Check</option>
                <option value="Weekly">Weekly Deep Clean</option>
              </select>
            </div>
          </div>

          {/* STATUS MATRIX - COMMON */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald-600 rounded-full" />
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Global Health & Safety Checks</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderCheckItem('isClean', 'Cleanliness', ClipboardCheck, 'emerald')}
              {renderCheckItem('isWaterAvailable', 'Water Supply', Droplets, 'blue')}
              {renderCheckItem('isElectricityOK', 'Power Supply', Zap, 'amber')}
              {renderCheckItem('isFireSafetyOK', 'Fire Safety', ShieldAlert, 'rose')}
              {renderCheckItem('isACVentilationOK', 'AC & Ventilation', Wind, 'sky')}
            </div>
          </div>

          {/* DYNAMIC SECTIONS BASED ON TYPE */}
          {selectedFacility && (
            <div className="space-y-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-emerald-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                  {selectedFacility.type} Specific Checks
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedFacility.type === 'Office' && (
                  <>
                    {renderCheckItem('isInternetOK', 'Internet & LAN', Wifi, 'blue')}
                    {renderCheckItem('isEquipmentOK', 'IT & Furniture', Settings, 'slate')}
                  </>
                )}
                {(selectedFacility.type === 'Factory' || selectedFacility.type === 'Production Center' || selectedFacility.type === 'Workshop') && (
                  <>
                    {renderCheckItem('isPPEComplianceOK', 'PPE Compliance', HardHat, 'orange')}
                    {renderCheckItem('isEquipmentOK', 'Machinery Status', Settings, 'slate')}
                  </>
                )}
                {selectedFacility.type === 'Warehouse' && (
                  <>
                    {renderCheckItem('isPestControlOK', 'Pest Control', Bug, 'lime')}
                    {renderCheckItem('isEquipmentOK', 'Pallet & Rack Safety', Settings, 'slate')}
                  </>
                )}
                {selectedFacility.type === 'Camp' && (
                  <>
                    {renderCheckItem('isEquipmentOK', 'Bedding & Rooms', Home, 'indigo')}
                    {renderCheckItem('isPestControlOK', 'Hygiene & Pests', Bug, 'lime')}
                  </>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM: EVIDENCE & NOTES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
            <div className="md:col-span-1 space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Visual Evidence</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer h-[120px]">
                <Camera size={24} className="text-slate-300 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Photos {photos.length > 0 && `(${photos.length})`}</span>
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="md:col-span-3 space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Inspector Notes</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={4}
                placeholder="Log maintenance requirements, specific issues, or observations..."
                className="w-full min-h-[120px] p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium outline-none focus:bg-white focus:border-emerald-600 transition-all resize-none text-sm shadow-inner"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(FacilityAuditPage, [{ module: 'facility', action: 'create' }]);

