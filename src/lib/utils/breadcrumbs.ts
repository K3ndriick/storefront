import type { BreadcrumbItem } from '@/components/ui/breadcrumb';
import type { ProductCategory } from '@/lib/types/products';

// Define our own simple type for breadcrumb data
export type BreadcrumbData = {
  label: string
  href: string
}

type SearchParams = {
  category?: ProductCategory
  categories?: string
  search?: string
  new_arrival?: string
  bestseller?: string
  onSale?: string
}

/**
 * Generate breadcrumb items based on URL search params
 * 
 * Examples:
 * /products → [Home, Products]
 * /products?category=cardio → [Home, Products, Cardio]
 * /products?onSale=true → [Home, Products, Sale]
 */
export function generateProductBreadcrumbs(searchParams: SearchParams): BreadcrumbData[] {
  // Always start with Home
  const breadcrumbs: BreadcrumbData[] = [
    { label: 'Home', href: '/' },
  ]
  
  // Always add Products (with link to all products)
  breadcrumbs.push({
    label: 'Products',
    href: '/products'
  })
    
  // If single category is selected
  if (searchParams.category) {
    // Capitalize the category name
    const categoryLabel = searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1);
    
    breadcrumbs.push({
      label: categoryLabel,
      href: `/products?category=${searchParams.category}`
    })
  }
  
  // If multiple categories selected (Equipment section)
  else if (searchParams.categories) {
    breadcrumbs.push({
      label: 'Equipment', // Text: "Equipment"
      href: `/products?categories=${searchParams.categories}` // Link with categories param
    })
  }
  
  // If viewing new arrivals
  else if (searchParams.new_arrival === 'true') {
    breadcrumbs.push({
      label: 'New Arrivals',
      href: '/products?newArrivals=true'
    })
  }
  
  // If viewing bestsellers
  else if (searchParams.bestseller === 'true') {
    breadcrumbs.push({
      label: 'Best Sellers',
      href: '/products?bestSellers=true'
    })
  }
  
  // If viewing sale items
  else if (searchParams.onSale === 'true') {
    breadcrumbs.push({
      label: 'On Sale',
      href: '/products?onSale=true'
    })
  }
  
  // If searching
  else if (searchParams.search) {
    // TODO: Add search breadcrumb
    // Example: Search: "treadmill"
    breadcrumbs.push({
      label: `Search: "${searchParams.search}"`,
      href: `/products?search=${searchParams.search}`
    })
  }
  
  return breadcrumbs
}