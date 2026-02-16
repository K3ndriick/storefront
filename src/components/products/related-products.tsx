import { getRelatedProducts } from '@/lib/actions/related-products';
import { ProductCard } from '@/components/products/product-card';
import type { Product } from '@/lib/types/products';

/**
 * Component Props
 * 
 * Think about: What does this component need to know?
 * - The current product (to find similar ones)
 * - How many to show (optional, defaults to 4)
 */
interface RelatedProductsProps {
  currentProduct: Product
  limit?: number
}

/**
 * Related Products Component
 * 
 * This is a SERVER COMPONENT (no 'use client') as we're fetching data
 * 
 * Key differences from client components:
 * - Can use async/await directly
 * - Runs on server (SEO-friendly)
 * - Can call server actions
 * - Cannot use useState, useEffect, etc.
 */
export async function RelatedProducts({ currentProduct, limit = 4 }: RelatedProductsProps) {
  // ==================== FETCH DATA ====================
  
  /**
   * Fetch related products
   */
  const relatedProducts = await getRelatedProducts(currentProduct, limit);

  // ==================== EARLY RETURN ====================
  
  /**
   * Handle empty state
   * 
   * What if no related products are found?
   * 
   * Condition: If relatedProducts is empty or null
   * Action: Return null (don't show section at all)
   */
  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  // ==================== RENDER ====================

  return (
    <section className="mt-16 lg:mt-24 border-t pt-16">

      {/* ==================== HEADER ==================== */}
      <div className="mb-8">
        <h2 className='text-3xl font-bold'>You may also like</h2>
        <p className='text-muted-foreground'>
          {`Similar products in ${currentProduct.category}`}
        </p>
      </div>

      {/* ==================== PRODUCT GRID ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </section>
  )
}

/**
 * ============================================================================
 * UNDERSTANDING SERVER COMPONENTS
 * ============================================================================
 * 
 * 1. SERVER COMPONENT (no 'use client'):
 *    - Runs on server during page build
 *    - Can be async
 *    - Can directly fetch data
 *    - HTML sent to browser (fast!)
 *    
 *    Client Component ('use client'):
 *    - Runs in browser
 *    - Cannot be async
 *    - Uses hooks (useState, etc.)
 *    - JavaScript sent to browser
 * 
 * 2. WHY ASYNC/AWAIT WORKS HERE:
 *    Server components can be async functions!
 *    
 *    export async function RelatedProducts() {
 *      const data = await fetchData()  ← Works!
 *      return <div>{data}</div>
 *    }
 *    
 *    This doesn't work in client components!
 * 
 * 3. SEO BENEFITS:
 *    - Related products rendered on server
 *    - Google sees the full HTML
 *    - Better for search rankings
 *    - Faster initial load
 * 
 * 4. WHEN TO USE SERVER VS CLIENT:
 *    Server Component:
 *    - Fetching data
 *    - Static content
 *    - No interactivity
 *    
 *    Client Component:
 *    - User interactions (clicks, typing)
 *    - State management (useState)
 *    - Browser APIs (localStorage)
 * 
 * 5. THIS COMPONENT'S FLOW:
 *    User views product page
 *    → Server renders page
 *    → RelatedProducts component runs on server
 *    → Fetches data from database
 *    → Renders HTML
 *    → Sends complete HTML to browser
 *    → User sees related products (instant!)
 * 
 * ============================================================================
 */


export async function RelatedProductsScroll({ currentProduct, limit = 4 }) {
  const relatedProducts = await getRelatedProducts(currentProduct, limit);

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }
  
  return (
  <section className="mt-16 lg:mt-24 border-t pt-16">
    <div className="mb-8">
      <h2 className="text-3xl font-bold">You May Also Like</h2>
    </div>
    
    { /* Horizontal scroll on mobile, grid on desktop */ } 
    <div className="overflow-x-auto lg:overflow-x-visible pb-4">
      <div className="flex gap-6 lg:grid lg:grid-cols-4 lg:gap-8 min-w-max lg:min-w-0">
        {relatedProducts.map((product) => (
          <div key={product.id} className="w-[280px] lg:w-auto flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}
