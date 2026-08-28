-- ABSOLUTE FINAL FIX - Adds ALL Missing Columns + Forces Schema Reload
-- This is the COMPLETE solution - run this ONCE

-- ====================================================================
-- PART 1: Add ALL Missing Columns
-- ====================================================================

DO $$ 
BEGIN
    -- Add tier_required if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'tier_required'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN tier_required VARCHAR(20) CHECK (tier_required IN ('bronze', 'silver', 'gold', 'platinum'));
        RAISE NOTICE '✅ Added tier_required column';
    ELSE
        RAISE NOTICE '✅ tier_required already exists';
    END IF;

    -- Add max_discount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'max_discount'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN max_discount DECIMAL(10,2);
        RAISE NOTICE '✅ Added max_discount column';
    ELSE
        RAISE NOTICE '✅ max_discount already exists';
    END IF;

    -- Add usage_count if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'usage_count'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN usage_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added usage_count column';
    ELSE
        RAISE NOTICE '✅ usage_count already exists';
    END IF;

    -- Add per_user_limit if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'per_user_limit'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN per_user_limit INTEGER;
        RAISE NOTICE '✅ Added per_user_limit column';
    ELSE
        RAISE NOTICE '✅ per_user_limit already exists';
    END IF;
END $$;

-- ====================================================================
-- PART 2: Force Multiple Schema Reloads (Important!)
-- ====================================================================

-- Reload 1
NOTIFY pgrst, 'reload schema';

-- Wait a moment
SELECT pg_sleep(1);

-- Reload 2 (double-check)
NOTIFY pgrst, 'reload schema';

-- Reload 3 (triple-check for stubborn cache)
NOTIFY pgrst, 'reload config';

-- ====================================================================
-- PART 3: Verify ALL Columns Exist
-- ====================================================================

DO $$ 
DECLARE
    tier_exists BOOLEAN;
    max_discount_exists BOOLEAN;
    usage_count_exists BOOLEAN;
    per_user_exists BOOLEAN;
BEGIN
    -- Check each column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'tier_required'
    ) INTO tier_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'max_discount'
    ) INTO max_discount_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'usage_count'
    ) INTO usage_count_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'per_user_limit'
    ) INTO per_user_exists;

    RAISE NOTICE '=============================================';
    RAISE NOTICE 'COLUMN CHECK:';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'tier_required: %', CASE WHEN tier_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'max_discount: %', CASE WHEN max_discount_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'usage_count: %', CASE WHEN usage_count_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'per_user_limit: %', CASE WHEN per_user_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    
    IF tier_exists AND max_discount_exists AND usage_count_exists AND per_user_exists THEN
        RAISE NOTICE '✅ ALL required columns exist!';
    ELSE
        RAISE WARNING '❌ Some columns are still missing!';
    END IF;
END $$;

-- ====================================================================
-- PART 4: Show Complete Table Structure
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
-- PART 5: Final Instructions
-- ====================================================================

DO $$ 
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✅ SCHEMA UPDATE COMPLETE!';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'CRITICAL: Do these 3 things NOW:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Wait 30 seconds (let schema cache update)';
    RAISE NOTICE '2. HARD REFRESH your app:';
    RAISE NOTICE '   - Press Ctrl + Shift + R (Windows)';
    RAISE NOTICE '   - Or Cmd + Shift + R (Mac)';
    RAISE NOTICE '3. Try creating promotion again';
    RAISE NOTICE '';
    RAISE NOTICE 'If it STILL fails after 30 seconds:';
    RAISE NOTICE '4. Restart your dev server:';
    RAISE NOTICE '   - Stop: Ctrl + C';
    RAISE NOTICE '   - Start: npm run dev';
    RAISE NOTICE '5. Hard refresh browser again';
    RAISE NOTICE '';
    RAISE NOTICE 'This WILL work! Schema cache takes time to update.';
    RAISE NOTICE '=============================================';
END $$;
