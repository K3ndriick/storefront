// Server component - no 'use client' needed.
// Reads order_id from the URL search params, fetches the order, and renders confirmation.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/actions/orders';
import type { OrderWithItems } from '@/lib/types/order';

// In Next.js 15, both params and searchParams are Promises - must be awaited.
type Props = {
  searchParams: Promise<{ order_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {

  // TODO: implement the data fetching
  //
  // 1. Await searchParams to get the object, then extract order_id from it
  //    Hint: look at how params is awaited in products/[slug]/page.tsx
  //    The key name in the URL is order_id, so destructure it:
  //      const { order_id: orderId } = await searchParams
  //
  // 2. If there is no orderId, call notFound()
  //    (someone navigated here directly without a valid order)
  //
  // 3. Call getOrderById(orderId) - it returns OrderWithItems | null
  //    Store the result in a variable typed as OrderWithItems | null
  //
  // 4. If the order is null, call notFound()
  const { order_id: orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-2xl mx-auto px-4">

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">&#10003;</div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order reference */}
        <div className="bg-card border p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Order number</span>
            <span className="font-mono font-bold">{order.order_number}</span>
          </div>
        </div>

        {/* Items */}
        <div className="bg-card border p-6 mb-6">
          <h2 className="font-bold mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name}
                  <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                </span>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost breakdown */}
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

        {/* Shipping address */}
        <div className="bg-card border p-6 mb-8">
          <h2 className="font-bold mb-4">Shipping To</h2>
          <address className="text-sm not-italic text-muted-foreground space-y-1">
            <p>{order.shipping_name}</p>
            <p>{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
            <p>{order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ''} {order.shipping_postal_code}</p>
            <p>{order.shipping_country}</p>
          </address>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/products"
            className="flex-1 text-center border px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 text-center bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View My Orders
          </Link>
        </div>

      </div>
    </div>
  )
}
