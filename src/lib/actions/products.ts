/**
 * Product Server Actions
 * 
 * Server-side functions for fetching product data from Supabase.
 * These run on the server and can be called directly from Server Components.
 * 
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import type { Product, ProductFilters } from '@/lib/types/products';

/**
 * Get products from database with optional filtering and sorting
 * 
 * @param {ProductFilters} [filters] - Optional filters to apply
 * @param {ProductCategory} [filters.category] - Filter by single category
 * @param {ProductCategory[]} [filters.categories] - Filter by multiple categories (OR condition)
 * @param {object} [filters.priceRange] - Filter by price range
 * @param {number} [filters.priceRange.min] - Minimum price (inclusive)
 * @param {number} [filters.priceRange.max] - Maximum price (inclusive)
 * @param {string} [filters.search] - Full-text search query (searches name, description, brand)
 * @param {ProductSortOption} [filters.sortBy] - Sort order: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'best-seller'
 * @param {boolean} [filters.inStockOnly] - Only return products where in_stock = true
 * @param {boolean} [filters.featured] - Only return featured products
 * @param {boolean} [filters.onSale] - Only return products with a sale_price
 * 
 * @returns {Promise<Product[]>} Array of products matching the filters
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Get all products
 * const products = await getProducts()
 * 
 * @example
 * // Get cardio products under $500
 * const cardioProducts = await getProducts({
 *   category: 'cardio',
 *   priceRange: { min: 0, max: 500 }
 * })
 * 
 * @example
 * // Search for treadmills, sorted by price
 * const treadmills = await getProducts({
 *   search: 'treadmill',
 *   sortBy: 'price-asc'
 * })
 * 
 * @example
 * // Get featured products on sale
 * const featuredSale = await getProducts({
 *   featured: true,
 *   onSale: true
 * })
 */
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  // Create authenticated Supabase client (server-side)
  const supabase = await createClient();
  
  /**
   * Query Building Process:
   * 
   * 1. Start with base query: SELECT * FROM products WHERE deleted_at IS NULL
   * 2. Conditionally chain filter methods based on provided filters
   * 3. Each method adds a WHERE clause to the SQL query
   * 4. Execute the final composed query
   * 
   * Supabase Query Builder Pattern:
   * - Methods chain together: query.eq().gte().order()
   * - Each method returns the query object for further chaining
   * - Query doesn't execute until you await it
   * - Automatic SQL injection protection via parameterization
   */
  
  // Base query: Get all non-deleted products
  let query = supabase
    .from('products')          // FROM products
    .select('*')                // SELECT *
    .is('deleted_at', null)     // WHERE deleted_at IS NULL (soft delete filter)
  
  // =====================================================
  // FILTERS: Conditionally add WHERE clauses
  // =====================================================
  
  /**
   * Single Category Filter
   * SQL: WHERE category = 'cardio'
   * Use Case: Category page (/products?category=cardio)
   */
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  /**
   * Multiple Categories Filter (OR condition)
   * SQL: WHERE category IN ('cardio', 'strength')
   * Use Case: User selects multiple category checkboxes
   * Note: Overrides single category filter if both provided
   */
  if (filters?.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }
  
  /**
   * Full-Text Search
   * SQL: WHERE search_vector @@ to_tsquery('treadmill')
   * Uses: PostgreSQL full-text search with GIN index
   * Searches: name, description, brand (combined via trigger)
   * Features: Word stemming, relevance ranking, typo tolerance
   * Use Case: Search bar (/products?search=treadmill)
   */
  if (filters?.search) {
    query = query.textSearch('search_vector', filters.search)
  }
  
  /**
   * Price Range Filter
   * SQL: WHERE price >= 100 AND price <= 500
   * Use Case: Price slider filter
   */
  if (filters?.priceRange) {
    query = query
      .gte('price', filters.priceRange.min)  // Greater than or equal
      .lte('price', filters.priceRange.max)  // Less than or equal
  }
  
  /**
   * In Stock Filter
   * SQL: WHERE in_stock = true
   * Use Case: "Hide out of stock" toggle
   * Note: Uses .eq() for boolean comparison
   */
  if (filters?.inStockOnly) {
    query = query.eq('in_stock', true)
  }
  
  /**
   * Featured Products Filter
   * SQL: WHERE featured = true
   * Use Case: Homepage featured section
   */
  if (filters?.featured) {
    query = query.eq('featured', true)
  }
  
  /**
   * On Sale Filter
   * SQL: WHERE sale_price IS NOT NULL
   * Use Case: "Sale" page showing discounted items
   * Note: Products with sale_price are on sale, null means regular price
   */
  if (filters?.onSale) {
    query = query.not('sale_price', 'is', null)
  }
  
  // =====================================================
  // SORTING: Add ORDER BY clause
  // =====================================================
  
  /**
   * Sort Options:
   * - price-asc: Cheapest first (budget shoppers)
   * - price-desc: Most expensive first (premium shoppers)
   * - name-asc: A-Z alphabetical
   * - name-desc: Z-A alphabetical
   * - newest: Most recently added (uses created_at timestamp, not new_arrival flag)
   * - best-seller: Filter to bestsellers, then alphabetical
   */
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('price', { ascending: false })
        break
      case 'name-asc':
        query = query.order('name', { ascending: true })
        break
      case 'name-desc':
        query = query.order('name', { ascending: false })
        break
      case 'newest':
        // Sort by actual creation date (not new_arrival marketing flag)
        // created_at is objective timestamp, new_arrival is subjective label
        query = query.order('created_at', { ascending: false })
        break
      case 'best-seller':
        // First filter to bestsellers, then sort alphabetically
        query = query.eq('bestseller', true).order('name', { ascending: true })
        break
    }
  }
  
  // =====================================================
  // EXECUTE QUERY
  // =====================================================
  
  /**
   * Execute the composed query
   * - Sends SQL to PostgreSQL
   * - Returns { data, error }
   * - data is null if error
   * - error is null if successful
   */
  const { data, error } = await query
  
  // =====================================================
  // ERROR HANDLING
  // =====================================================
  
  if (error) {
    // Log error for debugging (server-side console)
    console.error('Error fetching products:', error);
    
    // Throw error to be caught by caller
    // In production, you might want custom error messages
    throw new Error('Failed to fetch products');
  }
  
  // Return products array (empty array if no results)
  // Type assertion ensures TypeScript knows this is Product[]
  return data || []
}
