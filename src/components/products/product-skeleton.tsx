import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loader for a single product card
 * Should match the structure of ProductCard component
 */
export function ProductSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Image Skeleton - should be square (aspect-square) */}
      <Skeleton className="aspect-square" />

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Category Badge Skeleton */}
        <Skeleton className="h-4 w-20" />
         {/* Price Skeleton */}
        <Skeleton className="h-5 w-full" />
        {/* Stock Status Skeleton */}
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  )
}

/**
 * Grid of product skeletons
 * Shows 9 skeleton cards in the same layout as real products
 */
export function ProductGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
