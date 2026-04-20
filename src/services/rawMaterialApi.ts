import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getRawMaterials = async (params?: { initialized?: boolean }) => {
    const response = await axios.get(`${API_URL}/raw-materials`, { 
        params,
        withCredentials: true 
    });
    return response.data.data;
};

export const getRawMaterialDropdown = async () => {
    const response = await axios.get(`${API_URL}/raw-materials/dropdown`, { withCredentials: true });
    return response.data.data;
};

export const createRawMaterial = async (data: any) => {
    const response = await axios.post(`${API_URL}/raw-materials`, data, { withCredentials: true });
    return response.data;
};

export const updateRawMaterial = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/raw-materials/${id}`, data, { withCredentials: true });
    return response.data;
};

export const adjustRawMaterialStock = async (id: string, quantity: number, note?: string) => {
    const response = await axios.patch(`${API_URL}/raw-materials/${id}/adjust-stock`, { quantity, note }, { withCredentials: true });
    return response.data;
};

export const getRawMaterialById = async (id: string) => {
    const response = await axios.get(`${API_URL}/raw-materials/${id}`, { withCredentials: true });
    return response.data.data;
};

export const deleteRawMaterial = async (id: string) => {
    const response = await axios.delete(`${API_URL}/raw-materials/${id}`, { withCredentials: true });
    return response.data;
};
