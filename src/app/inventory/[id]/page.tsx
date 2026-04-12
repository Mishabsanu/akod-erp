'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { InventoryItem } from '@/lib/types';
import { getInventoryItemById } from '@/services/inventoryApi';
import {
  ArrowLeft,
  Clock,
  Edit2,
  MinusCircle,
  Package,
  PlusCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/* ---------------- TABS ---------------- */
const tabs = [
  { key: 'overview', label: 'Overview', icon: Package },
  { key: 'stock', label: 'Stock' },
  { key: 'history', label: 'History', icon: Clock },
  { key: 'system', label: 'System' },
];
type StockHistoryType =
  | 'ADD_STOCK'
  | 'INVENTORY_ADJUSTMENT'
  | 'DELIVERY'
  | 'RETURN'
  | 'RETURN_REVERT'
  | 'DELIVERY_ROLLBACK'
  | 'RETURN_DELETE_ROLLBACK'
  | 'DELIVERY_DELETE_ROLLBACK';
const STOCK_FLOW_MAP: Record<
  StockHistoryType,
  { direction: 'IN' | 'OUT'; sign: '+' | '-'; color: string }
> = {
  ADD_STOCK: { direction: 'IN', sign: '+', color: 'emerald' },
  INVENTORY_ADJUSTMENT: { direction: 'IN', sign: '+', color: 'emerald' },
  DELIVERY: { direction: 'OUT', sign: '-', color: 'rose' },
  RETURN: { direction: 'IN', sign: '+', color: 'emerald' },
  RETURN_REVERT: { direction: 'OUT', sign: '-', color: 'rose' },
  DELIVERY_ROLLBACK: { direction: 'IN', sign: '+', color: 'emerald' },
  RETURN_DELETE_ROLLBACK: { direction: 'OUT', sign: '-', color: 'rose' },
  DELIVERY_DELETE_ROLLBACK: { direction: 'IN', sign: '+', color: 'emerald' },
};

const ViewInventoryPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stock' | 'history' | 'system'
  >('overview');

  useEffect(() => {
    if (!id) return;

    const fetchInventory = async () => {
      try {
        const res = await getInventoryItemById(id as string);
        setItem(res);
      } catch {
        toast.error('Failed to fetch inventory details');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!item) return null;

  return (
    <div className="min-h-screen w-full bg-[#f5f7fb]">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Inventory — {item.itemCode}
              </h1>
              <p className="text-sm text-slate-400 leading-tight">
                PO {item.poNo}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/inventory/edit/${item._id}`)}
            className="flex items-center gap-2 bg-[#11375d] hover:bg-[#0a2741]
              text-white font-semibold px-6 py-2.5 rounded-xl transition"
          >
            <Edit2 className="w-4 h-4" />
            Edit Inventory
          </button>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex px-8 gap-8 border-t border-slate-200">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`relative flex items-center gap-2 py-4 text-sm font-semibold transition
                ${activeTab === key
                  ? 'text-[#11375d]'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
              {activeTab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#11375d]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-8 py-10 space-y-10">
        {/* ---------- OVERVIEW ---------- */}
        {activeTab === 'overview' && (
          <Section title="Overview">
            <div className="border border-slate-200 rounded-xl p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-8">
              <Detail label="PO Number" value={item.poNo} />
              <Detail label="Product Name" value={item.product.name} />
              <Detail label="Item Code" value={item.product.itemCode} />
              <Detail label="Unit" value={item.product.unit} />
              <Detail label="Reference" value={item.reference || "N/A"} />
              <Detail label="Status" value={item.status} />
            </div>
          </Section>
        )}

        {/* ---------- STOCK ---------- */}
        {activeTab === 'stock' && (
          <Section title="Stock Summary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StockCard label="Ordered Quantity" value={item.orderedQty} />
              <StockCard label="Available Quantity" value={item.availableQty} />
            </div>
          </Section>
        )}

        {/* ---------- HISTORY (FIXED FLOW UI) ---------- */}
        {activeTab === 'history' && (
          <Section title="Stock Movement Timeline">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="relative pl-10 space-y-10">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-slate-200" />

                {item.history.map((h, idx) => {
                  const meta = STOCK_FLOW_MAP[h.type];
                  const isIn = meta?.direction === 'IN';

                  return (
                    <div key={idx} className="relative flex gap-6">
                      {/* Timeline Node */}
                      <div
                        className={`absolute left-[6px] top-2 w-5 h-5 rounded-full border-4 ${isIn
                          ? 'bg-emerald-500 border-emerald-100'
                          : 'bg-rose-500 border-rose-100'
                          }`}
                      />

                      {/* Card */}
                      <div
                        className={`flex-1 rounded-lg border p-4 shadow-sm ${isIn
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-rose-200 bg-rose-50/40'
                          }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isIn ? (
                              <PlusCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <MinusCircle className="w-5 h-5 text-rose-600" />
                            )}

                            <span className="font-semibold text-slate-800">
                              {h.type.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Qty Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${isIn
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                              }`}
                          >
                            {meta.sign}
                            {h.stock}
                          </span>
                        </div>

                        {/* Note */}
                        {h.note && (
                          <p className="text-sm text-slate-600 mt-2">
                            {h.note}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-slate-500">
                          <span>
                            📦 Movement:
                            <strong className="ml-1 text-slate-700">
                              {meta.direction === 'IN'
                                ? 'Stock In'
                                : 'Stock Out'}
                            </strong>
                          </span>

                          <span>
                            👤 Customer:
                            <strong className="ml-1 text-slate-700">
                              {h?.customer?.name || '-'}
                            </strong>
                          </span>

                          {h.ticketNo && (
                            <span>
                              🎫 Ticket:
                              <strong className="ml-1 text-slate-700">
                                {h.ticketNo}
                              </strong>
                            </span>
                          )}

                          <span>
                            🕒 {h.date ? formatDateTime(h.date) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {/* ---------- SYSTEM ---------- */}
        {activeTab === 'system' && (
          <Section title="System Information">
            <div className="border border-slate-200 rounded-xl p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
              <Detail
                label="Created At"
                value={formatDateTime(item.createdAt)}
              />
              <Detail
                label="Updated At"
                value={formatDateTime(item.updatedAt)}
              />
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: string | null | number;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
      {label}
    </p>
    <p className="text-[15px] font-semibold text-slate-800">{value ?? '-'}</p>
  </div>
);

const StockCard = ({ label, value }: { label: string; value: number }) => (
  <div className="border border-slate-200 rounded-xl p-6 bg-white">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
  </div>
);

export default ViewInventoryPage;
