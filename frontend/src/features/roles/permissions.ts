export const emptyPermissions = {
  admin_module: {
    can_create: false,
    can_delete: false,
    can_update: false,
    can_view: true,
  },
  user_module: {
    can_create: false,
    can_delete: false,
    can_update: false,
    can_view: true,
  },
};

export function permissionLabel(value: boolean) {
  return value ? 'Yes' : 'No';
}
