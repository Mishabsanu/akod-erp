'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { Vendor } from '@/lib/types';
import { getVendorById } from '@/services/vendorApi';
import {
  ArrowLeft,
  Edit2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ViewVendorPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH VENDOR ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchVendor = async () => {
      try {
        const data = await getVendorById(id as string);
        setVendor(data);
      } catch (err) {
        toast.error('Failed to fetch vendor');
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!vendor) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-semibold text-gray-800">Vendor Details</h1>
        </div>
        <button
          onClick={() =>
            router.push(`/master/vendor/edit/${id}`)
          }
          className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a]
            text-white font-semibold py-2.5 px-5 rounded-lg shadow transition"
        >
          <Edit2 className="w-4 h-4" />
          Edit Vendor
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Detail label="Vendor Name" value={vendor.name} />
          <Detail label="Company" value={vendor.company} />
          <Detail label="Email" value={vendor.email} />
          <Detail label="Mobile" value={vendor.mobile} />
          <div>
            <strong>Status:</strong>{' '}
            <span
              className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                vendor.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-teal-100 text-teal-900'
              }`}
            >
              {vendor.status}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Address Details" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Detail label="Address" value={vendor.address} />
          <Detail label="City" value={vendor.city} />
          <Detail label="District" value={vendor.district} />
          <Detail label="State" value={vendor.state} />
          <Detail label="Pincode" value={vendor.pincode} />
        </div>
      </Section>

      <Section title="Contact Person Information" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Detail
            label="Contact Person Name"
            value={vendor.contactPersonName}
          />
          <Detail
            label="Contact Person Email"
            value={vendor.contactPersonEmail}
          />
          <Detail
            label="Contact Person Mobile"
            value={vendor.contactPersonMobile}
          />
        </div>
      </Section>

      <Section title="System Information" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail
            label="Created At"
            value={formatDateTime(vendor.createdAt)}
          />
          <Detail
            label="Updated At"
            value={formatDateTime(vendor.updatedAt)}
          />
        </div>
      </Section>
    </div>
  );
};

/* ---------------- DETAIL COMPONENT ---------------- */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
      {label}
    </p>
    <p className="text-base font-medium text-gray-800">
      {value || '-'}
    </p>
  </div>
);

export default ViewVendorPage;
