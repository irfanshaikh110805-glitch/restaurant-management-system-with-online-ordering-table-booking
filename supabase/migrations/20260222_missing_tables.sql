-- ============================================================
-- Migration: Missing tables & columns for full app functionality
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. delivery_tracking  (required by OrderTracking.jsx)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id                UUID REFERENCES orders(id) ON DELETE CASCADE,
  driver_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delivery_status         TEXT DEFAULT 'confirmed'
    CHECK (delivery_status IN ('confirmed','preparing','ready','picked_up','delivered','cancelled')),
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time    TIMESTAMP WITH TIME ZONE,
  delivery_notes          TEXT,
  current_lat             DECIMAL(10, 8),
  current_lng             DECIMAL(11, 8),
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own delivery tracking" ON delivery_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = delivery_tracking.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage delivery tracking" ON delivery_tracking
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER update_delivery_tracking_updated_at
  BEFORE UPDATE ON delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 2. event_registrations  (required by EventsPage.jsx)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (event_id, user_id)      -- prevents duplicate registrations
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage registrations" ON event_registrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- 3. Add missing columns to orders table
--    (used in Cart.jsx checkout and backendHelpers.js createOrder)
-- ────────────────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_name    TEXT,
  ADD COLUMN IF NOT EXISTS table_number     TEXT,
  ADD COLUMN IF NOT EXISTS order_type       TEXT DEFAULT 'dine-in'
    CHECK (order_type IN ('dine-in','takeout','delivery')),
  ADD COLUMN IF NOT EXISTS instructions     TEXT,
  ADD COLUMN IF NOT EXISTS subtotal         DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS tax_amount       DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS delivery_fee     DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount  DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount     DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_method   TEXT DEFAULT 'pay-at-restaurant',
  ADD COLUMN IF NOT EXISTS delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code_used  TEXT;

-- Keep total_amount in sync with total for backward compatibility
UPDATE orders SET total_amount = total WHERE total_amount IS NULL;

-- ────────────────────────────────────────────────────────────
-- 4. Add order_items.item_id alias if menu_item_id conflicts
--    (ReviewsPage.jsx checks order_items.item_id)
-- ────────────────────────────────────────────────────────────
-- Note: base schema uses menu_item_id. ReviewsPage queries item_id.
-- Add a generated column alias if not already present:
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT;

-- Backfill from existing menu_item_id values
UPDATE order_items SET item_id = menu_item_id WHERE item_id IS NULL;

-- ────────────────────────────────────────────────────────────
-- 5. Ensure reviews table has columns ReviewsPage.jsx expects
--    (item_id, review_text, is_verified_purchase, helpful_count, images)
-- ────────────────────────────────────────────────────────────
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS item_id              UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS review_text          TEXT,
  ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS helpful_count        INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images               TEXT[];   -- array of image URLs

-- review_votes table (for upvote/downvote on reviews)
CREATE TABLE IF NOT EXISTS review_votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type   TEXT CHECK (vote_type IN ('helpful','not_helpful')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (review_id, user_id)
);

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON review_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vote" ON review_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vote" ON review_votes FOR DELETE USING (auth.uid() = user_id);
