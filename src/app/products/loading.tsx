import { ProductGridSkeleton } from "@/components/products/product-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading state for products page
 * Shows while page.tsx fetches data from database
 * Matches the layout of the actual products page
 */
export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Skeleton */}
        {/* Small horizontal skeleton, h-4, w-48 (width for "Home > Products > Category") */}
        <Skeleton className="h-4 w-48 mb-8" />
        
        {/* Page Header Skeleton */}
        <div className="mb-12">
          {/* Title Skeleton */}
          <Skeleton className="h-10 w-64" />
          
          {/* Subtitle/Count Skeleton */}
          <Skeleton className="h-6 w-40 mt-4" />
        </div>

        {/* Product Grid Skeleton */}
        {/* Optional: Pass custom count (default is 9) */}
        <ProductGridSkeleton count={9} />
      </div>
    </div>
  )
}