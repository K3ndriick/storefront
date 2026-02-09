-- =====================================================
-- PowerProShop - Products Table Schema
-- =====================================================

-- Drop existing table if it exists (for development/testing)
-- WARNING: This deletes all data! Only use in development
DROP TABLE IF EXISTS products CASCADE;

-- =====================================================
-- MAIN PRODUCTS TABLE
-- =====================================================

CREATE TABLE products (
  -- ============ PRIMARY KEY ============
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- UUID: Universally unique identifier (impossible to guess)
  -- DEFAULT: Automatically generates a new UUID on INSERT
  -- PRIMARY KEY: Enforces uniqueness + auto-creates index
  
  -- ============ BASIC INFO ============
  name TEXT NOT NULL,
  -- Product display name: "Commercial Treadmill Pro 3000"
  -- NOT NULL: Every product MUST have a name
  
  slug TEXT UNIQUE NOT NULL,
  -- URL-friendly version: "commercial-treadmill-pro-3000"
  -- UNIQUE: No two products can share the same slug (prevents URL conflicts)
  -- Used in: /products/commercial-treadmill-pro-3000
  
  description TEXT,
  -- Full product description (for detail page)
  -- Can be long: features, specs, benefits
  -- NULL allowed: Can be added later
  
  short_description TEXT,
  -- Brief summary (for product cards, previews)
  -- Example: "Heavy-duty treadmill with 15% incline"
  -- NULL allowed: Falls back to first 100 chars of description
  
  -- ============ PRICING ============
  price DECIMAL(10, 2) NOT NULL,
  -- Regular retail price
  -- DECIMAL(10,2): Up to 99,999,999.99 (10 digits total, 2 decimal places)
  -- NOT NULL: Every product must have a price
  -- Example: 999.99
  
  sale_price DECIMAL(10, 2),
  -- Discounted price when on sale
  -- NULL: Product is not on sale
  -- NOT NULL: Product is on sale
  -- Example: If price=999.99 and sale_price=799.99, save $200
  
  cost_price DECIMAL(10, 2),
  -- What we paid to acquire the product (supplier cost)
  -- Used for: Profit margin calculations, admin analytics
  -- NEVER exposed to customers (server-side only)
  -- Example: cost=500, price=999.99, profit=$499.99
  
  -- ============ CATEGORIZATION ============
  category TEXT NOT NULL CHECK (category IN ('cardio', 'strength', 'weights', 'accessories', 'recovery')),
  -- Main product category
  -- CHECK constraint: Database enforces only these 5 values
  -- Prevents typos: 'Cardio', 'cardiovascular', etc.
  -- Used for: Primary filtering, navigation
  
  subcategory TEXT,
  -- Optional sub-categorization
  -- Example: category='cardio', subcategory='treadmills'
  -- NULL allowed: Not all categories need subcategories
  
  brand TEXT,
  -- Manufacturer/brand name
  -- Example: 'NordicTrack', 'Bowflex', 'Rogue Fitness'
  -- NULL allowed: Generic/unbranded products
  
  -- ============ INVENTORY TRACKING ============
  sku TEXT UNIQUE,
  -- Stock Keeping Unit: Internal inventory code
  -- Example: "TM-PRO-3000-BLK" (Treadmill-Pro-3000-Black)
  -- UNIQUE: Each SKU must be unique across all products
  -- Used by: Warehouse, barcode scanners, suppliers
  
  in_stock BOOLEAN DEFAULT true,
  -- Manual availability flag
  -- true: Available for purchase
  -- false: Not available (even if stock_quantity > 0)
  -- Use case: Product damaged, being inspected, pre-order only
  
  stock_quantity INTEGER DEFAULT 0,
  -- Actual number of units in warehouse
  -- INTEGER: Whole numbers only (can't have 2.5 treadmills)
  -- DEFAULT 0: Start with zero stock
  
  low_stock_threshold INTEGER DEFAULT 5,
  -- Alert threshold for "running low" warnings
  -- When stock_quantity < low_stock_threshold: Show "Only X left!" message
  -- DEFAULT 5: Configurable per product (some need higher threshold)
  
  -- ============ MEDIA ============
  images TEXT[] DEFAULT '{}',
  -- Array of image URLs
  -- Example: ['https://storage.../image1.jpg', 'https://storage.../image2.jpg']
  -- TEXT[]: PostgreSQL array type
  -- DEFAULT '{}': Empty array (no images yet)
  
  primary_image TEXT,
  -- Main product image URL (first image shown)
  -- Used in: Product cards, thumbnails, social sharing
  -- NULL allowed: Falls back to first image in images[] array
  
  -- ============ MARKETING FLAGS ============
  featured BOOLEAN DEFAULT false,
  -- Show on homepage, featured collections
  -- true: Premium placement
  -- false: Regular product
  -- DEFAULT false: Most products are not featured
  
  new_arrival BOOLEAN DEFAULT false,
  -- "NEW" badge for recently added products
  -- Can be automated: Set to true on create, false after 30 days
  -- DEFAULT false: Only mark explicitly
  
  bestseller BOOLEAN DEFAULT false,
  -- "BESTSELLER" badge for top-selling products
  -- Calculated from: Order data, revenue, units sold
  -- DEFAULT false: Must earn this badge
  
  -- ============ METADATA ============
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- When the product was added to database
  -- TIMESTAMPTZ: Timestamp with timezone (handles global businesses)
  -- NOW(): Automatically set to current date/time
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- When the product was last modified
  -- Updated via trigger (see below)
  -- Used for: Audit trails, cache invalidation
  
  deleted_at TIMESTAMPTZ,
  -- Soft delete: Mark as deleted without actually removing
  -- NULL: Product is active
  -- NOT NULL: Product is "deleted" (hidden from public, kept for records)
  -- Why soft delete? Preserve order history, analytics, undo capability
  
  -- ============ SEARCH OPTIMIZATION ============
  search_vector TSVECTOR
  -- Full-text search index data
  -- TSVECTOR: PostgreSQL's search-optimized text format
  -- Automatically populated via trigger (see below)
  -- Allows: Fast "treadmill" searches across name + description
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on category (filtering by category is very common)
CREATE INDEX idx_products_category ON products(category);
-- Speeds up: WHERE category = 'cardio'

-- Index on brand (filtering by brand is common)
CREATE INDEX idx_products_brand ON products(brand);
-- Speeds up: WHERE brand = 'NordicTrack'

-- Index on price (sorting by price, filtering price ranges)
CREATE INDEX idx_products_price ON products(price);
-- Speeds up: ORDER BY price, WHERE price BETWEEN 100 AND 500

-- Index on in_stock (filtering available products)
CREATE INDEX idx_products_in_stock ON products(in_stock);
-- Speeds up: WHERE in_stock = true

-- Partial index on featured (only indexes featured products)
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
-- Speeds up: WHERE featured = true (homepage query)
-- Saves space: Only indexes ~10-20 products instead of all 500

-- Unique index on slug (enforces uniqueness + speeds up detail page lookups)
CREATE INDEX idx_products_slug ON products(slug);
-- Speeds up: WHERE slug = 'commercial-treadmill-pro-3000'
-- Already unique from table definition, but explicit index helps

-- GIN index for full-text search
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
-- Speeds up: WHERE search_vector @@ to_tsquery('treadmill')
-- GIN: Generalized Inverted Index (optimized for text search)

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Trigger 1: Auto-update search_vector when product changes
-- This trigger automatically updates the search index whenever name/description changes
CREATE OR REPLACE FUNCTION products_search_update() RETURNS TRIGGER AS $$
BEGIN
  -- Combine name, description, brand into searchable text
  -- setweight: 'A' = highest priority (name), 'B' = medium (description), 'C' = low (brand)
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update 
  BEFORE INSERT OR UPDATE OF name, description, brand
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_update();

-- Trigger 2: Auto-update updated_at timestamp
-- Automatically sets updated_at to current time on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on the products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view non-deleted products (public read access)
CREATE POLICY "Public products are viewable by everyone"
  ON products
  FOR SELECT
  USING (deleted_at IS NULL);
-- Anyone (even anonymous users) can see products where deleted_at is NULL
-- Hides soft-deleted products from public view

-- Policy 2: Only authenticated users can insert products (placeholder for Phase 4)
-- For now, we'll use the service_role key to insert seed data
-- In Phase 4 (admin features), this will be restricted to admin users only
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
-- auth.role(): Supabase function that returns user's role
-- 'authenticated': Any logged-in user (will be restricted to admins later)

-- Policy 3: Only authenticated users can update products
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy 4: Only authenticated users can delete products (soft delete)
CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- HELPFUL QUERIES FOR TESTING
-- =====================================================

-- Test 1: View all products
-- SELECT * FROM products;

-- Test 2: View only in-stock cardio equipment
-- SELECT name, price, stock_quantity 
-- FROM products 
-- WHERE category = 'cardio' AND in_stock = true;

-- Test 3: Search for "treadmill"
-- SELECT name, category 
-- FROM products 
-- WHERE search_vector @@ to_tsquery('english', 'treadmill');

-- Test 4: Get featured products for homepage
-- SELECT name, primary_image, price, sale_price 
-- FROM products 
-- WHERE featured = true 
-- LIMIT 6;

-- Test 5: Low stock alert
-- SELECT name, stock_quantity, low_stock_threshold
-- FROM products 
-- WHERE stock_quantity < low_stock_threshold 
-- AND in_stock = true;

-- =====================================================
-- NOTES FOR DEVELOPMENT
-- =====================================================

-- 1. Primary Key (id) is automatically indexed
-- 2. UNIQUE constraints (slug, sku) automatically create indexes
-- 3. Indexes speed up reads but slow down writes (balanced approach)
-- 4. Soft delete (deleted_at) preserves order history and analytics
-- 5. RLS policies enforce security at database level (even if app has bugs)
-- 6. Triggers automate repetitive tasks (search index, timestamps)
-- 7. Check constraints (category) prevent bad data at database level

-- =====================================================
-- NEXT STEPS
-- =====================================================

-- 1. Run this schema in Supabase SQL Editor
-- 2. Create seed script to populate with sample products
-- 3. Test queries to verify indexes are working
-- 4. Build API endpoints to interact with this table
-- 5. Create UI components to display products