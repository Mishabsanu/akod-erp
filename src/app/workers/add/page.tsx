'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import WorkerForm from '@/components/WorkerForm';
import { createWorker } from '@/services/workerApi';
import withAuth from '@/components/withAuth';

const AddWorkerPage = () => {
  const router = useRouter();

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      await createWorker(formData);
      toast.success('Worker enrolled successfully');
      router.push('/workers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <WorkerForm
        isEditMode={false}
        onCancel={() => router.push('/workers')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(AddWorkerPage, [{ module: 'worker', action: 'create' }]);
