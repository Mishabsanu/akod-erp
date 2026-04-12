'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SalaryBreakupForm } from '@/components/payroll/SalaryBreakupForm';
import { getBreakupByUserId, upsertBreakup } from '@/services/payrollApi';
import { getUserById } from '@/services/userApi';

export default function ConfigSalaryBreakupPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    setFetching(true);
    try {
      const [userData, breakupData] = await Promise.all([
        getUserById(id as string),
        getBreakupByUserId(id as string),
      ]);
      setUser(userData);
      setInitialData(breakupData);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load employee details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await upsertBreakup({ user: id, ...formData });
      toast.success('Salary breakup updated successfully');
      router.push('/hr/payroll/breakups');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update breakup');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <SalaryBreakupForm
        loading={loading}
        userName={user?.name || 'Employee'}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
