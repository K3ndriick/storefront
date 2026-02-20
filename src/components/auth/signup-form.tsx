'use client';

/**
 * SignupForm
 *
 * Four-field registration form: full name, email, password, confirm password.
 *
 * New concept - cross-field validation with Zod .refine():
 *   Standard z.object() validates each field independently.
 *   .refine() runs AFTER all fields pass, giving you access to the whole object.
 *   We use it to compare password === confirmPassword across fields.
 *
 * Success behaviour:
 *   Supabase sends a confirmation email before activating the account.
 *   After signUp() succeeds, the user is NOT yet logged in.
 *   We flip `emailSent` state and show a "check your email" message -
 *   the same early-return pattern used in ForgotPasswordForm.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import type { SignupFormData } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// =============================================================
// ZOD SCHEMA
// =============================================================
// Define signupSchema using z.object() with these fields:
//
//   fullName:        z.string().min(1, 'Full name is required')
//   email:           z.string().email('Please enter a valid email address')
//   password:        z.string().min(12, 'Password must be at least 12 characters')
//   confirmPassword: z.string()
//
// Then chain .refine() to compare password and confirmPassword:
//
//   .refine((data) => data.password === data.confirmPassword, {
//     message: 'Passwords do not match',
//     path: ['confirmPassword'],
//   })
//
// How .refine() works:
//   - Runs AFTER all individual field validations pass
//   - Receives the full form object as `data`
//   - Return true = valid, false = attach the error at `path`
//   - `path: ['confirmPassword']` tells Zod which field's FormMessage shows the error
// =============================================================

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  confirmPassword: z.string()

}).refine((data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// =============================================================
// COMPONENT
// =============================================================

export function SignupForm() {
  const { signUp } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  // =============================================================
  // onSubmit
  // =============================================================
  // Submit handler.
  //
  // signUp() signature (from AuthContext):
  //   signUp(email: string, password: string, fullName: string)
  //   Note the argument order: email first, then password, then fullName.
  //
  // Steps:
  //   1. try: await signUp(data.email, data.password, data.fullName)
  //   2. On success: setEmailSent(true)
  //      (no redirect - user must confirm their email first)
  //   3. catch (error): toast.error(error instanceof Error ? error.message : 'Failed to create account')
  // =============================================================

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName);

      setEmailSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  // =============================================================
  // SUCCESS STATE
  // =============================================================

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <MailCheck className="h-12 w-12 text-primary" />
        <div className="space-y-1">
          <p className="font-semibold">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to your email address.
            Click it to activate your account.
          </p>
        </div>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to sign in
        </Link>
      </div>
    );
  }

  // =============================================================
  // FORM STATE (default)
  // =============================================================

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Sarah Mitchell"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              {/* FormMessage here shows the .refine() error when passwords don't match */}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>

      </form>
    </Form>
  );
}
