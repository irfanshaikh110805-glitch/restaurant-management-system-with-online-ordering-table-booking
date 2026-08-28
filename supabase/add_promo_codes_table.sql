-- Add Promo Codes Table to Existing Database
-- Run this in Supabase SQL Editor if the promo_codes table is missing

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  tier_required VARCHAR(20) CHECK (tier_required IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid duplicates
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins delete promo codes" ON promo_codes;
DROP POLICY IF EXISTS "view_active_promos" ON promo_codes;
DROP POLICY IF EXISTS "admin_select_promos" ON promo_codes;
DROP POLICY IF EXISTS "admin_insert_promos" ON promo_codes;
DROP POLICY IF EXISTS "admin_update_promos" ON promo_codes;
DROP POLICY IF EXISTS "admin_delete_promos" ON promo_codes;

-- Create optimized policies (SINGLE policy per action)

-- SELECT - Admins see all, others see only active
CREATE POLICY "select_promos" 
  ON promo_codes FOR SELECT 
  USING (
    is_active = true 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- INSERT - Only admins
CREATE POLICY "insert_promos" 
  ON promo_codes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- UPDATE - Only admins
CREATE POLICY "update_promos" 
  ON promo_codes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- DELETE - Only admins
CREATE POLICY "delete_promos" 
  ON promo_codes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Add trigger for updated_at (if not already exists)
DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at 
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Force PostgREST to reload schema cache (fixes PGRST204 error)
NOTIFY pgrst, 'reload schema';

-- Insert sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, valid_until, is_active) VALUES
  ('WELCOME10', 'Get 10% off on your first order', 'percentage', 10, 100, NOW() + INTERVAL '30 days', true),
  ('SAVE20', 'Save 20% on orders above ₹500', 'percentage', 20, 500, NOW() + INTERVAL '30 days', true),
  ('FLAT100', 'Flat ₹100 off on orders above ₹1000', 'fixed', 100, 1000, NOW() + INTERVAL '30 days', true),
  ('WEEKEND25', 'Weekend special - 25% off', 'percentage', 25, 300, NOW() + INTERVAL '7 days', true),
  ('FIRSTORDER', 'First time user discount', 'percentage', 15, 0, NOW() + INTERVAL '90 days', true)
ON CONFLICT (code) DO NOTHING;

-- Verify table creation
SELECT 
  'promo_codes table created successfully!' as message,
  COUNT(*) as sample_promos
FROM promo_codes;
