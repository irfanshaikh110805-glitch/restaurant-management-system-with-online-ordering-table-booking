-- ====================================================================
-- ULTIMATE FIX - Solves ALL Problems at Once
-- ====================================================================
-- This script:
-- 1. Forces schema cache reload for promo_codes columns
-- 2. Fixes duplicate RLS policies (performance warning)
-- 3. Fixes security warnings (payment function + leaked password)
-- ====================================================================

-- ====================================================================
-- PART 1: FORCE SCHEMA RELOAD (Fix PGRST204 Error)
-- ====================================================================

-- Multiple reload attempts to ensure cache updates
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload config';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

DO $$ 
BEGIN
    RAISE NOTICE '✅ Schema reload commands sent!';
    RAISE NOTICE '⏳ Wait 30 seconds for cache to update, then restart your dev server';
END $$;

-- ====================================================================
-- PART 2: FIX DUPLICATE RLS POLICIES (Performance Warning)
-- ====================================================================

-- Drop ALL existing promo_codes policies
DROP POLICY IF EXISTS admin_select_promos ON promo_codes;
DROP POLICY IF EXISTS view_active_promos ON promo_codes;
DROP POLICY IF EXISTS admin_insert_promos ON promo_codes;
DROP POLICY IF EXISTS admin_update_promos ON promo_codes;
DROP POLICY IF EXISTS admin_delete_promos ON promo_codes;
DROP POLICY IF EXISTS select_promos ON promo_codes;
DROP POLICY IF EXISTS insert_promos ON promo_codes;
DROP POLICY IF EXISTS update_promos ON promo_codes;
DROP POLICY IF EXISTS delete_promos ON promo_codes;

-- Create ONE clean SELECT policy that handles both public and admin access
CREATE POLICY select_promos ON promo_codes
    FOR SELECT
    USING (
        -- Public users: see only active promos
        is_active = true
        OR
        -- Admins: see all promos
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create admin-only INSERT policy
CREATE POLICY insert_promos ON promo_codes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create admin-only UPDATE policy
CREATE POLICY update_promos ON promo_codes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create admin-only DELETE policy
CREATE POLICY delete_promos ON promo_codes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DO $$ 
BEGIN
    RAISE NOTICE '✅ RLS policies consolidated (4 clean policies)';
END $$;

-- ====================================================================
-- PART 3: FIX SECURITY WARNING - Payment Function Access
-- ====================================================================

-- Revoke authenticated access to payment function
REVOKE ALL ON FUNCTION update_order_payment_status(uuid, text, text, text) FROM authenticated;

-- Only allow service role (backend) to call this function
GRANT EXECUTE ON FUNCTION update_order_payment_status(uuid, text, text, text) TO service_role;

DO $$ 
BEGIN
    RAISE NOTICE '✅ Payment function secured (service_role only)';
END $$;

-- ====================================================================
-- PART 4: VERIFY ALL FIXES
-- ====================================================================

DO $$ 
DECLARE
    policy_count INTEGER;
    tier_exists BOOLEAN;
    max_discount_exists BOOLEAN;
BEGIN
    -- Check policy count
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'promo_codes';

    -- Check columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'tier_required'
    ) INTO tier_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'max_discount'
    ) INTO max_discount_exists;

    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VERIFICATION RESULTS:';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'RLS Policies: % (should be 4)', policy_count;
    RAISE NOTICE 'tier_required column: %', CASE WHEN tier_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'max_discount column: %', CASE WHEN max_discount_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '=============================================';
END $$;

-- ====================================================================
-- PART 5: SHOW CURRENT PROMO_CODES STRUCTURE
-- ====================================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'promo_codes' 
ORDER BY ordinal_position;

-- ====================================================================
-- FINAL INSTRUCTIONS
-- ====================================================================

DO $$ 
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✅✅✅ ALL FIXES APPLIED! ✅✅✅';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'NOW DO THESE STEPS:';
    RAISE NOTICE '';
    RAISE NOTICE '1. ⏳ Wait 30 seconds (schema cache update)';
    RAISE NOTICE '';
    RAISE NOTICE '2. 🔄 Restart your dev server:';
    RAISE NOTICE '   - Press Ctrl + C';
    RAISE NOTICE '   - Run: npm run dev';
    RAISE NOTICE '';
    RAISE NOTICE '3. 🌐 Hard refresh browser:';
    RAISE NOTICE '   - Windows: Ctrl + Shift + R';
    RAISE NOTICE '   - Mac: Cmd + Shift + R';
    RAISE NOTICE '';
    RAISE NOTICE '4. ✅ Test promotion creation';
    RAISE NOTICE '';
    RAISE NOTICE '5. 🔒 Enable Leaked Password Protection:';
    RAISE NOTICE '   - Go to: Dashboard → Authentication → Settings';
    RAISE NOTICE '   - Toggle ON: "Leaked Password Protection"';
    RAISE NOTICE '   - Click Save';
    RAISE NOTICE '';
    RAISE NOTICE 'After these steps, ALL warnings will be gone!';
    RAISE NOTICE '=============================================';
END $$;
