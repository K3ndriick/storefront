'use client'

import Image from 'next/image'
import { useCartStore } from '@/store/useCartStore'

export const OrderSummary = () => {
  const items = useCartStore(state => state.items)
  const subtotal = useCartStore(state => state.subtotal())
  const tax = useCartStore(state => state.tax())
  const shipping = useCartStore(state => state.shipping())
  const total = useCartStore(state => state.total())

  return (
    <div className="bg-card p-4 sm:p-6 border lg:sticky lg:top-16">
      <h3 className="text-xl font-bold mb-6">Order Summary</h3>

      {/* Line items */}
      <div className="space-y-4 mb-6">
        {items.map(item => {
          const effectivePrice = item.salePrice ?? item.price
          return (
            <div key={item.productId} className="flex gap-3">
              {item.image && (
                <div className="relative w-14 h-14 bg-muted shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold shrink-0">
                ${(effectivePrice * item.quantity).toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="space-y-2 border-t pt-4 text-sm">
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
          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-muted-foreground">
            Free shipping on orders over $1,000
          </p>
        )}
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
