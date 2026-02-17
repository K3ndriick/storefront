'use client'

/**
 * CartEmpty
 *
 * Shown when the cart has no items. Provides a clear call-to-action
 * to navigate back to the products page.
 *
 * This component has no logic - it renders only when the parent
 * (the cart page) determines items.length === 0.
 *
 * Usage:
 *   {items.length === 0 && <CartEmpty />}
 */

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="rounded-full bg-muted p-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground">
          Looks like you haven&apos;t added anything yet.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/products">Browse Products</Link>
      </Button>
    </div>
  )
}
