'use client';

/**
 * LoginForm
 *
 * Renders the email/password login form inside the /login page Card.
 *
 * Libraries used:
 *   react-hook-form  - manages form state, validation, and submission
 *   zod              - defines the validation schema (what is/isn't valid input)
 *   @hookform/resolvers/zod - bridges zod and react-hook-form together
 *   sonner           - shows success/error toast notifications
 *
 * Data flow:
 *   User types -> react-hook-form tracks values
 *     -> Submit -> zod validates
 *       -> if invalid: show inline errors (FormMessage handles this)
 *       -> if valid: call signIn() from AuthContext
 *         -> success: toast + redirect to `next` or '/'
 *         -> error: toast with Supabase error message
 *
 * useSearchParams:
 *   Reads the `?next=` URL param set by proxy.ts when redirecting unauthenticated users.
 *   Example: /login?next=/checkout -> after login, redirect to /checkout.
 *   Falls back to '/' if no next param exists.
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth/auth-context';
import type { LoginFormData } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// =============================================================
// ZOD SCHEMA
// =============================================================
// Defines what valid login input looks like.
// react-hook-form will run this against field values on submit.
// If validation fails, FormMessage displays the error string.
//
// z.object() - schema for an object with named fields
// z.string() - field must be a string
// .email()   - must be a valid email format (built-in zod check)
// .min(1)    - must not be empty (min 1 character)
//
// Schema fields
//   email:    z.string() + .email() with message 'Please enter a valid email address'
//   password: z.string() + .min(1) with message 'Password is required'
// =============================================================

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// =============================================================
// COMPONENT
// =============================================================

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  // Read the ?next= param - where to send the user after login.
  // proxy.ts sets this when redirecting unauthenticated users to /login.
  const next = searchParams.get('next') ?? '/';

  // --- useForm setup ---
  //
  // useForm() initialises the form with react-hook-form.
  // resolver: zodResolver(loginSchema) - plugs in our zod schema for validation
  // defaultValues: sets the initial value of each field (empty strings here)
  //
  // Destructuring what we need:
  //   form         - the form instance (passed to <Form> as `...form`)
  //   handleSubmit - wraps our onSubmit, runs validation first
  //   formState    - contains { isSubmitting } which we use to disable the button

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  // --- onSubmit handler ---
  //
  // Called by handleSubmit ONLY if zod validation passes.
  // `data` is the validated form values typed as LoginFormData.
  //
  // Pattern:
  //   try: call signIn(email, password)
  //        on success: show success toast, redirect to `next`
  //   catch: show error toast using the error message from Supabase
  //          (signIn throws the original Supabase error, which has a .message property)
  //
  // router.push(next) - navigates the user to the post-login destination
  // toast.success()   - shows a green success notification via sonner
  // toast.error()     - shows a red error notification via sonner
  //

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      router.push(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  // =============================================================
  // JSX
  // =============================================================
  // <Form {...form}>        - passes all form methods into shadcn's Form (FormProvider)
  // <FormField>             - connects a field to react-hook-form via Controller
  //   name=                 - must match a key in loginSchema / LoginFormData
  //   render={({ field })   - field contains { value, onChange, onBlur, ref }
  //     <FormItem>          - wraps label + input + error message with spacing
  //       <FormLabel>       - auto-linked to input via htmlFor (no manual id needed)
  //       <FormControl>     - passes aria attributes for accessibility
  //         <Input>         - the actual input, spread with {...field}
  //       <FormMessage>     - renders the zod error string if validation fails

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Email field */}
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

        {/* Password field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button - disabled and shows loading text while submitting */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        {/* Link to signup */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:underline"
          >
            Sign up
          </Link>
        </p>

      </form>
    </Form>
  );
}
