-- ========================================================
-- RESTO - FINAL DATABASE RESTRUCTURE & AUDIT FIXES
-- This script consolidates all features and fixes inconsistencies
-- ========================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BASE TABLES RECONCILIATION
-- ========================================================

-- Profiles Enhancement
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff', 'driver')),
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS anniversary_date DATE,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Use a trigger to auto-generate referral code for new profiles
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(REPLACE(uuid_generate_v4()::TEXT, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_referral_code ON profiles;
CREATE TRIGGER tr_generate_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Menu Items Enhancement
ALTER TABLE IF EXISTS menu_items
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url_2 TEXT,
  ADD COLUMN IF NOT EXISTS ingredients TEXT,
  ADD COLUMN IF NOT EXISTS allergens TEXT,
  ADD COLUMN IF NOT EXISTS dietary_info TEXT, -- 'Veg', 'Non-Veg', 'Vegan', etc.
  ADD COLUMN IF NOT EXISTS calories INTEGER,
  ADD COLUMN IF NOT EXISTS protein INTEGER,
  ADD COLUMN IF NOT EXISTS carbs INTEGER,
  ADD COLUMN IF NOT EXISTS fat INTEGER,
  ADD COLUMN IF NOT EXISTS prep_time INTEGER, -- minutes
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_chef_special BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS spice_level INTEGER CHECK (spice_level BETWEEN 0 AND 3),
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Orders Enhancement
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2), -- the final total
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS table_number TEXT,
  ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
  ADD COLUMN IF NOT EXISTS special_instructions TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pay-at-restaurant',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Bookings Enhancement
ALTER TABLE IF EXISTS bookings
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS occasion_type TEXT,
  ADD COLUMN IF NOT EXISTS table_preference TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. NEW FEATURE TABLES
-- ========================================================

-- Delivery Zones & Addresses
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  pincodes TEXT[] NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 50,
  min_order_for_free_delivery DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- 'Home', 'Work', 'Other'
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL DEFAULT 'Vijayapura',
  state TEXT NOT NULL DEFAULT 'Karnataka',
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Tracking
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id),
  delivery_status TEXT DEFAULT 'confirmed' CHECK (delivery_status IN ('confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'failed')),
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  delivery_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS RECONCILIATION
-- Create item_reviews which is used by the frontend
CREATE TABLE IF NOT EXISTS item_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  images TEXT[],
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT false,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- Ensure a 'reviews' table exists or is a view to support legacy pages
-- If the existing table 'reviews' is actually used by the code as item-based, 
-- we ensure it has the right columns.
ALTER TABLE IF EXISTS reviews
  ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS review_text TEXT,
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_response TEXT;

-- Review Votes
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES item_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Loyalty Rewards
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'food' CHECK (category IN ('food', 'discount', 'merchandise', 'exclusive')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points Transactions
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'bonus', 'referral', 'refund')),
  description TEXT,
  reference_id UUID, -- order_id or reward_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catering Requests
CREATE TABLE IF NOT EXISTS catering_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  venue_address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  budget_range TEXT,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo Code Usage Tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_applied DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- favorite_items (redundant definition check)
CREATE TABLE IF NOT EXISTS favorite_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- 3. TRIGGERS & FUNCTIONS
-- ========================================================

-- Update menu item rating summary
CREATE OR REPLACE FUNCTION update_menu_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- We'll just update from reviews table since the frontend uses that
  UPDATE menu_items
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE item_id = NEW.item_id AND status = 'approved'),
    review_count = (SELECT COUNT(*) FROM reviews WHERE item_id = NEW.item_id AND status = 'approved')
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_menu_item_rating ON reviews;
CREATE TRIGGER tr_update_menu_item_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_menu_item_rating();

-- Award loyalty points on order completion
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_earn INTEGER;
BEGIN
  -- Only award points when status changes to 'delivered' or 'completed'
  IF (NEW.status = 'delivered' OR NEW.status = 'completed') AND (OLD.status != 'delivered' AND OLD.status != 'completed') AND NEW.user_id IS NOT NULL THEN
    -- Earn 1 point for every ₹10 spent
    points_to_earn := FLOOR(NEW.total / 10);
    
    -- Update user profile
    UPDATE profiles
    SET loyalty_points = loyalty_points + points_to_earn
    WHERE id = NEW.user_id;
    
    -- Log transaction
    INSERT INTO points_transactions (user_id, points, transaction_type, description, reference_id)
    VALUES (NEW.user_id, points_to_earn, 'earn', 'Points earned for order #' || SUBSTRING(NEW.id::TEXT, 1, 8), NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_award_loyalty_points ON orders;
CREATE TRIGGER tr_award_loyalty_points
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION award_loyalty_points();

-- 4. RLS POLICIES
-- ========================================================

-- Enable RLS on new tables
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_items ENABLE ROW LEVEL SECURITY;

-- Policies for delivery_zones (Public read)
CREATE POLICY "Public read delivery_zones" ON delivery_zones FOR SELECT USING (true);

-- Policies for delivery_addresses (Owner only)
CREATE POLICY "Users manage own addresses" ON delivery_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Policies for favorite_items (Owner only)
CREATE POLICY "Users manage own favorites" ON favorite_items
  FOR ALL USING (auth.uid() = user_id);

-- Policies for catering_requests (Owner can view/create, Admin manage)
CREATE POLICY "Users view own catering" ON catering_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create catering" ON catering_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage catering" ON catering_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for item_reviews & reviews
CREATE POLICY "Public view approved reviews" ON reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);

-- 5. SEED DATA (IF EMPTY)
-- ========================================================

INSERT INTO delivery_zones (name, pincodes, delivery_fee)
VALUES ('Vijayapura City', ARRAY['586101', '586102', '586103'], 30)
ON CONFLICT DO NOTHING;

INSERT INTO loyalty_rewards (title, description, points_cost, image_url)
VALUES 
  ('Free Biryani', 'Get one free Chicken Biryani on your next visit', 500, 'https://images.pexels.com/photos/10312440/pexels-photo-10312440.jpeg'),
  ('₹100 Voucher', 'Flat INR 100 off on your order', 200, 'https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg'),
  ('Free Beverage', 'One free mocktail or cold drink', 100, 'https://images.pexels.com/photos/605408/pexels-photo-605408.jpeg')
ON CONFLICT DO NOTHING;
