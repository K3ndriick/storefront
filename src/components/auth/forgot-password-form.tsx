'use client';

/**
 * ForgotPasswordForm
 *
 * Single-field form that sends a password reset email.
 *
 * Key difference from LoginForm:
 *   On success we do NOT redirect. There is nowhere to go yet -
 *   the user must check their email and click the link.
 *   Instead we flip a local `emailSent` state to true and render
 *   a confirmation message in place of the form.
 *
 * Flow:
 *   User enters email -> submit -> resetPassword(email)
 *     -> success: emailSent = true -> show "Check your inbox" UI
 *     -> error: toast.error with the Supabase message
 *
 *   After clicking the email link:
 *     Supabase -> /auth/callback?code=...&next=/forgot-password/confirm
 *     -> callback route exchanges code for session
 *     -> user lands on /forgot-password/confirm to set new password
 */

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import type { ForgotPasswordFormData } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// =============================================================
// ZOD SCHEMA
// =============================================================
// Define the schema for the forgot password form.
//   It has one field: email
//   Use z.string().email() with message 'Please enter a valid email address'
// =============================================================

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

// =============================================================
// COMPONENT
// =============================================================

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  // Local state: flips to true after a successful resetPassword() call.
  // When true, we hide the form and show the "check your email" message.
  // This is a common pattern for actions that trigger an async side-effect
  // (email send) where there is no page to navigate to immediately.
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  // =============================================================
  // onSubmit
  // =============================================================
  // Submit handler.
  //
  // Steps:
  //   1. try: await resetPassword(data.email)
  //   2. On success: setEmailSent(true)
  //      Note: no toast needed here - the success UI replaces the form
  //   3. catch (error): toast.error(error instanceof Error ? error.message : 'Something went wrong')
  //
  // Why no toast on success?
  //   The component renders a full confirmation UI when emailSent is true.
  //   A toast would be redundant alongside that visual change.
  // =============================================================

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);

      setEmailSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  // =============================================================
  // SUCCESS STATE
  // =============================================================
  // When emailSent is true, render a confirmation message instead of the form.
  // The user has nothing else to do on this page - they need to check their email.
  // Early return keeps the logic clean - no nested ternaries in the JSX below.

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <MailCheck className="h-12 w-12 text-primary" />
        <div className="space-y-1">
          <p className="font-semibold">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to your email address.
            It may take a minute to arrive.
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>

      </form>
    </Form>
  );
}
