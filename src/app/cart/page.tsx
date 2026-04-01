'use client'

/**
 * Cart Page  (/cart)
 *
 * The main shopping cart page. Reads the cart store directly since this
 * is a client component - there's no server-side data fetching needed,
 * the cart lives entirely in localStorage via Zustand persist.
 *
 * Layout:
 * - Empty cart: centered empty-state component
 * - Non-empty cart: responsive grid - item list (left) + order summary (right)
 *
 * Note: This page is 'use client' because it reads from the Zustand store.
 * Server components cannot access client-side state like localStorage.
 */

import { CartItem } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'
import { CartEmpty } from '@/components/cart/cart-empty'
import { useCartStore } from '@/store/useCartStore'

export default function CartPage() {
  // Read items from the cart store.
  // Note: items is plain state (an array), NOT a computed function,
  // so you do NOT need () here - just state.items

  const items = useCartStore(state => state.items);

  // If the cart is empty, show the empty state.
  // Use an early return: if items.length === 0, return <CartEmpty />
  if (items.length === 0) {
    return <CartEmpty/>
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      {/* Two-column layout: item list on left, summary on right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Cart items - takes up 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <div className="space-y-0">
            {/* Map over items and render a <CartItem> for each one.
                Each CartItem needs a `key` prop (use item.productId) and an `item` prop.
            */}
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
        </div>

        {/* Order summary - takes up 1/3 of the width on large screens */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>

      </div>
    </main>
  )
}
