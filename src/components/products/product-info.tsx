// components/products/product-info.tsx

import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from './add-to-cart-button'
import { calculateProductPricing, getStockStatus, formatPrice } from '@/lib/utils/product-helpers'
import type { Product } from '@/lib/types/products'

type ProductInfoProps = {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  // Calculate pricing and stock
  const { isOnSale, displayPrice, savingsPercent } = calculateProductPricing(product.price, product.sale_price);

  const stockStatus = getStockStatus(product.in_stock, product.stock_quantity, product.low_stock_threshold);
  
  return (
    <div className="space-y-6">
      {/* Display category badge */}
      <div>
        <Badge className='bg-accent text-accent-foreground uppercase text-xs'>
          {product.category}
        </Badge>
      </div>
      
      {/* Display product name */}
      <h1 className='text-4xl font-bold tracking-tight mb-2'>
        {product.name}
      </h1>
      
      {/* Display brand if available */}
      {product.brand && (
        <p className='text-sm text-muted-foreground'>
          by {product.brand}
        </p>
      )}
      
      {/* Display current price/sale price */}
      <div className="flex items-baseline gap-3">
        <p className='text-3xl font-bold'>
          {formatPrice(displayPrice)}
        </p>
        
        {/* Display original price if on sale */}
        {isOnSale && (
          <p className='text-xl text-muted-foreground line-through'>
            {formatPrice(product.price)}
          </p>
        )}
        
        {/* Display sale badge if on sale */}
        {isOnSale && (
        <Badge className='bg-destructive text-destructive-foreground pointer-events-none'>
          SAVE {Math.round(savingsPercent)}%
        </Badge>
        )}
      </div>
      
      {/* Display stock status badge */}
      <div>
        <Badge className={
          stockStatus.badgeVariant === 'destructive'
            ? 'bg-destructive text-destructive-foreground'
            : stockStatus.badgeVariant === 'warning'
            ? 'badge-status-pending'
            : 'badge-status-delivered'
        }>
          {stockStatus.message}
        </Badge>
      </div>
      
      {/* Display short description if available */}
      {(product.short_description != null) && (
        <p className='text-lg text-muted-foreground'>
          {product.short_description}
        </p>
      )}
      
      {/* Add to cart button */}
      <div className="pt-4">
        <AddToCartButton product={product} disabled={!stockStatus.inStock}/>
      </div>
      
      {/* Product description */}
      <div className="pt-6 border-t">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
          {product.description || "No description available."}
        </p>
      </div>
      
      {/* Product specifications */}
      <div className="pt-6 border-t">
        <h2 className="text-xl font-semibold mb-3">Specifications</h2>
        <dl className="space-y-2">
          {/* SKU */}
          {product.sku && (
            <div className="flex">
              <dt className="font-medium w-32">SKU:</dt>
              <dd className="text-muted-foreground">{product.sku}</dd>
            </div>
          )}
          
          {/* Category */}
          <div className="flex">
            <dt className="font-medium w-32">Category:</dt>
            <dd className="text-muted-foreground capitalize">{product.category}</dd>
          </div>
          
          {/* Brand */}
          {product.brand && (
            <div className="flex">
              <dt className="font-medium w-32">Brand:</dt>
              <dd className="text-muted-foreground">{product.brand}</dd>
            </div>
          )}
          
          {/* Subcategory */}
          {product.subcategory && (
            <div className="flex">
              <dt className="font-medium w-32">Subcategory:</dt>
              <dd className="text-muted-foreground">{product.subcategory}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}