// Server component - fetches and displays a single order's full details.
// proxy.ts already guarantees the user is authenticated before this renders.
// RLS on the orders table ensures users can only fetch their own orders.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/actions/orders'
import type { OrderWithItems } from '@/lib/types/order'

type Props = {
  params: Promise<{ id: string }>
}

// Maps each order status to a Tailwind colour for the badge
const statusStyles: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

export default async function OrderDetailPage({ params }: Props) {

  // Fetch the order
  //
  // 1. Await params to get the id:
  //      const { id } = await params
  //
  // 2. Call getOrderById(id) - returns OrderWithItems | null
  //    Store the result typed as OrderWithItems | null
  //
  // 3. If order is null, call notFound()
  //    (handles both missing orders and orders belonging to another user - RLS returns null)
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // ============================================================
  // RENDER
  // ============================================================

  const date = new Date(order.created_at).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">

        {/* Back link */}
        <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
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

        {/* Totals */}
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
        <div className="bg-card border p-6">
          <h2 className="font-bold mb-4">Shipped To</h2>
          <address className="text-sm not-italic text-muted-foreground space-y-1">
            <p>{order.shipping_name}</p>
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
    </div>
  )
}
