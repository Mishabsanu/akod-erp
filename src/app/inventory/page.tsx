'use client';

import { InventoryFilterBar } from '@/components/inventory/InventoryFilterBar'; // Use InventoryFilterBar
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { InventoryFilter, InventoryItem } from '@/lib/types'; // Use InventoryItem type
import {
  deleteInventoryItem, // Use Inventory API
  getInventoryItems, // Use Inventory API
} from '@/services/inventoryApi';
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
import withAuth from '@/components/withAuth';

const InventoryPage = () => {
  // Rename component
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]); // State for inventory items
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<InventoryFilter['status']>(undefined);
  const [minStock, setMinStock] = useState<number | undefined>(undefined);
  const [maxStock, setMaxStock] = useState<number | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalInventoryCount, setTotalInventoryCount] = useState(0);
  const [totalInventoryPages, setTotalInventoryPages] = useState(1);

  const router = useRouter();
  const { can } = useAuth();
  const toggleActionMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: InventoryFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
        minStock,
        maxStock,
      };

      const response = await getInventoryItems(
        filterParams,
        currentPage,
        limit
      );

      const {
        inventoryItems: fetchedItems,
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = response;

      setInventoryItems(fetchedItems || []);
      setTotalInventoryPages(fetchedTotalPages || 1);
      setTotalInventoryCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      toast.error('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    statusFilter,
    minStock, 
    maxStock, 
    currentPage,
    limit,
  ]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this inventory item?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              toast.info('Inventory item deletion cancelled.', {
                duration: 2000,
              });
            }}
            className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              const loadingId = toast.loading('Deleting inventory item...');
              try {
                const response = await deleteInventoryItem(id); // Use Inventory API
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(
                    response.message || 'Inventory item deleted successfully!'
                  );
                  fetchInventory(); // Re-fetch data
                } else {
                  toast.error(
                    response.message || 'Failed to delete inventory item.'
                  );
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(
                  error.response?.data?.message ||
                    'Something went wrong while deleting inventory item.'
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

  const handleAdd = () => router.push('/inventory/add'); // Update path
  const handleEdit = (id: string) => router.push(`/inventory/edit/${id}`); // Update path
  const handleRowClick = (item: InventoryItem) => {
    if (item._id && can('inventory', 'update')) {
      router.push(`/inventory/${item._id}`);
    }
  };

  const columns: Column<InventoryItem>[] = useMemo(() => {
    const baseColumns: Column<InventoryItem>[] = [
      {
        accessor: 'poNo',
        header: 'PO Number',
        render: (item) => <span className="font-bold text-[#0f766e] uppercase tracking-wider">{item.poNo}</span>
      },
      {
        accessor: 'product',
        header: 'Product',
        render: (item) => item.product?.name || '—',
      },
      {
        accessor: 'itemCode',
        header: 'Item Code',
        render: (item) => <span className="font-bold text-gray-950 uppercase tracking-widest">{item.itemCode}</span>
      },
      {
        accessor: 'orderedQty',
        header: 'Ordered Qty',
        render: (item) => item.orderedQty.toLocaleString(),
      },
      {
        accessor: 'availableQty',
        header: 'Available Qty',
        render: (item) => item.availableQty.toLocaleString(),
      },
      {
        accessor: 'status',
        header: 'Status',
        render: (item) => {
          const statusStyles: Record<string, string> = {
            IN_STOCK: 'bg-green-100 text-green-800',
            LOW_STOCK: 'bg-yellow-100 text-yellow-800',
            OUT_OF_STOCK: 'bg-teal-100 text-teal-900',
          };

          const color =
            statusStyles[item.status] || 'bg-gray-100 text-gray-800';

          return (
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg ${
                item.status === 'IN_STOCK' ? 'bg-[#0f766e] text-white' : item.status === 'LOW_STOCK' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {item.status.replaceAll('_', ' ')}
            </span>
          );
        },
      },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (item: InventoryItem) => (
          <span className="text-sm font-medium text-gray-600">
            {typeof item.createdBy === 'object' ? item.createdBy.name : item.createdBy || '--'}
          </span>
        ),
      },
      {
        accessor: 'createdAt',
        header: 'Date Created',
        render: (item: InventoryItem) => (
          <span className="text-sm font-medium text-gray-600">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
          </span>
        ),
      },
    ];

    if (can('inventory', 'update') || can('inventory', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof InventoryItem,
        header: 'Actions',
        render: (item) => (
          <div className="flex items-center gap-2">
            {can('inventory', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item._id) handleEdit(item._id);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('inventory', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item._id) handleDelete(item._id);
                }}
                className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
        eyebrow="Logistics"
        title="Inventory"
        highlight="Status"
        description="Monitor stock status, item movement, and available quantities."
        actions={
          <>
          {can('inventory', 'create') && (
            <button
              onClick={handleAdd}
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
          {/* Filters */}
          <InventoryFilterBar
            onStatusChange={setStatusFilter}
            onStockRangeChange={(min, max) => {
              setMinStock(min);
              setMaxStock(max);
              setCurrentPage(1); // reset pagination
            }}
            onClearFilters={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
              setMinStock(undefined);
              setMaxStock(undefined);
              setCurrentPage(1);
            }}
            initialStatus={statusFilter}
          />

          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search inventory..."
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
              placeholder="Search inventory..."
            />
          </div>
        </>
      )}

      {/* Inventory Items Display */}
      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={inventoryItems}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalInventoryCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalInventoryPages}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
};

export default withAuth(InventoryPage, [{ module: 'inventory', action: 'view' }]);
