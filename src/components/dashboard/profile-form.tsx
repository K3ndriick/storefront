'use client';

/**
 * ProfileForm
 *
 * Client Component - owns the form state and handles submission.
 * Receives the current profile values as props (fetched server-side
 * by the page) so the fields are pre-filled on first render.
 */

import { useState } from 'react';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile } from '@/lib/types/auth';

type Props = {
  profile: Profile
  email: string   // comes from the auth user, not the profile row
}

export function ProfileForm({ profile, email }: Props) {

  // Pre-fill state from the current profile values
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [phone,    setPhone]    = useState(profile.phone    ?? '');

  // UI state
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================================
  // Implement handleSubmit
  //
  // Think about:
  //   - What should happen at the start of submission? (hint: saving state)
  //   - Which server action do you call, and what do you pass it?
  //   - The action returns null on success or an error string on failure -
  //     how do you use that return value to update the UI?
  //   - What should be reset/cleared when you start a new submission?
  // ============================================================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess(false);

    const updatingProfileResult = await updateProfile({ full_name: fullName, phone: phone });

    if (updatingProfileResult) {
      setError(updatingProfileResult);
      setSaving(false);

      return "Unable to update user profile";
    } else {
      setSuccess(true);
      setSaving(false);

      return null;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">

      {/* Email - read-only, comes from Supabase Auth */}
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-muted text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
      </div>

      {/* Full name */}
      <div className="space-y-1">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+61 4XX XXX XXX"
        />
      </div>

      {/* Feedback messages */}
      {error   && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Profile updated.</p>}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save changes'}
      </Button>

    </form>
  )
}
