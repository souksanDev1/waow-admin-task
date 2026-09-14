'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { login } from '@/lib/api/admin-api';
import { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const fieldClassName =
  'h-11 border-zinc-600 bg-zinc-950 text-zinc-50 placeholder:text-zinc-500 caret-zinc-50 selection:bg-zinc-600 selection:text-zinc-50 focus-visible:border-zinc-300 focus-visible:ring-zinc-500/40 [&:-webkit-autofill]:[-webkit-text-fill-color:#fafafa] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#09090b_inset] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.username, values.password);
      toast.success('Welcome back');
      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-zinc-50">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-zinc-200">
          Username
        </Label>
        <Input
          id="username"
          autoComplete="username"
          placeholder="superadmin"
          className={fieldClassName}
          {...register('username')}
        />
        {errors.username ? (
          <p className="text-sm text-red-400">{errors.username.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-200">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${fieldClassName} pr-11`}
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full bg-zinc-50 text-zinc-950 hover:bg-white"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
