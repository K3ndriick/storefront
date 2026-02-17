/**
 * Cart Loading UI
 *
 * Next.js automatically shows this while the cart page is loading.
 * For a client-side cart, this mainly covers the brief hydration window
 * before Zustand re-hydrates state from localStorage.
 *
 * Uses a skeleton layout that mirrors the real cart structure so the
 * page doesn't flash a blank screen or jump layout on load.
 */

import { Skeleton } from '@/components/ui/skeleton'

export default function CartLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-9 w-48" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Cart item skeletons */}
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 border-b pb-6">
              <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
              <div className="flex flex-1 flex-col gap-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Order summary skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>

      </div>
    </main>
  )
}
