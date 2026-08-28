-- FINAL COMPLETE FIX - Promo Codes Table
-- This will completely clean up and fix ALL policy issues
-- Run this in Supabase SQL Editor RIGHT NOW!

-- ====================================================================
-- STEP 1: DROP EVERY POSSIBLE POLICY (covers all old and new names)
-- ====================================================================

DO $$ 
BEGIN
    -- Drop all possible policy names
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
    
    RAISE NOTICE 'All old policies dropped successfully!';
END $$;

-- ====================================================================
-- STEP 2: CREATE CLEAN, OPTIMIZED POLICIES (ONE per action)
-- ====================================================================

-- Policy 1: SELECT - Combines public (active only) + admin (all)
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

-- Policy 2: INSERT - Only admins
CREATE POLICY "insert_promos" 
  ON promo_codes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Policy 3: UPDATE - Only admins
CREATE POLICY "update_promos" 
  ON promo_codes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Policy 4: DELETE - Only admins
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
-- STEP 3: FORCE SCHEMA RELOAD (Critical!)
-- ====================================================================

NOTIFY pgrst, 'reload schema';

-- ====================================================================
-- STEP 4: VERIFICATION
-- ====================================================================

-- Show final policy count (should be exactly 4)
DO $$ 
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'promo_codes';
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VERIFICATION RESULTS:';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Total policies on promo_codes: %', policy_count;
    
    IF policy_count = 4 THEN
        RAISE NOTICE '✅ SUCCESS! Exactly 4 policies (correct)';
    ELSE
        RAISE WARNING '❌ Expected 4 policies but found %', policy_count;
    END IF;
END $$;

-- List all policies (should show exactly 4)
SELECT 
    '✅ Policy List:' as status,
    policyname,
    cmd as action
FROM pg_policies 
WHERE tablename = 'promo_codes'
ORDER BY cmd, policyname;

-- Verify max_discount column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'promo_codes' 
            AND column_name = 'max_discount'
        ) 
        THEN '✅ max_discount column exists!'
        ELSE '❌ max_discount column MISSING!'
    END as column_check;

-- Final success message
DO $$ 
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✅ PROMO CODES TABLE IS NOW FIXED!';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your app (Ctrl + Shift + R)';
    RAISE NOTICE '2. Go to Admin → Promotions';
    RAISE NOTICE '3. Click "Create Promotion"';
    RAISE NOTICE '4. It should work perfectly now!';
    RAISE NOTICE '=============================================';
END $$;
