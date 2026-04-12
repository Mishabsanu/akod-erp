'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { Customer } from '@/lib/types';
import { getCustomerById } from '@/services/customerApi';
import {
  ArrowLeft,
  Edit2,
  User,
  MapPin,
  Settings,
  CreditCard,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/* ---------------- TABS ---------------- */
const tabs = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'contact', label: 'Contact', icon: User },
  { key: 'system', label: 'System', icon: Settings },
  { key: 'transactions', label: 'Transactions', icon: CreditCard },
];

const ViewCustomerPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'address' | 'contact' | 'system' | 'transactions'
  >('overview');

  /* ---------------- FETCH CUSTOMER ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchCustomer = async () => {
      try {
        const data = await getCustomerById(id as string);
        setCustomer(data);
      } catch (error) {
        toast.error('Failed to fetch customer data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!customer) return null;

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
                {customer.name}
              </h1>
              <p className="text-sm text-slate-400 leading-tight">
                {customer.company || 'Customer Profile'}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/master/customer/edit/${id}`)}
            className="flex items-center gap-2 bg-[#11375d] hover:bg-[#0a2741]
              text-white font-semibold px-6 py-2.5 rounded-xl transition"
          >
            <Edit2 className="w-4 h-4" />
            Edit Customer
          </button>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex px-8 gap-8 border-t border-slate-200">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`relative flex items-center gap-2 py-4 text-sm font-semibold transition
                ${
                  activeTab === key
                    ? 'text-[#11375d]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Icon className="w-4 h-4" />
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
          <Section title="Customer Overview">
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Detail label="Customer Name" value={customer.name} />
                <Detail label="Company" value={customer.company} />
                <Detail label="Email" value={customer.email} />
                <Detail label="Mobile" value={customer.mobile} />

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block mt-1 px-4 py-1.5 rounded-full text-xs font-bold
                      ${
                        customer.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                  >
                    {customer.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* ---------- ADDRESS ---------- */}
        {activeTab === 'address' && (
          <Section title="Address Information">
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Detail label="Address" value={customer.address} />
                <Detail label="City" value={customer.city} />
                <Detail label="District" value={customer.district} />
                <Detail label="State" value={customer.state} />
                <Detail label="Pincode" value={customer.pincode} />
              </div>
            </div>
          </Section>
        )}

        {activeTab === 'contact' && (
          <Section title="Contact Person">
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Detail label="Name" value={customer.contactPersonName} />
                <Detail label="Email" value={customer.contactPersonEmail} />
                <Detail label="Mobile" value={customer.contactPersonMobile} />
              </div>
            </div>
          </Section>
        )}
        {/* ---------- SYSTEM ---------- */}
        {activeTab === 'system' && (
          <Section title="System Information">
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Detail
                  label="Created At"
                  value={formatDateTime(customer.createdAt)}
                />
                <Detail
                  label="Updated At"
                  value={formatDateTime(customer.updatedAt)}
                />
              </div>
            </div>
          </Section>
        )}

        {/* ---------- TRANSACTIONS ---------- */}
        {activeTab === 'transactions' && (
          <Section title="Transactions">
            <div className="border border-dashed border-slate-300 rounded-xl p-12 bg-white text-center">
              <p className="text-sm text-slate-500 mb-2">
                Invoices, payments, and other transactions
              </p>
              <p className="text-slate-400 text-sm">
                No transactions available
              </p>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

/* ---------------- DETAIL COMPONENT ---------------- */
const Detail = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
      {label}
    </p>
    <p className="text-[15px] font-semibold text-slate-800">{value || '-'}</p>
  </div>
);

export default ViewCustomerPage;
