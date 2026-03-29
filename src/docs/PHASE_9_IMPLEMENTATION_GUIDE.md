# Phase 9: Admin Dashboard - Implementation Guide

**Project:** GymProShop E-Commerce & Business Management Platform
**Phase:** 9 - Admin Dashboard
**Created:** March 19, 2026
**Estimated Duration:** 10-12 hours
**Complexity:** Very High
**Status:** Not started — next to implement

---

## Quick Reference

**Prerequisites:** Phases 0-6 complete
**New Dependencies:** None (uses existing Supabase, shadcn/ui, Lucide, Recharts optional for charts)
**Database Changes:** `profiles.role` column (ALTER TABLE — no new tables for core modules)
**New Server Actions:** `lib/actions/admin/products.ts`, `orders.ts`, `users.ts`, `analytics.ts`
**New Helper:** `lib/supabase/admin.ts` (service role client — bypasses RLS)
**Route Protection:** Add `/admin` to `proxy.ts` protected routes

---

## Overview

### Why Phase 9 before 7 and 8

The original plan sequenced Reviews → Appointments → Admin. This guide implements Admin first for two reasons:

1. **Core admin modules are fully buildable today.** Product management, order management, analytics, and user management have all their data already — orders (Phase 5), products (Phase 2), profiles (Phase 4). None of these depend on Phase 7 or 8.

2. **Phases 7 and 8 depend on Phase 9 to be useful.** Reviews sit in `pending` forever without a moderation UI. Appointments are created with no way for the owner to view or act on them. Building admin first means 7 and 8 can ship complete on day one.

**Consequence:** Two admin modules (Review Moderation, Appointment Management) will be built as stubs in this phase — pages that exist with the correct routing and placeholder UI, ready to be fleshed out when Phase 7 and 8 are complete.

### What We're Building

| Module                    | Status | Depends on                   |
|---------------------------|--------|------------------------------|
| Analytics overview        | Full   | Orders, Products (exist)     |
| Product management (CRUD) | Full   | Products (exist)             |
| Order management          | Full   | Orders (exist)               |
| User management           | Full   | Profiles (exist)             |
| Review moderation         | Stub   | Phase 7 (reviews table)      |
| Appointment management    | Stub   | Phase 8 (appointments table) |

### Business Value

This phase is the most critical for the shop owner's day-to-day operations:

- Product CRUD means the owner can add/edit/remove products without a developer
- Order management means the owner can update shipping status and view all transactions
- Analytics gives at-a-glance business visibility from any device
- User management provides a customer directory

---

## Architecture

### Admin Route Structure

```
/admin                      -> analytics overview (home)
/admin/products             -> product list with search/filter
/admin/products/new         -> create new product
/admin/products/[id]/edit   -> edit existing product
/admin/orders               -> all orders (all users)
/admin/orders/[id]          -> order detail + status update
/admin/users                -> customer list
/admin/reviews              -> review moderation (stub — Phase 7)
/admin/appointments         -> appointment management (stub — Phase 8)
```

### Server vs Client Split

```
app/admin/layout.tsx         (Server) — role check, renders AdminSidebar
  AdminSidebar               (Client) — usePathname() for active state
  page children              (Server) — fetch data, pass to Client forms
    ProductForm              (Client) — form state for create/edit
    OrderStatusSelect        (Client) — dropdown to update status
    AnalyticsCards           (Server-compatible) — pure display
```

The pattern mirrors Phase 6's dashboard: Server Components fetch data, Client Components own interactivity. The admin layout does the role check (not `proxy.ts`) so the middleware stays lightweight.

### Why a Service Role Client

Admin pages need to read data across all users — all orders, all profiles, all reviews. The regular Supabase client respects RLS, which restricts customers to their own rows. Two options:

**Option A: Admin RLS policies** — Add a policy to each table: `USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`. Requires touching every table's policies.

**Option B: Service role client** — A second Supabase client initialised with `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. Used only in server actions (never in the browser). Simpler to maintain.

This guide uses **Option B**. The service role key is already in `.env.local` from Phase 5.

### Auth Flow for Admin

```
Request to /admin/*
  └─ proxy.ts: is user authenticated?
       ├─ No  → redirect /login?redirect=/admin
       └─ Yes → allow through
               └─ admin/layout.tsx: profiles.role === 'admin'?
                    ├─ No  → redirect /
                    └─ Yes → render admin UI
```

`proxy.ts` handles the auth gate (already protects `/dashboard`, just add `/admin`). The layout handles the role gate. This is cleaner than adding role logic to middleware.

---

## Files

```
New files (~21):
  lib/supabase/admin.ts
  lib/auth/admin-check.ts
  lib/types/admin.ts
  lib/actions/admin/analytics.ts
  lib/actions/admin/products.ts
  lib/actions/admin/orders.ts
  lib/actions/admin/users.ts
  app/admin/layout.tsx
  app/admin/page.tsx
  app/admin/products/page.tsx
  app/admin/products/new/page.tsx
  app/admin/products/[id]/edit/page.tsx
  app/admin/orders/page.tsx
  app/admin/orders/[id]/page.tsx
  app/admin/users/page.tsx
  app/admin/reviews/page.tsx           (stub)
  app/admin/appointments/page.tsx      (stub)
  components/admin/admin-sidebar.tsx
  components/admin/stat-card.tsx
  components/admin/product-form.tsx
  components/admin/order-status-select.tsx

Modified files (2):
  src/proxy.ts     (add /admin to protected routes)
  lib/types/index.ts  (export admin types)
```

---

## Implementation Steps

### STEP 1: Database Migration (10 minutes)

Execute in Supabase SQL Editor:

```sql
-- Add role column to profiles (safe to run even if column exists)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

-- Grant admin role to the shop owner account
-- Replace with the actual user ID from Supabase Auth > Users
UPDATE profiles
SET role = 'admin'
WHERE id = 'your-owner-user-id-here';

-- Verify
SELECT id, full_name, email, role FROM profiles WHERE role = 'admin';
```

No new tables are needed for this phase. Phase 7 and 8 will add their own tables when implemented.

---

### STEP 2: Admin Supabase Client (15 minutes)

The service role client bypasses RLS. It must only ever be used in Server Actions or Route Handlers — never imported into a Client Component.

**File:** `lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// This client bypasses Row Level Security.
// NEVER import this in a Client Component or expose it to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

**Why not reuse `createClient` from `lib/supabase/server`?**
The server client uses the anon key and inherits the authenticated user's RLS context. The admin client uses the service role key and has no RLS restrictions. They serve different purposes and must stay separate.

---

### STEP 3: Admin Auth Check (15 minutes)

**File:** `lib/auth/admin-check.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

// Returns true if the current session belongs to an admin user.
// Uses the regular server client (not admin) — we're just reading
// the current user's own profile, which RLS permits.
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}
```

---

### STEP 4: Update proxy.ts (5 minutes)

Add `/admin` to the list of protected routes so unauthenticated users are redirected to login.

**File:** `src/proxy.ts` — locate the protected routes array and add `/admin`:

```typescript
// Existing protected routes (Phase 4):
const protectedRoutes = ['/checkout', '/dashboard']

// Updated:
const protectedRoutes = ['/checkout', '/dashboard', '/admin']
```

This handles the auth gate only. The role check (admin vs customer) happens in the layout.

---

### STEP 5: Admin Types (10 minutes)

**File:** `lib/types/admin.ts`

```typescript
// Analytics summary shown on the overview page
export type AnalyticsSummary = {
  revenueThisMonth: number
  revenueAllTime: number
  ordersThisMonth: number
  ordersAllTime: number
  pendingOrders: number
  processingOrders: number
  lowStockCount: number
  totalProducts: number
  totalCustomers: number
}

// Flat product row for admin table (no joins needed)
export type AdminProduct = {
  id: string
  name: string
  slug: string
  sku: string | null
  category: string
  brand: string | null
  price: number
  sale_price: number | null
  stock_quantity: number
  low_stock_threshold: number
  in_stock: boolean
  featured: boolean
  images: string[]
  created_at: string
}

// Order row for admin table (includes customer email via join)
export type AdminOrder = {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  customer_email: string
  customer_name: string
}

// Customer row for admin user list
export type AdminUser = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
  order_count: number
}
```

Add to `lib/types/index.ts`:

```typescript
export * from './admin'
```

---

### STEP 6: Admin Server Actions (1 hour)

#### 6a — Analytics

**File:** `lib/actions/admin/analytics.ts`

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { AnalyticsSummary } from '@/lib/types/admin'

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Run queries in parallel
  const [
    { data: allOrders },
    { data: monthOrders },
    { data: products },
    { count: customerCount },
  ] = await Promise.all([
    supabase.from('orders').select('total, status'),
    supabase.from('orders').select('total').gte('created_at', startOfMonth),
    supabase.from('products').select('stock_quantity, low_stock_threshold, in_stock'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ])

  const revenueAllTime = allOrders?.reduce((sum, o) => sum + o.total, 0) ?? 0
  const revenueThisMonth = monthOrders?.reduce((sum, o) => sum + o.total, 0) ?? 0
  const pendingOrders = allOrders?.filter(o => o.status === 'pending').length ?? 0
  const processingOrders = allOrders?.filter(o => o.status === 'processing').length ?? 0
  const lowStockCount = products?.filter(
    p => p.stock_quantity <= p.low_stock_threshold
  ).length ?? 0

  return {
    revenueThisMonth,
    revenueAllTime,
    ordersThisMonth: monthOrders?.length ?? 0,
    ordersAllTime: allOrders?.length ?? 0,
    pendingOrders,
    processingOrders,
    lowStockCount,
    totalProducts: products?.length ?? 0,
    totalCustomers: customerCount ?? 0,
  }
}

export async function getRecentOrders(limit = 10) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at, shipping_name, shipping_email')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}
```

#### 6b — Products

**File:** `lib/actions/admin/products.ts`

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { AdminProduct } from '@/lib/types/admin'

export async function getAllProducts(): Promise<AdminProduct[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  return data
}

// Input type mirrors the products table fields that can be set via the form
type ProductInput = {
  name: string
  slug: string
  description: string | null
  price: number
  sale_price: number | null
  category: string
  brand: string | null
  sku: string | null
  stock_quantity: number
  low_stock_threshold: number
  in_stock: boolean
  featured: boolean
  images: string[]
}

export async function createProduct(input: ProductInput): Promise<string | null> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('products').insert(input)

  if (error) return error.message
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return null
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<string | null> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return error.message
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}/edit`)
  revalidatePath('/products')
  return null
}

export async function deleteProduct(id: string): Promise<string | null> {
  const supabase = createAdminClient()

  // Soft delete: mark out of stock and unfeatured rather than hard delete.
  // Hard delete would break order_items references and remove sales history.
  const { error } = await supabase
    .from('products')
    .update({ in_stock: false, featured: false, stock_quantity: 0 })
    .eq('id', id)

  if (error) return error.message
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return null
}

export async function updateStock(
  id: string,
  quantity: number
): Promise<string | null> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .update({
      stock_quantity: quantity,
      in_stock: quantity > 0,
    })
    .eq('id', id)

  if (error) return error.message
  revalidatePath('/admin/products')
  return null
}
```

**Why soft delete?** Hard-deleting a product that appears in `order_items` violates the foreign key constraint, and even if `ON DELETE CASCADE` were set it would destroy purchase history. Soft delete preserves the audit trail while hiding the product from the storefront (`in_stock: false` is already filtered out by the customer-facing `getProducts` action).

#### 6c — Orders

**File:** `lib/actions/admin/orders.ts`

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
type OrderStatus = typeof ORDER_STATUSES[number]

export async function getAllOrders() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at, shipping_name, shipping_email')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAdminOrderById(id: string) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('orders')
    .select(`*, items:order_items(*)`)
    .eq('id', id)
    .single()

  return data
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<string | null> {
  if (!ORDER_STATUSES.includes(status)) return 'Invalid status'

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return error.message
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return null
}
```

#### 6d — Users

**File:** `lib/actions/admin/users.ts`

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getAllUsers() {
  const supabase = createAdminClient()

  // Profiles joined with order counts
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, role, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Get order count per user in one query
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('user_id')

  const countMap = (orderCounts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.user_id] = (acc[row.user_id] ?? 0) + 1
    return acc
  }, {})

  return (profiles ?? []).map(p => ({
    ...p,
    order_count: countMap[p.id] ?? 0,
  }))
}
```

---

### STEP 7: Admin Layout + Sidebar (45 minutes)

The layout is a Server Component. It fetches the current user, confirms admin role, and renders the two-column shell. Non-admins are immediately redirected.

**File:** `app/admin/layout.tsx`

```typescript
import { redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/auth/admin-check'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect('/')

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**File:** `components/admin/admin-sidebar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  Calendar,
} from 'lucide-react'

const navItems = [
  { href: '/admin',              label: 'Overview',      icon: LayoutDashboard, exact: true },
  { href: '/admin/products',     label: 'Products',      icon: Package },
  { href: '/admin/orders',       label: 'Orders',        icon: ShoppingBag },
  { href: '/admin/users',        label: 'Customers',     icon: Users },
  { href: '/admin/reviews',      label: 'Reviews',       icon: Star },
  { href: '/admin/appointments', label: 'Appointments',  icon: Calendar },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-primary text-primary-foreground">
      <div className="p-6 border-b border-primary-foreground/20">
        <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-1">
          Admin
        </p>
        <p className="font-bold text-lg">GymProShop</p>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-foreground/15 text-primary-foreground'
                  : 'text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

**Why `exact: true` for Overview?** The Overview route is `/admin`. Without an exact match flag, `pathname.startsWith('/admin')` would always be true for every admin page, keeping Overview permanently highlighted. The `exact` flag switches it to `pathname === href` for that one route.

**Why dark sidebar?** Visual separation from the customer-facing site makes it immediately obvious the owner is in admin mode. Uses `bg-primary` (black) with inverted text — no new design tokens needed.

---

### STEP 8: Analytics Overview Page (1 hour)

**File:** `app/admin/page.tsx`

```typescript
import { getAnalyticsSummary, getRecentOrders } from '@/lib/actions/admin/analytics'
import { StatCard } from '@/components/admin/stat-card'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const [summary, recentOrders] = await Promise.all([
    getAnalyticsSummary(),
    getRecentOrders(8),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue this month"
          value={`$${summary.revenueThisMonth.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Orders this month"
          value={summary.ordersThisMonth.toString()}
        />
        <StatCard
          label="Pending orders"
          value={summary.pendingOrders.toString()}
          alert={summary.pendingOrders > 0}
        />
        <StatCard
          label="Low stock products"
          value={summary.lowStockCount.toString()}
          alert={summary.lowStockCount > 0}
          href="/admin/products"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total revenue" value={`$${summary.revenueAllTime.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`} />
        <StatCard label="Total orders"  value={summary.ordersAllTime.toString()} />
        <StatCard label="Products"      value={summary.totalProducts.toString()} href="/admin/products" />
        <StatCard label="Customers"     value={summary.totalCustomers.toString()} href="/admin/users" />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>

        <div className="bg-card border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.shipping_email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

**File:** `components/admin/stat-card.tsx`

```typescript
import Link from 'next/link'

type Props = {
  label: string
  value: string
  alert?: boolean
  href?: string
}

export function StatCard({ label, value, alert = false, href }: Props) {
  const content = (
    <div className={`bg-card border p-5 ${alert ? 'border-destructive/50' : ''}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold ${alert ? 'text-destructive' : ''}`}>{value}</p>
    </div>
  )

  if (href) {
    return <Link href={href} className="block hover:opacity-80 transition-opacity">{content}</Link>
  }

  return content
}
```

---

### STEP 9: Product Management (2.5 hours)

#### 9a — Product List

**File:** `app/admin/products/page.tsx`

```typescript
import Link from 'next/link'
import { getAllProducts } from '@/lib/actions/admin/products'
import { Button } from '@/components/ui/button'

export default async function AdminProductsPage() {
  const products = await getAllProducts()

  const lowStock = products.filter(p => p.stock_quantity <= p.low_stock_threshold)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {lowStock.length > 0 && (
            <p className="text-sm text-destructive mt-1">
              {lowStock.length} product{lowStock.length > 1 ? 's' : ''} low on stock
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/admin/products/new">+ Add Product</Link>
        </Button>
      </div>

      <div className="bg-card border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{product.category}</td>
                <td className="px-4 py-3 text-right">
                  {product.sale_price ? (
                    <span>
                      <span className="line-through text-muted-foreground mr-1">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-destructive">${product.sale_price.toFixed(2)}</span>
                    </span>
                  ) : (
                    `$${product.price.toFixed(2)}`
                  )}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${
                  product.stock_quantity <= product.low_stock_threshold
                    ? 'text-destructive font-bold'
                    : ''
                }`}>
                  {product.stock_quantity}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.in_stock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {product.in_stock ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

#### 9b — Product Form Component

This is the shared form used by both Create and Edit pages. It accepts an optional `product` prop — if provided it's pre-filled (edit mode), if absent it renders blank (create mode).

**File:** `components/admin/product-form.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, updateProduct } from '@/lib/actions/admin/products'
import type { AdminProduct } from '@/lib/types/admin'

type Props = {
  product?: AdminProduct  // undefined = create mode, defined = edit mode
}

export function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [name,              setName]              = useState(product?.name ?? '')
  const [slug,              setSlug]              = useState(product?.slug ?? '')
  const [description,       setDescription]       = useState(product?.description ?? '')
  const [price,             setPrice]             = useState(product?.price?.toString() ?? '')
  const [salePrice,         setSalePrice]         = useState(product?.sale_price?.toString() ?? '')
  const [category,          setCategory]          = useState(product?.category ?? '')
  const [brand,             setBrand]             = useState(product?.brand ?? '')
  const [sku,               setSku]               = useState(product?.sku ?? '')
  const [stockQuantity,     setStockQuantity]     = useState(product?.stock_quantity?.toString() ?? '0')
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.low_stock_threshold?.toString() ?? '5')
  const [inStock,           setInStock]           = useState(product?.in_stock ?? true)
  const [featured,          setFeatured]          = useState(product?.featured ?? false)

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  // Auto-generate slug from name (create mode only)
  function handleNameChange(value: string) {
    setName(value)
    if (!isEdit) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const input = {
      name,
      slug,
      description: description || null,
      price: parseFloat(price),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      category,
      brand: brand || null,
      sku: sku || null,
      stock_quantity: parseInt(stockQuantity),
      low_stock_threshold: parseInt(lowStockThreshold),
      in_stock: inStock,
      featured,
      images: product?.images ?? [],
    }

    const result = isEdit
      ? await updateProduct(product.id, input)
      : await createProduct(input)

    if (result) {
      setError(result)
      setSaving(false)
    } else {
      router.push('/admin/products')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Basic info */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Basic Information
        </h2>

        <div className="space-y-1">
          <Label>Name</Label>
          <Input value={name} onChange={e => handleNameChange(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <Label>Slug</Label>
          <Input value={slug} onChange={e => setSlug(e.target.value)} required
            className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground">URL: /products/{slug || '...'}</p>
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Category</Label>
            <Input value={category} onChange={e => setCategory(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Brand</Label>
            <Input value={brand} onChange={e => setBrand(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>SKU</Label>
          <Input value={sku} onChange={e => setSku(e.target.value)} className="font-mono" />
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Pricing
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Price ($)</Label>
            <Input
              type="number" step="0.01" min="0"
              value={price} onChange={e => setPrice(e.target.value)} required
            />
          </div>
          <div className="space-y-1">
            <Label>Sale Price ($) <span className="text-muted-foreground font-normal">optional</span></Label>
            <Input
              type="number" step="0.01" min="0"
              value={salePrice} onChange={e => setSalePrice(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Inventory
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Stock Quantity</Label>
            <Input
              type="number" min="0"
              value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required
            />
          </div>
          <div className="space-y-1">
            <Label>Low Stock Threshold</Label>
            <Input
              type="number" min="0"
              value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} required
            />
          </div>
        </div>
      </section>

      {/* Flags */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Visibility
        </h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)}
            className="w-4 h-4" />
          <span className="text-sm font-medium">Active (visible on storefront)</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
            className="w-4 h-4" />
          <span className="text-sm font-medium">Featured (shown on homepage)</span>
        </label>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

#### 9c — Create and Edit Pages

**File:** `app/admin/products/new/page.tsx`

```typescript
import { ProductForm } from '@/components/admin/product-form'

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm />
    </div>
  )
}
```

**File:** `app/admin/products/[id]/edit/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { getAdminProductById } from '@/lib/actions/admin/products'
import { ProductForm } from '@/components/admin/product-form'

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params
  const product = await getAdminProductById(id)

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  )
}
```

---

### STEP 10: Order Management (1 hour)

#### 10a — Order Status Select (Client Component)

This component handles the status dropdown and submits the update server-side.

**File:** `components/admin/order-status-select.tsx`

```typescript
'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/lib/actions/admin/orders'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

type Props = {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [status,  setStatus]  = useState(currentStatus)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleChange(newStatus: string) {
    setStatus(newStatus)
    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateOrderStatus(orderId, newStatus as typeof STATUSES[number])

    if (result) {
      setError(result)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        className="border rounded px-3 py-1.5 text-sm bg-background"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      {saving  && <span className="text-xs text-muted-foreground">Saving...</span>}
      {success && <span className="text-xs text-green-600">Saved</span>}
      {error   && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
```

#### 10b — Orders List

**File:** `app/admin/orders/page.tsx`

```typescript
import Link from 'next/link'
import { getAllOrders } from '@/lib/actions/admin/orders'

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="bg-card border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => {
              const date = new Date(order.created_at).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.shipping_email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{date}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

#### 10c — Order Detail with Status Update

**File:** `app/admin/orders/[id]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminOrderById } from '@/lib/actions/admin/orders'
import { OrderStatusSelect } from '@/components/admin/order-status-select'

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await getAdminOrderById(id)

  if (!order) notFound()

  const date = new Date(order.created_at).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">
          ← Orders
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
          <p className="text-muted-foreground text-sm mt-1">Placed {date}</p>
        </div>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Customer */}
      <div className="bg-card border p-6">
        <h2 className="font-semibold mb-3">Customer</h2>
        <p className="text-sm">{order.shipping_name}</p>
        <p className="text-sm text-muted-foreground">{order.shipping_email}</p>
        {order.shipping_phone && <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>}
      </div>

      {/* Items */}
      <div className="bg-card border p-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product_name}
                <span className="text-muted-foreground ml-1">×{item.quantity}</span>
              </span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span><span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span><span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-card border p-6">
        <h2 className="font-semibold mb-3">Ship To</h2>
        <address className="text-sm not-italic text-muted-foreground space-y-1">
          <p>{order.shipping_address_line1}</p>
          {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
          <p>
            {order.shipping_city}
            {order.shipping_state ? `, ${order.shipping_state}` : ''} {order.shipping_postal_code}
          </p>
          <p>{order.shipping_country}</p>
        </address>
      </div>
    </div>
  )
}
```

---

### STEP 11: User Management (30 minutes)

**File:** `app/admin/users/page.tsx`

```typescript
import { getAllUsers } from '@/lib/actions/admin/users'

export default async function AdminUsersPage() {
  const users = await getAllUsers()
  const customers = users.filter(u => u.role === 'customer')
  const admins = users.filter(u => u.role === 'admin')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {customers.length} customers · {admins.length} admin{admins.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-card border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-right px-4 py-3 font-medium">Orders</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(user => {
              const joined = new Date(user.created_at).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{user.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{user.order_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{joined}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

### STEP 12: Stub Pages (30 minutes)

These pages exist so the sidebar links work and the routes are in place. They will be replaced with full implementations during Phase 7 and Phase 8 respectively.

**File:** `app/admin/reviews/page.tsx`

```typescript
export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review Moderation</h1>
      <div className="bg-card border p-12 text-center">
        <p className="text-muted-foreground font-medium">Coming in Phase 7</p>
        <p className="text-sm text-muted-foreground mt-2">
          Product reviews will appear here for approval or rejection once Phase 7 is implemented.
        </p>
      </div>
    </div>
  )
}
```

**File:** `app/admin/appointments/page.tsx`

```typescript
export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <div className="bg-card border p-12 text-center">
        <p className="text-muted-foreground font-medium">Coming in Phase 8</p>
        <p className="text-sm text-muted-foreground mt-2">
          Service appointments will appear here for confirmation and management once Phase 8 is implemented.
        </p>
      </div>
    </div>
  )
}
```

---

## Design Patterns Used in Phase 9

### Service Role Client Pattern

```
Regular server client (lib/supabase/server.ts)
  Used by: customer pages, dashboard, proxy.ts
  Key:     NEXT_PUBLIC_SUPABASE_ANON_KEY
  RLS:     Respected — users see only their own data

Admin client (lib/supabase/admin.ts)
  Used by: lib/actions/admin/* only
  Key:     SUPABASE_SERVICE_ROLE_KEY
  RLS:     Bypassed — can read/write all rows
```

The admin client is never imported from a Client Component. It only exists in server-side action files. This is enforced by the `'use server'` directive at the top of each admin action file.

### Soft Delete Pattern

Products are never hard-deleted. Instead they are marked `in_stock: false, stock_quantity: 0`. This:

- Preserves `order_items` records (purchase history intact)
- Avoids foreign key violations
- Makes the product invisible on the storefront (existing `getProducts` filters on `in_stock`)

If a true removal is ever needed, it must be done directly in Supabase and only after verifying no order references exist.

### `exact` Flag on Sidebar Active State

The Overview link at `/admin` would permanently match `pathname.startsWith('/admin')` for all admin pages. The `exact: true` flag on that nav item switches it to strict equality (`pathname === '/admin'`), so it only highlights when actually on the overview page.

---

## What Comes Next (When to Fill the Stubs)

### Phase 7: Reviews
When the `reviews` table exists, replace `app/admin/reviews/page.tsx` with:
- A table of pending reviews (status = 'pending')
- Approve/Reject buttons calling server actions that update `status` and `moderated_by`
- A filter for pending/approved/rejected

The admin server action will follow the same service role client pattern established here.

### Phase 8: Appointments
When the `appointments` table exists, replace `app/admin/appointments/page.tsx` with:
- A list/calendar view of all appointments
- Status update (pending → confirmed → completed/cancelled)
- Admin notes field

The `OrderStatusSelect` component pattern (client component, calls server action on change) can be directly reused for appointment status updates.

---

## Testing Checklist

### Access Control
- [ ] Navigating to `/admin` while logged out redirects to `/login`
- [ ] Navigating to `/admin` as a customer account redirects to `/`
- [ ] Navigating to `/admin` as admin account loads correctly
- [ ] No admin route is accessible without the role check passing

### Analytics Overview
- [ ] All stat cards show correct numbers (cross-check against Supabase directly)
- [ ] Low stock card highlights red when count > 0
- [ ] Recent orders table shows the 8 most recent orders
- [ ] Clicking stat card links navigates to correct page

### Product Management
- [ ] All products listed in the table
- [ ] Low stock products highlighted in red
- [ ] Create new product — all fields save correctly
- [ ] Slug auto-generates from name in create mode
- [ ] Edit product — form pre-fills with existing values
- [ ] Marking inactive removes product from `/products` (storefront)
- [ ] Sale price displays strikethrough on list page
- [ ] Delete (soft) sets stock to 0 and hides from storefront
- [ ] Product still appears in past order records after soft delete

### Order Management
- [ ] All orders listed (not just current user's)
- [ ] Status dropdown updates correctly
- [ ] "Saved" confirmation appears after status change
- [ ] Order detail shows all items, totals, and shipping address
- [ ] Changing status reflects on the customer's dashboard order view

### User Management
- [ ] All customer accounts listed
- [ ] Order count per customer is accurate
- [ ] Admin accounts excluded from customer list

### Stub Pages
- [ ] `/admin/reviews` renders the placeholder without error
- [ ] `/admin/appointments` renders the placeholder without error
- [ ] Both appear in the sidebar as active when on their respective routes

---

## Common Issues

### Issue: Admin layout redirects to `/` even for the admin user
**Solution:** Check the `profiles` table. The `role` column may not exist yet (run the ALTER TABLE migration), or the admin user's `role` value may still be `'customer'`. Run the UPDATE query to set `role = 'admin'` for the correct user ID.

### Issue: Admin actions return all rows for one user but not all users
**Solution:** The admin action is likely importing `createClient` from `lib/supabase/server` instead of `createAdminClient` from `lib/supabase/admin`. RLS is restricting the query to the logged-in user's rows. Switch to the admin client.

### Issue: `SUPABASE_SERVICE_ROLE_KEY` is undefined in server action
**Solution:** The key must be in `.env.local` (not `.env`). Restart the dev server after adding it — Next.js does not hot-reload env changes.

### Issue: Slug collision on product create
**Solution:** The slug field has a unique constraint in the database. If two products have similar names, manually adjust the slug in the form. Consider appending a short random suffix to auto-generated slugs as a safeguard.

### Issue: Product form shows blank on edit page
**Solution:** The `params` object in Next.js 15+ App Router is a Promise. Make sure `params` is awaited: `const { id } = await params` before calling `getAdminProductById`.

### Issue: Overview revenue shows $0 despite orders existing
**Solution:** Check that `getAnalyticsSummary` is using `createAdminClient`. The `orders` table's RLS allows users to read only their own orders — even server-side, if the anon client is used, it will have no authenticated context and return nothing.

---

## Success Criteria

**Phase 9 is complete when:**

- [ ] Admin-only access enforced (auth gate + role gate)
- [ ] Analytics overview displays correct revenue, order counts, and stock alerts
- [ ] Products can be listed, created, edited, and soft-deleted
- [ ] Product stock and featured status can be updated
- [ ] All orders (across all customers) can be viewed
- [ ] Order status can be updated (pending → processing → shipped → delivered → cancelled)
- [ ] Customer list is accessible with order counts
- [ ] Review moderation stub renders without error
- [ ] Appointment management stub renders without error
- [ ] Admin sidebar active state highlights correctly
- [ ] All pages are responsive on mobile

---

## Implementation Checklist

### Session 1: Foundation (2 hours)
- [ ] Run database migration (add `role` column, set admin user)
- [ ] Create `lib/supabase/admin.ts`
- [ ] Create `lib/auth/admin-check.ts`
- [ ] Create `lib/types/admin.ts`
- [ ] Update `src/proxy.ts` to protect `/admin`
- [ ] Create `app/admin/layout.tsx`
- [ ] Create `components/admin/admin-sidebar.tsx`
- [ ] Verify admin login/redirect flow works end-to-end

### Session 2: Analytics + Users (2 hours)
- [ ] Create `lib/actions/admin/analytics.ts`
- [ ] Create `lib/actions/admin/users.ts`
- [ ] Create `components/admin/stat-card.tsx`
- [ ] Create `app/admin/page.tsx` (overview)
- [ ] Create `app/admin/users/page.tsx`
- [ ] Verify stat counts are correct

### Session 3: Product Management (3 hours)
- [ ] Create `lib/actions/admin/products.ts`
- [ ] Create `components/admin/product-form.tsx`
- [ ] Create `app/admin/products/page.tsx`
- [ ] Create `app/admin/products/new/page.tsx`
- [ ] Create `app/admin/products/[id]/edit/page.tsx`
- [ ] Test create, edit, soft delete, stock update

### Session 4: Order Management (2 hours)
- [ ] Create `lib/actions/admin/orders.ts`
- [ ] Create `components/admin/order-status-select.tsx`
- [ ] Create `app/admin/orders/page.tsx`
- [ ] Create `app/admin/orders/[id]/page.tsx`
- [ ] Test status update and detail view

### Session 5: Stubs + Polish (1 hour)
- [ ] Create `app/admin/reviews/page.tsx` (stub)
- [ ] Create `app/admin/appointments/page.tsx` (stub)
- [ ] Mobile responsive check across all admin pages
- [ ] Test full access control flow (logged out, customer, admin)

---

## Resources

- Supabase Service Role: https://supabase.com/docs/guides/api/api-keys
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- revalidatePath: https://nextjs.org/docs/app/api-reference/functions/revalidate-path

---

**Total Estimated Time:** 10-12 hours
**Next Phase:** Phase 7 (Product Reviews) — when complete, replace `app/admin/reviews/page.tsx` stub with full moderation UI
