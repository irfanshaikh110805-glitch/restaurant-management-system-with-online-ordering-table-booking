-- ====================================================================
-- HOTEL EVEREST FAMILY RESTAURANT - COMPLETE DATABASE SETUP
-- All-In-One Database Schema, Triggers, RLS Policies & Seed Data
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS & CORE FUNCTIONS
-- ────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────────────
-- 2. CORE & USER TABLES
-- ────────────────────────────────────────────────────────────────────

-- 1. Profiles (linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  date_of_birth DATE,
  anniversary_date DATE,
  profile_image_url TEXT,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menu Categories
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  image_url_2 TEXT,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  dietary_tags TEXT[],
  dietary_info TEXT,
  allergens TEXT[],
  spice_level TEXT CHECK (spice_level IN ('mild', 'medium', 'spicy', 'extra_spicy')),
  calories INTEGER,
  prep_time_minutes INTEGER,
  is_chef_special BOOLEAN DEFAULT false,
  is_seasonal BOOLEAN DEFAULT false,
  customization_options JSONB,
  rating DECIMAL(3,2) DEFAULT 4.5,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Delivery Addresses
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL DEFAULT 'Vijayapura',
  state TEXT NOT NULL DEFAULT 'Karnataka',
  pincode TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Delivery Zones
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  pincode_pattern TEXT,
  distance_from_restaurant_km DECIMAL(5, 2),
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
  estimated_delivery_time_min INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT,
  phone TEXT,
  delivery_address TEXT,
  delivery_address_id UUID REFERENCES public.delivery_addresses(id) ON DELETE SET NULL,
  table_number TEXT,
  order_type TEXT DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'takeout', 'delivery')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'pay-at-restaurant',
  razorpay_order_id TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2),
  instructions TEXT,
  special_instructions TEXT,
  delivery_time_slot TEXT,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  delivery_notes TEXT,
  loyalty_points_used INTEGER DEFAULT 0,
  loyalty_points_earned INTEGER DEFAULT 0,
  promo_code_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  item_id UUID REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Delivery Tracking
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delivery_status TEXT DEFAULT 'confirmed' CHECK (delivery_status IN ('confirmed','preparing','ready','picked_up','delivered','cancelled')),
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  delivery_notes TEXT,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  payment_gateway TEXT DEFAULT 'razorpay',
  failure_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  split_payments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0 AND guests <= 20),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  special_requests TEXT,
  occasion_type TEXT,
  table_preference TEXT,
  is_party_booking BOOLEAN DEFAULT false,
  special_arrangements JSONB,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Booking Waitlist
CREATE TABLE IF NOT EXISTS public.booking_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  guests INTEGER NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'expired')),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. General Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_text TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  images TEXT[],
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_response TEXT,
  admin_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Item Specific Reviews
CREATE TABLE IF NOT EXISTS public.item_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  image_urls TEXT[],
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  admin_response TEXT,
  admin_response_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, order_id, menu_item_id)
);

-- 14. Review Votes
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- 15. Promo Codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_delivery')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  applicable_to TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  tier_required VARCHAR(20) CHECK (tier_required IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Promo Code Usage
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Loyalty Tiers
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  min_points INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  points_multiplier DECIMAL(3,2) DEFAULT 1.0,
  benefits JSONB,
  tier_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Loyalty Points
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_tier_id UUID REFERENCES public.loyalty_tiers(id),
  lifetime_points INTEGER DEFAULT 0,
  tier_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Points Transactions
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus', 'referral')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Loyalty Rewards
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type TEXT DEFAULT 'discount',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_reward_points INTEGER DEFAULT 0,
  referred_reward_points INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Flash Sales
CREATE TABLE IF NOT EXISTS public.flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5, 2) NOT NULL,
  applicable_items UUID[],
  applicable_categories UUID[],
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('order', 'booking', 'promotion', 'account', 'general')),
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  sent_via TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  booking_reminders BOOLEAN DEFAULT true,
  promotional_offers BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'kn')),
  theme_preference TEXT DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  dietary_preference TEXT[],
  allergen_warnings TEXT[],
  spice_tolerance TEXT DEFAULT 'medium',
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Favorite Items
CREATE TABLE IF NOT EXISTS public.favorite_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- 27. Saved Payment Methods
CREATE TABLE IF NOT EXISTS public.saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT CHECK (payment_type IN ('card', 'upi', 'wallet')),
  card_last_four TEXT,
  card_brand TEXT,
  upi_id TEXT,
  wallet_provider TEXT,
  is_default BOOLEAN DEFAULT false,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. Event Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 30. Catering Requests
CREATE TABLE IF NOT EXISTS public.catering_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT,
  event_date DATE NOT NULL,
  expected_guests INTEGER NOT NULL,
  venue_address TEXT NOT NULL,
  menu_preferences TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'confirmed', 'completed', 'cancelled')),
  admin_quote DECIMAL(10, 2),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. Combo Meals
CREATE TABLE IF NOT EXISTS public.combo_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price DECIMAL(10, 2) NOT NULL,
  combo_price DECIMAL(10, 2) NOT NULL,
  item_ids UUID[] NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- 3. TRIGGERS & FUNCTIONS
-- ────────────────────────────────────────────────────────────────────

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_addresses_updated_at BEFORE UPDATE ON public.delivery_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON public.delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_item_reviews_updated_at BEFORE UPDATE ON public.item_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_catering_requests_updated_at BEFORE UPDATE ON public.catering_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_combo_meals_updated_at BEFORE UPDATE ON public.combo_meals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function and trigger to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := 'HE' || UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 6));

  INSERT INTO public.profiles (id, full_name, phone, role, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    ref_code
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.loyalty_points (user_id, total_points, lifetime_points)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent double bookings
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_slot 
  ON public.bookings(booking_date, booking_time) 
  WHERE status != 'cancelled';

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_meals ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- MENU CATEGORIES
DROP POLICY IF EXISTS "Public read categories" ON public.menu_categories;
CREATE POLICY "Public read categories" ON public.menu_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write categories" ON public.menu_categories;
CREATE POLICY "Admin write categories" ON public.menu_categories FOR ALL USING (public.is_admin());

-- MENU ITEMS
DROP POLICY IF EXISTS "Public read menu items" ON public.menu_items;
CREATE POLICY "Public read menu items" ON public.menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write menu items" ON public.menu_items;
CREATE POLICY "Admin write menu items" ON public.menu_items FOR ALL USING (public.is_admin());

-- COMBO MEALS
DROP POLICY IF EXISTS "Public read combo meals" ON public.combo_meals;
CREATE POLICY "Public read combo meals" ON public.combo_meals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write combo meals" ON public.combo_meals;
CREATE POLICY "Admin write combo meals" ON public.combo_meals FOR ALL USING (public.is_admin());

-- DELIVERY ADDRESSES
DROP POLICY IF EXISTS "Users read own addresses" ON public.delivery_addresses;
CREATE POLICY "Users read own addresses" ON public.delivery_addresses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert own addresses" ON public.delivery_addresses;
CREATE POLICY "Users insert own addresses" ON public.delivery_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own addresses" ON public.delivery_addresses;
CREATE POLICY "Users update own addresses" ON public.delivery_addresses FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users delete own addresses" ON public.delivery_addresses;
CREATE POLICY "Users delete own addresses" ON public.delivery_addresses FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- DELIVERY ZONES
DROP POLICY IF EXISTS "Public read delivery zones" ON public.delivery_zones;
CREATE POLICY "Public read delivery zones" ON public.delivery_zones FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage delivery zones" ON public.delivery_zones;
CREATE POLICY "Admin manage delivery zones" ON public.delivery_zones FOR ALL USING (public.is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users/Admins update orders" ON public.orders;
CREATE POLICY "Users/Admins update orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE USING (public.is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR public.is_admin()
);
DROP POLICY IF EXISTS "Users insert own order items" ON public.order_items;
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR public.is_admin()
);
DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- DELIVERY TRACKING
DROP POLICY IF EXISTS "Users read own tracking" ON public.delivery_tracking;
CREATE POLICY "Users read own tracking" ON public.delivery_tracking FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = delivery_tracking.order_id AND orders.user_id = auth.uid()) OR public.is_admin()
);
DROP POLICY IF EXISTS "Admins manage tracking" ON public.delivery_tracking;
CREATE POLICY "Admins manage tracking" ON public.delivery_tracking FOR ALL USING (public.is_admin());

-- PAYMENTS
DROP POLICY IF EXISTS "Users read own payments" ON public.payments;
CREATE POLICY "Users read own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()) OR public.is_admin()
);
DROP POLICY IF EXISTS "System/Users insert payments" ON public.payments;
CREATE POLICY "System/Users insert payments" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()) OR public.is_admin()
);
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.is_admin());

-- BOOKINGS
DROP POLICY IF EXISTS "Users read own bookings" ON public.bookings;
CREATE POLICY "Users read own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert own bookings" ON public.bookings;
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users update own bookings" ON public.bookings;
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage bookings" ON public.bookings;
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL USING (public.is_admin());

-- BOOKING WAITLIST
DROP POLICY IF EXISTS "Users read own waitlist" ON public.booking_waitlist;
CREATE POLICY "Users read own waitlist" ON public.booking_waitlist FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert own waitlist" ON public.booking_waitlist;
CREATE POLICY "Users insert own waitlist" ON public.booking_waitlist FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage waitlist" ON public.booking_waitlist;
CREATE POLICY "Admins manage waitlist" ON public.booking_waitlist FOR ALL USING (public.is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users insert own review" ON public.reviews;
CREATE POLICY "Users insert own review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users/Admins update reviews" ON public.reviews;
CREATE POLICY "Users/Admins update reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins delete reviews" ON public.reviews;
CREATE POLICY "Admins delete reviews" ON public.reviews FOR DELETE USING (public.is_admin());

-- ITEM REVIEWS
DROP POLICY IF EXISTS "Public read item reviews" ON public.item_reviews;
CREATE POLICY "Public read item reviews" ON public.item_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users insert own item review" ON public.item_reviews;
CREATE POLICY "Users insert own item review" ON public.item_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users/Admins update item reviews" ON public.item_reviews;
CREATE POLICY "Users/Admins update item reviews" ON public.item_reviews FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins delete item reviews" ON public.item_reviews;
CREATE POLICY "Admins delete item reviews" ON public.item_reviews FOR DELETE USING (public.is_admin());

-- REVIEW VOTES
DROP POLICY IF EXISTS "Public read votes" ON public.review_votes;
CREATE POLICY "Public read votes" ON public.review_votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage own vote" ON public.review_votes;
CREATE POLICY "Users manage own vote" ON public.review_votes FOR ALL USING (auth.uid() = user_id);

-- PROMO CODES
DROP POLICY IF EXISTS "Select promo codes" ON public.promo_codes;
CREATE POLICY "Select promo codes" ON public.promo_codes FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage promo codes" ON public.promo_codes;
CREATE POLICY "Admin manage promo codes" ON public.promo_codes FOR ALL USING (public.is_admin());

-- PROMO CODE USAGE
DROP POLICY IF EXISTS "Users read own promo usage" ON public.promo_code_usage;
CREATE POLICY "Users read own promo usage" ON public.promo_code_usage FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert own promo usage" ON public.promo_code_usage;
CREATE POLICY "Users insert own promo usage" ON public.promo_code_usage FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- LOYALTY TIERS
DROP POLICY IF EXISTS "Public read loyalty tiers" ON public.loyalty_tiers;
CREATE POLICY "Public read loyalty tiers" ON public.loyalty_tiers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage loyalty tiers" ON public.loyalty_tiers;
CREATE POLICY "Admin manage loyalty tiers" ON public.loyalty_tiers FOR ALL USING (public.is_admin());

-- LOYALTY POINTS
DROP POLICY IF EXISTS "Users read own loyalty points" ON public.loyalty_points;
CREATE POLICY "Users read own loyalty points" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users/System update loyalty points" ON public.loyalty_points;
CREATE POLICY "Users/System update loyalty points" ON public.loyalty_points FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- POINTS TRANSACTIONS
DROP POLICY IF EXISTS "Users read own transactions" ON public.points_transactions;
CREATE POLICY "Users read own transactions" ON public.points_transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users/System insert transactions" ON public.points_transactions;
CREATE POLICY "Users/System insert transactions" ON public.points_transactions FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- LOYALTY REWARDS
DROP POLICY IF EXISTS "Public read loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Public read loyalty rewards" ON public.loyalty_rewards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Admin manage loyalty rewards" ON public.loyalty_rewards FOR ALL USING (public.is_admin());

-- REFERRALS
DROP POLICY IF EXISTS "Users read own referrals" ON public.referrals;
CREATE POLICY "Users read own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert referrals" ON public.referrals;
CREATE POLICY "Users insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users/Admins update referrals" ON public.referrals;
CREATE POLICY "Users/Admins update referrals" ON public.referrals FOR UPDATE USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.is_admin());

-- FLASH SALES
DROP POLICY IF EXISTS "Public read flash sales" ON public.flash_sales;
CREATE POLICY "Public read flash sales" ON public.flash_sales FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage flash sales" ON public.flash_sales;
CREATE POLICY "Admin manage flash sales" ON public.flash_sales FOR ALL USING (public.is_admin());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Allow notification creation" ON public.notifications;
CREATE POLICY "Allow notification creation" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users delete own notifications" ON public.notifications;
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- NOTIFICATION PREFERENCES
DROP POLICY IF EXISTS "Users manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users manage own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- USER PREFERENCES
DROP POLICY IF EXISTS "Users manage own user preferences" ON public.user_preferences;
CREATE POLICY "Users manage own user preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- FAVORITE ITEMS
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorite_items;
CREATE POLICY "Users manage own favorites" ON public.favorite_items FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- SAVED PAYMENT METHODS
DROP POLICY IF EXISTS "Users manage own saved payment methods" ON public.saved_payment_methods;
CREATE POLICY "Users manage own saved payment methods" ON public.saved_payment_methods FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- EVENTS
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage events" ON public.events;
CREATE POLICY "Admin manage events" ON public.events FOR ALL USING (public.is_admin());

-- EVENT REGISTRATIONS
DROP POLICY IF EXISTS "Users read own event registrations" ON public.event_registrations;
CREATE POLICY "Users read own event registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert own event registrations" ON public.event_registrations;
CREATE POLICY "Users insert own event registrations" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users/Admins manage event registrations" ON public.event_registrations;
CREATE POLICY "Users/Admins manage event registrations" ON public.event_registrations FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- CATERING REQUESTS
DROP POLICY IF EXISTS "Users read own catering requests" ON public.catering_requests;
CREATE POLICY "Users read own catering requests" ON public.catering_requests FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users insert own catering requests" ON public.catering_requests;
CREATE POLICY "Users insert own catering requests" ON public.catering_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage catering requests" ON public.catering_requests;
CREATE POLICY "Admins manage catering requests" ON public.catering_requests FOR ALL USING (public.is_admin());

-- STORAGE (menu-images)
DROP POLICY IF EXISTS "Public read menu images" ON storage.objects;
CREATE POLICY "Public read menu images" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
DROP POLICY IF EXISTS "Authenticated users upload menu images" ON storage.objects;
CREATE POLICY "Authenticated users upload menu images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users update menu images" ON storage.objects;
CREATE POLICY "Authenticated users update menu images" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────────────
-- 5. INITIAL SEED DATA
-- ────────────────────────────────────────────────────────────────────

-- Categories
INSERT INTO public.menu_categories (name, display_order) VALUES
  ('Starters', 1),
  ('Biryani', 2),
  ('Kebabs', 3),
  ('Main Course', 4),
  ('Chinese', 5),
  ('Desserts', 6),
  ('Beverages', 7)
ON CONFLICT (name) DO NOTHING;

-- Menu Items
DO $$
DECLARE
  cat_starters UUID;
  cat_biryani UUID;
  cat_kebabs UUID;
  cat_main UUID;
  cat_chinese UUID;
  cat_desserts UUID;
  cat_beverages UUID;
BEGIN
  SELECT id INTO cat_starters FROM public.menu_categories WHERE name = 'Starters';
  SELECT id INTO cat_biryani FROM public.menu_categories WHERE name = 'Biryani';
  SELECT id INTO cat_kebabs FROM public.menu_categories WHERE name = 'Kebabs';
  SELECT id INTO cat_main FROM public.menu_categories WHERE name = 'Main Course';
  SELECT id INTO cat_chinese FROM public.menu_categories WHERE name = 'Chinese';
  SELECT id INTO cat_desserts FROM public.menu_categories WHERE name = 'Desserts';
  SELECT id INTO cat_beverages FROM public.menu_categories WHERE name = 'Beverages';

  INSERT INTO public.menu_items (name, description, price, category_id, is_available, is_featured, dietary_info, dietary_tags, spice_level, rating, order_count, image_url)
  VALUES 
    ('Paneer Tikka Platter', 'Cottage cheese cubes marinated in spiced yogurt and grilled in traditional clay oven.', 280.00, cat_starters, true, true, 'Vegetarian', ARRAY['vegetarian', 'gluten-free'], 'medium', 4.8, 142, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=60'),
    ('Crispy Corn Delight', 'Golden fried sweet corn tossed with bell peppers, green chilies, and aromatic herbs.', 210.00, cat_starters, true, false, 'Vegetarian', ARRAY['vegetarian'], 'mild', 4.5, 95, 'https://images.unsplash.com/photo-1514944298352-fa0f9d8f63bf?w=800&auto=format&fit=crop&q=60'),
    ('Chicken Malai Tikka', 'Tender chicken morsels steeped in rich cream, cashew paste, and gentle royal cardamom.', 340.00, cat_starters, true, true, 'Non-Vegetarian', ARRAY['halal'], 'mild', 4.9, 210, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=60'),
    ('Hyderabadi Dum Biryani (Chicken)', 'Fragrant basmati rice layered with spiced marinated chicken and slow-cooked with royal saffron.', 380.00, cat_biryani, true, true, 'Non-Vegetarian', ARRAY['halal'], 'spicy', 4.9, 450, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60'),
    ('Mutton Royal Dum Biryani', 'Prime tender cuts of mutton simmered in fragrant awadhi spices, layered with aged basmati rice.', 480.00, cat_biryani, true, true, 'Non-Vegetarian', ARRAY['halal'], 'spicy', 5.0, 380, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60'),
    ('Everest Special Veg Dum Biryani', 'Fresh farm garden vegetables, paneer cubes, and golden caramelized onions layered with long-grain rice.', 290.00, cat_biryani, true, false, 'Vegetarian', ARRAY['vegetarian'], 'medium', 4.7, 180, 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=60'),
    ('Galouti Kebab', 'Melt-in-mouth minced mutton patties infused with 16 exotic royal spices, served on miniature parathas.', 420.00, cat_kebabs, true, true, 'Non-Vegetarian', ARRAY['halal'], 'medium', 4.9, 190, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60'),
    ('Seekh Kebab Supreme', 'Finely spiced minced lamb grilled over charcoal sigris, garnished with fresh mint & onion rings.', 390.00, cat_kebabs, true, false, 'Non-Vegetarian', ARRAY['halal'], 'spicy', 4.8, 160, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=60'),
    ('Butter Chicken Everest Special', 'Tandoor grilled chicken chunks simmered in a velvety, buttery tomato & cashew silk gravy.', 390.00, cat_main, true, true, 'Non-Vegetarian', ARRAY['halal'], 'mild', 4.9, 520, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=60'),
    ('Paneer Butter Masala', 'Fresh cottage cheese cubes gently cooked in a creamy spiced tomato gravy with fragrant kasuri methi.', 310.00, cat_main, true, true, 'Vegetarian', ARRAY['vegetarian'], 'mild', 4.8, 310, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=60'),
    ('Dal Makhani Bukhara', 'Whole black lentils slow simmered overnight over live charcoal, enriched with fresh dairy butter.', 260.00, cat_main, true, false, 'Vegetarian', ARRAY['vegetarian', 'gluten-free'], 'mild', 4.8, 280, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60'),
    ('Shahi Gulab Jamun', 'Warm deep-fried milk dumplings soaked in cardamom saffron sugar syrup, topped with pistachio slivers.', 140.00, cat_desserts, true, true, 'Vegetarian', ARRAY['vegetarian'], 'mild', 4.9, 340, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=60'),
    ('Royal Kesar Pista Falooda', 'Traditional chilled beverage dessert layered with basil seeds, vermicelli, saffron syrup, and rich kulfi.', 180.00, cat_desserts, true, true, 'Vegetarian', ARRAY['vegetarian'], 'mild', 4.9, 290, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=60'),
    ('Fresh Mint Mojito', 'Crushed fresh garden mint, lime wedges, and bubbly soda over crushed crystal ice.', 130.00, cat_beverages, true, false, 'Vegetarian', ARRAY['vegetarian', 'vegan'], 'mild', 4.6, 210, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=60');
END $$;

-- Loyalty Tiers
INSERT INTO public.loyalty_tiers (tier_name, min_points, discount_percentage, points_multiplier, tier_color, benefits) VALUES
  ('Bronze', 0, 0, 1.0, '#CD7F32', '{"perks": ["Earn 1 point per ₹10 spent", "Birthday special offer"]}'),
  ('Silver', 500, 5, 1.2, '#C0C0C0', '{"perks": ["5% flat discount", "1.2x points multiplier", "Priority table reservations"]}'),
  ('Gold', 1500, 10, 1.5, '#FFD700', '{"perks": ["10% flat discount", "1.5x points multiplier", "Free delivery on all orders", "Complimentary welcome drink"]}'),
  ('Platinum', 3000, 15, 2.0, '#E5E4E2', '{"perks": ["15% flat discount", "2.0x points multiplier", "Chef special tasting previews", "Dedicated VIP concierge"]}')
ON CONFLICT (tier_name) DO NOTHING;

-- Loyalty Rewards
INSERT INTO public.loyalty_rewards (reward_name, title, description, points_required, reward_type, is_active) VALUES
  ('₹100 Off Dining Voucher', '₹100 Off Dining Voucher', 'Redeem on your next dine-in or online delivery order.', 200, 'discount', true),
  ('Complimentary Royal Dessert', 'Complimentary Royal Dessert', 'Chef special Shahi Gulab Jamun or Kulfi Falooda.', 350, 'free_item', true),
  ('₹250 Grand Feast Voucher', '₹250 Grand Feast Voucher', 'Applicable on orders above ₹1,000.', 500, 'discount', true),
  ('VIP Table Upgrade + Welcome Drink', 'VIP Table Upgrade + Welcome Drink', 'Priority seating and complimentary welcome drink.', 800, 'experience', true)
ON CONFLICT DO NOTHING;

-- Delivery Zones
INSERT INTO public.delivery_zones (zone_name, distance_from_restaurant_km, delivery_fee, minimum_order_amount, estimated_delivery_time_min, is_active) VALUES
  ('Central Vijayapura (MG Road / Station)', 3.0, 0.00, 200.00, 25, true),
  ('Golgumbaz & Heritage Quarter', 5.0, 30.00, 250.00, 35, true),
  ('Outer Ring Road & Extended Suburbs', 10.0, 50.00, 400.00, 45, true)
ON CONFLICT DO NOTHING;

-- Promo Codes
INSERT INTO public.promo_codes (code, description, discount_type, discount_value, min_order_amount, max_discount, max_discount_amount, valid_from, valid_until, is_active) VALUES
  ('WELCOME50', 'Flat ₹50 off on your first order above ₹299', 'fixed', 50.00, 299.00, 50.00, 50.00, NOW(), NOW() + INTERVAL '1 year', true),
  ('EVEREST10', '10% instant discount on orders above ₹500', 'percentage', 10.00, 500.00, 150.00, 150.00, NOW(), NOW() + INTERVAL '1 year', true),
  ('FEAST20', '20% off on grand family feasts above ₹1,200', 'percentage', 20.00, 1200.00, 300.00, 300.00, NOW(), NOW() + INTERVAL '1 year', true)
ON CONFLICT (code) DO NOTHING;

-- Events
INSERT INTO public.events (title, description, event_type, event_date, event_time, duration_hours, max_attendees, current_attendees, is_bookable, booking_fee, is_active) VALUES
  ('Awadhi Biryani & Charcoal Kebab Festival', 'Celebrated masterchefs fire up live charcoal sigris to present royal dum pukht biryanis and melt-in-mouth kebabs.', 'cultural', CURRENT_DATE + 7, '19:30:00', 4, 100, 24, true, 0.00, true),
  ('Soulful Sufi Musical Evening & Royal Dinner', 'An enchanting acoustic live sufi music evening accompanied by a candlelit multi-course feast.', 'live_music', CURRENT_DATE + 14, '20:00:00', 3, 60, 18, true, 0.00, true)
ON CONFLICT DO NOTHING;
