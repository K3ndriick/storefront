'use server';

import { createClient } from '@/lib/supabase/server';

type CartItemForReservation = {
  product_id: string;
  quantity:   number;
};

// ============================================================
// RESERVE CART STOCK
//
// Calls the reserve_stock RPC once per cart item, sequentially.
// Sequential (not parallel) because the RPC acquires a row lock
// on the products table — processing one at a time avoids any
// chance of deadlock if the same product ever appears twice.
//
// Returns null on success.
// Returns an error string if any item has insufficient stock —
// at that point the caller should stop checkout.
//
// Reservations that were already written before a failure will
// expire naturally via their expires_at TTL (default 15 minutes).
// ============================================================

export async function reserveCartStock(
  items: CartItemForReservation[],
  userId: string
): Promise<string | null> {
  const supabase = await createClient();

  for (const item of items) {
    const { error } = await supabase.rpc('reserve_stock', {
      p_product_id:       item.product_id,
      p_quantity:         item.quantity,
      p_user_id:          userId,
      p_duration_minutes: 15,
    });

    if (error) {
      // The RPC raises: "Insufficient stock: X available, Y requested"
      // Surface a user-friendly message rather than the raw DB error.
      return 'One or more items in your cart is no longer available in the requested quantity. Please review your cart before continuing.';
    }
  }

  return null;
}
