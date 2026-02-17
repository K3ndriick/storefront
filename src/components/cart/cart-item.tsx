'use client'

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
    <div className="flex gap-4 border-b pb-6 last:border-b-0">

      {/* Product image - links back to the product page */}
      <Link
        href={`/products/${item.slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
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
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              href={`/products/${item.slug}`}
              className="font-semibold hover:text-accent transition-colors"
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
            className='h-8 w-8 text-muted-foreground hover: text-destructive'
            aria-label='Remove item'
            onClick={() => removeItem(item.productId)}
          >
            <X className='h-4 w-4'/>
          </Button>
        </div>

        <div className="flex items-end justify-between gap-4">
          {/* Quantity + price row */}
          <QuantityControl
            value={item.quantity}
            onChange={(newQuantity) => updateQuantity(item.productId, newQuantity)}
            max={item.maxQuantity}
          />

          <span className="text-sm">
            ${(displayPrice * item.quantity).toFixed(2)}
          </span>

          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          )}

          <div className="text-xs text-muted-foreground">${displayPrice.toFixed(2)} each</div>
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
