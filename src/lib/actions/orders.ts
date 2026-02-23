'use server';

import { createClient } from '@/lib/supabase/server';
import type { Order, OrderWithItems, ShippingAddress } from '@/lib/types/order';

// ============================================================
// INPUT TYPE
// Everything createOrder needs to build the order + items rows
// ============================================================

type CartItemInput = {
  product_id: string,
  product_name: string,
  product_image: string | null,
  price: number,
  quantity: number
}

type CreateOrderData = {
  user_id: string,
  cart_items: CartItemInput[],
  shipping_address: ShippingAddress,
  subtotal: number,
  tax: number,
  shipping: number,
  total: number,
  stripe_payment_intent_id: string
}

// ============================================================
// CREATE ORDER
// ============================================================

export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  const supabase = await createClient();

  // STEP 1 - Generate a unique, human-readable order number
  // Format: ORD-YYYYMMDD-XXXXXXXXX  (date + 9 random alphanumeric chars, uppercase)
  //
  // Hints:
  //   - new Date() gives you today
  //   - .getFullYear(), .getMonth() + 1, .getDate() give you the parts
  //   - String(month).padStart(2, '0') zero-pads single digit months (e.g. 1 → "01")
  //   - Math.random().toString(36) converts a random number to base-36 (0-9 + a-z)
  //   - .substring(2, 11) takes 9 chars from position 2 (skips "0.")
  //   - .toUpperCase() makes it look like a proper reference number
  //
  //  build the orderNumber string using the format above
  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, '0');
  let day = String(currentDate.getDate()).padStart(2, '0');
  let random9AlphaNumChars = Math.random().toString(36).substring(2, 11).toUpperCase();
  const orderNumber = `ORD-${year}${month}${day}${random9AlphaNumChars}`;

  // STEP 2 - Insert the order row into Supabase
  // Map every field from `data` and `data.shipping_address` to the DB column names.
  // Remember: ShippingAddress uses short names (e.g. `name`) but DB columns use
  // prefixed names (e.g. `shipping_name`) - you'll need to map them manually.
  //
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: data.user_id,
      order_number: orderNumber,
      status: 'pending',
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      shipping_name: data.shipping_address.name,
      shipping_email: data.shipping_address.email,
      shipping_phone: data.shipping_address.phone,
      shipping_address_line1: data.shipping_address.address_line1,
      shipping_address_line2: data.shipping_address.address_line2,
      shipping_city: data.shipping_address.city,
      shipping_state: data.shipping_address.state,
      shipping_postal_code: data.shipping_address.postal_code,
      shipping_country: data.shipping_address.country,
      stripe_payment_intent_id: data.stripe_payment_intent_id,
      payment_status: 'succeeded',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // STEP 3 - Build the order_items array and insert it
  // Each item in data.cart_items needs to become a row in order_items.
  // Use .map() with an arrow function to transform each CartItemInput.
  // Every row also needs the order_id from the order we just created above.
  //
  // Use .map() to build orderItems, then insert into 'order_items'
  let orderItems = data.cart_items.map((cartItemInput) => ({
    order_id: order.id,
    product_id: cartItemInput.product_id,
    product_name: cartItemInput.product_name,
    product_image: cartItemInput.product_image,
    product_price: cartItemInput.price,
    product_quantity: cartItemInput.quantity
  }));

  const { data: orderItemsData, error: orderItemsError } = await supabase
    .from('order_items')
    .insert({orderItems})
  
  if (orderItemsError) throw orderItemsError;
  

  // STEP 4 - Reduce stock for each item purchased
  // Loop through data.cart_items with for...of
  // For each item, call supabase.rpc('reduce_stock', { product_id, quantity })
  // This calls the atomic SQL function we wrote in the schema.
  //
  // TODO: write the for...of loop
  for (const cartItem of data.cart_items) {
    const { data: cartItem, error: cartItemError } = await supabase
      .rpc('reduce_stock', { cartItem.product_id, cartItem.product_quantity })
  }

  // STEP 5 - Return the created order
  return order
}

// ============================================================
// GET ORDER BY ID (with items joined)
// ============================================================

export const getOrderById = async (orderId: string): Promise<OrderWithItems | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single()

  if (error) return null
  return data as OrderWithItems
}

// ============================================================
// GET ALL ORDERS FOR A USER
// ============================================================

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
