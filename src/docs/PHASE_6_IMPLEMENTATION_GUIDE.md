# Phase 6: User Dashboard - Implementation Guide

**Project:** PowerProShop E-Commerce Platform
**Phase:** 6 - User Dashboard
**Created:** March 17, 2026
**Estimated Duration:** 6-8 hours
**Complexity:** Moderate
**Status:** 80% complete - addresses sub-page outstanding

---

## Quick Reference

**Prerequisites:** Phases 0-5 complete
**New Dependencies:** None (uses existing Supabase, shadcn/ui, Lucide)
**Database Tables:** `profiles` (existing), `addresses` (new - Step 5)
**New Server Actions:** `lib/actions/profile.ts`
**Route protection:** Already handled by `proxy.ts`

---

## Overview

### What We Built

A user account dashboard with a persistent sidebar layout and four sub-pages:

```
/dashboard                  -> redirects to /dashboard/orders
/dashboard/orders           -> full order history list
/dashboard/orders/[id]      -> single order detail view
/dashboard/profile          -> edit name and phone
/dashboard/settings         -> change password
/dashboard/addresses        -> (NOT YET BUILT - see Step 5)
```

### Business Value

- Self-service order history reduces support requests
- Profile management keeps customer data accurate
- Saved addresses (planned) speed up repeat checkout
- Gives customers a reason to create an account

---

## Architecture

### Server vs Client split

```
layout.tsx          (Server) - fetches user + profile name, renders DashboardSidebar
  DashboardSidebar  (Client) - uses usePathname() for active link highlighting
  page children     (Server) - each page fetches its own data where needed
    ProfileForm     (Client) - owns form state and submit logic
    ChangePasswordForm (Client) - owns password form state
    OrderCard       (Server-compatible) - pure display, no state
```

### Why this pattern?

The sidebar needs `usePathname()` (a hook) so it must be a Client Component.
But hooks cannot be called in Server Components, so the layout stays a Server
Component and simply passes the pre-fetched `userName` down as a prop.
This avoids an unnecessary client-side fetch.

---

## Files Created

```
New files (11):
  app/dashboard/layout.tsx
  app/dashboard/page.tsx
  app/dashboard/orders/page.tsx
  app/dashboard/orders/[id]/page.tsx
  app/dashboard/profile/page.tsx
  app/dashboard/settings/page.tsx
  components/dashboard/dashboard-sidebar.tsx
  components/dashboard/profile-form.tsx
  components/dashboard/change-password-form.tsx
  lib/actions/profile.ts

Modified files (2):
  components/orders/order-card.tsx   (updated link href, status badge tokens)
  app/globals.css                    (added badge-status-* utility classes)
```

---

## Implementation Steps

### STEP 1: Dashboard Layout (45 minutes)

The layout is a Server Component. It:
1. Fetches the current user via `supabase.auth.getUser()`
2. Queries the `profiles` table for their `full_name`
3. Renders the two-column layout (sidebar + main content area)

Route protection does NOT need to be done here - `proxy.ts` already
redirects unauthenticated users away from `/dashboard` before this runs.

**File:** `app/dashboard/layout.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar userName={profile?.full_name ?? null} />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
```

**File:** `app/dashboard/page.tsx`

The root `/dashboard` route has nothing to show itself - just redirect:

```typescript
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/dashboard/orders');
}
```

---

### STEP 2: Sidebar Navigation (30 minutes)

The sidebar is a Client Component because it needs `usePathname()` to
highlight the active nav item. It receives `userName` as a prop (already
fetched by the layout) rather than fetching it itself.

**File:** `components/dashboard/dashboard-sidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard/orders',   label: 'Orders',   icon: ShoppingBag },
  { href: '/dashboard/profile',  label: 'Profile',  icon: User        },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings    },
];

type Props = {
  userName: string | null;
};

export function DashboardSidebar({ userName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="mb-6 px-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Signed in as
        </p>
        <p className="font-semibold truncate">{userName ?? 'My Account'}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          // startsWith so /dashboard/orders/[id] still highlights "Orders"
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Why `startsWith` not `===`:**
Strict equality would de-highlight "Orders" when the user navigates to
`/dashboard/orders/some-id`. `startsWith` keeps the parent link active
for any child route underneath it.

---

### STEP 3: Order History Pages (1 hour)

#### 3a - Orders List

Server Component. Fetches all orders for the current user via the existing
`getUserOrders` action from Phase 5.

**File:** `app/dashboard/orders/page.tsx`

```typescript
import { getUserOrders } from '@/lib/actions/orders';
import { createClient } from '@/lib/supabase/server';
import { OrderCard } from '@/components/orders/order-card';

export default async function DashboardOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orders = await getUserOrders(user!.id);

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Order History</h2>
      {orders.map((order) => (
        <OrderCard order={order} key={order.id} />
      ))}
    </div>
  );
}
```

#### 3b - Order Detail

Server Component. Uses `getOrderById` from Phase 5 (returns `OrderWithItems`
with items already joined). RLS on the `orders` table means Supabase returns
`null` for any order not belonging to the current user - `notFound()` handles
both "doesn't exist" and "belongs to someone else".

**File:** `app/dashboard/orders/[id]/page.tsx`

```typescript
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/actions/orders';

type Props = {
  params: Promise<{ id: string }>;
};

const statusStyles: Record<string, string> = {
  pending:    'badge-status-pending',
  processing: 'badge-status-processing',
  shipped:    'badge-status-shipped',
  delivered:  'badge-status-delivered',
  cancelled:  'badge-status-cancelled',
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const date = new Date(order.created_at).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">

        <Link
          href="/dashboard/orders"
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
        >
          &larr; Back to orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
            <p className="text-sm text-muted-foreground mt-1">Placed on {date}</p>
          </div>
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${statusStyles[order.status]}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Items */}
        <div className="bg-card border p-6 mb-6">
          <h2 className="font-bold mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name}
                  <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card border p-6 mb-6">
          <h2 className="font-bold mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-card border p-6">
          <h2 className="font-bold mb-4">Shipped To</h2>
          <address className="text-sm not-italic text-muted-foreground space-y-1">
            <p>{order.shipping_name}</p>
            <p>{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
            <p>
              {order.shipping_city}
              {order.shipping_state ? `, ${order.shipping_state}` : ''}{' '}
              {order.shipping_postal_code}
            </p>
            <p>{order.shipping_country}</p>
          </address>
        </div>

      </div>
    </div>
  );
}
```

#### 3c - OrderCard component

**File:** `components/orders/order-card.tsx`

Displays a single order row. Links to `/dashboard/orders/[id]`.
Status badge uses `badge-status-*` utility classes from `globals.css`
(defined in the design system, not hardcoded Tailwind colors).

```typescript
import Link from 'next/link';
import type { Order } from '@/lib/types/order';

const statusStyles: Record<Order['status'], string> = {
  pending:    'badge-status-pending',
  processing: 'badge-status-processing',
  shipped:    'badge-status-shipped',
  delivered:  'badge-status-delivered',
  cancelled:  'badge-status-cancelled',
};

type Props = {
  order: Order;
};

export const OrderCard = ({ order }: Props) => {
  const date = new Date(order.created_at).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="block bg-card border p-6 hover:bg-accent/50 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-mono font-bold text-sm">{order.order_number}</p>
          <p className="text-xs text-muted-foreground mt-1">{date}</p>
        </div>
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
        <p className="font-bold">${order.total.toFixed(2)}</p>
      </div>
    </Link>
  );
};
```

---

### STEP 4: Profile & Settings Pages (1.5 hours)

#### 4a - Profile page

Server Component. Fetches the full profile row then passes it to
`ProfileForm` (Client Component) as a prop. Email comes from the
`auth.users` record, not the `profiles` table.

**File:** `app/dashboard/profile/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/dashboard/profile-form';

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Profile</h2>
      <ProfileForm profile={profile} email={user!.email!} />
    </div>
  );
}
```

#### 4b - Profile server action

**File:** `lib/actions/profile.ts`

Returns a `string | null` rather than throwing. This is intentional: the
ProfileForm (client) needs to display an inline error message. Returning a
value is cleaner than catching a thrown error across the server/client boundary.

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type UpdateProfileData = {
  full_name: string;
  phone: string | null;
};

export async function updateProfile(data: UpdateProfileData): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: data.full_name, phone: data.phone })
    .eq('id', user!.id);

  if (error) return `Failed to update profile: ${error.message}`;

  revalidatePath('/dashboard/profile');
  return null;
}
```

**Why `revalidatePath`?**
The profile page is a Server Component that fetches the profile on every
request. After a successful update, `revalidatePath` tells Next.js to
invalidate the cached version of that page so it re-fetches with fresh data
on the next visit.

#### 4c - ProfileForm (Client Component)

**File:** `components/dashboard/profile-form.tsx`

Owns the form state for full name and phone. Pre-fills fields from the
server-fetched profile. Calls `updateProfile` on submit.

```typescript
'use client';

import { useState } from 'react';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile } from '@/lib/types/auth';

type Props = {
  profile: Profile;
  email: string;
};

export function ProfileForm({ profile, email }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [phone,    setPhone]    = useState(profile.phone    ?? '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile({ full_name: fullName, phone });

    if (result) {
      setError(result);
    } else {
      setSuccess(true);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
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

      <div className="space-y-1">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+61 4XX XXX XXX"
        />
      </div>

      {error   && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Profile updated.</p>}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  );
}
```

#### 4d - Settings page and ChangePasswordForm

The settings page has no server-side data needs - just renders the form.

**File:** `app/dashboard/settings/page.tsx`

```typescript
import { ChangePasswordForm } from '@/components/dashboard/change-password-form';

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      <ChangePasswordForm />
    </div>
  );
}
```

**File:** `components/dashboard/change-password-form.tsx`

Unlike `ProfileForm`, this component throws on failure (via `updatePassword`
from `useAuth`), so it uses try/catch. Also does client-side validation
(password match check) before touching the server.

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePasswordForm() {
  const { updatePassword } = useAuth();
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState<string | null>(null);
  const [success,  setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Client-side check before hitting the server
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setSaving(false);
      return;
    }

    try {
      await updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
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
  );
}
```

---

### STEP 5: Saved Addresses Page (OUTSTANDING - ~2 hours)

This is the only remaining piece of Phase 6.

#### 5a - Database Schema

Execute in Supabase SQL Editor:

```sql
CREATE TABLE addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  label        TEXT,                              -- e.g. "Home", "Work"
  name         TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city         TEXT NOT NULL,
  state        TEXT,
  postal_code  TEXT NOT NULL,
  country      TEXT NOT NULL DEFAULT 'AU',
  phone        TEXT,
  is_default   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can do anything to their own addresses
CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### 5b - Address types

Add to `lib/types/index.ts` (or a new `lib/types/address.ts`):

```typescript
export type Address = {
  id: string;
  user_id: string;
  label: string | null;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
};
```

#### 5c - Address server actions

**File:** `lib/actions/addresses.ts`

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Address } from '@/lib/types/address';

export async function getUserAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user!.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createAddress(
  input: Omit<Address, 'id' | 'user_id' | 'created_at'>
): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If this is being set as default, clear the existing default first
  if (input.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user!.id);
  }

  const { error } = await supabase
    .from('addresses')
    .insert({ ...input, user_id: user!.id });

  if (error) return error.message;
  revalidatePath('/dashboard/addresses');
  return null;
}

export async function updateAddress(
  id: string,
  input: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>
): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (input.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user!.id);
  }

  const { error } = await supabase
    .from('addresses')
    .update(input)
    .eq('id', id)
    .eq('user_id', user!.id); // belt and braces alongside RLS

  if (error) return error.message;
  revalidatePath('/dashboard/addresses');
  return null;
}

export async function deleteAddress(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) return error.message;
  revalidatePath('/dashboard/addresses');
  return null;
}
```

#### 5d - Addresses page

**File:** `app/dashboard/addresses/page.tsx`

This page needs:
- A list of saved addresses (empty state if none)
- An "Add address" button/form
- Edit and delete controls on each card
- A "Set as default" action

Suggested structure (implement as needed):

```typescript
import { getUserAddresses } from '@/lib/actions/addresses';
import { AddressCard } from '@/components/dashboard/address-card';
import { AddAddressForm } from '@/components/dashboard/add-address-form';

export default async function DashboardAddressesPage() {
  const addresses = await getUserAddresses();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Saved Addresses</h2>

      {addresses.length === 0 ? (
        <p className="text-muted-foreground">No saved addresses yet.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}

      <AddAddressForm />
    </div>
  );
}
```

#### 5e - Add Addresses link to sidebar

Update `components/dashboard/dashboard-sidebar.tsx` to include Addresses
once the page is built:

```typescript
import { ShoppingBag, User, MapPin, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard/orders',    label: 'Orders',    icon: ShoppingBag },
  { href: '/dashboard/profile',   label: 'Profile',   icon: User        },
  { href: '/dashboard/addresses', label: 'Addresses', icon: MapPin      },
  { href: '/dashboard/settings',  label: 'Settings',  icon: Settings    },
];
```

---

## Design Patterns Used in Phase 6

### Error feedback pattern

Two different patterns are used depending on whether the action throws:

| Pattern      | Used in            | How it works |
|--------------|--------------------|--------------|
| Return value | ProfileForm        | Action returns `string or null`. Null = success, string = error message. |
| try/catch    | ChangePasswordForm | Action throws on failure. Catch the error and read `.message`. |

Both patterns set `success` and `error` state booleans/strings which
control inline feedback rendering. Neither uses a toast.

### Server/Client data handoff

Server Component fetches data -> passes to Client Component as props.

This is the standard Next.js App Router pattern for forms that need
pre-populated values. The Server Component has direct access to Supabase
(via server client), so data is available on first render without a
client-side round trip.

### Status badge tokens

Order status badges use design system utility classes, not hardcoded colors:

```typescript
const statusStyles = {
  pending:    'badge-status-pending',
  processing: 'badge-status-processing',
  shipped:    'badge-status-shipped',
  delivered:  'badge-status-delivered',
  cancelled:  'badge-status-cancelled',
}
```

These classes are defined in `app/globals.css` using CSS variable pairs
(`--status-pending-bg` / `--status-pending-fg`). See `DESIGN_DOC.md` for
the full status badge specification.

---

## Deviations from Original Plan

The `PHASES_6-10_IMPLEMENTATION_GUIDE.md` plan had some differences from
what was actually built. Notable deviations:

| Plan | Actual |
|------|--------|
| Orders page uses client-side `useState` + `useEffect` to fetch orders | Orders page is a Server Component - data fetched at request time, simpler |
| Status filter dropdown on orders page | Not implemented - plain list only |
| Profile uses `useToast` for feedback | Inline text feedback used instead (no toast) |
| Layout re-checks auth with `redirect()` inside layout | Auth handled entirely by `proxy.ts` - layout does not re-check |
| `useToast` from shadcn | Replaced by `sonner` toast library in auth forms; dashboard uses inline feedback |

---

## Testing Checklist

### Dashboard Layout
- [ ] Navigating to `/dashboard` redirects to `/dashboard/orders`
- [ ] Sidebar shows the user's full name
- [ ] Active nav link is highlighted correctly
- [ ] Sidebar active state updates when navigating between pages
- [ ] Layout is responsive (sidebar stacks above content on mobile)

### Orders
- [ ] Order history loads and displays all past orders
- [ ] Empty state message shows when user has no orders
- [ ] Each OrderCard links to the correct detail page
- [ ] Status badge shows correct color for each status
- [ ] Order detail shows all items with correct quantities and prices
- [ ] Order totals match (subtotal + tax + shipping = total)
- [ ] Shipping address renders correctly
- [ ] Back to orders link works
- [ ] Attempting to view another user's order returns 404

### Profile
- [ ] Form pre-fills with current profile values
- [ ] Email field is disabled and cannot be changed
- [ ] Full name and phone update successfully
- [ ] Success message appears after save
- [ ] Error message appears if update fails
- [ ] Navigating away and back shows updated values

### Settings
- [ ] New password and confirm password must match (client-side)
- [ ] Mismatched passwords show error before server is called
- [ ] Successful password change shows success message
- [ ] Fields are cleared after successful update
- [ ] New password works on next login

### Addresses (when built)
- [ ] Empty state shown when no addresses saved
- [ ] New address can be added
- [ ] Address can be edited
- [ ] Address can be deleted
- [ ] Default address toggle works
- [ ] Only one address can be default at a time
- [ ] Users cannot view or modify another user's addresses (RLS)

---

## Success Criteria

**Phase 6 is complete when:**

- [x] Dashboard layout with sidebar navigation renders correctly
- [x] Orders page shows full order history with status badges
- [x] Order detail page shows items, totals, and shipping address
- [x] Profile page allows editing full name and phone
- [x] Settings page allows changing password
- [x] All forms show inline success/error feedback
- [x] Sidebar active state highlights current page
- [x] Fully responsive on mobile
- [ ] Users can manage saved addresses (OUTSTANDING)

---

## Common Issues

### Issue: Layout shows wrong user name after profile update
**Solution:** `revalidatePath('/dashboard/profile')` is called in the action,
but the layout fetches `full_name` independently. If the layout is cached, the
name in the sidebar header won't update until a full page refresh. Consider
adding `revalidatePath('/dashboard')` to cover the layout.

### Issue: Active sidebar link not highlighting
**Solution:** Check that `usePathname()` is returning the expected path. If
the sidebar is rendered inside a server context by mistake, the hook won't
work - confirm `'use client'` is at the top of `dashboard-sidebar.tsx`.

### Issue: Order detail page shows 404 for valid order
**Solution:** Check RLS. The `getOrderById` action uses the server Supabase
client (authenticated as the current user). If the `orders` policy is wrong,
it will return null for all queries. Test the query directly in Supabase
SQL Editor using `SET LOCAL role = authenticated`.

### Issue: Password change fails silently
**Solution:** `updatePassword` is from `useAuth` which wraps Supabase Auth.
Supabase requires a minimum password length (default 6 characters). Check
the error message being caught - it may be a Supabase validation error.

---

## What Comes Next

**Phase 7: Product Reviews**
- Star ratings (1-5) per product
- Written review with title and body
- Verified purchase badge (linked to order history)
- Admin moderation queue (pending/approved/rejected)
- Review summary with average rating and distribution chart displayed on product pages

---

## Resources

- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Next.js App Router: https://nextjs.org/docs/app
- usePathname: https://nextjs.org/docs/app/api-reference/functions/use-pathname
- revalidatePath: https://nextjs.org/docs/app/api-reference/functions/revalidate-path

---

## Implementation Checklist

### Session 1: Layout and Navigation (1.5 hours)
- [ ] Create `app/dashboard/layout.tsx`
- [ ] Create `app/dashboard/page.tsx` (redirect)
- [ ] Create `components/dashboard/dashboard-sidebar.tsx`
- [ ] Verify sidebar renders and active states work

### Session 2: Order Pages (1.5 hours)
- [ ] Create `app/dashboard/orders/page.tsx`
- [ ] Create `app/dashboard/orders/[id]/page.tsx`
- [ ] Update `components/orders/order-card.tsx` (link href + badge classes)
- [ ] Test order history loads and order detail works

### Session 3: Profile and Settings (1.5 hours)
- [ ] Create `lib/actions/profile.ts`
- [ ] Create `components/dashboard/profile-form.tsx`
- [ ] Create `app/dashboard/profile/page.tsx`
- [ ] Create `components/dashboard/change-password-form.tsx`
- [ ] Create `app/dashboard/settings/page.tsx`
- [ ] Test profile update and password change

### Session 4: Addresses (2 hours) - OUTSTANDING
- [ ] Run database migration (addresses table)
- [ ] Create `lib/types/address.ts`
- [ ] Create `lib/actions/addresses.ts`
- [ ] Create `components/dashboard/address-card.tsx`
- [ ] Create `components/dashboard/add-address-form.tsx`
- [ ] Create `app/dashboard/addresses/page.tsx`
- [ ] Add Addresses link to sidebar nav items
- [ ] Test full CRUD

---

**Total Estimated Time:** 6-8 hours
**Completed:** ~5-6 hours (sessions 1-3)
**Remaining:** ~2 hours (session 4 - addresses)
