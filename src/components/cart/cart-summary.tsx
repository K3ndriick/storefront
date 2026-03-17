'use client'

/**
 * CartSummary
 *
 * The order summary panel displayed beside the cart item list.
 * Shows a breakdown of subtotal, tax, shipping, and total,
 * plus a free shipping threshold indicator.
 *
 * This component reads computed values from the cart store - it never
 * calculates prices itself. The store owns all the math.
 *
 * Usage:
 *   <CartSummary />
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/useCartStore';

export function CartSummary() {
  // Pull subtotal, tax, shipping, and total from the cart store.
  const subtotal = useCartStore(state => state.subtotal());
  const tax = useCartStore(state => state.tax());
  const shipping = useCartStore(state => state.shipping());
  const total = useCartStore(state => state.total());

  // Free shipping threshold logic.
  // Free shipping kicks in at $1000 subtotal (defined in the store's shipping()).
  const FREE_SHIPPING_THRESHOLD = 1000;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      {/* Free shipping progress - only shown when not yet qualifying */}
      {amountToFreeShipping > 0 && (
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Add <span className="font-medium text-foreground">${amountToFreeShipping.toFixed(2)}</span> more for free shipping
        </div>
      )}

      {/* Price breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          {shipping === 0
            ? <span className="text-success font-medium">FREE</span>
            : <span>${shipping.toFixed(2)}</span>
          }
        </div>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {/* Checkout button */}
      <Button className="w-full" size="lg" asChild>
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>
    </div>
  )
}
