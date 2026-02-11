/**
 * Product utility functions for pricing and stock calculations
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

type ProductPricing = {
  isOnSale: boolean
  displayPrice: number
  savingsPercent: number
}

type StockStatus = {
  inStock: boolean
  isLowStock: boolean
  message: string
  badgeVariant: 'default' | 'destructive' | 'warning' | 'success'
}

// ============================================
// PRICING CALCULATIONS
// ============================================
/**
 * Calculate product pricing information
 * @param price - Regular price
 * @param salePrice - Sale price (null if not on sale)
 * @returns Pricing object with isOnSale, displayPrice, and savingsPercent
 */
export function calculateProductPricing(price: number, salePrice: number | null): ProductPricing {
  // Calculate isOnSale
  const isOnSale = (salePrice == null ? false : true);

  // Calculate displayPrice
  const displayPrice = salePrice ?? price;

  // Calculate savingsPercent
  const savingsPercent = salePrice ? ((price - salePrice) / price) * 100 : 0;

  // Return object with all values
  return { isOnSale, displayPrice, savingsPercent };
}

// ============================================
// STOCK STATUS CALCULATIONS
// ============================================
/**
 * Determine stock status and appropriate messaging
 * @param inStock - Boolean indicating if product is in stock
 * @param stockQuantity - Current stock quantity
 * @param lowStockThreshold - Threshold for low stock warning
 * @returns Stock status object with messaging and badge variant
 */
export function getStockStatus(inStock: boolean, stockQuantity: number, lowStockThreshold: number): StockStatus {
  // Your implementation here:
  if (!inStock || stockQuantity === 0) {
    // STATE 1: Out of Stock
    return {
      inStock: false,
      isLowStock: false,
      message: "OUT OF STOCK",
      badgeVariant: 'destructive'
    }
  } else if (stockQuantity < lowStockThreshold) {
    // STATE 2: Low Stock (below threshold)
    return {
      inStock: true,
      isLowStock: true,
      message: `Only ${stockQuantity} left!`,
      badgeVariant: 'warning'
    }
  } else {
    // STATE 3: In Stock (plenty available)
    return {
      inStock: true,
      isLowStock: false,
      message: "In stock",
      badgeVariant: 'success'
    }
  }
}

// ============================================
// FORMAT HELPERS
// ============================================
/**
 * Format price for display
 * @param price - Price to format
 * @returns Formatted price string (e.g., "$1,299.99")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(price)
}