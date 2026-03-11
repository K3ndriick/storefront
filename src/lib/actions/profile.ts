'use server';

/**
 * Profile Server Actions
 *
 * Server-side mutations for the user's profile.
 * These run on the server - never exposed to the client bundle.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type UpdateProfileData = {
  full_name: string
  phone: string | null
}

/**
 * updateProfile
 *
 * Updates the signed-in user's row in the profiles table.
 * Returns an error message string on failure, or null on success.
 *
 * Why return a string instead of throwing?
 * The ProfileForm (client component) needs to display an inline
 * error message. Returning a value is cleaner than try/catching
 * a thrown error across the server/client boundary.
 */
export async function updateProfile(data: UpdateProfileData): Promise<string | null> {
  const supabase = await createClient();

  // ============================================================
  // Get the current user, then update their profile row
  //
  // Think about:
  //   - You need the user's id to know which row to update
  //   - The Supabase update pattern: .from(...).update({...}).eq(...)
  //   - What should you return if the update fails? If it succeeds?
  //   - revalidatePath('/dashboard/profile') should be called on
  //     success so Next.js re-fetches the page with fresh data
  // ============================================================

  // get the current user
  const { data: { user } } = await supabase.auth.getUser();

  // update the profiles table row for this user
  const { error } = await supabase
  .from('profiles')
  .update({full_name: data.full_name, phone: data.phone})
  .eq('id', user!.id)

  // return null on success, or an error message string on failure
    if (error) {
      return (`Failed to update user profile: ${error.message}`);
    } else {
      revalidatePath('/dashboard/profile');
      return null; // return null here because expected return type's Promise states return string or null
    }
}
