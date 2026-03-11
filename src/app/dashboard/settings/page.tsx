/**
 * Dashboard - Settings page
 *
 * No server-side data fetching needed - the password form starts empty.
 * This page just renders the form component.
 */

import { ChangePasswordForm } from '@/components/dashboard/change-password-form'

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      <ChangePasswordForm />
    </div>
  )
}
