-- ============================================================
-- ADD REVIEW STATS TO PRODUCTS TABLE
-- ============================================================
ALTER TABLE products
  ADD COLUMN average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN review_count   INTEGER       NOT NULL DEFAULT 0;
