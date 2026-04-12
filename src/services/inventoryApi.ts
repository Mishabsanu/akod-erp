import api from '@/lib/api';
import {
  CreateInventoryPayload,
  InventoryFilter,
  InventoryItem,
  InventoryResponse,
  PODropdownItem,
} from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api'; // Import from central types

export const getInventoryItems = async (
  filter: InventoryFilter,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, any> = { page, limit };
  if (filter.search) params.search = filter.search;
  if (filter.status) params.status = filter.status;
  if (filter.minStock) params.minStock = filter.minStock;
  if (filter.maxStock) params.maxStock = filter.maxStock;

  const { data } = await api.get<GetApiResponse<InventoryItem>>('/inventory', {
    params,
  });

  return {
    inventoryItems: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
    limit: data?.data?.limit || limit,
  };
};

export const getInventoryItemById = async (id: string) => {
  const { data } = await api.get<ApiResponse<InventoryItem>>(
    `/inventory/${id}`
  );
  return data.data; // Assuming data.data directly contains the InventoryItem
};

export const createInventoryItem = async (payload: CreateInventoryPayload) => {
  const { data } = await api.post<ApiResponse<InventoryResponse[]>>(
    '/inventory',
    payload
  );
  return data;
};

export const updateInventoryItem = async (
  id: string,
  payload: Partial<InventoryItem>
) => {
  const { data } = await api.put<ApiResponse<InventoryItem>>(
    `/inventory/${id}`,
    payload
  );
  return data;
};

export const deleteInventoryItem = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/inventory/${id}`);
  return data;
};

export const getAvailableProducts = async (): Promise<PODropdownItem[]> => {
  const { data } = await api.get<ApiResponse<PODropdownItem[]>>(
    '/inventory/available-products'
  );
  return data.data;
};
