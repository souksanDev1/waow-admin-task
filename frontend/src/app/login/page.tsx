import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,250,250,0.12),_transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 text-zinc-50 shadow-2xl backdrop-blur">
        <p className="text-2xl font-semibold tracking-tight text-zinc-50">Waow</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Use your admin credentials to manage roles, admins, and users.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
