'use client';

/**
 * auth-context
 *
 * Provides global authentication state and methods to the entire app.
 *
 * Two things are exported:
 *   1. AuthProvider  - wrap the app with this in layout.tsx
 *   2. useAuth       - call this in any component to access auth state
 *
 * Data flow:
 *   Supabase Auth (source of truth)
 *     -> AuthContext state (user, profile, session, loading)
 *       -> Any component that calls useAuth()
 *
 * On page load:
 *   1. getSession()           - check if a session already exists in cookies
 *   2. fetchProfile(userId)   - load their profile row from the DB
 *   3. onAuthStateChange()    - listen for future login/logout events
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AuthContextType, Profile } from '@/lib/types';
import type { User, Session } from '@supabase/supabase-js';

// =============================================================
// 1. CREATE THE CONTEXT
// =============================================================
// createContext creates an empty "container" for our auth state.
// undefined means: "no value yet" - we detect this in useAuth()
// to warn developers who forget to add <AuthProvider> to layout.tsx.
// =============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================
// 2. AUTH PROVIDER COMPONENT
// =============================================================
// This component holds the state and logic.
// It wraps the app in layout.tsx so every child can access it.
// =============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {

  // --- State ---
  // These are the values components will read via useAuth()
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  // loading starts as true - we don't know the auth state yet on first render.
  // It becomes false once we've checked cookies and fetched the profile.
  // Components can use this to avoid rendering before auth is confirmed.

  const router = useRouter();
  const supabase = createClient();

  // --- On mount: check for existing session ---
  useEffect(() => {
    // Step 1: Check if the user already has a session (e.g. returning visitor)
    // getSession() reads the auth cookie that Supabase stored on last login
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // session?.user uses optional chaining: if session is null, don't crash
      // ?? null is the nullish coalescing operator: use null if the left side is undefined

      if (session?.user) {
        // User has an active session - load their profile from the DB
        fetchProfile(session.user.id);
      } else {
        // No session - auth check is done, set loading to false
        setLoading(false);
      }
    })

    // Step 2: Subscribe to future auth changes (login, logout, token refresh)
    // This fires whenever the auth state changes AFTER the initial check above
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    })

    // Cleanup: unsubscribe when the component unmounts
    // Without this, the listener would keep running after the component is gone
    return () => subscription.unsubscribe()
  }, [])
  // [] means this effect runs once on mount only - we only need one subscription

  // =============================================================
  // FETCH PROFILE
  // =============================================================
  // Loads the user's row from the public.profiles table.
  // Called after we confirm a session exists.
  // =============================================================

  const fetchProfile = async (userId: string) => {
    try {
      // Query the 'profiles' table for the row where id = userId
      //
      // The result comes back as: { data, error }
      // If error exists, throw it so the catch block handles it.
      // If data exists, call setProfile(data) to store it in state.
      // INTERNAL HELPER METHOD - errors logged, app continues

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setRole(data.role);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      // finally runs whether the try succeeded or the catch fired
      // Always set loading to false here - the auth check is complete either way
      setLoading(false);
    }
  }

  // =============================================================
  // AUTH METHODS
  // =============================================================
  // These wrap Supabase Auth calls and are exposed via context.
  // Components call these instead of calling Supabase directly.
  // All methods throw on error - the calling component handles it
  // with try/catch and shows a toast to the user.
  // =============================================================

  const signUp = async (email: string, password: string, fullName: string) => {
    // Call supabase.auth.signUp()
    //
    // signUp takes: { email, password, options }
    // options.data is what gets stored in raw_user_meta_data in auth.users
    // The handle_new_user trigger reads options.data.full_name to create the profile
    // METHOD CALLED BY UI - component decides how to handle the error

    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } }
    });

    if (error) {
      throw error;
    }
  }

  const signIn = async (email: string, password: string) => {
    // Call supabase.auth.signInWithPassword()
    //
    // signInWithPassword takes: { email, password }
    // Same pattern: destructure error from the result, throw if it exists.
    //
    // After a successful sign in, onAuthStateChange (above) will automatically
    // fire and update the user/session/profile state - you don't need to do it here.
    // METHOD CALLED BY UI - component decides how to handle the error

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }

  const signOut = async () => {
    // Call supabase.auth.signOut()
    //
    // After signing out:
    //   1. Throw if there's an error
    //   2. Redirect the user to the home page using router.push('/')
    //
    // Note: onAuthStateChange will fire and clear user/session/profile state automatically.
    // METHOD CALLED BY UI - component decides how to handle the error

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;    
    }

    router.push('/');
  }

  const resetPassword = async (email: string) => {
    // Call supabase.auth.resetPasswordForEmail()
    //
    // resetPasswordForEmail takes: (email, options)
    // options.redirectTo is the URL Supabase puts in the reset email link.
    // After clicking it, the user lands at that URL with a ?code= parameter.
    // Our /auth/callback route (built later) will handle the code exchange.
    //
    // Set redirectTo to:
    //   `${window.location.origin}/auth/callback?next=/forgot-password/confirm`https://mailtrap.io/inboxes/4399031/messages
    //
    // window.location.origin gives the base URL (e.g. 'http://localhost:3000')
    // so the full redirectTo becomes: 'http://localhost:3000/auth/callback?next=/forgot-password/confirm'

    const { error } = await supabase.auth.resetPasswordForEmail(
      email, { redirectTo: `${window.location.origin}/auth/callback?next=/forgot-password/confirm` });

    if (error) {
      throw error;
    }
  }

  const updatePassword = async (newPassword: string) => {
    // Call supabase.auth.updateUser() to set a new password.
    //
    // updateUser() updates the currently authenticated user's account data.
    // It takes an object - to change the password, pass: { password: newPassword }
    // The user must already be authenticated (the reset email link handled that via
    // the /auth/callback route which exchanged the code for a session).
    //
    // Same pattern as all other auth methods: destructure { error }, throw if it exists.

    const { error } = await supabase.auth.updateUser( { password: newPassword } );

    if (error) {
      throw error;
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    // Update the user's row in the profiles table
    //
    // Steps:
    //   1. If !user, throw new Error('No user logged in')
    //      (can't update a profile if nobody is signed in)
    //
    //   2. Use supabase to update the profiles table:
    //      supabase.from('profiles').update(updates).eq('id', user.id)
    //      The RLS policy ensures users can only update their own row.
    //
    //   3. If error, throw it
    //
    //   4. Re-fetch the profile so local state reflects the new values:
    //      await fetchProfile(user.id)
    if (!user) {
      throw new Error("No user logged in");
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

    if (error) {
      throw error;
    }

    await fetchProfile(user.id);
  }

  // =============================================================
  // 3. PROVIDE THE CONTEXT VALUE
  // =============================================================
  // This object is what components receive when they call useAuth().
  // It combines all the state and all the methods into one object.
  // =============================================================

  const value: AuthContextType = {
    // explicit form
    user: user,
    role: role,
    profile: profile,
    session: session,
    loading: loading,

    // alternatively can shorthand it from signUp: signUp to just signUp, works for methods as well

    // shorthand form
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// =============================================================
// 4. useAuth HOOK
// =============================================================
// This is what components import to access the auth state.
// The guard (if context === undefined) gives a clear error message
// if someone accidentally uses useAuth() outside of <AuthProvider>.
// =============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Did you forget to add <AuthProvider> to layout.tsx?')
  }
  return context
}
