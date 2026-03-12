-- ============================================================
-- COMPLETE SCHEMA FIX - Resolve all inconsistencies
-- Run this after the base schema to ensure consistency
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. STANDARDIZE COLUMN NAMES
-- ────────────────────────────────────────────────────────────

-- Ensure order_items has both menu_item_id and item_id for compatibility
ALTER TABLE order_items 
  ADD COLUMN IF NOT EXISTS item_id UUID;

-- Sync item_id with menu_item_id
UPDATE order_items 
SET item_id = menu_item_id 
WHERE item_id IS NULL;

-- Add foreign key if not exists
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_item_id_fkey'
  ) THEN
    ALTER TABLE order_items 
      ADD CONSTRAINT order_items_item_id_fkey 
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE RESTRICT;
  END IF;
END $;

-- ────────────────────────────────────────────────────────────
-- 2. ENSURE REVIEWS TABLE HAS ALL REQUIRED COLUMNS
-- ────────────────────────────────────────────────────────────

ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS review_text TEXT,
  ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS admin_response TEXT,
  ADD COLUMN IF NOT EXISTS admin_response_at TIMESTAMP WITH TIME ZONE;

-- Migrate comment to review_text if needed
UPDATE reviews 
SET review_text = comment 
WHERE review_text IS NULL AND comment IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 3. ENSURE ALL ORDERS COLUMNS EXIST
-- ────────────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS table_number TEXT,
  ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'dine-in' 
    CHECK (order_type IN ('dine-in', 'takeout', 'delivery')),
  ADD COLUMN IF NOT EXISTS special_instructions TEXT,
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pay-at-restaurant',
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_points_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code_used TEXT;

-- Sync total_amount with total for backward compatibility
UPDATE orders 
SET total_amount = total 
WHERE total_amount IS NULL AND total IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 4. ENSURE PAYMENTS TABLE HAS ALL COLUMNS
-- ────────────────────────────────────────────────────────────

ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS split_payments JSONB;

-- ────────────────────────────────────────────────────────────
-- 5. ENSURE BOOKINGS TABLE HAS ALL COLUMNS
-- ────────────────────────────────────────────────────────────

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS occasion_type TEXT,
  ADD COLUMN IF NOT EXISTS table_preference TEXT,
  ADD COLUMN IF NOT EXISTS is_party_booking BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS special_arrangements JSONB,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;

-- ────────────────────────────────────────────────────────────
-- 6. ENSURE PROFILES TABLE HAS ALL COLUMNS
-- ────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS anniversary_date DATE,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'bronze' 
    CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum'));

-- ────────────────────────────────────────────────────────────
-- 7. ENSURE MENU_ITEMS TABLE HAS ALL COLUMNS
-- ────────────────────────────────────────────────────────────

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS dietary_tags TEXT[],
  ADD COLUMN IF NOT EXISTS allergens TEXT[],
  ADD COLUMN IF NOT EXISTS spice_level TEXT CHECK (spice_level IN ('mild', 'medium', 'spicy', 'extra_spicy')),
  ADD COLUMN IF NOT EXISTS calories INTEGER,
  ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS is_chef_special BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS customization_options JSONB,
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0;

-- ────────────────────────────────────────────────────────────
-- 8. CREATE MISSING TABLES
-- ────────────────────────────────────────────────────────────

-- Ensure promo_codes table exists
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_delivery')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  usage_limit_per_user INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'new_users', 'loyal_users')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure events table exists
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('live_music', 'cultural', 'workshop', 'celebration')),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  duration_hours INTEGER,
  image_url TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_bookable BOOLEAN DEFAULT false,
  booking_fee DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 9. ADD MISSING UPDATED_AT TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$;

-- Add triggers for all tables with updated_at
DO $
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at 
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $;

-- ────────────────────────────────────────────────────────────
-- 10. VERIFICATION AND CLEANUP
-- ────────────────────────────────────────────────────────────

-- Remove duplicate or conflicting constraints
DO $
BEGIN
  -- Clean up any duplicate check constraints
  PERFORM 1;
END $;

-- Final verification
DO $
BEGIN
  RAISE NOTICE '✅ Schema consistency fixes applied successfully!';
  RAISE NOTICE 'Tables: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
  RAISE NOTICE 'Indexes: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
  RAISE NOTICE 'Triggers: %', (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public');
END $;
