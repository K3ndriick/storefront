'use client';

/**
 * ResetPasswordForm
 *
 * Shown at /forgot-password/confirm after the user clicks the password reset email link.
 * By the time this page renders, the user is already authenticated -
 * /auth/callback exchanged the one-time code for a real session.
 *
 * Two fields: newPassword + confirmNewPassword (cross-field validation via .refine())
 * On success: redirect to '/' with a success toast.
 * No emailSent state needed - we redirect immediately after the password is updated.
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth/auth-context';
import type { ResetPasswordFormData } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// =============================================================
// ZOD SCHEMA
// =============================================================
// Define resetPasswordSchema.
//
//   Two fields:
//     newPassword:        z.string().min(12, 'Password must be at least 12 characters')
//     confirmNewPassword: z.string()
//
//   Then chain .refine() to confirm the passwords match.
//
//   Path should be ['confirmNewPassword']
// =============================================================

const resetPasswordSchema = z.object({
  newPassword: z.string().min(12, 'Password must be at least 12 characters'),
  confirmNewPassword: z.string()

}).refine(
  (data) => data.newPassword === data.confirmNewPassword, 
  {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  }
);

// =============================================================
// COMPONENT
// =============================================================

export function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const router = useRouter();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  // =============================================================
  // onSubmit
  // =============================================================
  // Submit handler.
  //
  // This form redirects on success (unlike forgot-password which shows a message).
  // The user has a new password and is already logged in - send them home.
  //
  // Steps:
  //   1. try: await updatePassword(data.newPassword)
  //   2. On success: toast.success('Password updated successfully')
  //                  then router.push('/')
  //   3. catch (error): toast.error(error instanceof Error ? error.message : 'Failed to update password')
  // =============================================================

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await updatePassword(data.newPassword);

      toast.success('Password updated successfully');

      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  // =============================================================
  // JSX
  // =============================================================

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update password'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">
            Back to sign in
          </Link>
        </p>

      </form>
    </Form>
  );
}
