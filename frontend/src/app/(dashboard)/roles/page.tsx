'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
} from '@/lib/api/admin-api';
import { emptyPermissions } from '@/features/roles/permissions';
import type { Permissions, Role } from '@/types/api';
import { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function PermissionsEditor({
  value,
  onChange,
}: {
  value: Permissions;
  onChange: (next: Permissions) => void;
}) {
  const modules = ['admin_module', 'user_module'] as const;
  const actions = ['can_view', 'can_create', 'can_update', 'can_delete'] as const;

  return (
    <div className="space-y-4">
      {modules.map((mod) => (
        <div key={mod} className="rounded-lg border border-zinc-200 p-3">
          <p className="mb-2 text-sm font-medium">{mod}</p>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <label key={action} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value[mod][action]}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      [mod]: { ...value[mod], [action]: e.target.checked },
                    })
                  }
                />
                {action}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['roles'], queryFn: listRoles });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permissions>(emptyPermissions);

  function openCreate() {
    setEditing(null);
    setName('');
    setPermissions(emptyPermissions);
    setOpen(true);
  }

  function openEdit(role: Role) {
    setEditing(role);
    setName(role.name);
    setPermissions(role.permissions);
    setOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateRole(editing.id, { name, permissions });
      }
      return createRole({ name, permissions });
    },
    onSuccess: async () => {
      toast.success(editing ? 'Role updated' : 'Role created');
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: async () => {
      toast.success('Role deleted');
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Roles</h2>
          <p className="text-sm text-zinc-600">Manage dynamic module permissions.</p>
        </div>
        <Button onClick={openCreate}>Create role</Button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Admin perms</TableHead>
              <TableHead>User perms</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No roles</TableCell>
              </TableRow>
            ) : (
              data.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    V{Number(role.permissions.admin_module.can_view)} C
                    {Number(role.permissions.admin_module.can_create)} U
                    {Number(role.permissions.admin_module.can_update)} D
                    {Number(role.permissions.admin_module.can_delete)}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    V{Number(role.permissions.user_module.can_view)} C
                    {Number(role.permissions.user_module.can_create)} U
                    {Number(role.permissions.user_module.can_update)} D
                    {Number(role.permissions.user_module.can_delete)}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(role)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={['SUPER_ADMIN', 'NORMAL'].includes(role.name)}
                      onClick={() => deleteMutation.mutate(role.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit role' : 'Create role'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={editing ? ['SUPER_ADMIN', 'NORMAL'].includes(editing.name) : false}
              />
            </div>
            <PermissionsEditor value={permissions} onChange={setPermissions} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!name.trim() || saveMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
