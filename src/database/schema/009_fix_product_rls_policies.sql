-- =====================================================
-- MIGRATION: Fix product table RLS policies
-- Restricts INSERT / UPDATE / DELETE to admin role only.
--
-- The original policies (from 001_create_products_table.sql)
-- allowed any authenticated user to write to the products
-- table. This was an intentional placeholder noted in the
-- comment "will be restricted to admins later".
--
-- Run this in the Supabase SQL editor.
-- =====================================================

-- Drop the placeholder policies
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Restrict writes to admin role only.
-- auth.uid() looks up the calling user's id;
-- we then check their role in the profiles table.
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
