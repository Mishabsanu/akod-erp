'use client';
import RoleForm from '@/components/RoleForm';
import withAuth from '@/components/withAuth';
import { Role } from '@/lib/types';
import { handleApiError } from '@/app/utils/errorHandler';
import { createRole } from '@/services/roleApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddRolePage = () => {
  const router = useRouter();
  const handleSubmit = async (
    roleData: Role,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    setSubmitting(true);
    try {
      const response = await createRole(roleData);
      if (response.success) {
        toast.success(response.message || 'Role created successfully!');
        router.push('/roles');
      } else {
        toast.error(response.message || 'Failed to create role');
      }
    } catch (error: any) {
      const handledError = handleApiError(error);
      if (handledError.fields) {
        setErrors(handledError.fields);
        toast.error(handledError.message);
      } else {
        toast.error(handledError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => router.push('/roles');
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <RoleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={false}
      />
    </div>
  );
};

export default withAuth(AddRolePage, [{ module: 'admin', action: 'create' }]);
