-- COMPLETE FIX - Creates Missing Column + Fixes All Policies
-- Run this ONCE in Supabase SQL Editor

-- ====================================================================
-- PART 1: ADD MISSING COLUMN (if it doesn't exist)
-- ====================================================================

DO $$ 
BEGIN
    -- Check if max_discount column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' 
        AND column_name = 'max_discount'
    ) THEN
        -- Add the column
        ALTER TABLE promo_codes ADD COLUMN max_discount DECIMAL(10,2);
        RAISE NOTICE '✅ Added max_discount column';
    ELSE
        RAISE NOTICE '✅ max_discount column already exists';
    END IF;
    
    -- Also add other potentially missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' 
        AND column_name = 'usage_count'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN usage_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added usage_count column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' 
        AND column_name = 'per_user_limit'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN per_user_limit INTEGER;
        RAISE NOTICE '✅ Added per_user_limit column';
    END IF;
END $$;

-- ====================================================================
-- PART 2: DROP ALL EXISTING POLICIES
-- ====================================================================

DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "Admins insert promo codes" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "Admins update promo codes" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "Admins delete promo codes" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all promo codes" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "view_active_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "admin_select_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "admin_insert_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "admin_update_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "admin_delete_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "select_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "insert_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "update_promos" ON promo_codes';
    EXECUTE 'DROP POLICY IF EXISTS "delete_promos" ON promo_codes';
    
    RAISE NOTICE '✅ Dropped all existing policies';
END $$;

-- ====================================================================
-- PART 3: CREATE CLEAN POLICIES (ONE per action)
-- ====================================================================

-- SELECT: Public sees active, admins see all
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

-- INSERT: Only admins
CREATE POLICY "insert_promos" 
  ON promo_codes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- UPDATE: Only admins
CREATE POLICY "update_promos" 
  ON promo_codes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- DELETE: Only admins
CREATE POLICY "delete_promos" 
  ON promo_codes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- ====================================================================
-- PART 4: ADD SAMPLE DATA (if table is empty)
-- ====================================================================

DO $$
DECLARE
    promo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO promo_count FROM promo_codes;
    
    IF promo_count = 0 THEN
        INSERT INTO promo_codes (
            code, 
            description, 
            discount_type, 
            discount_value,
            min_order_amount,
            max_discount,
            valid_from,
            valid_until,
            is_active
        ) VALUES
            ('WELCOME10', 'Get 10% off on your first order', 'percentage', 10, 100, 50, NOW(), NOW() + INTERVAL '30 days', true),
            ('SAVE20', 'Save 20% on orders above ₹500', 'percentage', 20, 500, 200, NOW(), NOW() + INTERVAL '30 days', true),
            ('FLAT100', 'Flat ₹100 off on orders above ₹1000', 'fixed', 100, 1000, 100, NOW(), NOW() + INTERVAL '30 days', true),
            ('WEEKEND25', 'Weekend special - 25% off', 'percentage', 25, 300, 300, NOW(), NOW() + INTERVAL '7 days', true),
            ('FIRSTORDER', 'First time user discount', 'percentage', 15, 0, 100, NOW(), NOW() + INTERVAL '90 days', true)
        ON CONFLICT (code) DO NOTHING;
        
        RAISE NOTICE '✅ Added 5 sample promo codes';
    ELSE
        RAISE NOTICE '✅ Promo codes already exist (% found)', promo_count;
    END IF;
END $$;

-- ====================================================================
-- PART 5: FORCE SCHEMA RELOAD
-- ====================================================================

NOTIFY pgrst, 'reload schema';

-- ====================================================================
-- PART 6: FINAL VERIFICATION
-- ====================================================================

DO $$ 
DECLARE
    policy_count INTEGER;
    column_exists BOOLEAN;
    promo_count INTEGER;
BEGIN
    -- Count policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'promo_codes';
    
    -- Check max_discount column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' 
        AND column_name = 'max_discount'
    ) INTO column_exists;
    
    -- Count promo codes
    SELECT COUNT(*) INTO promo_count FROM promo_codes;
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'FINAL VERIFICATION:';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Policy count: % (expected: 4)', policy_count;
    RAISE NOTICE 'max_discount column: %', CASE WHEN column_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'Promo codes in table: %', promo_count;
    RAISE NOTICE '=============================================';
    
    IF policy_count = 4 AND column_exists THEN
        RAISE NOTICE '✅✅✅ EVERYTHING IS FIXED! ✅✅✅';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Refresh your app (Ctrl + Shift + R)';
        RAISE NOTICE '2. Go to Admin → Promotions';
        RAISE NOTICE '3. Click "Create Promotion"';
        RAISE NOTICE '4. Fill the form and submit';
        RAISE NOTICE '5. IT WILL WORK! 🎉';
    ELSE
        RAISE WARNING '❌ Something is still wrong!';
        IF policy_count != 4 THEN
            RAISE WARNING 'Policy count is % but should be 4', policy_count;
        END IF;
        IF NOT column_exists THEN
            RAISE WARNING 'max_discount column is still missing!';
        END IF;
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'promo_codes' 
ORDER BY ordinal_position;

-- Show final policies
SELECT 
    policyname,
    cmd as action,
    permissive
FROM pg_policies 
WHERE tablename = 'promo_codes'
ORDER BY cmd, policyname;
