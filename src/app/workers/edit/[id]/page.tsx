'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import WorkerForm from '@/components/WorkerForm';
import { getWorker, updateWorker } from '@/services/workerApi';
import withAuth from '@/components/withAuth';

const EditWorkerPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorker = useCallback(async () => {
    try {
      const data = await getWorker(id as string);
      setWorker(data);
    } catch (error) {
      toast.error('Failed to load worker data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorker();
  }, [fetchWorker]);

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      // For editing, we might need to send a simple object or FormData depending on backend capability
      // The current workerApi.updateWorker expects Partial<Worker> (an object)
      // If we are uploading files, we might need a separate endpoint or multipart PUT.
      // However, looking at services/workerApi.ts, updateWorker uses a regular PUT.
      
      const payload: any = {};
      formData.forEach((value, key) => {
        // Only add non-file fields to the simple object payload for PUT
        if (!(value instanceof File)) {
          payload[key] = value;
        }
      });

      await updateWorker(id as string, payload);
      toast.success('Worker record updated');
      router.push('/workers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-indigo-600 font-black animate-pulse uppercase tracking-[0.4em]">Retrieving Personnel Records...</div>;
  if (!worker) return <div className="p-10 text-center text-gray-400">Worker not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <WorkerForm
        initialData={worker}
        isEditMode={true}
        onCancel={() => router.push('/workers')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(EditWorkerPage, [{ module: 'worker', action: 'update' }]);
