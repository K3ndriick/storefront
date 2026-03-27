-- Phase 9 - Admin Role Setup
-- Run in Supabase SQL editor when setting up the admin dashboard.
--
-- 1. Adds a `role` column to profiles (defaults to 'customer' for all existing rows).
-- 2. Grants admin role to the shop owner account.
-- 3. Verification query to confirm the admin row exists.

-- 1. Add role column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

-- 2. Grant admin role to the shop owner
--    Replace the UUID below with the actual user ID from Supabase Auth > Users
UPDATE profiles
  SET role = 'admin'
  WHERE id = '30d3b647-e1d6-44ab-823f-d9e104032d14';

-- 3. Verify
SELECT id, full_name, email, role FROM profiles WHERE role = 'admin';
