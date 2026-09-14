export type ModulePermissions = {
  can_create: boolean;
  can_delete: boolean;
  can_update: boolean;
  can_view: boolean;
};

export type Permissions = {
  admin_module: ModulePermissions;
  user_module: ModulePermissions;
};

export type ApiResponse<T> = {
  error: boolean;
  code: number | string;
  message: string;
  data: T;
};

export type AdminProfile = {
  id: number;
  username: string;
  roleName: string;
  permissions: Permissions;
};

export type LoginData = {
  token: string;
  admin: AdminProfile;
};

export type Role = {
  id: number;
  name: string;
  permissions: Permissions;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
};

export type Admin = {
  id: number;
  username: string;
  role_id: number;
  role?: {
    id: number;
    name: string;
    permissions: Permissions;
  };
  is_deleted: boolean;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: number;
  phone_number: string;
  name: string;
  profile_image: string | null;
  created_at?: string;
  updated_at?: string;
};

export class ApiError extends Error {
  code: number | string;
  data: unknown;

  constructor(message: string, code: number | string, data: unknown = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}
