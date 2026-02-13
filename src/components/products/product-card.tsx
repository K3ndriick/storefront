'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types/products';

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  // Calculate if product is on sale
  const isOnSale = (product.sale_price == null ? false : true );
  
  // Determine which price to display
  const displayPrice = (isOnSale ? product.sale_price: product.price);
  
  // Calculate discount percentage (if on sale)
  // Only calculate if isOnSale is true
  const discountPercent = isOnSale && product.sale_price
    ? ((product.price - product.sale_price) / product.price) * 100
    : 0
  
  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Product Image - 80% of card space (Design Rule #2) */}
      <div className="aspect-square bg-muted overflow-hidden relative">
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="text-white font-semibold text-lg">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Product Image */}
        <Image
          src={product.primary_image || product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Sale Badge - Top Right */}
        {isOnSale && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-destructive text-destructive-foreground">
              SAVE {Math.round(discountPercent)}%
            </Badge>
          </div>
        )}


        {/* Category Badge - Top Left */}
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-accent text-accent-foreground uppercase text-xs">
            {product.category}
          </Badge>
        </div>
      </div>

      {/* Product Info - 20% of card space (Design Rule #2) */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2">
          {/* Current/Sale Price */}
          <span className="text-2xl font-bold">
            ${displayPrice}
          </span>

          {/* Original Price (crossed out if on sale) */}
          {/* TODO: Only show original price if product is on sale */}
          {isOnSale && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.price}
            </span>
          )}

        </div>

        {/* Stock Status */}
        <p className="text-sm text-muted-foreground mt-2">
          {!product.in_stock ? (
            "Out of stock"
          ) : product.stock_quantity < product.low_stock_threshold ? (
            `Only ${product.stock_quantity} left!`
          ) : (
            "In stock"
          )}
        </p>
      </div>
    </Link>
  )
}