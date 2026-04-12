'use client';

import { formatDate } from '@/app/utils/formatDate';
import { VendorFilterBar } from '@/components/master/VendorFilterBar'; // Import VendorFilterBar
import { Column, DataTable } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { Vendor, VendorFilter } from '@/lib/types';
import { deleteVendor, getVendors } from '@/services/vendorApi';
import { Edit2, Filter, MoreVertical, Plus, Trash2, Users } from 'lucide-react'; // Import Filter icon
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const VendorPage: React.FC = () => {
  const router = useRouter();
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // State for action menu
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility
  const { can } = useAuth();

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<VendorFilter['status']>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalVendorsCount, setTotalVendorsCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  const fetchAllVendors = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: VendorFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
      };
      const {
        vendors: fetchedVendors,
        totalCount: fetchedTotalCount,
        totalPages: fetchedTotalPages,
      } = await getVendors(filterParams, currentPage, limit);
      setAllVendors(fetchedVendors);
      setTotalVendorsCount(fetchedTotalCount);
      setTotalPagesCount(fetchedTotalPages);
    } catch (error) {
      toast.error('Failed to fetch vendors.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchAllVendors();
  }, [fetchAllVendors]);

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const handleAddVendor = () => {
    router.push('/master/vendor/add');
  };

  const handleEdit = (id: string) => {
    router.push(`/master/vendor/edit/${id}`);
  };

  const handleRowClick = (vendor: Vendor) => {
    if (vendor._id) {
      router.push(`/master/vendor/${vendor._id}`);
    }
  };

  const handleDelete = async (id: string) => {
    // Show confirmation toast
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this vendor?
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
              const loadingToast = toast.loading('Deleting vendor...');
              try {
                const response = await deleteVendor(id);
                toast.dismiss(loadingToast);
                if (response.success) {
                  toast.success(
                    response.message || 'Vendor deleted successfully!'
                  );
                  fetchAllVendors(); // Re-fetch data to update the list
                } else {
                  toast.error(response.message || 'Failed to delete vendor.');
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

  const columns: Column<Vendor>[] = useMemo(() => {
    const baseColumns: Column<Vendor>[] = [
      { accessor: 'name', header: 'Vendor Name' },
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
        render: (vendor) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              vendor.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {vendor.status}
          </span>
        ),
      },
    ];

    if (can('vendor', 'update') || can('vendor', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof Vendor, // Cast to keyof Vendor to satisfy type, as 'actions' is not a direct property
        header: 'Actions',
        render: (vendor) => (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (vendor._id) toggleActionMenu(vendor._id);
              }}
              className="text-gray-600 hover:text-[#11375d] transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenu === vendor._id && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {can('vendor', 'update') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (vendor._id) handleEdit(vendor._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-[#11375d]" /> Edit
                  </button>
                )}
                {can('vendor', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (vendor._id) handleDelete(vendor._id);
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
            Vendor Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {' '}
          {/* Group Add and Filter buttons */}
          {can('vendor', 'create') && (
            <button
              onClick={handleAddVendor}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
            >
              <Plus className="w-4 h-4" /> Add Vendor
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
          <VendorFilterBar
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
              placeholder="Search vendors..."
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
              placeholder="Search vendors..."
            />
          </div>
        </>
      )}

      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={allVendors}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalVendorsCount}
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

export default VendorPage;
