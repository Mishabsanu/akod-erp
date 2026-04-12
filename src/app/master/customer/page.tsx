'use client';

import { formatDate } from '@/app/utils/formatDate';
import { CustomerFilterBar } from '@/components/master/CustomerFilterBar'; // Import CustomerFilterBar
import { Column, DataTable } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { Customer, CustomerFilter } from '@/lib/types';
import { deleteCustomer, getCustomers } from '@/services/customerApi';
import { Edit2, Filter, MoreVertical, Plus, Trash2, Users } from 'lucide-react'; // Import Filter icon
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const CustomerPage: React.FC = () => {
  const router = useRouter();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // State for action menu
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility
  const { can } = useAuth();

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<CustomerFilter['status']>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  const fetchAllCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: CustomerFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
      };
      const {
        customers: fetchedCustomers,
        totalCount: fetchedTotalCount,
        totalPages: fetchedTotalPages,
      } = await getCustomers(filterParams, currentPage, limit);
      setAllCustomers(fetchedCustomers);
      setTotalCustomersCount(fetchedTotalCount);
      setTotalPagesCount(fetchedTotalPages);
    } catch (error) {
      toast.error('Failed to fetch customers.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const handleAddCustomer = () => {
    router.push('/master/customer/add');
  };

  const handleEdit = (id: string) => {
    router.push(`/master/customer/edit/${id}`);
  };

  const handleRowClick = (customer: Customer) => {
    if (customer._id) {
      router.push(`/master/customer/${customer._id}`);
    }
  };

  const handleDelete = async (id: string) => {
    // Show confirmation toast
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this customer?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              const loadingToast = toast.loading('Deleting customer...');
              try {
                const response = await deleteCustomer(id);
                toast.dismiss(loadingToast);
                if (response.success) {
                  toast.success(
                    response.message || 'Customer deleted successfully!'
                  );
                  fetchAllCustomers(); // Re-fetch data to update the list
                } else {
                  toast.error(response.message || 'Failed to delete customer.');
                }
              } catch (error: any) {
                toast.dismiss(loadingToast);
                toast.error(
                  error.message || 'Something went wrong while deleting.'
                );
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  const columns: Column<Customer>[] = useMemo(() => {
    const baseColumns: Column<Customer>[] = [
      { accessor: 'name', header: 'Customer Name' },
      { accessor: 'company', header: 'Company' },
      { accessor: 'mobile', header: 'Mobile' },
      { accessor: 'contactPersonName', header: 'Contact Person Name' },
      { accessor: 'contactPersonMobile', header: 'Contact Person Mobile' },
      {
        accessor: 'createdAt',
        header: 'Date',
        render: (vendor) => formatDate(vendor.createdAt),
      },
      {
        accessor: 'status',
        header: 'Status',
        render: (customer) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              customer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {customer.status}
          </span>
        ),
      },
    ];

    if (can('customer', 'update') || can('customer', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof Customer,
        header: 'Actions',
        render: (customer) => (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (customer._id) toggleActionMenu(customer._id);
              }}
              className="text-gray-600 hover:text-[#11375d] transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenu === customer._id && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {can('customer', 'update') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customer._id) handleEdit(customer._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-[#11375d]" /> Edit
                  </button>
                )}
                {can('customer', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customer._id) handleDelete(customer._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#cc1518] hover:bg-gray-50"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <Users className="w-7 h-7 text-red-600" />
          <h1 className="text-3xl font-semibold text-gray-800">
            Customer Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {' '}
          {/* Group Add and Filter buttons */}
          {can('customer', 'create') && (
            <button
              onClick={handleAddCustomer}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {showFilters ? (
        <>
          {/* Filters */}
          <CustomerFilterBar
            onStatusChange={setStatusFilter}
            onClearFilters={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
              setCurrentPage(1); // Reset page on clear
            }}
            initialStatus={statusFilter}
          />
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search customers..."
            />
          </div>
        </>
      ) : (
        <>
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search customers..."
            />
          </div>
        </>
      )}

      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={allCustomers}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalCustomersCount}
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

export default CustomerPage;
