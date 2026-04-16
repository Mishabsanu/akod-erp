'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { Product } from '@/lib/types';
import { getProductById } from '@/services/catalogApi';
import { Edit2, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ViewProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const fetchedProduct = await getProductById(id);
          setProduct(fetchedProduct);
        } catch (error) {
          toast.error('Failed to fetch product data.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/master/catalog/edit/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-semibold text-gray-800">
            Product Details
          </h1>
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a] text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
        >
          <Edit2 className="w-4 h-4" /> Edit Product
        </button>
      </div>

      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Detail label="Product Name" value={product.name} />
          <Detail label="Item Code" value={product.itemCode} />
          <Detail label="Unit" value={product.unit} />
          <Detail label="Unit" value={product.description} />
          <div>
            <strong>Status:</strong>{' '}
            <span
              className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                product.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-teal-100 text-teal-900'
              }`}
            >
              {product.status}
            </span>
          </div>
        </div>
      </Section>

      <Section title="System Information" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail label="Created At" value={formatDateTime(product.createdAt)} />
          <Detail label="Updated At" value={formatDateTime(product.updatedAt)} />
        </div>
      </Section>
    </div>
  );
};

/* ================= Reusable Detail Component ================= */
const Detail = ({ label, value }: { label: string; value?: string | null }) => (
  <p>
    <strong>{label}:</strong>{' '}
    <span className="text-gray-700">{value || '-'}</span>
  </p>
);

export default ViewProductPage;
