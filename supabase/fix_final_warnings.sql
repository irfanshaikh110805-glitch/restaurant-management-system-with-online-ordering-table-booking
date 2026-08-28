-- Fix Final 2 Security Warnings
-- Run this in Supabase SQL Editor

-- ====================================================================
-- FIX 1: update_order_payment_status - Remove authenticated access
-- ====================================================================

-- This function should only be called internally or by service role (payment webhooks)
-- Regular authenticated users should NOT be able to call this directly

REVOKE EXECUTE ON FUNCTION public.update_order_payment_status(uuid, text, text, text) FROM authenticated;

-- Keep it available only for service_role (for payment gateway webhooks)
GRANT EXECUTE ON FUNCTION public.update_order_payment_status(uuid, text, text, text) TO service_role;

-- ====================================================================
-- Note: The second warning requires Dashboard action (not SQL)
-- ====================================================================

DO $$ 
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✅ FINAL SECURITY FIX APPLIED!';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed:';
    RAISE NOTICE '✅ Revoked authenticated access to update_order_payment_status()';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ONE MORE STEP REQUIRED (Dashboard only):';
    RAISE NOTICE '';
    RAISE NOTICE 'Enable Leaked Password Protection:';
    RAISE NOTICE '1. Go to: Dashboard → Authentication → Settings';
    RAISE NOTICE '2. Scroll to "Security and Protection" section';
    RAISE NOTICE '3. Toggle ON: "Enable Leaked Password Protection"';
    RAISE NOTICE '4. Click "Save"';
    RAISE NOTICE '';
    RAISE NOTICE 'After that, you will have 0 warnings! 🎉';
    RAISE NOTICE '=============================================';
END $$;
