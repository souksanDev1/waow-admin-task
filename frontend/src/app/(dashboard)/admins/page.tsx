'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  createAdmin,
  deleteAdmin,
  listAdmins,
  listRoles,
  resetAdminPassword,
  updateAdmin,
} from '@/lib/api/admin-api';
import { getAdminProfile } from '@/lib/auth/token';
import type { Admin, AdminProfile } from '@/types/api';
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
export default function AdminsPage() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: listAdmins,
  });
  const { data: roles = [] } = useQuery({
    queryKey: ['roles-options'],
    queryFn: listRoles,
    enabled: profile?.roleName === 'SUPER_ADMIN' || Boolean(profile?.permissions.admin_module.can_create),
    retry: false,
  });

  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [resetPassword, setResetPasswordValue] = useState('');
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);

  useEffect(() => {
    setProfile(getAdminProfile<AdminProfile>());
  }, []);

  const canCreate = useMemo(
    () =>
      profile?.roleName === 'SUPER_ADMIN' ||
      Boolean(profile?.permissions.admin_module.can_create),
    [profile],
  );
  const canUpdate = useMemo(
    () =>
      profile?.roleName === 'SUPER_ADMIN' ||
      Boolean(profile?.permissions.admin_module.can_update),
    [profile],
  );
  const canDelete = useMemo(
    () =>
      profile?.roleName === 'SUPER_ADMIN' ||
      Boolean(profile?.permissions.admin_module.can_delete),
    [profile],
  );
  const isSuper = profile?.roleName === 'SUPER_ADMIN';

  function openCreate() {
    setEditing(null);
    setUsername('');
    setPassword('');
    setRoleId(roles[0] ? String(roles[0].id) : '');
    setOpen(true);
  }

  function openEdit(admin: Admin) {
    setEditing(admin);
    setUsername(admin.username);
    setPassword('');
    setRoleId(String(admin.role_id));
    setOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const role_id = Number(roleId);
      if (editing) {
        const payload: { username?: string; password?: string; role_id?: number } = {
          username,
          role_id,
        };
        if (password) payload.password = password;
        return updateAdmin(editing.id, payload);
      }
      return createAdmin({ username, password, role_id });
    },
    onSuccess: async () => {
      toast.success(editing ? 'Admin updated' : 'Admin created');
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdmin(id),
    onSuccess: async () => {
      toast.success('Admin soft-deleted');
      await queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetAdminPassword(resetTarget!.id, resetPassword),
    onSuccess: async () => {
      toast.success('Password reset');
      setResetOpen(false);
      setResetPasswordValue('');
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Reset failed');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Admins</h2>
          <p className="text-sm text-zinc-600">Create and manage admin accounts.</p>
        </div>
        {canCreate ? <Button onClick={openCreate}>Create admin</Button> : null}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading…</TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.role?.name || admin.role_id}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    {canUpdate ? (
                      <Button size="sm" variant="outline" onClick={() => openEdit(admin)}>
                        Edit
                      </Button>
                    ) : null}
                    {isSuper ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setResetTarget(admin);
                          setResetPasswordValue('');
                          setResetOpen(true);
                        }}
                      >
                        Reset password
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(admin.id)}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit admin' : 'Create admin'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{editing ? 'Password (optional)' : 'Password'}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-id">Role</Label>
              <select
                id="role-id"
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="" disabled>
                  Select role
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={
                !username ||
                !roleId ||
                (!editing && password.length < 6) ||
                saveMutation.isPending
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password — {resetTarget?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPasswordValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => resetMutation.mutate()}
              disabled={resetPassword.length < 6 || resetMutation.isPending}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
