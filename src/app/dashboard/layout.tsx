/**
 * Dashboard Layout
 *
 * Server Component — fetches the current user server-side and passes
 * their name to the DashboardSidebar. The sidebar needs the name but
 * is a Client Component (for usePathname), so we fetch here and pass
 * it down as a prop instead of fetching inside the sidebar.
 *
 * Visual structure:
 *
 *   ┌─────────────────────────────────────────────┐
 *   │  Header (from root layout)                  │
 *   ├──────────────┬──────────────────────────────┤
 *   │              │                              │
 *   │   Sidebar    │   {children}                 │
 *   │   - Orders   │   (the active dashboard page)│
 *   │   - Profile  │                              │
 *   │   - Settings │                              │
 *   │              │                              │
 *   ├──────────────┴──────────────────────────────┤
 *   │  Footer (from root layout)                  │
 *   └─────────────────────────────────────────────┘
 */

import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // ============================================================
  // YOUR TASK: Fetch the current user's profile name
  //
  // You need to get the user's full_name to pass to the sidebar.
  //
  // Step 1: Create the Supabase server client
  //   const supabase = await createClient()
  //
  // Step 2: Get the current user
  //   const { data: { user } } = await supabase.auth.getUser()
  //   proxy.ts guarantees /dashboard routes are protected, so user
  //   is always non-null here — you can safely use user!
  //
  // Step 3: Fetch their profile row
  //   Query the 'profiles' table for the row where id = user!.id
  //   Select only the 'full_name' column (no need to fetch everything)
  //   Use .single() since there's exactly one profile per user
  //   Destructure: const { data: profile } = await supabase...
  //
  // Step 4: Pass profile?.full_name to DashboardSidebar below
  //   profile?.full_name uses optional chaining — if the query returned
  //   null for some reason, this safely returns undefined instead of crashing
  // ============================================================

  // TODO: const supabase = ...
  // TODO: const { data: { user } } = ...
  // TODO: const { data: profile } = ...


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Page heading */}
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* Two-column layout: sidebar left, content right */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar — pass the fetched name as a prop */}
          <DashboardSidebar
            userName={null /* replace null with profile?.full_name ?? null */}
          />

          {/* Main content area — renders the active dashboard page */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
