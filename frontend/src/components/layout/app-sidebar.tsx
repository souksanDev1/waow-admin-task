'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Shield, Users, UserCog, LogOut } from 'lucide-react';
import { clearToken, getAdminProfile } from '@/lib/auth/token';
import type { AdminProfile } from '@/types/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roles', label: 'Roles', icon: Shield, superOnly: true },
  { href: '/admins', label: 'Admins', icon: UserCog },
  { href: '/users', label: 'Users', icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    setAdmin(getAdminProfile<AdminProfile>());
  }, []);

  function logout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Waow</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Admin Console</h1>
        {admin ? (
          <p className="mt-2 truncate text-sm text-zinc-400">
            {admin.username} · {admin.roleName}
          </p>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links
          .filter((link) => !link.superOnly || admin?.roleName === 'SUPER_ADMIN')
          .map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  active ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-900',
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-zinc-800 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-300 hover:bg-zinc-900 hover:text-white"
          onClick={logout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
