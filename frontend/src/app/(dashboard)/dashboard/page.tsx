'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminProfile } from '@/lib/auth/token';
import type { AdminProfile } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    setAdmin(getAdminProfile<AdminProfile>());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-zinc-600">
          Welcome{admin ? `, ${admin.username}` : ''}. Manage admin access and inspect users.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: '/roles', title: 'Roles', desc: 'Dynamic permissions', superOnly: true },
          { href: '/admins', title: 'Admins', desc: 'Create, update, soft delete' },
          { href: '/users', title: 'Users', desc: 'Read-only user listing' },
        ]
          .filter((item) => !item.superOnly || admin?.roleName === 'SUPER_ADMIN')
          .map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="transition hover:border-zinc-400">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-600">{item.desc}</CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
