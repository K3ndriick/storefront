-- =====================================================
-- PowerProShop - Addresses Table Schema
-- =====================================================
-- Purpose: Stores saved delivery addresses for authenticated customers.
--
-- Relationship to other tables:
--   Each address belongs to one user (user_id -> auth.users.id).
--   Addresses are used to pre-fill the shipping address form at checkout,
--   saving repeat customers from re-entering their details every order.
--   The orders table stores a snapshot of the address at time of purchase -
--   editing or deleting a saved address does NOT alter past orders.
--
-- Why a separate table (not stored on the profile)?
--   A customer may have multiple addresses (home, work, parent's house).
--   Storing them as separate rows supports full CRUD without complexity.
--   The profiles table stores identity data; this table stores logistics data.
--
-- Lifecycle:
--   Created -> user adds an address on /dashboard/addresses
--   Read    -> pre-filling checkout form, listing on /dashboard/addresses
--   Updated -> user edits an address in the dashboard
--   Deleted -> user removes an address from the dashboard
-- =====================================================


-- =====================================================
-- MAIN ADDRESSES TABLE
-- =====================================================

CREATE TABLE addresses (

  -- ============ PRIMARY KEY ============
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- UUID: Universally unique identifier - no sequential guessing of IDs
  -- PRIMARY KEY: Enforces uniqueness across all address rows
  -- DEFAULT gen_random_uuid(): Supabase generates this automatically on INSERT

  -- ============ OWNERSHIP ============
  user_id UUID NOT NULL REFERENCES auth.users(id),
  -- Links this address to a specific Supabase Auth user
  -- NOT NULL: Every address must belong to a user - orphaned addresses not allowed
  -- REFERENCES auth.users(id): Foreign key constraint - user must exist in auth.users
  -- Note: No ON DELETE CASCADE here intentionally. Deleting a user account
  --   is handled separately in Phase 9 admin work. For now, users cannot
  --   self-delete accounts, so dangling addresses are not a practical risk.

  -- ============ DISPLAY ============
  label TEXT,
  -- Optional user-defined name for this address
  -- Examples: 'Home', 'Work', 'Mum''s place'
  -- NULL allowed: Most users won't bother labelling - shown only if present
  -- No uniqueness constraint - a user can have two 'Home' labels if they want

  -- ============ RECIPIENT ============
  name TEXT NOT NULL,
  -- Full name of the person receiving delivery at this address
  -- NOT NULL: Required for courier labels and delivery instructions
  -- May differ from the account holder (e.g. sending a gift to someone else)
  -- Example: 'Sarah Mitchell'

  -- ============ ADDRESS FIELDS ============
  address_line1 TEXT NOT NULL,
  -- Street address - first line
  -- NOT NULL: The minimum required for a deliverable address
  -- Example: '42 Bourke Street'

  address_line2 TEXT,
  -- Street address - second line (optional)
  -- NULL allowed: Not all addresses have a second line
  -- Examples: 'Apartment 3', 'Unit 12B', 'Level 5'

  city TEXT NOT NULL,
  -- Suburb or city name
  -- NOT NULL: Required for all Australian addresses
  -- Example: 'Melbourne'

  state TEXT,
  -- State or territory abbreviation
  -- NULL allowed: Optional at DB level, but required in the form for AU addresses
  -- Examples: 'VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'

  postal_code TEXT NOT NULL,
  -- Australian postcode (4 digits) or international equivalent
  -- NOT NULL: Required for delivery routing
  -- TEXT not INTEGER: Leading zeros are valid in some international codes
  -- Example: '3000' (Melbourne CBD), '2000' (Sydney CBD)

  country TEXT NOT NULL DEFAULT 'AU',
  -- Country code (ISO 3166-1 alpha-2)
  -- NOT NULL: All addresses must have a country
  -- DEFAULT 'AU': The business ships domestically - most addresses will be Australian
  -- Example: 'AU', 'NZ', 'US'

  -- ============ CONTACT ============
  phone TEXT,
  -- Contact number for delivery queries or appointment reminders
  -- NULL allowed: Optional - not all customers provide one
  -- Not validated at DB level - format validation handled in the application layer
  -- Example: '+61412345678'

  -- ============ FLAGS ============
  is_default BOOLEAN DEFAULT false,
  -- Whether this is the user's primary address, pre-selected at checkout
  -- DEFAULT false: New addresses are not automatically set as default
  -- Only one address per user should be true at any time - enforced in application
  --   logic (setDefaultAddress action clears all others before setting the new one)
  -- Note: No DB-level UNIQUE constraint on (user_id, is_default = true) because
  --   PostgreSQL partial unique indexes cannot be maintained atomically during
  --   the two-step clear-then-set operation without a transaction. Handled in code.

  -- ============ METADATA ============
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- When this address was saved by the user
  -- TIMESTAMPTZ: Timestamp WITH timezone - consistent across time zones
  -- NOW(): Set automatically at INSERT time - never manually provided
  -- Used for: Ordering addresses chronologically (oldest first, default first)
  -- Note: No updated_at column - address edits replace all fields in one UPDATE,
  --   so a last-modified timestamp has limited value here.
);


-- =====================================================
-- INDEXES
-- =====================================================
-- Indexes speed up queries by letting PostgreSQL jump directly to matching rows
-- instead of scanning the entire table. Essential for any column used in WHERE or JOIN.

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
-- Speeds up: SELECT * FROM addresses WHERE user_id = '...'
-- Used by:   getUserAddresses() action - fetches all addresses for the current user
-- Without this, Supabase would scan every address row to find the user's ones.
-- With this, it jumps directly to the matching rows via the B-tree index.


-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- RLS is a PostgreSQL feature that enforces access rules at the DATABASE level.
-- Even if application code has a bug, RLS ensures users can only
-- access their own data.
--
-- How it works:
--   Without RLS: Any authenticated user can read or write any address row.
--   With RLS:    Every query is silently filtered through policies.
--                If no policy matches, the operation is denied by default.
--
-- auth.uid() is a Supabase helper that returns the UUID of the currently
-- authenticated user. Returns NULL for unauthenticated (anonymous) requests.
-- =====================================================

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
-- Activates RLS on this table.
-- Without this line, all policies below are ignored and the table is wide open.


-- =====================================================
-- RLS POLICIES
-- =====================================================

CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
-- FOR ALL: A single policy covering SELECT, INSERT, UPDATE, and DELETE.
-- Used here because the access rule is identical for all operations:
--   "you can only touch rows that belong to you."
-- Compare to orders, where separate SELECT and INSERT policies exist because
--   the rules differ (orders are inserted by the server, not the user directly).
USING (auth.uid() = user_id)
-- USING: Applied to SELECT, UPDATE, and DELETE - filters which rows are visible/editable
-- auth.uid() = user_id: The logged-in user's ID must match the address owner
--
-- What this means in practice:
--   User A (id: 'abc') runs: SELECT * FROM addresses
--   RLS rewrites it to:       SELECT * FROM addresses WHERE user_id = 'abc'
--   User A sees only their own addresses - never another customer's.
WITH CHECK (auth.uid() = user_id);
-- WITH CHECK: Applied to INSERT and UPDATE - validates the new row being written
-- auth.uid() = user_id: Users can only INSERT/UPDATE rows where they are the owner
--
-- What this prevents:
--   User A tries: INSERT INTO addresses (user_id, ...) VALUES ('xyz', ...)
--   WITH CHECK fails: auth.uid() ('abc') != user_id ('xyz') -> INSERT denied
--   Users cannot create addresses under another user's ID.


-- =====================================================
-- HELPFUL QUERIES FOR TESTING
-- =====================================================

-- Note: Run these in the Supabase SQL Editor, which uses the service_role key
-- and bypasses RLS - giving you full visibility across all rows.

-- Test 1: View all saved addresses across all users
-- SELECT * FROM addresses ORDER BY user_id, is_default DESC, created_at ASC;

-- Test 2: View all addresses for a specific user
-- SELECT id, label, name, address_line1, city, state, postal_code, is_default
-- FROM addresses
-- WHERE user_id = 'paste-user-uuid-here'
-- ORDER BY is_default DESC, created_at ASC;

-- Test 3: Confirm only one default address per user (should return 0 rows if clean)
-- SELECT user_id, COUNT(*) AS default_count
-- FROM addresses
-- WHERE is_default = true
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;

-- Test 4: Addresses with no label (majority expected)
-- SELECT id, name, address_line1, city
-- FROM addresses
-- WHERE label IS NULL;

-- Test 5: Count of saved addresses per user (engagement metric)
-- SELECT user_id, COUNT(*) AS address_count
-- FROM addresses
-- GROUP BY user_id
-- ORDER BY address_count DESC;


-- =====================================================
-- NOTES FOR DEVELOPMENT
-- =====================================================

-- 1. The is_default flag is maintained in application code, not enforced at DB level.
--    The setDefaultAddress() server action clears all is_default = true rows for the
--    user before setting the new one. Always update via this action - do not update
--    is_default directly to avoid ending up with multiple defaults.

-- 2. Editing or deleting an address does NOT affect past orders. The orders table
--    stores a full snapshot of the shipping address at time of purchase (separate
--    shipping_name, shipping_address_line1 ... columns). They are independent.

-- 3. The country field defaults to 'AU' at DB level. The application form also
--    defaults to 'AU'. If international shipping is added in the future, review
--    the postal_code validation - some countries use alphanumeric codes (e.g. UK).

-- 4. NEVER query addresses with the anon key expecting all rows. RLS will filter
--    results to only the authenticated user's own addresses. Use the service_role
--    key (server-side only) for admin queries across all users.

-- 5. No updated_at column exists on this table. Address edits replace the full
--    row's fields in a single UPDATE, making a last-modified timestamp less useful.
--    If an audit trail of address changes becomes a requirement, add updated_at
--    and a BEFORE UPDATE trigger (see the pattern in 003_create_profiles_table.sql).


-- =====================================================
-- NEXT STEPS
-- =====================================================

-- 1. Run this schema in Supabase SQL Editor (done)
-- 2. Create Address TypeScript types in lib/types/address.ts (done)
-- 3. Create server actions in lib/actions/addresses.ts (done)
-- 4. Build AddressForm component for add/edit (done)
-- 5. Build AddressCard component for display/delete/set-default (done)
-- 6. Build /dashboard/addresses page (done)
-- 7. Future: Pre-fill checkout ShippingAddressForm from saved default address
-- 8. Future: Allow address selection at checkout (pick from saved addresses)
