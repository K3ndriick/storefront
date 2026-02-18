/**
 * Auth Types
 *
 * This file defines all TypeScript types related to authentication.
 * These types are shared across:
 *   - lib/auth/AuthContext.tsx  (state management)
 *   - components/auth/*.tsx     (form components)
 *   - app/(auth)/*.tsx          (auth pages)
 *
 * We import Supabase's built-in types for User and Session so we
 * don't have to define those ourselves - Supabase already knows
 * what shape a logged-in user and session object take.
 */

import type { User, Session } from '@supabase/supabase-js'

// Re-export so other files only need to import from '@/lib/types'
export type { User, Session }

// =============================================================
// PROFILE TYPE
// =============================================================
// Represents a row in our public.profiles table.
// Your job: fill in the fields based on the SQL schema you wrote.
//
// Rules:
//   - Field names must exactly match the column names in the DB
//   - Use `string` for TEXT columns
//   - Use `string | null` for nullable TEXT columns (NULL allowed)
//   - Timestamps come back from Supabase as ISO strings (use string)
//
// Hint: Open 003_create_profiles_table.sql and look at the
//       column definitions - every column needs a field here.
// =============================================================

export type Profile = {
  id: string,
  email: string,
  full_name: string | null,
  phone: string | null,
  created_at: string,
  updated_at: string
}

// =============================================================
// AUTH CONTEXT TYPE
// =============================================================
// Describes everything the AuthContext exposes to the rest of the app.
// This is already complete - study it to understand what the context
// provides before you build the context itself.
//
// Reading guide:
//   - State fields (user, profile, session, loading) are read-only values
//   - Method fields (signUp, signIn, etc.) are async functions
//   - Promise<void> means: "returns a Promise, resolves with nothing"
//   - Methods throw an error on failure (caller must use try/catch)
// =============================================================

export type AuthContextType = {
  // --- State ---
  user: User | null            // The Supabase auth user (null if logged out)
  profile: Profile | null      // Our profiles table row (null if logged out)
  session: Session | null      // The active session with tokens (null if logged out)
  loading: boolean             // True while auth state is being determined on page load

  // --- Methods ---
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  // Partial<Profile> means: an object with any subset of Profile fields
  // e.g. { full_name: 'New Name' } or { phone: '0412345678' }
}

// =============================================================
// FORM DATA TYPES
// =============================================================
// Each auth form collects different data from the user.
// Your job: define what fields each form needs.
//
// Rules:
//   - All form fields are strings (inputs always return strings)
//   - Think about what each form actually asks the user to fill in
//   - These types will be used by React Hook Form for type-safe forms
//
// Hint: Look at the form designs in PHASE_4_IMPLEMENTATION_GUIDE.md
//       and the Supabase methods in AuthContextType above for clues.
// =============================================================

// Login form - what does a user need to enter to log in?
export type LoginFormData = {
  email: string,
  password: string,
}

// Signup form - what does a user need to enter to create an account?
// Note: includes a confirm password field for validation purposes
export type SignupFormData = {
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
}

// Forgot password form - what does a user enter to request a reset email?
export type ForgotPasswordFormData = {
  email:string
}

// Reset password form - what does a user enter when setting their new password?
// Note: shown on the /forgot-password/confirm page after clicking the email link
export type ResetPasswordFormData = {
  newPassword: string,
  confirmNewPassword: string
}

// Update profile form - what fields can a user edit on their profile page?
// Note: email is NOT editable here (Supabase handles email changes separately)
// Note: password is NOT editable here (separate flow)
export type UpdateProfileFormData = {
  fullName: string,
  phone: string
}
