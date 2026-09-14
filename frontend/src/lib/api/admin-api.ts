import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { Admin, AdminProfile, LoginData, Permissions, Role, User } from '@/types/api';
import { setAdminProfile, setToken } from '@/lib/auth/token';

export async function login(username: string, password: string): Promise<LoginData> {
  const data = await apiPost<LoginData>('/auth/login', { username, password });
  setToken(data.token);
  setAdminProfile(data.admin);
  return data;
}

export function listRoles() {
  return apiGet<Role[]>('/roles');
}

export function createRole(payload: { name: string; permissions: Permissions }) {
  return apiPost<Role>('/roles', payload);
}

export function updateRole(id: number, payload: Partial<{ name: string; permissions: Permissions }>) {
  return apiPut<Role>(`/roles/${id}`, payload);
}

export function deleteRole(id: number) {
  return apiDelete<{ id: number }>(`/roles/${id}`);
}

export function listAdmins() {
  return apiGet<Admin[]>('/admins');
}

export function createAdmin(payload: { username: string; password: string; role_id: number }) {
  return apiPost<Admin>('/admins', payload);
}

export function updateAdmin(
  id: number,
  payload: Partial<{ username: string; password: string; role_id: number }>,
) {
  return apiPut<Admin>(`/admins/${id}`, payload);
}

export function deleteAdmin(id: number) {
  return apiDelete<{ id: number; is_deleted: boolean }>(`/admins/${id}`);
}

export function resetAdminPassword(id: number, password: string) {
  return apiPost<{ id: number }>(`/admins/${id}/reset-password`, { password });
}

export function listUsers() {
  return apiGet<User[]>('/users');
}

export type { AdminProfile };
