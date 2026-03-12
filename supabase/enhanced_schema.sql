-- ============================================
-- ENHANCED SCHEMA FOR HOTEL EVEREST RESTAURANT
-- Includes all new features: Delivery, Loyalty, Reviews, Promotions, etc.
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DELIVERY SYSTEM TABLES
-- ============================================

-- Customer delivery addresses
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
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery zones and pricing
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_name TEXT NOT NULL,
  pincode_pattern TEXT, -- regex pattern for pincodes
  distance_from_restaurant_km DECIMAL(5, 2),
  delivery_fee DECIMAL(10, 2) NOT NULL,
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
  estimated_delivery_time_min INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ENHANCED ORDERS TABLE (UPDATE)
-- ============================================

-- Add new columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'delivery'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address_id UUID REFERENCES delivery_addresses(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_time_slot TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_used INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;

-- ============================================
-- 3. LOYALTY & REWARDS SYSTEM
-- ============================================

-- Loyalty tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name TEXT NOT NULL UNIQUE, -- 'Bronze', 'Silver', 'Gold', 'Platinum'
  min_points INTEGER NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  points_multiplier DECIMAL(3, 2) DEFAULT 1.0, -- 1.5x points for higher tiers
  benefits JSONB, -- {"free_delivery": true, "priority_support": true}
  tier_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer loyalty points
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_tier_id UUID REFERENCES loyalty_tiers(id),
  lifetime_points INTEGER DEFAULT 0, -- Never decreases
  tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points transaction history
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- Can be positive (earned) or negative (redeemed)
  transaction_type TEXT CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus', 'referral')),
  reference_id UUID, -- Could be order_id, referral_id, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral system
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_reward_points INTEGER DEFAULT 0,
  referred_reward_points INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ENHANCED REVIEWS & RATINGS SYSTEM
-- ============================================

-- Item-specific reviews (replace simple reviews table)
CREATE TABLE IF NOT EXISTS item_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  image_urls TEXT[], -- Array of image URLs
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  admin_response TEXT,
  admin_response_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, order_id, menu_item_id) -- One review per item per order
);

-- Review helpfulness votes
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES item_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- ============================================
-- 5. PROMOTIONS & MARKETING
-- ============================================

-- Promo codes and coupons
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_delivery')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER, -- NULL = unlimited
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'new_users', 'loyal_users')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo code usage tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promo_code_id, order_id)
);

-- Flash sales / Limited time offers
CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5, 2) NOT NULL,
  applicable_items UUID[], -- Array of menu_item_id
  applicable_categories UUID[], -- Array of category_id
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ENHANCED MENU FEATURES
-- ============================================

-- Add dietary and nutritional info to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS dietary_tags TEXT[]; -- ['vegetarian', 'vegan', 'gluten-free', 'jain', 'halal']
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT[]; -- ['nuts', 'dairy', 'eggs', 'shellfish']
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS spice_level TEXT CHECK (spice_level IN ('mild', 'medium', 'spicy', 'extra_spicy'));
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS calories INTEGER;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_chef_special BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS customization_options JSONB; -- {"extra_cheese": 20, "no_onion": 0}

-- Combo meals
CREATE TABLE IF NOT EXISTS combo_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price DECIMAL(10, 2) NOT NULL,
  combo_price DECIMAL(10, 2) NOT NULL,
  item_ids UUID[] NOT NULL, -- Array of menu_item_id
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. ADVANCED BOOKING FEATURES
-- ============================================

-- Add new columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS occasion_type TEXT; -- 'birthday', 'anniversary', 'business', 'celebration'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS table_preference TEXT; -- 'window', 'outdoor', 'private', 'no_preference'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_party_booking BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_arrangements JSONB; -- {"cake_arrangement": true, "decoration": "balloons"}
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT; -- 'weekly', 'monthly'

-- Waitlist for when tables are full
CREATE TABLE IF NOT EXISTS booking_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  guests INTEGER NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'expired')),
  notified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('order', 'booking', 'promotion', 'account', 'general')),
  reference_id UUID, -- order_id, booking_id, etc.
  is_read BOOLEAN DEFAULT false,
  sent_via TEXT[], -- ['email', 'sms', 'push', 'whatsapp']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  booking_reminders BOOLEAN DEFAULT true,
  promotional_offers BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. USER PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'kn')),
  theme_preference TEXT DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  dietary_preference TEXT[], -- ['vegetarian', 'vegan', 'non-vegetarian']
  allergen_warnings TEXT[],
  spice_tolerance TEXT DEFAULT 'medium',
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorite menu items
CREATE TABLE IF NOT EXISTS favorite_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- ============================================
-- 10. ENHANCED PROFILES
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anniversary_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- ============================================
-- 11. PAYMENT METHODS
-- ============================================

CREATE TABLE IF NOT EXISTS saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT CHECK (payment_type IN ('card', 'upi', 'wallet')),
  card_last_four TEXT,
  card_brand TEXT, -- 'Visa', 'Mastercard', etc.
  upi_id TEXT,
  wallet_provider TEXT, -- 'PhonePe', 'GPay', 'Paytm'
  is_default BOOLEAN DEFAULT false,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS split_payments JSONB; -- For split payment tracking

-- ============================================
-- 12. EVENTS & CATERING
-- ============================================

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

CREATE TABLE IF NOT EXISTS catering_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT, -- 'wedding', 'corporate', 'birthday', 'other'
  event_date DATE NOT NULL,
  expected_guests INTEGER NOT NULL,
  venue_address TEXT NOT NULL,
  menu_preferences TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'confirmed', 'completed', 'cancelled')),
  admin_quote DECIMAL(10, 2),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 13. INVENTORY MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  category TEXT, -- 'vegetables', 'spices', 'proteins', 'dairy'
  current_stock DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- 'kg', 'liters', 'pieces'
  reorder_level DECIMAL(10, 2) NOT NULL,
  supplier_name TEXT,
  supplier_contact TEXT,
  last_ordered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu item ingredients mapping
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10, 2) NOT NULL, -- per serving
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 14. ANALYTICS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS daily_sales_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_delivery_orders INTEGER DEFAULT 0,
  total_dine_in_orders INTEGER DEFAULT 0,
  total_takeaway_orders INTEGER DEFAULT 0,
  average_order_value DECIMAL(10, 2) DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Delivery Addresses
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON delivery_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON delivery_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON delivery_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON delivery_addresses FOR DELETE USING (auth.uid() = user_id);

-- Delivery Zones (public read, admin write)
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view delivery zones" ON delivery_zones FOR SELECT USING (true);
CREATE POLICY "Only admins can modify delivery zones" ON delivery_zones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Loyalty Points
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own loyalty points" ON loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert loyalty points" ON loyalty_points FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loyalty Tiers (public read)
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view loyalty tiers" ON loyalty_tiers FOR SELECT USING (true);

-- Points Transactions
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Item Reviews
ALTER TABLE item_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view item reviews" ON item_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for own orders" ON item_reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM orders WHERE id = item_reviews.order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own reviews" ON item_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all reviews" ON item_reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Review Votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all review votes" ON review_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on reviews" ON review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Promo Codes (public read active codes)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active promo codes" ON promo_codes FOR SELECT USING (is_active = true AND valid_until > NOW());
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Promo Code Usage
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own promo usage" ON promo_code_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all promo usage" ON promo_code_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Flash Sales (public read)
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active flash sales" ON flash_sales FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage flash sales" ON flash_sales FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Combo Meals (public read)
ALTER TABLE combo_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view combo meals" ON combo_meals FOR SELECT USING (true);
CREATE POLICY "Admins can manage combo meals" ON combo_meals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Waitlist
ALTER TABLE booking_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own waitlist entries" ON booking_waitlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to waitlist" ON booking_waitlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all waitlist" ON booking_waitlist FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Notification Preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- User Preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Favorite Items
ALTER TABLE favorite_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON favorite_items FOR ALL USING (auth.uid() = user_id);

-- Saved Payment Methods
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own payment methods" ON saved_payment_methods FOR ALL USING (auth.uid() = user_id);

-- Events (public read)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Catering Requests
ALTER TABLE catering_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own catering requests" ON catering_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create catering requests" ON catering_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all catering requests" ON catering_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update catering requests" ON catering_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inventory (admin only)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage inventory" ON inventory_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Menu Item Ingredients (admin only)
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage ingredients mapping" ON menu_item_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Daily Sales Stats (admin read)
ALTER TABLE daily_sales_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view sales stats" ON daily_sales_stats FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at triggers
CREATE TRIGGER update_delivery_addresses_updated_at BEFORE UPDATE ON delivery_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON loyalty_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_reviews_updated_at BEFORE UPDATE ON item_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combo_meals_updated_at BEFORE UPDATE ON combo_meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catering_requests_updated_at BEFORE UPDATE ON catering_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate referral code for new users
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code BEFORE INSERT ON profiles
  FOR EACH ROW WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION generate_referral_code();

-- Auto-calculate loyalty tier based on points
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_tier_id UUID;
BEGIN
  SELECT id INTO new_tier_id
  FROM loyalty_tiers
  WHERE NEW.total_points >= min_points
  ORDER BY min_points DESC
  LIMIT 1;
  
  IF new_tier_id IS NOT NULL AND new_tier_id != OLD.current_tier_id THEN
    NEW.current_tier_id := new_tier_id;
    NEW.tier_updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_loyalty_tier BEFORE UPDATE ON loyalty_points
  FOR EACH ROW WHEN (NEW.total_points != OLD.total_points)
  EXECUTE FUNCTION update_loyalty_tier();

-- Award loyalty points after order completion
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  points_to_award INTEGER;
  multiplier DECIMAL(3, 2) := 1.0;
BEGIN
  -- Only award points when order is delivered/completed and payment is successful
  IF NEW.status = 'delivered' AND NEW.payment_status = 'completed' 
     AND (OLD.status != 'delivered' OR OLD.payment_status != 'completed') THEN
    
    -- Calculate points: 1 point per ₹10 spent
    points_to_award := FLOOR(NEW.total / 10);
    
    -- Get user's tier multiplier
    SELECT COALESCE(lt.points_multiplier, 1.0) INTO multiplier
    FROM loyalty_points lp
    LEFT JOIN loyalty_tiers lt ON lp.current_tier_id = lt.id
    WHERE lp.user_id = NEW.user_id;
    
    -- Apply multiplier
    points_to_award := FLOOR(points_to_award * multiplier);
    
    -- Update loyalty points
    INSERT INTO loyalty_points (user_id, total_points, lifetime_points)
    VALUES (NEW.user_id, points_to_award, points_to_award)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = loyalty_points.total_points + points_to_award,
      lifetime_points = loyalty_points.lifetime_points + points_to_award,
      updated_at = NOW();
    
    -- Record transaction
    INSERT INTO points_transactions (user_id, points, transaction_type, reference_id, description)
    VALUES (NEW.user_id, points_to_award, 'earned', NEW.id, 'Points earned from order #' || NEW.id);
    
    -- Update order with points earned
    NEW.loyalty_points_earned := points_to_award;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_order_completion BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION award_loyalty_points();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default loyalty tiers
INSERT INTO loyalty_tiers (tier_name, min_points, discount_percentage, points_multiplier, tier_color, benefits) VALUES
  ('Bronze', 0, 0, 1.0, '#CD7F32', '{"description": "Welcome tier for all new members"}'),
  ('Silver', 500, 5, 1.2, '#C0C0C0', '{"free_delivery_orders": 2, "birthday_bonus": 50}'),
  ('Gold', 1500, 10, 1.5, '#FFD700', '{"free_delivery": true, "priority_support": true, "birthday_bonus": 100}'),
  ('Platinum', 5000, 15, 2.0, '#E5E4E2', '{"free_delivery": true, "priority_support": true, "exclusive_events": true, "birthday_bonus": 200}')
ON CONFLICT (tier_name) DO NOTHING;

-- Insert default delivery zones for Vijayapura
INSERT INTO delivery_zones (zone_name, distance_from_restaurant_km, delivery_fee, minimum_order_amount, estimated_delivery_time_min, is_active) VALUES
  ('City Center (0-3 km)', 2.5, 20, 100, 30, true),
  ('Extended Area (3-5 km)', 4.0, 40, 150, 45, true),
  ('Outskirts (5-8 km)', 7.0, 60, 200, 60, true)
ON CONFLICT DO NOTHING;

-- Sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until, applicable_to, is_active) VALUES
  ('WELCOME50', 'Welcome bonus for new users', 'percentage', 50, 200, 100, NULL, NOW() + INTERVAL '90 days', 'new_users', true),
  ('FIRSTORDER', 'First order discount', 'fixed', 100, 300, NULL, NULL, NOW() + INTERVAL '90 days', 'new_users', true),
  ('FREEDEL', 'Free delivery on orders above ₹500', 'free_delivery', 0, 500, NULL, NULL, NOW() + INTERVAL '90 days', 'all', true),
  ('FEAST20', 'Get 20% off on orders above ₹1000', 'percentage', 20, 1000, 200, NULL, NOW() + INTERVAL '30 days', 'all', true)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE delivery_addresses IS 'Customer delivery addresses for food delivery';
COMMENT ON TABLE loyalty_points IS 'Customer loyalty points and tier tracking';
COMMENT ON TABLE promo_codes IS 'Promotional discount codes and coupons';
COMMENT ON TABLE item_reviews IS 'Customer reviews for individual menu items';
COMMENT ON TABLE notifications IS 'User notifications for orders, bookings, and promotions';
COMMENT ON TABLE combo_meals IS 'Combo meal packages at discounted prices';
COMMENT ON TABLE events IS 'Restaurant events like live music, workshops, etc.';
COMMENT ON TABLE catering_requests IS 'Catering service requests for external events';
COMMENT ON TABLE inventory_items IS 'Inventory management for ingredients and supplies';
