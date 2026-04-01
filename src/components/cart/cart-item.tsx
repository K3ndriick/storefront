'use client'

/**
 * CartItem
 *
 * Renders a single row in the cart for one product. Each row shows:
 * - Product image (thumbnail, links to product page)
 * - Product name, category, and a remove (X) button
 * - QuantityControl stepper wired to updateQuantity in the store
 * - Price display: line total (qty * effectivePrice), strikethrough original
 *   if on sale, and a per-unit "each" label
 * - A stock warning when the customer has reached the available stock limit
 *
 * Design decisions:
 * - Price snapshot: item.price and item.salePrice are copied from the product
 *   at add-time (in addItem). This means the displayed price is always what
 *   the customer saw when they added it, not the current DB price.
 *
 * - displayPrice uses nullish coalescing (??): item.salePrice ?? item.price.
 *   This handles three cases cleanly: salePrice is a number (use it),
 *   salePrice is null/undefined (fall back to price).
 *
 * - hasDiscount checks both that salePrice exists AND is less than price.
 *   The double check prevents showing a strikethrough if sale_price somehow
 *   equals or exceeds the regular price (data integrity guard).
 *
 * - The stock warning triggers at item.quantity >= item.stock (raw DB value),
 *   not maxQuantity. This means if stock is 3 and the customer has 3 in cart,
 *   the warning shows even though maxQuantity would be 3 too.
 *
 * - The QuantityControl onChange is an arrow function: (newQty) => updateQuantity(...)
 *   QuantityControl calls this with the new value when + or - is clicked.
 *   Passing updateQuantity directly would call it immediately during render.
 *
 * Usage:
 *   <CartItem item={cartItem} />
 */

import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantityControl } from './quantity-control'
import { useCartStore } from '@/store/useCartStore'
import type { CartItem as CartItemType } from '@/lib/types/cart'

type Props = {
  item: CartItemType
}

export function CartItem({ item }: Props) {
  // Pull updateQuantity and removeItem out of the cart store
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);


  // Calculate display values
  const displayPrice = item.salePrice ?? item.price;
  const hasDiscount = (item.salePrice && item.salePrice < item.price) ? true : false;

  return (
    <div className="flex gap-3 sm:gap-4 border-b pb-4 sm:pb-6 last:border-b-0">

      {/* Product image - links back to the product page */}
      <Link
        href={`/products/${item.slug}`}
        className="relative h-16 w-16 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden bg-muted"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="font-semibold hover:text-accent transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {item.category}
            </p>
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            className='h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-white'
            aria-label='Remove item'
            onClick={() => removeItem(item.productId)}
          >
            <X className='h-4 w-4'/>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          {/* Quantity stepper */}
          <QuantityControl
            value={item.quantity}
            onChange={(newQuantity) => updateQuantity(item.productId, newQuantity)}
            max={item.maxQuantity}
          />

          {/* Price */}
          <div className="sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-sm font-medium">
                ${(displayPrice * item.quantity).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">${displayPrice.toFixed(2)} each</p>
          </div>
        </div>

        {/* Stock warning - only show when the customer has maxed out available stock */}
        {item.quantity >= item.stock && (
          <p className="text-xs text-destructive">
            Only {item.stock} left in stock
          </p>
        )}
      </div>
    </div>
  )
}
