// ============================================================
// ORDER TYPES
// ============================================================

export type Order = {
  // Identity fields
  id: string,
  user_id: string,
  order_number: string,

  // Status
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',

  // Pricing fields
  subtotal: number,
  tax: number,
  shipping: number,
  total: number,

  // Shipping address fields
  // (hint: look at the schema - some are required, some are optional i.e. nullable)
  shipping_name: string,
  shipping_email: string,
  shipping_phone: string | null,
  shipping_address_line1: string,
  shipping_address_line2: string | null,
  shipping_city: string,
  shipping_state: string | null,
  shipping_postal_code: string,
  shipping_country: string

  // Logistics fields (nullable - not filled until admin processes the order)
  tracking_number: string | null,
  shipping_provider: string | null,
  shipped_at: string | null,

  // Stripe fields
  stripe_payment_intent_id: string | null,
  payment_status: 'pending' | 'succeeded' | 'failed',

  // Timestamps (Supabase returns these as ISO strings)
  created_at: string,
  updated_at: string
}

// ============================================================
// ORDER ITEM TYPE
// ============================================================
// This represents a single product line within an order.
// It lives in the order_items table, linked to orders via order_id.

export type OrderItem = {
  id: string,
  order_id: Order['id'], // referencing Order type's id
  product_id: string,
  product_name: string, // (snapshot of name at time of purchase)
  product_image: string | null, // nullable dependent on existence of image in DB
  price: number, // (price at time of purchase - not current product price)
  quantity: number,
  created_at: string
}

// ============================================================
// COMBINED TYPE
// ============================================================
// An order with its items already joined - used on the order detail page.

export type OrderWithItems = Order & {
  items: OrderItem[]
}

// ============================================================
// SHIPPING ADDRESS TYPE
// ============================================================
// Used in the checkout form before an order is created.

export type ShippingAddress = {
  name: string,
  email: string,
  phone: string | null,
  address_line1: string,
  address_line2: string | null,
  city: string,
  state: string | null,
  postal_code: string,
  country: string
}
