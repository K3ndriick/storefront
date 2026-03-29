-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  product_id UUID NOT NULL REFERENCES products(id),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  order_id   UUID NOT NULL REFERENCES orders(id),

  -- Content
  rating  INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title   TEXT    NOT NULL,
  body    TEXT    NOT NULL,

  -- Moderation
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID        REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,

  -- Flags
  verified_purchase BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One review per user per product
  UNIQUE (product_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id    ON reviews(user_id);
CREATE INDEX idx_reviews_status     ON reviews(status);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public: approved reviews only
CREATE POLICY "Approved reviews are viewable by everyone"
ON reviews FOR SELECT
USING (status = 'approved');

-- Authenticated: insert own reviews only
CREATE POLICY "Users can insert own reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Authenticated: update own reviews (only while pending)
CREATE POLICY "Users can update own pending reviews"
ON reviews FOR UPDATE
USING  (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);
