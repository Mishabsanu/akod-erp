'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Wrench, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  History, 
  MessageSquare,
  Activity
} from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { getVehicleDropdown, createMechanicalCheckup, getLastCheckup } from '@/services/fleetApi';
import withAuth from '@/components/withAuth';
import { MechanicalCheckup } from '@/lib/types';

const PART_KEYS = ['engine', 'oilLevel', 'tires', 'brakes', 'lights', 'suspension'];

const MechanicalCheckupPage = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<{ _id: string, name: string, plateNo: string }[]>([]);
  const [lastReport, setLastReport] = useState<MechanicalCheckup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    odometer: '',
    date: new Date().toISOString().split('T')[0],
    isWaterWashed: false,
    isClean: false,
    remarks: '',
    status: 'Fit',
    partsCondition: {
      engine: { status: 'Good', remarks: '' },
      oilLevel: { status: 'OK', remarks: '' },
      tires: { status: 'Good', remarks: '' },
      brakes: { status: 'Good', remarks: '' },
      lights: { status: 'Working', remarks: '' },
      suspension: { status: 'Good', remarks: '' }
    } as any
  });

  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicleDropdown();
        setVehicles(data);
      } catch (error) {
        toast.error('Failed to load vehicles');
      }
    };
    fetchVehicles();
  }, []);

  // Fetch last report when vehicle changes
  useEffect(() => {
    const fetchLast = async () => {
      if (!formData.vehicleId) {
        setLastReport(null);
        return;
      }
      try {
        const report = await getLastCheckup(formData.vehicleId);
        setLastReport(report);
      } catch (error) {
        console.error('Failed to fetch last report');
      }
    };
    fetchLast();
  }, [formData.vehicleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePartStatusChange = (part: string, status: string) => {
    setFormData(prev => ({
      ...prev,
      partsCondition: {
        ...prev.partsCondition,
        [part]: { ...prev.partsCondition[part], status }
      }
    }));
  };

  const handlePartRemarkChange = (part: string, remarks: string) => {
    setFormData(prev => ({
      ...prev,
      partsCondition: {
        ...prev.partsCondition,
        [part]: { ...prev.partsCondition[part], remarks }
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');
    
    setSubmitting(true);
    const data = new FormData();
    data.append('vehicleId', formData.vehicleId);
    data.append('odometer', formData.odometer);
    data.append('date', formData.date);
    data.append('isWaterWashed', String(formData.isWaterWashed));
    data.append('isClean', String(formData.isClean));
    data.append('remarks', formData.remarks);
    data.append('status', formData.status);
    data.append('partsCondition', JSON.stringify(formData.partsCondition));
    
    photos.forEach(photo => data.append('photos', photo));

    try {
      await createMechanicalCheckup(data);
      toast.success('Mechanical checkup recorded successfully');
      router.push('/fleet/reports');
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const getLastStatus = (part: string) => {
    if (!lastReport?.partsCondition) return 'No History';
    const condition = (lastReport.partsCondition as any)[part];
    if (typeof condition === 'string') return condition;
    return condition?.status || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-[1600px]">
        <ListPageHeader
          eyebrow="Fleet & Workshop"
          title="Advanced"
          highlight="Inspection"
          description="Detailed mechanical audit with historical condition tracking and per-part diagnostics."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-10 w-full">
          {/* TOP SECTION: VEHICLE & META */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-900/20">
                  <Truck size={24} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Deployment Identity</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Vehicle & Journey Metadata</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Target Asset *</label>
                <select 
                  name="vehicleId" 
                  value={formData.vehicleId} 
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-600 outline-none transition-all font-bold text-gray-900"
                  required
                >
                  <option value="">Search & Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} — {v.plateNo}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Odometer Reading (KM) *</label>
                <input 
                  type="number" 
                  name="odometer" 
                  value={formData.odometer} 
                  onChange={handleInputChange}
                  placeholder="e.g. 145200"
                  className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-600 outline-none transition-all font-bold text-gray-900"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Diagnostic Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-600 outline-none transition-all font-bold text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* DIAGNOSTIC MATRIX */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                      <Activity size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Audit Matrix</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cross-Examination of Major Components</p>
                  </div>
               </div>
               {lastReport && (
                 <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                    <History size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">History Sync Active</span>
                 </div>
               )}
            </div>

            <div className="w-full overflow-x-auto">
               <table className="w-full border-separate border-spacing-y-4">
                  <thead>
                    <tr>
                      <th className="text-left px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4">Major Component</th>
                      <th className="text-left px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4">Last Condition</th>
                      <th className="text-left px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4">Current Assessment</th>
                      <th className="text-left px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4">Special Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PART_KEYS.map((part) => (
                      <tr key={part} className="group transition-all hover:translate-x-1">
                        <td className="bg-gray-50 rounded-l-[1.5rem] px-8 py-6 border-y border-l border-transparent group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-slate-200/50">
                          <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{part.replace(/([A-Z])/g, ' $1')}</span>
                        </td>
                        <td className="bg-gray-50 px-8 py-6 border-y border-transparent group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-slate-200/50">
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${getLastStatus(part) === 'Good' || getLastStatus(part) === 'OK' || getLastStatus(part) === 'Working' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                             <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{getLastStatus(part)}</span>
                           </div>
                        </td>
                        <td className="bg-gray-50 px-8 py-6 border-y border-transparent group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-slate-200/50">
                          <select
                            value={formData.partsCondition[part].status}
                            onChange={(e) => handlePartStatusChange(part, e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:border-teal-600 outline-none shadow-sm cursor-pointer"
                          >
                            {part === 'oilLevel' ? (
                              <> <option value="OK">OK</option> <option value="Low">Low</option> <option value="Needs Change">Needs Change</option> </>
                            ) : part === 'lights' ? (
                              <> <option value="Working">Working</option> <option value="Bulb Fuse">Bulb Fuse</option> <option value="Repair Needed">Repair Needed</option> </>
                            ) : (
                              <> <option value="Good">Good</option> <option value="Repair Needed">Repair Needed</option> <option value="Critical">Critical</option> </>
                            )}
                          </select>
                        </td>
                        <td className="bg-gray-50 rounded-r-[1.5rem] px-8 py-6 border-y border-r border-transparent group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-slate-200/50">
                           <div className="flex items-center gap-3">
                              <MessageSquare size={14} className="text-gray-300" />
                              <input 
                                type="text"
                                value={formData.partsCondition[part].remarks}
                                onChange={(e) => handlePartRemarkChange(part, e.target.value)}
                                placeholder="Add specific note..."
                                className="w-full bg-transparent border-b border-gray-200 focus:border-teal-600 outline-none text-xs font-bold text-gray-600 transition-all pb-1 translate-y-0.5"
                              />
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* CLEANING & PHOTOS */}
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col gap-8">
                <div>
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Cleanliness Standards</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <label className="flex items-center gap-4 p-6 bg-gray-50 rounded-[1.5rem] border-2 border-transparent hover:border-teal-100 cursor-pointer transition-all">
                          <input type="checkbox" name="isWaterWashed" checked={formData.isWaterWashed} onChange={handleInputChange} className="w-6 h-6 rounded-lg text-teal-600 border-gray-200 focus:ring-teal-600" />
                          <span className="text-xs font-black uppercase tracking-widest text-gray-700">Water Washed</span>
                      </label>
                      <label className="flex items-center gap-4 p-6 bg-gray-50 rounded-[1.5rem] border-2 border-transparent hover:border-teal-100 cursor-pointer transition-all">
                          <input type="checkbox" name="isClean" checked={formData.isClean} onChange={handleInputChange} className="w-6 h-6 rounded-lg text-teal-600 border-gray-200 focus:ring-teal-600" />
                          <span className="text-xs font-black uppercase tracking-widest text-gray-700">Internal Cleaning</span>
                      </label>
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 px-1">Evidence Capture</h3>
                   <div className="relative group border-2 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center justify-center hover:border-teal-600 hover:bg-teal-50/50 transition-all cursor-pointer">
                      <Camera size={40} className="text-gray-300 group-hover:text-teal-600 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Snap Photos</p>
                      <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {photos.length > 0 && <p className="mt-4 px-3 py-1 bg-teal-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">{photos.length} files attached</p>}
                   </div>
                </div>
             </div>

             {/* FINAL VERDICT */}
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Grand Manifest Remarks</label>
                   <textarea 
                     name="remarks" value={formData.remarks} onChange={handleInputChange}
                     placeholder="Summary of overall vehicle condition or critical breakdown narrative..."
                     className="w-full h-40 px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[2rem] text-gray-800 font-medium outline-none focus:bg-white focus:border-teal-600 transition-all resize-none shadow-inner"
                   />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Deployment Verdict</label>
                    <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100">
                        {['Fit', 'Needs Maintenance', 'Grounded'].map((s) => (
                            <button
                                key={s} type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === s 
                                    ? s === 'Grounded' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40 translate-y-[-2px]' 
                                    : s === 'Needs Maintenance' ? 'bg-amber-500 text-white shadow-xl shadow-amber-900/40 translate-y-[-2px]'
                                    : 'bg-teal-700 text-white shadow-xl shadow-teal-900/40 translate-y-[-2px]' 
                                    : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
          </div>

          <div className="flex justify-end items-center gap-6 pt-10 border-t border-gray-100">
              <button 
                  type="button" 
                  onClick={() => router.back()} 
                  className="px-12 py-5 rounded-2xl border-2 border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-100 transition-all"
              >
                  Discard
              </button>
              <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-16 py-5 rounded-2xl bg-teal-800 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-teal-950/30 hover:bg-teal-900 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3"
              >
                  {submitting ? 'Archiving...' : 'Launch Report'}
                  <CheckCircle2 size={18} />
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(MechanicalCheckupPage, [{ module: 'fleet', action: 'create' }]);
