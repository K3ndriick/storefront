export interface Product {
  // Primary key
  id: string 
  
  // Basic info
  name: string
  slug: string
  description: string | null
  short_description: string | null
  
  // Pricing
  price: number
  sale_price: number | null
  cost_price: number | null
  
  // Categorization
  category: 'cardio' | 'strength' | 'weights' | 'accessories' | 'recovery'
  subcategory: string | null
  brand: string | null
  
  // Inventory
  sku: string | null
  in_stock: boolean
  stock_quantity: number
  low_stock_threshold: number
  
  // Media
  images: string[]
  primary_image: string | null
  
  // Marketing flags
  featured: boolean
  new_arrival: boolean
  bestseller: boolean
  
  // Metadata
  created_at: string
  updated_at: string
  deleted_at: string | null
  
  // Search (we won't use this in TypeScript much)
  search_vector: string | null
}

// Utility type: Product without sensitive data (for client-side)
export type PublicProduct = Omit<Product, 'cost_price'>

// Utility type: Product creation (fields needed to create new product)
export type CreateProduct = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'search_vector'>

// Type for category filter
export type ProductCategory = Product['category']  // 'cardio' | 'strength' | ...