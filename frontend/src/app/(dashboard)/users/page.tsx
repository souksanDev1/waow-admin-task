'use client';

import { useQuery } from '@tanstack/react-query';
import { listUsers } from '@/lib/api/admin-api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function UsersPage() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="text-sm text-zinc-600">Read-only list from the shared users table.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Profile image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading…</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4}>Failed to load users</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No users yet</TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-zinc-600">
                    {user.profile_image || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
