import axios from 'axios';
import { clearToken, getToken } from '@/lib/auth/token';
import { ApiError, type ApiResponse } from '@/types/api';

const baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/v1`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body && typeof body === 'object' && 'error' in body && body.error) {
      throw new ApiError(body.message || 'Request failed', body.code, body.data);
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const body = error.response.data as ApiResponse<unknown>;
      if (error.response.status === 401 && typeof window !== 'undefined') {
        clearToken();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      throw new ApiError(body.message || 'Request failed', body.code ?? error.response.status, body.data);
    }
    throw error;
  },
);

export async function apiGet<T>(url: string): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(url);
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url);
  return data.data;
}
