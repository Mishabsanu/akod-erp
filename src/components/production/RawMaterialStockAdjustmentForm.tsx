'use client';

import React, { useState, useEffect } from 'react';
import { getRawMaterialDropdown } from '@/services/rawMaterialApi';
import { Layers, Plus, X, Package, Loader2, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

interface RawMaterialStockAdjustmentFormProps {
  onSubmit: (materialId: string, quantity: number, note?: string) => Promise<void>;
  onCancel: () => void;
  initialMaterialId?: string;
}

const RawMaterialStockAdjustmentForm: React.FC<RawMaterialStockAdjustmentFormProps> = ({ onSubmit, onCancel, initialMaterialId }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState(initialMaterialId || '');
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getRawMaterialDropdown();
        setMaterials(data || []);
      } catch (error) {
        toast.error('Failed to load raw materials');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId) return toast.error('Please select a material');
    if (quantity === 0) return toast.error('Quantity cannot be zero');

    setIsSubmitting(true);
    try {
      await onSubmit(selectedMaterialId, quantity, note);
      onCancel();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Adjustment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0f766e] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
            <Plus size={24} />
          </div>
          <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">
            Adjust <span className="text-[#0f766e]">Stock Volume</span>
          </h2>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Raw Material</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors">
                <Layers size={18} />
              </div>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                disabled={!!initialMaterialId}
                className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-teal-700 transition-all appearance-none text-sm font-bold text-gray-800 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <option value="">Select a material from registry...</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.itemCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Adjustment Qty (+/-)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors">
                  <Package size={18} />
                </div>
                <input
                  type="number"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="e.g. 100 or -50"
                  className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-teal-700 transition-all text-sm font-bold text-gray-800 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reference / Note</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors">
                  <StickyNote size={18} />
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Restock from Vendor A"
                  className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-teal-700 transition-all text-sm font-bold text-gray-800 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-5 bg-teal-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Authorize Adjustment'}
              {!isSubmitting && <Plus size={16} />}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RawMaterialStockAdjustmentForm;
