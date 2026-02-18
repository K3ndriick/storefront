-- =====================================================
-- PowerProShop - Profiles Table Schema
-- =====================================================
-- Purpose: Stores public user profile data for authenticated customers.
--
-- Relationship to Supabase Auth:
--   Supabase manages login credentials (email, hashed password, tokens)
--   in an internal `auth.users` table that we cannot modify directly.
--   This `profiles` table extends that with our own business data
--   (display name, phone) that the app actually needs.
--
-- Why a separate table?
--   auth.users is locked down by Supabase - we can't add columns to it.
--   profiles gives us full control over customer-facing data,
--   RLS policies, and future fields (e.g. loyalty points, addresses).
--
-- Lifecycle:
--   Created → automatically on user signup (via trigger below)
--   Read    → user views their own profile
--   Updated → user edits profile in /profile page
--   Deleted → automatically when auth.users row is deleted (CASCADE)
-- =====================================================


-- =====================================================
-- MAIN PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (

  -- ============ PRIMARY KEY ============
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- UUID: Matches exactly the id from auth.users (same value, same row)
  -- PRIMARY KEY: Enforces uniqueness - one profile per user, no duplicates
  -- REFERENCES auth.users(id): Foreign key - this profile must belong to a real user
  -- ON DELETE CASCADE: If the user is deleted from auth.users,
  --   their profile row is automatically deleted too (no orphaned data)
  -- Note: id is NOT auto-generated here - it comes from auth.users on signup

  -- ============ IDENTITY ============
  email TEXT NOT NULL,
  -- User's email address, mirrored from auth.users for convenience
  -- NOT NULL: Every profile must have an email
  -- Note: Captured at signup via the handle_new_user trigger below.
  --   If a user changes their email via Supabase Auth, this field does NOT
  --   auto-update - a future sync trigger can handle that if needed.
  -- Used for: Display in admin panels, order confirmations, service reminders

  full_name TEXT,
  -- Customer's display name
  -- Example: "Sarah Mitchell"
  -- NULL allowed: Optional - user can skip during signup and add later
  -- Populated from: signup form → auth.users.raw_user_meta_data → trigger

  phone TEXT,
  -- Customer's contact number (for delivery updates, appointment reminders)
  -- Example: '+61412345678'
  -- NULL allowed: Optional - collected on /profile page after signup
  -- Not validated at DB level - format validation handled in application layer

  -- ============ METADATA ============
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- When the profile was first created (= when the user signed up)
  -- TIMESTAMPTZ: Timestamp WITH timezone - consistent across time zones
  -- NOW(): Set automatically at insert time - never manually provided
  -- Used for: Admin analytics (new signups per day/month)

  updated_at TIMESTAMPTZ DEFAULT NOW()
  -- When the profile was last modified by the user
  -- Updated automatically via trigger (see set_updated_at below)
  -- Used for: Audit trail, cache invalidation
);


-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- RLS is a PostgreSQL feature that enforces access rules at the DATABASE level.
-- Even if application code has a bug, RLS ensures users can only
-- access data they are authorised to see.
--
-- How it works:
--   Without RLS: Any SQL query can read or write any row.
--   With RLS:    Every query is silently filtered through policies.
--                If no policy matches, the operation is denied by default.
--
-- auth.uid() is a Supabase helper that returns the UUID of the currently
-- authenticated user. Returns NULL for unauthenticated (anonymous) requests.
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Activates RLS on this table.
-- Without this line, all policies below are ignored and the table is wide open.


-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Policy 1: Users can read their own profile only (SELECT)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
-- FOR SELECT: Applies to read operations only
-- USING (...): Condition that must be true for a row to be returned
-- auth.uid() = id: The logged-in user's ID must match the profile's id
--
-- What this means in practice:
--   User A (id: 'abc') runs SELECT * FROM profiles
--   → RLS silently rewrites it to SELECT * FROM profiles WHERE id = 'abc'
--   → User A sees only their own row - never another customer's profile
--
-- Note: No public SELECT policy exists - profiles are entirely private.
-- Note: An admin policy (service_role or role check) will be added in Phase 9.

-- Policy 2: Users can edit their own profile only (UPDATE)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
-- FOR UPDATE: Applies to write operations only
-- USING (...): Condition that must be true for the row to be editable
-- auth.uid() = id: You can only update your own profile row
--
-- What this means in practice:
--   User A tries: UPDATE profiles SET full_name = 'Hacker' WHERE id = 'xyz'
--   → RLS checks: does auth.uid() equal 'xyz'? No → update silently affects 0 rows
--   → User A cannot tamper with another user's profile, even knowing their UUID
--
-- Note: No INSERT policy - profile creation is handled exclusively by the
--   handle_new_user trigger (SECURITY DEFINER), which bypasses RLS intentionally.
--   This prevents users from crafting rogue INSERT statements.
--
-- Note: No DELETE policy - deletion is handled by ON DELETE CASCADE on the
--   id column. Deleting the auth.users row cascades here automatically.


-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================
-- Triggers are database-level automation: they fire automatically
-- in response to INSERT, UPDATE, or DELETE events on a table.
-- This removes the need for application code to remember these
-- side-effects - the database handles them reliably every time.
-- =====================================================

-- -------------------------------------------------------
-- Trigger 1: Auto-create a profile row when a new user signs up
-- -------------------------------------------------------
-- When:  Immediately after a new row is inserted into auth.users
-- Why:   Supabase creates the auth.users row on signup. We need a
--        matching profiles row to store the customer's display data.
--        Doing this in application code is fragile - this trigger
--        ensures it always happens, even if the app crashes mid-signup.
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
-- RETURNS TRIGGER: Required return type for all trigger functions
-- $$: PostgreSQL dollar-quoting - marks the start of the function body
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    -- NEW: In a trigger, NEW refers to the row just inserted into auth.users
    -- NEW.id: The UUID Supabase assigned to this new user

    NEW.email,
    -- NEW.email: The email address the user signed up with

    NEW.raw_user_meta_data->>'full_name'
    -- raw_user_meta_data: A JSONB column in auth.users where Supabase stores
    --   extra data passed during signup via the options.data object:
    --   supabase.auth.signUp({ email, password, options: { data: { full_name: '...' } } })
    -- ->>: JSONB operator - extracts the value as plain TEXT (not JSON)
    -- Returns NULL if the key is absent - handled safely since full_name is nullable
  );
  RETURN NEW;
  -- RETURN NEW: Required for AFTER triggers - confirms the operation succeeded.
  --   We return the auth.users row unchanged (we have not modified it).
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- LANGUAGE plpgsql: PostgreSQL's procedural language used for this function
-- SECURITY DEFINER: The function runs with the permissions of its creator
--   (the database superuser), NOT the permissions of the signing-up user.
--   Required because:
--   1. RLS is enabled on profiles with no INSERT policy for regular users
--   2. The trigger fires before the new user is fully authenticated
--   3. SECURITY DEFINER allows the trigger to bypass RLS for this one INSERT

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  -- AFTER INSERT: Fires after the auth.users row is fully committed to disk
  --   (BEFORE INSERT would fire too early - the row may not exist yet)
  -- ON auth.users: Watches Supabase's internal users table for new signups
  FOR EACH ROW
  -- FOR EACH ROW: Executes once per new user (not once per bulk statement)
  EXECUTE FUNCTION public.handle_new_user();


-- -------------------------------------------------------
-- Trigger 2: Auto-update the updated_at timestamp on any profile change
-- -------------------------------------------------------
-- When:  Before any UPDATE on the profiles table
-- Why:   updated_at must always reflect the true last-modified time.
--        Without this trigger, application code would have to manually
--        set updated_at on every update - easy to forget and inconsistent.
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- NEW: In a BEFORE UPDATE trigger, NEW is the row as it will be written
  -- We set updated_at before the row hits disk - always accurate
  -- NOW(): Current timestamp with timezone at the moment of the update
  RETURN NEW;
  -- RETURN NEW: Required for BEFORE triggers - returns the modified row
  --   to be written to the table. Returning NULL would cancel the update.
END;
$$ LANGUAGE plpgsql;
-- No SECURITY DEFINER needed - the authenticated user already has UPDATE
-- permission on their own profile row via the RLS policy above.

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  -- BEFORE UPDATE: Fires before the row is written - lets us modify NEW in time
  --   (AFTER UPDATE would be too late to change the row being saved)
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- =====================================================
-- HELPFUL QUERIES FOR TESTING
-- =====================================================

-- Note: Run these in the Supabase SQL Editor, which uses the service_role key
-- and bypasses RLS - giving you full visibility across all rows.

-- Test 1: View all profiles (confirm rows are being created on signup)
-- SELECT * FROM profiles ORDER BY created_at DESC;

-- Test 2: Confirm a specific user's profile was created correctly
-- SELECT id, email, full_name, phone, created_at
-- FROM profiles
-- WHERE id = 'paste-user-uuid-here';

-- Test 3: Join profiles with auth.users to compare data
-- SELECT p.id, p.email, p.full_name, u.created_at AS auth_created
-- FROM profiles p
-- JOIN auth.users u ON p.id = u.id
-- ORDER BY p.created_at DESC
-- LIMIT 10;

-- Test 4: New customer signups in the last 30 days
-- SELECT COUNT(*) AS new_signups
-- FROM profiles
-- WHERE created_at >= NOW() - INTERVAL '30 days';

-- Test 5: Profiles with missing full_name (incomplete onboarding)
-- SELECT id, email, created_at
-- FROM profiles
-- WHERE full_name IS NULL;

-- Test 6: Profiles with a phone number (opted in for SMS/call contact)
-- SELECT id, email, full_name, phone
-- FROM profiles
-- WHERE phone IS NOT NULL;


-- =====================================================
-- NOTES FOR DEVELOPMENT
-- =====================================================

-- 1. NEVER query profiles with the anon key expecting all rows.
--    RLS will filter results to only the authenticated user's own row.
--    Use the service_role key (server-side only, never in the browser)
--    to query all profiles for admin or analytics purposes.

-- 2. The id column receives its value from auth.users via the trigger -
--    it is NOT auto-generated (no gen_random_uuid() here).
--    This 1:1 relationship means you can JOIN both tables on id directly.

-- 3. The email field is a snapshot captured at signup time.
--    If a user changes their email via Supabase Auth, profiles.email
--    does NOT auto-update. A future UPDATE trigger on auth.users can
--    sync this if needed (planned for Phase 9 admin work).

-- 4. SECURITY DEFINER on handle_new_user() is intentional and safe here.
--    The function performs a single, tightly scoped INSERT with known columns.
--    It does not grant any broader permissions beyond creating that one row.

-- 5. There is no INSERT RLS policy on profiles. All profile creation goes
--    through the handle_new_user trigger. This is intentional - it prevents
--    users from INSERT-ing profiles with arbitrary IDs or data.

-- 6. ON DELETE CASCADE on the id column means deleting a user from auth.users
--    automatically removes their profile row. No orphaned data is possible.

-- 7. The update_updated_at() function has a generic name. If other tables need
--    the same pattern, use a unique function name per table to avoid conflicts.
--    (See update_updated_at_column() used by the products table.)


-- =====================================================
-- NEXT STEPS
-- =====================================================

-- 1. Run this schema in Supabase SQL Editor (done)
-- 2. Configure Auth providers in Supabase Dashboard (done)
-- 3. Build AuthContext and useAuth hook to read/write profiles (Phase 4)
-- 4. Build /profile page for users to edit their data (Phase 4)
-- 5. Future: Add shipping address fields (Phase 5 - Checkout)
-- 6. Future: Add loyalty_points or rewards field (Phase 7+)
-- 7. Future: Restrict product mutations to admin role only (Phase 9)
