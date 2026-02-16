'use server';

import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types/products';

/**
 * Get Related Products
 * 
 * Finds products similar to the given product for "You May Also Like" section.
 * 
 * Matching Strategy:
 * 1. Same category (must match)
 * 2. Similar price range (+/-30% of current product)
 * 3. Exclude current product (don't show the same item)
 * 4. In stock only (don't recommend unavailable products)
 * 5. Not deleted
 * 6. Limit to 4 products
 * 
 * @param currentProduct - The product being viewed
 * @param limit - How many related products to return (default: 4)
 * @returns Array of related products
 * 
 * We pass the whole product instead of just the ID as category and price are needed to do smart matching
 */
export async function getRelatedProducts(currentProduct: Product, limit: number = 4): Promise<Product[]> {
  // ==================== CREATE SUPABASE CLIENT ====================
  const supabase = await createClient();

  // ==================== CALCULATE PRICE RANGE ====================
  /**
   * Calculate price range for matching
   * 
   * We want products within +/-30% of current product's price.
   * 
   * Formula:
   * - priceVariance = 0.3 (represents 30%)
   * - minPrice = currentProduct.price * (1 - priceVariance)
   * - maxPrice = currentProduct.price * (1 + priceVariance)
   */
  const priceVariance = 0.3;
  const minPrice = currentProduct.price * (1 - priceVariance);
  const maxPrice = currentProduct.price * (1 + priceVariance);

  // ==================== BUILD QUERY ====================
  
  /**
   * Query the database
   * 
   * You need to chain these filters:
   * 1. .from('products')
   * 2. .select('*')
   * 3. .eq('category', currentProduct.category)  ← Same category
   * 4. .neq('id', currentProduct.id)             ← Not the current product
   * 5. .eq('in_stock', true)                     ← In stock only
   * 6. .is('deleted_at', null)                   ← Not deleted
   * 7. .gte('price', minPrice)                   ← Price >= min
   * 8. .lte('price', maxPrice)                   ← Price <= max
   * 9. .limit(limit)                             ← Limit results
   * 
   */

  // Base query: Get all non-deleted products
  let query = supabase
    .from('products')
    .select('*')  
    .is('deleted_at', null)
    .eq('in_stock', true)
    .eq('category', currentProduct.category)
    .neq('id', currentProduct.id)
    .gte('price', minPrice)
    .lte('price', maxPrice)
    .limit(limit)


  const { data, error } = await query;

  // ==================== ERROR HANDLING ====================
  if (error) {
    // Log error for debugging (server-side console)
    console.error('Error fetching products:', error);
    
    // Throw error to be caught by caller
    throw new Error('Failed to fetch products');
  }

  // ==================== RETURN RESULTS ====================
  return data || []
}

/**
 * ============================================================================
 * UNDERSTANDING THIS SERVER ACTION
 * ============================================================================
 * 
 * 1. WHAT IS 'use server'?
 *    - Marks this file as Server Actions
 *    - These functions ONLY run on the server
 *    - Never sent to the browser
 *    - Can safely access database
 *    
 *    Think about: Why is this secure?
 * 
 * 2. WHY ±30% PRICE RANGE?
 *    Too narrow (±10%):
 *    - Might find 0 products
 *    - Too restrictive
 *    
 *    Too wide (±100%):
 *    - $100 product shows $200 products
 *    - Not really "similar"
 *    
 *    Sweet spot (±30%):
 *    - $1000 product → $700-$1300 range
 *    - Similar price tier
 *    - Usually finds 3-4 matches
 * 
 * 3. QUERY EFFICIENCY:
 *    Order matters for performance!
 *    
 *    Good order (what we're doing):
 *    1. Filter by category (indexed, fast)
 *    2. Exclude current ID (quick)
 *    3. Filter by stock (boolean, fast)
 *    4. Filter by price range (indexed, fast)
 *    5. Limit results (stop early)
 *    
 *    Bad order:
 *    1. Scan ALL products first
 *    2. Then filter (slow!)
 * 
 * 4. WHY LIMIT TO 4?
 *    - Fits nicely in a grid (1, 2, or 4 columns)
 *    - Not overwhelming
 *    - Fast to load
 *    - Common e-commerce pattern
 * 
 * ============================================================================
 */