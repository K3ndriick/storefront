-- Phase 5 (post) - Stripe Webhook Setup
-- Run in Supabase SQL editor before enabling the webhook handler.
--
-- 1. Unique constraint prevents duplicate orders if both the client-side
--    createOrder() and the webhook fire for the same payment (idempotency).
--
-- 2. pending_orders staging table holds cart + shipping data at the moment
--    the user submits their shipping address. The webhook reads this row to
--    reconstruct the order if the browser crashes before createOrder() runs.

-- 1. Unique constraint on orders.stripe_payment_intent_id
ALTER TABLE orders
  ADD CONSTRAINT orders_stripe_payment_intent_id_key
  UNIQUE (stripe_payment_intent_id);

-- 2. Staging table for in-flight checkout sessions
CREATE TABLE pending_orders (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id TEXT        UNIQUE NOT NULL,
  user_id           UUID        NOT NULL REFERENCES auth.users(id),
  cart_items        JSONB       NOT NULL,
  shipping_address  JSONB       NOT NULL,
  subtotal          NUMERIC(10,2) NOT NULL,
  tax               NUMERIC(10,2) NOT NULL,
  shipping          NUMERIC(10,2) NOT NULL,
  total             NUMERIC(10,2) NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only the service role client (used by the webhook) can access this table
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON pending_orders USING (false);
