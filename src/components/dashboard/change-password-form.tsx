'use client';

/**
 * ChangePasswordForm
 *
 * Client Component - uses the auth context to update the user's password.
 * Unlike ProfileForm, there's nothing to pre-fill, so no props needed.
 */

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export function ChangePasswordForm() {

  const { updatePassword } = useAuth();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================================
  // Implement handleSubmit
  //
  // This form is different from ProfileForm in two ways:
  //
  //   1. Client-side validation first
  //      Before calling anything, check that newPassword and
  //      confirmPassword match. If they don't, setError and return
  //      early - no need to hit the server.
  //
  //   2. updatePassword throws on failure (unlike updateProfile)
  //      Wrap the call in try/catch. On success, clear the fields.
  //      On failure, the caught error has a .message property.
  //
  // Think about what state needs resetting at the start, and what
  // should happen to `saving` when everything is done.
  // ============================================================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      try {
        await updatePassword(newPassword);

        setNewPassword("");
        setConfirmPassword("");
        setSuccess(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to change password');
      }
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">

      <div className="space-y-1">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min. 8 characters"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error   && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Password updated.</p>}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Update password'}
      </Button>

    </form>
  )
}
