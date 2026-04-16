'use client';

import { ProductFilterBar } from '@/components/catalog/ProductFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { Product, ProductFilter } from '@/lib/types';
import { deleteProduct, getCatalog } from '@/services/catalogApi';
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

const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ProductFilter['status']>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  const router = useRouter();
  const { can } = useAuth();
  const toggleActionMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: ProductFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
      };

      const response = await getCatalog(filterParams, currentPage, limit);
      const {
        products: fetchedProducts,
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = response;

      setProducts(fetchedProducts || []);
      setTotalPagesCount(fetchedTotalPages || 1);
      setTotalProductsCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load product catalog.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">
            Are you sure you want to delete this product?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                toast.info('Product deletion cancelled.', { duration: 2000 });
              }}
              className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                const loadingId = toast.loading('Deleting product...');
                try {
                  const response = await deleteProduct(id);
                  toast.dismiss(loadingId);
                  if (response.success) {
                    toast.success(
                      response.message || 'Product deleted successfully!'
                    );
                    fetchProducts();
                  } else {
                    toast.error(
                      response.message || 'Failed to delete product.'
                    );
                  }
                } catch (error: any) {
                  toast.dismiss(loadingId);
                  toast.error(
                    error.response?.data?.message ||
                      'Something went wrong while deleting product.'
                  );
                }
              }}
              className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        id: 'delete-confirm',
        duration: Infinity,
        position: 'top-right',
      }
    );
  };

  const handleAdd = () => router.push('/master/catalog/add');
  const handleEdit = (id: string) => router.push(`/master/catalog/edit/${id}`);
  const handleRowClick = (product: Product) => {
    if (product._id) {
      router.push(`/master/catalog/${product._id}`);
    }
  };

  const columns: Column<Product>[] = useMemo(() => {
    const baseColumns: Column<Product>[] = [
      { accessor: 'name', header: 'Name' },
      { accessor: 'itemCode', header: 'Item Code' },
      { accessor: 'unit', header: 'Unit' },
      {
        accessor: 'status',
        header: 'Status',
        render: (product) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              product.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-teal-100 text-teal-900'
            }`}
          >
            {product.status}
          </span>
        ),
      },
    ];

    if (can('product', 'update') || can('product', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof Product,
        header: 'Actions',
        render: (product: Product) => (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product._id) toggleActionMenu(product._id);
              }}
              className="text-gray-600 hover:text-[#0f766e] transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenu === product._id && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {can('product', 'update') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product._id) handleEdit(product._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-[#0f766e]" />
                    Edit
                  </button>
                )}
                {can('product', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product._id) handleDelete(product._id);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#0f766e] hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
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
        eyebrow="Product Registry"
        title="Product"
        highlight="Catalog"
        description="Manage product definitions, specifications, and catalog status."
        actions={
          <>
          {can('product', 'create') && (
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
          <ProductFilterBar
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
              placeholder="Search products..."
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
              placeholder="Search products..."
            />
          </div>
        </>
      )}

      {/* Products Display */}
      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={products}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalProductsCount}
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

export default CatalogPage;
