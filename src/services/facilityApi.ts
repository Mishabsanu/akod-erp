import api from '@/lib/api';
import { ApiResponse } from '@/lib/types/api';
import { Facility, FacilityChecklist } from '@/lib/types';

// --- FACILITIES ---
export const getFacilities = async (params?: any) => {
  const response = await api.get<{ data: { content: Facility[], totalCount: number, totalPages: number } }>('/facilities', { params });
  return response.data;
};

export const getFacility = async (id: string) => {
  const response = await api.get<ApiResponse<Facility>>(`/facilities/${id}`);
  return response.data.data;
};

export const createFacility = async (data: Partial<Facility>) => {
  const response = await api.post<ApiResponse<Facility>>('/facilities', data);
  return response.data.data;
};

export const updateFacility = async (id: string, data: Partial<Facility>) => {
  const response = await api.put<ApiResponse<Facility>>(`/facilities/${id}`, data);
  return response.data.data;
};

export const deleteFacility = async (id: string) => {
  const response = await api.delete<ApiResponse<any>>(`/facilities/${id}`);
  return response.data;
};

export const getFacilityDropdown = async () => {
  const response = await api.get<ApiResponse<any[]>>('/facilities/dropdown');
  return response.data.data;
};

// --- AUDIT LOGS ---
export const getAuditLogs = async (params?: any) => {
  const response = await api.get<{ data: { content: FacilityChecklist[], totalCount: number } }>('/facilities/audit/logs', { params });
  return response.data;
};

export const createAuditReport = async (formData: FormData) => {
  const response = await api.post<ApiResponse<FacilityChecklist>>('/facilities/audit/report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};
