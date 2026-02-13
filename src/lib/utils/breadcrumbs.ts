import type { BreadcrumbItem } from '@/components/ui/breadcrumb';
import type { Product, ProductCategory } from '@/lib/types/products';

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
    {
      label: 'Home',  // Text: "Home"
      href: '/'       // Link: homepage
    },
  ]
  
  // Always add Products (with link to all products)
  breadcrumbs.push({
    label: 'Products',  // Text: "Products"
    href: '/products'   // Link: all products page
  })
    
  // If single category is selected
  if (searchParams.category) {
    // Capitalize the category name
    const categoryLabel = searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1);
    
    breadcrumbs.push({
      label: categoryLabel, // "Cardio", "Strength", etc.
      href: `/products?category=${searchParams.category}`
    })
  }
  
  // If multiple categories selected (Equipment section)
  else if (searchParams.categories) {
    breadcrumbs.push({
      label: 'Equipment',                                       // Text: "Equipment"
      href: `/products?categories=${searchParams.categories}` // Link with categories param
    })
  }
  
  // If viewing new arrivals
  else if (searchParams.new_arrival === 'true') {
    breadcrumbs.push({
      label: 'New Arrivals',              // Text: "New Arrivals"
      href: '/products?newArrivals=true'  // Link to new arrivals
    })
  }
  
  // If viewing bestsellers
  else if (searchParams.bestseller === 'true') {
    breadcrumbs.push({
      label: 'Best Sellers',              // Text: "Best Sellers"
      href: '/products?bestSellers=true'  // Link to best sellers
    })
  }
  
  // If viewing sale items
  else if (searchParams.onSale === 'true') {
    breadcrumbs.push({
      label: 'On Sale',               // Text: "On Sale"
      href: '/products?onSale=true'   // Link to on sale products
    })
  }
  
  // If searching
  else if (searchParams.search) {
    // Example: Search: "treadmill"
    breadcrumbs.push({
      label: `Search: "${searchParams.search}"`,      // Text: Search: "treadmill"
      href: `/products?search=${searchParams.search}` // Link to search results
    })
  }
  
  return breadcrumbs
}

/**
 * Generate breadcrumbs for individual product detail pages
 * 
 * Structure: Home > Products > [Category] > Product Name
 * 
 * Example: Home > Products > Cardio > Professional Treadmill X3000
 * 
 * @param product - Product object from database
 * @returns Array of breadcrumb items
 */
export function generateProductDetailBreadcrumbs(product: Product): BreadcrumbData[] {
  // Reuse existing category breadcrumb logic
  const categoryBreadcrumbs = generateProductBreadcrumbs({category: product.category});
  
  // Add product name at the end of breadcrumb
  categoryBreadcrumbs.push({
    label: product.name,
    href: `/products/${product.slug}`
  });
  
  return categoryBreadcrumbs;
}