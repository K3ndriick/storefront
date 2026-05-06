# Database Schema

PowerProShop uses Supabase PostgreSQL. This document covers the full table structure, relationships, key design decisions, and the database functions that enforce business logic.

For how RLS policies are applied per table, see [ARCHITECTURE.md](./ARCHITECTURE.md#row-level-security).

---

## Entity Relationship Diagram

```
auth.users (Supabase managed)
    |
    +-- profiles          1:1   one profile per user
    |
    +-- addresses         1:N   a user has many saved addresses
    |
    +-- orders            1:N   a user has many orders
    |       |
    |       +-- order_items    1:N   an order has many line items
    |               |
    |               +-- products  N:1  each line item references a product
    |
    +-- reviews           1:N   a user has many reviews
    |       |
    |       +-- products  N:1  each review is for one product
    |       +-- orders    N:1  each review is linked to a verified order
    |
    +-- appointments      1:N   a user has many appointments
    |       |
    |       +-- services  N:1  each appointment is for one service type
    |
    +-- stock_reservations  1:N  a user has many reservations (during checkout)
    |       |
    |       +-- products  N:1
    |
    +-- stock_adjustments (created_by -> auth.users)
            |
            +-- products  N:1

products
    +-- stock_adjustments  1:N  full audit log of all stock movements
    +-- stock_reservations 1:N  active holds during checkout
    +-- order_items        1:N  snapshot of product at time of purchase
    +-- reviews            1:N  approved customer reviews

suppliers
    +-- purchase_orders    1:N  a supplier has many POs
            |
            +-- purchase_order_items  1:N  a PO has many line items
                    |
                    +-- products  N:1
```

---

## Tables

### `products`
The core catalog. All pricing, stock, and categorisation lives here.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `name` | TEXT | Display name |
| `slug` | TEXT UNIQUE | URL identifier (`/products/[slug]`) |
| `description` | TEXT | Full detail page description |
| `short_description` | TEXT | Card/preview summary |
| `price` | DECIMAL(10,2) | Regular retail price |
| `sale_price` | DECIMAL(10,2) | NULL = not on sale |
| `cost_price` | DECIMAL(10,2) | Supplier cost, never exposed to customers |
| `category` | TEXT | CHECK: cardio, strength, weights, accessories, recovery |
| `brand` | TEXT | |
| `sku` | TEXT UNIQUE | Internal inventory code |
| `in_stock` | BOOLEAN | Manual availability flag (independent of stock_quantity) |
| `stock_quantity` | INTEGER | Units on hand |
| `low_stock_threshold` | INTEGER | Alert trigger level |
| `images` | TEXT[] | Array of storage URLs |
| `primary_image` | TEXT | Main display image |
| `featured` | BOOLEAN | Homepage placement |
| `new_arrival` | BOOLEAN | "NEW" badge |
| `bestseller` | BOOLEAN | "BESTSELLER" badge |
| `deleted_at` | TIMESTAMPTZ | NULL = active; soft delete |
| `search_vector` | TSVECTOR | Auto-maintained full-text search index |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Key design notes:**
- Soft deletes via `deleted_at` - all public queries filter `.is('deleted_at', null)`. Deleted products remain in the DB so historical order_items still reference valid data.
- `in_stock` and `stock_quantity` are independent. A product can have `stock_quantity > 0` but `in_stock = false` (e.g. damaged, being inspected).
- `search_vector` is maintained by a `BEFORE INSERT OR UPDATE` trigger - no manual updates needed.

---

### `profiles`
Extends `auth.users` with business-relevant customer data. One-to-one with `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK FK | Same UUID as `auth.users.id` |
| `email` | TEXT | Mirrored from auth at signup |
| `full_name` | TEXT | |
| `phone` | TEXT | |
| `role` | TEXT | `customer` (default) or `admin` |
| `avatar_url` | TEXT | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Key design notes:**
- Created automatically via a `AFTER INSERT ON auth.users` trigger (`handle_new_user()`). No application code needed on signup.
- `role = 'admin'` is the access gate for the entire admin dashboard. Checked in both Edge Middleware and every admin Server Action.
- `email` is a snapshot from signup. If a user changes their auth email, `profiles.email` does not auto-sync.

---

### `addresses`
Saved delivery addresses per customer. Independent from the address snapshot stored on orders.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | -> `auth.users.id` |
| `label` | TEXT | e.g. "Home", "Work" (optional) |
| `name` | TEXT | Recipient name |
| `address_line1` | TEXT | |
| `address_line2` | TEXT | |
| `city` | TEXT | |
| `state` | TEXT | |
| `postal_code` | TEXT | TEXT not INTEGER (leading zeros) |
| `country` | TEXT | DEFAULT 'AU' |
| `phone` | TEXT | |
| `is_default` | BOOLEAN | Pre-selected at checkout |
| `created_at` | TIMESTAMPTZ | |

**Key design note:** Editing or deleting a saved address has no effect on past orders. Orders store a full address snapshot at the time of purchase as flat columns.

---

### `orders`
One row per completed purchase. Address is stored as a snapshot - not a foreign key to `addresses`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | -> `auth.users.id` |
| `order_number` | TEXT UNIQUE | Format: ORD-YYYYMMDD-XXXXXXXXX |
| `status` | TEXT | pending, processing, shipped, delivered, cancelled |
| `subtotal` | DECIMAL(10,2) | |
| `tax` | DECIMAL(10,2) | 10% GST |
| `shipping` | DECIMAL(10,2) | $0 if subtotal >= $1000, else $50 |
| `total` | DECIMAL(10,2) | |
| `shipping_name` | TEXT | Address snapshot fields |
| `shipping_email` | TEXT | |
| `shipping_phone` | TEXT | |
| `shipping_address_line1` | TEXT | |
| `shipping_address_line2` | TEXT | |
| `shipping_city` | TEXT | |
| `shipping_state` | TEXT | |
| `shipping_postal_code` | TEXT | |
| `shipping_country` | TEXT | DEFAULT 'AU' |
| `stripe_payment_intent_id` | TEXT | Idempotency key for webhook |
| `payment_status` | TEXT | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Key design note:** `stripe_payment_intent_id` is the idempotency key. The webhook checks this before creating an order - if it already exists, the event is a duplicate delivery and is skipped.

---

### `order_items`
Line items for each order. Product name and price are snapshotted at purchase time.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK | -> `orders.id` ON DELETE CASCADE |
| `product_id` | UUID FK | -> `products.id` |
| `product_name` | TEXT | Snapshot - preserved if product is later renamed |
| `product_image` | TEXT | Snapshot |
| `price` | DECIMAL(10,2) | Snapshot - preserved if price changes |
| `quantity` | INTEGER | |
| `created_at` | TIMESTAMPTZ | |

**Key design note:** Name and price are stored as snapshots, not read dynamically from `products`. A product being renamed, repriced, or deleted cannot alter the historical order record.

---

### `reviews`
Customer product reviews with a moderation workflow.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK | -> `products.id` |
| `user_id` | UUID FK | -> `auth.users.id` |
| `order_id` | UUID FK | -> `orders.id` (verified purchase) |
| `rating` | INTEGER | CHECK: 1-5 |
| `title` | TEXT | |
| `body` | TEXT | |
| `status` | TEXT | CHECK: pending, approved, rejected |
| `moderated_by` | UUID FK | -> `auth.users.id` (admin) |
| `moderated_at` | TIMESTAMPTZ | |
| `verified_purchase` | BOOLEAN | True if order_id links to a real purchase |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**UNIQUE constraint:** `(product_id, user_id)` - one review per user per product.

**State machine:** `pending -> approved` or `pending -> rejected`. Valid transitions are enforced in the Server Action before any DB write. A CHECK constraint on `status` provides a second enforcement layer.

---

### `services`
The service catalog - repair types, installation, maintenance.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | TEXT | e.g. "Treadmill Repair" |
| `description` | TEXT | |
| `duration_minutes` | INTEGER | Drives slot availability calculation |
| `price` | NUMERIC(10,2) | |
| `active` | BOOLEAN | Inactive services hidden from booking page |
| `created_at` | TIMESTAMPTZ | |

**Key design note:** Available time slots are not stored. They are computed on request from `duration_minutes`, business hours (9AM-5PM), and existing `appointments` rows. No synchronisation problem possible.

---

### `appointments`
Customer bookings against a service type.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | -> `auth.users.id` |
| `service_id` | UUID FK | -> `services.id` |
| `appointment_date` | DATE | Stored separately from time for cheap date filtering |
| `appointment_time` | TIME | |
| `end_time` | TIME | Derived: appointment_time + duration_minutes |
| `duration_minutes` | INTEGER | Snapshot from service at booking time |
| `status` | TEXT | CHECK: pending, confirmed, completed, cancelled |
| `customer_name` | TEXT | Snapshot at booking time |
| `customer_email` | TEXT | Snapshot |
| `customer_phone` | TEXT | Snapshot |
| `equipment_type` | TEXT | What the customer is bringing in |
| `equipment_brand` | TEXT | |
| `issue_description` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

**Key design note:** `appointment_date` and `appointment_time` are stored as separate columns (not a single TIMESTAMPTZ) so slot availability queries can filter by date without timezone arithmetic.

---

### `stock_reservations`
Inventory holds placed during the checkout flow. Expire after 15 minutes.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK | -> `products.id` ON DELETE CASCADE |
| `quantity` | INTEGER | CHECK > 0 |
| `reserved_by` | UUID FK | -> `auth.users.id` |
| `expires_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

**Key design note:** Rows are never deleted - they expire via `expires_at`. The `reserve_stock()` RPC ignores rows where `expires_at < NOW()`. Available stock = `stock_quantity - SUM(active reservations)`.

---

### `stock_adjustments`
Append-only audit log of every stock movement.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK | -> `products.id` ON DELETE CASCADE |
| `adjustment_type` | TEXT | CHECK: sale, restock, return, adjustment |
| `quantity_change` | INTEGER | Positive = increase, negative = decrease |
| `previous_quantity` | INTEGER | Snapshot before change |
| `new_quantity` | INTEGER | Snapshot after change |
| `reason` | TEXT | |
| `created_by` | UUID FK | -> `auth.users.id` (admin who made the change) |
| `created_at` | TIMESTAMPTZ | |

**Key design note:** Rows are never updated or deleted. This is an immutable audit log - every stock movement is permanently recorded.

---

### `suppliers`
Supplier contact records for purchase order management.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | TEXT | |
| `contact_name` | TEXT | |
| `email` | TEXT | |
| `phone` | TEXT | |
| `address` | TEXT | |
| `notes` | TEXT | |
| `active` | BOOLEAN | Inactive suppliers hidden from PO creation |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### `purchase_orders`
Stock replenishment orders placed with suppliers.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `supplier_id` | UUID FK | -> `suppliers.id` |
| `order_number` | TEXT UNIQUE | |
| `status` | TEXT | CHECK: pending, ordered, received, cancelled |
| `total_cost` | DECIMAL(10,2) | |
| `expected_delivery` | DATE | |
| `notes` | TEXT | |
| `created_by` | UUID FK | -> `auth.users.id` |
| `received_at` | TIMESTAMPTZ | Set when status -> received |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### `purchase_order_items`
Line items per purchase order. Cascade-deleted when the PO is deleted.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `purchase_order_id` | UUID FK | -> `purchase_orders.id` ON DELETE CASCADE |
| `product_id` | UUID FK | -> `products.id` |
| `quantity` | INTEGER | CHECK > 0 |
| `cost_per_unit` | DECIMAL(10,2) | |
| `created_at` | TIMESTAMPTZ | |

---

## Database Functions

### `reserve_stock(p_product_id, p_quantity, p_user_id, p_duration_minutes)`
Called at checkout start. Checks available stock and inserts a reservation row atomically.

```
available = stock_quantity - SUM(active reservations for this product)
if available < requested: RAISE EXCEPTION
else: INSERT INTO stock_reservations
```

Uses `SELECT ... FOR UPDATE` to lock the product row - two simultaneous calls queue behind the lock rather than both reading the same available count.

`SECURITY DEFINER` - runs as the DB owner, bypassing RLS on `stock_reservations` (which has no public write policies). The function is the controlled write path.

---

### `reduce_stock(product_id, quantity)`
Called at order confirmation (from the Stripe webhook handler). Decrements `stock_quantity` atomically.

```
UPDATE products SET stock_quantity = stock_quantity - quantity
WHERE id = product_id AND stock_quantity >= quantity
```

If `stock_quantity < quantity`, raises an exception - the order creation is blocked. `SECURITY DEFINER`.

---

### `handle_new_user()`
Trigger function on `AFTER INSERT ON auth.users`. Automatically creates a `profiles` row for every new signup. `SECURITY DEFINER` to bypass RLS on `profiles` (which has no INSERT policy for regular users - profile creation is exclusively managed by this trigger).

---

## Key Design Patterns

| Pattern | Where used | Why |
|---|---|---|
| Soft deletes | `products.deleted_at` | Preserves order history; undo capability |
| Snapshot fields | `order_items`, `appointments` | Historical records unaffected by future edits |
| Address snapshot on orders | `orders.shipping_*` columns | Editing a saved address never alters past orders |
| Append-only audit log | `stock_adjustments` | Immutable history of every stock movement |
| Computed availability | Appointment slots | No sync problem; derived fresh on every request |
| DB-level business logic | `reserve_stock()`, `reduce_stock()` | Atomicity guarantees that application code cannot provide |
| SECURITY DEFINER functions | `reserve_stock()`, `reduce_stock()`, `handle_new_user()` | Controlled write paths that bypass RLS safely |
