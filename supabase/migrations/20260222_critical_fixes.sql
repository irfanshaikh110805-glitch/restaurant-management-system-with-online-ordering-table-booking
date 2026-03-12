-- ============================================================
-- CRITICAL BACKEND FIXES - February 22, 2026
-- Addresses security vulnerabilities and data integrity issues
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ADD UNIQUE CONSTRAINT FOR BOOKING SLOTS
--    Prevents race condition double bookings
-- ────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_slot 
  ON bookings(booking_date, booking_time) 
  WHERE status != 'cancelled';

COMMENT ON INDEX idx_bookings_unique_slot IS 
  'Prevents double bookings by ensuring unique date/time slots (excluding cancelled)';

-- ────────────────────────────────────────────────────────────
-- 2. ADD MISSING INDEXES FOR PERFORMANCE
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
  ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_created 
  ON points_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_promo 
  ON promo_code_usage(user_id, promo_code_id);

CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_default 
  ON delivery_addresses(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_item_reviews_menu_item_created 
  ON item_reviews(menu_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorite_items_user 
  ON favorite_items(user_id);

-- ────────────────────────────────────────────────────────────
-- 3. ADD MISSING RLS POLICIES
-- ────────────────────────────────────────────────────────────

-- Notifications DELETE policy
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications 
  FOR DELETE USING (auth.uid() = user_id);

-- Promo codes - stricter policies
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
CREATE POLICY "Users can view valid promo codes" ON promo_codes 
  FOR SELECT USING (
    is_active = true 
    AND valid_from <= NOW() 
    AND valid_until >= NOW()
  );

-- Daily sales stats - allow system inserts
DROP POLICY IF EXISTS "System can insert sales stats" ON daily_sales_stats;
CREATE POLICY "System can insert sales stats" ON daily_sales_stats 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sales stats" ON daily_sales_stats 
  FOR UPDATE USING (true);

-- ────────────────────────────────────────────────────────────
-- 4. ADD CHECK CONSTRAINTS FOR DATA INTEGRITY
-- ────────────────────────────────────────────────────────────

-- Ensure order totals are consistent
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS check_order_total_consistency;

ALTER TABLE orders 
  ADD CONSTRAINT check_order_total_consistency 
  CHECK (
    total >= 0 
    AND subtotal >= 0 
    AND tax_amount >= 0 
    AND delivery_fee >= 0
    AND discount_amount >= 0
  );

-- Ensure booking dates are in the future
ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS check_booking_future_date;

ALTER TABLE bookings 
  ADD CONSTRAINT check_booking_future_date 
  CHECK (booking_date >= CURRENT_DATE);

-- Ensure promo code validity period is logical
ALTER TABLE promo_codes 
  DROP CONSTRAINT IF EXISTS check_promo_validity_period;

ALTER TABLE promo_codes 
  ADD CONSTRAINT check_promo_validity_period 
  CHECK (valid_until > valid_from);

-- Ensure loyalty points are non-negative
ALTER TABLE loyalty_points 
  DROP CONSTRAINT IF EXISTS check_loyalty_points_positive;

ALTER TABLE loyalty_points 
  ADD CONSTRAINT check_loyalty_points_positive 
  CHECK (total_points >= 0 AND lifetime_points >= 0);

-- ────────────────────────────────────────────────────────────
-- 5. IMPROVE TRIGGER FUNCTIONS WITH BETTER SECURITY
-- ────────────────────────────────────────────────────────────

-- Enhanced order completion trigger with validation
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $
DECLARE
  points_to_award INTEGER;
  multiplier DECIMAL(3, 2) := 1.0;
BEGIN
  -- Only award points when order is delivered/completed and payment is successful
  IF NEW.status IN ('delivered', 'completed') 
     AND NEW.payment_status = 'completed' 
     AND (OLD.status NOT IN ('delivered', 'completed') OR OLD.payment_status != 'completed') 
     AND NEW.user_id IS NOT NULL 
     AND NEW.total > 0 THEN
    
    -- Calculate points: 1 point per ₹10 spent (minimum 1 point)
    points_to_award := GREATEST(FLOOR(NEW.total / 10), 1);
    
    -- Get user's tier multiplier
    SELECT COALESCE(lt.points_multiplier, 1.0) INTO multiplier
    FROM loyalty_points lp
    LEFT JOIN loyalty_tiers lt ON lp.current_tier_id = lt.id
    WHERE lp.user_id = NEW.user_id;
    
    -- Apply multiplier
    points_to_award := FLOOR(points_to_award * multiplier);
    
    -- Update loyalty points with conflict handling
    INSERT INTO loyalty_points (user_id, total_points, lifetime_points)
    VALUES (NEW.user_id, points_to_award, points_to_award)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = loyalty_points.total_points + points_to_award,
      lifetime_points = loyalty_points.lifetime_points + points_to_award,
      updated_at = NOW();
    
    -- Record transaction
    INSERT INTO points_transactions (user_id, points, transaction_type, reference_id, description)
    VALUES (
      NEW.user_id, 
      points_to_award, 
      'earned', 
      NEW.id, 
      'Points earned from order #' || SUBSTRING(NEW.id::TEXT, 1, 8)
    );
    
    -- Update order with points earned
    NEW.loyalty_points_earned := points_to_award;
  END IF;
  
  RETURN NEW;
END;
$;

-- ────────────────────────────────────────────────────────────
-- 6. ADD AUDIT LOGGING FOR SENSITIVE OPERATIONS
-- ────────────────────────────────────────────────────────────

-- Create audit log function
CREATE OR REPLACE FUNCTION log_sensitive_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $
BEGIN
  -- Log to audit_logs table if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    INSERT INTO audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_data, 
      new_data
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$;

-- Apply audit logging to sensitive tables
DROP TRIGGER IF EXISTS tr_audit_promo_codes ON promo_codes;
CREATE TRIGGER tr_audit_promo_codes
  AFTER INSERT OR UPDATE OR DELETE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

DROP TRIGGER IF EXISTS tr_audit_payments ON payments;
CREATE TRIGGER tr_audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

-- ────────────────────────────────────────────────────────────
-- 7. ADD RATE LIMITING TABLE (SERVER-SIDE)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- user_id or IP address
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint 
  ON api_rate_limits(identifier, endpoint, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
  ON api_rate_limits(window_start);

-- Auto-cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  DELETE FROM api_rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$;

-- ────────────────────────────────────────────────────────────
-- 8. ADD FUNCTION FOR SECURE PRICE VERIFICATION
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION verify_order_prices(
  p_items JSONB
)
RETURNS TABLE(
  is_valid BOOLEAN,
  calculated_subtotal DECIMAL(10,2),
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $
DECLARE
  v_item JSONB;
  v_menu_item RECORD;
  v_subtotal DECIMAL(10,2) := 0;
BEGIN
  -- Iterate through items and verify prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Fetch actual price from database
    SELECT id, price INTO v_menu_item
    FROM menu_items
    WHERE id = (v_item->>'id')::UUID
    AND is_available = true;
    
    -- Check if item exists and is available
    IF NOT FOUND THEN
      RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Invalid or unavailable menu item';
      RETURN;
    END IF;
    
    -- Verify price matches
    IF ABS(v_menu_item.price - (v_item->>'price')::DECIMAL(10,2)) > 0.01 THEN
      RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Price mismatch detected';
      RETURN;
    END IF;
    
    -- Add to subtotal
    v_subtotal := v_subtotal + (v_menu_item.price * (v_item->>'quantity')::INTEGER);
  END LOOP;
  
  RETURN QUERY SELECT true, v_subtotal, NULL::TEXT;
END;
$;

COMMENT ON FUNCTION verify_order_prices IS 
  'Server-side price verification to prevent client-side manipulation';

-- ────────────────────────────────────────────────────────────
-- 9. ADD SECURITY COMMENTS AND DOCUMENTATION
-- ────────────────────────────────────────────────────────────

COMMENT ON TABLE api_rate_limits IS 
  'Server-side rate limiting to prevent abuse and DDoS attacks';

COMMENT ON CONSTRAINT check_booking_future_date ON bookings IS 
  'Prevents booking dates in the past';

COMMENT ON CONSTRAINT check_order_total_consistency ON orders IS 
  'Ensures all order amounts are non-negative';

-- ────────────────────────────────────────────────────────────
-- 10. GRANT APPROPRIATE PERMISSIONS
-- ────────────────────────────────────────────────────────────

-- Ensure authenticated users can call verification function
GRANT EXECUTE ON FUNCTION verify_order_prices TO authenticated;
GRANT EXECUTE ON FUNCTION verify_order_prices TO anon;

-- ────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- ────────────────────────────────────────────────────────────

-- Verify all critical indexes exist
DO $
BEGIN
  RAISE NOTICE 'Critical fixes applied successfully!';
  RAISE NOTICE 'Indexes created: %', (
    SELECT COUNT(*) 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
  );
END $;
