# Post-Phase 5 Tasks

## 1. Stripe Webhook Handler

### What it is
A webhook is an HTTP endpoint that Stripe calls on your server when a payment event occurs.
Currently, orders are created client-side after `stripe.confirmPayment()` resolves.
The problem: if the user's browser crashes, closes, or loses connection after the payment
is captured but before `createOrder()` runs — the money is taken but no order is created.

A webhook listens for `payment_intent.succeeded` on your server and creates the order there
as a fallback (or as the primary mechanism). It is Stripe calling you, not the browser.

### What needs to be done

#### 1. Create the webhook endpoint
- Create `src/app/api/webhooks/stripe/route.ts`
- This is a Next.js Route Handler — it exports an async `POST` function
- Stripe sends a raw body + a `Stripe-Signature` header

#### 2. Verify the webhook signature
- Use `stripe.webhooks.constructEvent(body, signature, webhookSecret)`
- This proves the request genuinely came from Stripe and not a third party
- Requires a new env var: `STRIPE_WEBHOOK_SECRET`
- Raw body must be read as a Buffer — Next.js route handlers need `req.text()` or `req.arrayBuffer()` for this

#### 3. Handle the `payment_intent.succeeded` event
```ts
switch (event.type) {
  case 'payment_intent.succeeded':
    const paymentIntent = event.data.object
    // createOrder() here using paymentIntent.metadata or paymentIntent.id
    break
}
```

#### 4. Store order data in Payment Intent metadata
The webhook only receives what Stripe sends — it has no access to the browser's cart state.
You need to pass cart/shipping data to the Payment Intent when creating it so the webhook
can use it. Options:
- Store a serialised cart + shipping address in `paymentIntent.metadata` when calling `createPaymentIntent()`
  (metadata has a 500-char per key limit — may need multiple keys or a separate DB table)
- Or: store a `pending_orders` row in Supabase when shipping is submitted, keyed by `paymentIntentId`,
  then the webhook reads it and promotes it to a real order on success

#### 5. Local development
- Install Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- This tunnels Stripe's webhook calls to your local server
- The CLI also prints the webhook signing secret for local use

#### 6. Prevent duplicate orders
- Add a unique constraint on `stripe_payment_intent_id` in the orders table
- Or check `getOrderByPaymentIntentId()` before inserting
- This handles the case where both the client-side flow AND the webhook both try to create the order

---

## 2. Stock Reservation System

### What it is
A race condition exists between stock check and stock deduction.
Currently: stock is only reduced AFTER payment succeeds (in `createOrder` → `reduce_stock` RPC).
The problem: two users can both view "1 item in stock", both add to cart, both pay —
and both orders succeed. `reduce_stock` has a stock guard (`WHERE stock_quantity >= quantity`)
so the second RPC will throw, but only after the second user has already been charged.

A reservation system holds stock for a user who has started checkout, preventing overselling.

### What needs to be done

#### 1. Add a `stock_reservations` table
```sql
CREATE TABLE stock_reservations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL,
  reserved_by UUID REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Create a `reserve_stock` RPC
An atomic SQL function that:
1. Checks `available stock = stock_quantity - SUM(active reservations)`
2. If enough available, inserts a reservation row
3. If not enough, raises an exception (which becomes a Supabase error)

"Active" reservations = those where `expires_at > NOW()` (e.g. 15 minutes from creation).

#### 3. Call `reserve_stock` when the user submits shipping
In `handleShippingSubmit` (checkout/page.tsx), before calling `createPaymentIntent`:
- Call the `reserve_stock` RPC for each cart item
- If any reservation fails (stock contention), show a toast and stop checkout
- Pass the reservation IDs forward so they can be released or confirmed

#### 4. Release reservations on cancellation
- If the user leaves checkout without paying, reservations expire naturally (via `expires_at`)
- Optionally: call a `release_reservation` RPC when the user navigates away (beforeunload)

#### 5. Convert reservations to confirmed stock reduction on payment
- In `createOrder` (or the Stripe webhook), instead of calling `reduce_stock`:
  - Mark the reservation as fulfilled
  - Or delete the reservation and reduce stock atomically in a single transaction

#### 6. Clean up expired reservations
- A Supabase cron job (pg_cron) or Edge Function can periodically delete rows where `expires_at < NOW()`
- Or handle it lazily: the `reserve_stock` RPC ignores expired rows in its availability check

### Priority note
This is a "nice to have" for a personal portfolio project — the `reduce_stock` stock guard
already prevents negative inventory (users will get an error after payment, not a silent failure).
The reservation system eliminates the window entirely and is the industry-standard approach.
