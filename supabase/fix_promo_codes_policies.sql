-- Fix Promo Codes Table - Remove Duplicate Policies and Optimize RLS
-- Run this in Supabase SQL Editor to fix all the warnings

-- Step 1: Drop ALL existing policies on promo_codes
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins delete promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can view all promo codes" ON promo_codes;

-- Step 2: Create optimized policies (ONE policy per action - fixes warning!)

-- SELECT: Admins see all promos, others see only active ones
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

-- INSERT: Only admins can insert
CREATE POLICY "insert_promos" 
  ON promo_codes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- UPDATE: Only admins can update
CREATE POLICY "update_promos" 
  ON promo_codes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- DELETE: Only admins can delete
CREATE POLICY "delete_promos" 
  ON promo_codes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Step 3: Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify policies (should show 4 policies - ONE per action)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'promo_codes'
ORDER BY policyname;

-- Step 5: Verify the table structure has max_discount column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'promo_codes' 
ORDER BY ordinal_position;
