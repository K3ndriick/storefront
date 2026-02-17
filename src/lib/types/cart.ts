/**
 * Represents a single item in the shopping cart.
 *
 * Notice we snapshot the product data at add-time (name, price, image).
 * This means the cart stays consistent even if the product changes in the DB.
 */
export type CartItem = {
  // -- Identification --
  productId: string   // UUID from database (used as the unique cart key)
  slug: string        // URL slug (so we can link back to the product page)

  // -- Display info --
  name: string
  image: string       // Resolved URL: primary_image ?? images[0] ?? ''
  category: string

  // -- Pricing (snapshot at add-time) --
  price: number         // Regular price
  salePrice?: number | null  // Sale price, if the product was on sale when added

  // -- Quantity management --
  quantity: number      // How many the customer wants
  stock: number         // Available stock at add-time (used for max enforcement)
  maxQuantity: number   // Math.min(stock, 10) — the ceiling we enforce

  // -- Metadata --
  addedAt: string       // ISO timestamp string
}

/**
 * Validation result returned from cart operations.
 * Used when you need to surface errors without throwing.
 */
export type CartValidationResult = {
  success: boolean
  error?: string
  maxQuantity?: number
}

/**
 * A snapshot of the cart's financial summary.
 * Useful if you ever need to pass totals around without calling store methods.
 */
export type CartSummary = {
  itemCount: number
  subtotal: number
  tax: number
  shipping: number
  total: number
}
