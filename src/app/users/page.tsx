'use client';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { UserFilterBar } from '@/components/users/UserFilterBar';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserFilter } from '@/lib/types';
import { deleteUser, getUsers } from '@/services/userApi';
import {
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserFilter['role']>(undefined);
  const [statusFilter, setStatusFilter] =
    useState<UserFilter['status']>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  const router = useRouter();

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: UserFilter = {
        search: searchTerm || undefined,
        role: roleFilter,
        status: statusFilter,
      };

      const response = await getUsers(filterParams, currentPage, limit);
      const {
        users: fetchedUsers,
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = response;

      setUsers(fetchedUsers || []);
      setTotalPagesCount(fetchedTotalPages || 1);
      setTotalUsersCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this user?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              toast.info('User deletion cancelled.', { duration: 2000 });
            }}
            className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              const loadingId = toast.loading('Deleting user...');
              try {
                const response = await deleteUser(id);
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(
                    response.message || 'User deleted successfully!'
                  );
                  fetchUsers();
                } else {
                  toast.error(response.message || 'Failed to delete user.');
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(
                  error.response?.data?.message ||
                    'Something went wrong while deleting.'
                );
              }
            }}
            className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleAddUser = () => router.push('/users/add');
  const handleEdit = (id: string) => router.push(`/users/edit/${id}`);
  const handleRowClick = (user: User) => {
    if (user._id) {
      router.push(`/users/${user._id}`);
    }
  };
  const columns: Column<User>[] = useMemo(() => {
    const baseColumns: Column<User>[] = [
      { accessor: 'name', header: 'Name' },
      { accessor: 'email', header: 'Email' },
      { accessor: 'mobile', header: 'Mobile' },
      {
        accessor: 'role',
        header: 'Role',
        render: (user) => (
          <span>
            {' '}
            {typeof user.role === 'object' && user.role ? user.role.name : '-'}
          </span>
        ),
      },

      {
        accessor: 'status',
        header: 'Status',
        render: (user) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              user.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-teal-100 text-teal-900'
            }`}
          >
            {user.status}
          </span>
        ),
      },
    ];

    if (can('user', 'update') || can('user', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof User,
        header: 'Actions',
        render: (user) => (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (user._id) toggleActionMenu(user._id);
              }}
              className="text-gray-600 hover:text-[#0f766e] transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenu === user._id && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {can('user', 'update') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user._id) handleEdit(user._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-[#0f766e]" /> Edit
                  </button>
                )}
                {can('user', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user._id) handleDelete(user._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#0f766e] hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ),
      });
    }

    return baseColumns;
  }, [openMenu, can]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Staff Registry"
        title="User"
        highlight="Management"
        description="Manage employee profiles, access status, and account ownership."
        actions={
          <>
          {can('user', 'create') && (
            <button
              onClick={handleAddUser}
              className="page-header-button"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="page-header-button secondary"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          </>
        }
      />

      {showFilters ? (
        <>
          <UserFilterBar
            onRoleChange={setRoleFilter}
            onStatusChange={setStatusFilter}
            onClearFilters={() => {
              setSearchTerm('');
              setRoleFilter(undefined);
              setStatusFilter(undefined);
              setCurrentPage(1);
            }}
            initialRole={roleFilter}
            initialStatus={statusFilter}
          />
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search users..."
            />
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search users..."
            />
          </div>
        </>
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalUsersCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPagesCount}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
};

export default UsersPage;
