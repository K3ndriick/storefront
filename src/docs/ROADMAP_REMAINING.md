# PowerProShop - Remaining Work Roadmap

**Created:** March 25, 2026
**Last Updated:** March 29, 2026
**Status:** Stripe webhook complete. Three feature phases remaining before feature-complete.
**Total Estimated Time:** ~27 hours

---

## Priority Order

```
1. Stripe Webhook Handler     (~3 hrs)   COMPLETE (March 29, 2026)
2. Phase 7: Reviews           (~7 hrs)   <- next feature phase
3. Phase 8: Appointments      (~9 hrs)   <- most complex, needs a focused block
4. Phase 10: Inventory        (~8 hrs)   <- stock reservation fits naturally here
5. UI/UX Polish               (~3 hrs)   <- final pass once feature-complete
```

---

## 1. Stripe Webhook Handler

**Priority:** Do first - this is a production gap, not a feature
**Estimated time:** ~3 hours
**File to create:** `src/app/api/webhooks/stripe/route.ts`

### The Problem

Orders are currently created client-side after `stripe.confirmPayment()` resolves.
If the browser crashes or closes after payment is captured but before `createOrder()` runs -
the customer is charged but no order exists. Money taken, nothing to ship.

### What to Build

1. Create the webhook endpoint (`POST /api/webhooks/stripe`)
2. Verify the Stripe signature (`stripe.webhooks.constructEvent`) to prove the request came from Stripe
3. Handle `payment_intent.succeeded` - create the order server-side as the authoritative path
4. Store cart + shipping data in PaymentIntent metadata (or a `pending_orders` table) so the webhook has what it needs
5. Add unique constraint on `stripe_payment_intent_id` to prevent duplicate orders
6. Test locally with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**New env var required:** `STRIPE_WEBHOOK_SECRET` (already in .env.local from Phase 5 setup)

### System Design Concepts

| Concept         | How It Applies |
|-----------------|---------------|
| **Idempotency** | Stripe retries failed webhooks. The same `payment_intent.succeeded` event may arrive 2-3 times. A unique constraint on `stripe_payment_intent_id` (or a `processed_events` table) ensures the order is only created once regardless of retries. This is the canonical idempotency pattern. |
| **Event-driven architecture** | Order creation moves from client-initiated (browser calls `createOrder`) to server-initiated (Stripe calls your endpoint on payment success). The server reacts to an external event rather than being called directly. Decouples payment confirmation from order creation. |
| **Defensive programming** | Verifying the webhook signature before processing is a trust boundary - never process an unauthenticated event. Same principle as validating JWTs before trusting user identity. |

---

## 2. Phase 7: Product Reviews

**Priority:** First feature phase after webhook
**Estimated time:** ~7 hours
**Depends on:** Phase 9 admin stubs (create `/admin/reviews` stub page alongside this phase)

### What to Build

- `reviews` table: `id`, `product_id`, `user_id`, `order_id`, `rating` (1-5), `title`, `body`, `status` (pending/approved/rejected), `created_at`
- Verified purchase check: review can only be submitted if user has a delivered order containing the product
- Review submission form on product detail page (authenticated users only)
- Review list + star rating summary on product detail page (approved reviews only)
- Admin moderation queue at `/admin/reviews` (fills in the Phase 9 stub)

### System Design Concepts

| Concept | How It Applies |
|---------|---------------|
| **State machine** | A review moves through defined states: `pending -> approved` or `pending -> rejected`. Only valid transitions are allowed - you cannot go from `approved` back to `pending`, or skip straight to `approved` from creation. Enforcing this in the DB (CHECK constraint) and server action prevents invalid state. |
| **Denormalisation** | Rather than recalculating average rating from all reviews on every product page load, store `average_rating` and `review_count` directly on the products table. Updated via a Supabase trigger or server action when a review is approved/rejected. Classic read-optimisation trade-off: slightly more complex writes for much faster reads. |
| **Access control at data layer** | The verified purchase check is not just a UI concern - it should be enforced in the server action (`getOrderByUserAndProduct()` before allowing submission). UI-only guards are trivially bypassed. |

---

## 3. Phase 8: Appointment Booking

**Priority:** After reviews - most complex remaining phase
**Estimated time:** ~9 hours
**Depends on:** Phase 9 admin stubs (create `/admin/appointments` stub page alongside this phase)

### What to Build

- `services` table: name, description, duration (minutes), price
- `appointments` table: `id`, `user_id`, `service_id`, `start_time`, `end_time`, `status` (pending/confirmed/cancelled), `notes`
- Public booking page: service selection, date/time picker showing only available slots
- Dashboard page for users: upcoming and past appointments
- Admin appointments view at `/admin/appointments` (fills in the Phase 9 stub)
- Email confirmation on booking

### System Design Concepts

| Concept | How It Applies |
|---------|---------------|
| **Concurrency control / double-booking prevention** | Two users can see the same open slot and both attempt to book it simultaneously. The solution is an atomic SQL function (same pattern as `reduce_stock`) that checks availability and inserts the appointment in a single transaction. If both requests arrive at the same time, PostgreSQL's row locking ensures only one succeeds. |
| **TTL / slot expiry** | Optionally hold a slot for X minutes when a user starts the booking flow (same concept as stock reservations). The slot is released if they don't confirm. Requires a `reserved_until` field and a cleanup mechanism (pg_cron or lazy expiry check). |
| **Derived availability** | Available slots are not stored - they are computed from service duration + existing appointments + business hours. This is a query/computation problem, not a storage problem. Storing "available slots" would create sync issues every time an appointment is cancelled or rescheduled. |
| **Idempotency (again)** | Email confirmations must not be sent twice if the booking request retries. Same pattern as the webhook: check before acting. |

---

## 4. Phase 10: Inventory Management

**Priority:** After appointments
**Estimated time:** ~8 hours (includes stock reservation system from post-phase-5 tasks)

### What to Build

- `stock_adjustments` table: `id`, `product_id`, `user_id` (admin who made change), `delta` (positive = restock, negative = sale/correction), `reason`, `created_at`
- Admin stock adjustment UI: quick +/- form on product list or dedicated inventory page
- Low-stock alerts: flag products below threshold in admin dashboard (already surfaced in Phase 9, formalise here)
- Stock reservation system (see below)

### Stock Reservation System (from post-phase-5-tasks.md)

The current flow reduces stock only after payment succeeds. Two users can both check out the last unit simultaneously - both payments succeed, second `reduce_stock` throws after the fact.

**What to add:**
1. `stock_reservations` table: `product_id`, `quantity`, `reserved_by`, `expires_at`
2. `reserve_stock` RPC: atomically checks `stock_quantity - SUM(active reservations)`, inserts reservation if available, raises exception if not
3. Call `reserve_stock` when user submits shipping address (before `createPaymentIntent`)
4. On payment success (webhook): convert reservation to confirmed stock reduction
5. Reservations expire naturally via `expires_at` if checkout is abandoned

### System Design Concepts

| Concept | How It Applies |
|---------|---------------|
| **Audit log / append-only ledger** | `stock_adjustments` is an immutable event log - rows are never updated or deleted. Current stock is the product's base quantity plus the sum of all adjustments. This is a simplified form of event sourcing: state is derived from history, and history is preserved. Useful for debugging ("why does this product show 3 units?") and for compliance. |
| **Optimistic vs pessimistic locking** | The current approach (check then deduct) is optimistic - it assumes conflicts are rare and handles them after the fact. The reservation system is pessimistic - it holds a lock (the reservation row) before proceeding. The trade-off: pessimistic locking prevents the bad outcome entirely but adds complexity and can cause "phantom unavailability" if reservations aren't cleaned up. |
| **Eventual consistency** | Expired reservations are not cleaned up immediately - they are ignored by the `reserve_stock` RPC's availability calculation (`WHERE expires_at > NOW()`). The table is eventually consistent: stale rows exist temporarily but do not affect correctness. Lazy cleanup via pg_cron avoids the need for a synchronous delete on every checkout. |
| **Derived state vs stored state** | Available stock = `stock_quantity - SUM(active reservations)`. This is computed, not stored. Storing it would require keeping two values in sync. Deriving it from authoritative sources (the two tables) is more reliable, at the cost of a slightly more expensive read. |

---

## 5. UI/UX Polish

**Priority:** Last - do once feature-complete
**Estimated time:** ~3 hours

Areas to revisit once all features are in:

- Loading and empty states consistency across all new pages (reviews, appointments, inventory)
- Mobile responsiveness check on admin dashboard
- Error message tone and clarity across forms
- Transition/animation consistency (page loads, form submissions)
- Accessibility pass: focus states, aria labels on interactive elements

---

## System Design Concepts Summary

| Concept | Phase |
|---------|-------|
| Idempotency | Webhook, Appointments |
| Event-driven architecture | Webhook |
| State machine | Reviews |
| Denormalisation | Reviews |
| Concurrency control | Appointments, Inventory |
| TTL / slot expiry | Appointments |
| Derived availability | Appointments |
| Audit log / append-only ledger | Inventory |
| Optimistic vs pessimistic locking | Inventory |
| Eventual consistency | Inventory |
| Access control at data layer | Reviews |

---

**Last Updated:** March 25, 2026
