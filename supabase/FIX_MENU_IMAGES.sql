-- ====================================================================
-- FIX MENU ITEM IMAGE URLs
-- Run this in Supabase SQL Editor to fix wrong/duplicate images
-- Root cause: photo-1599488615731 (fish/aquarium) was mistakenly used
--             for food items. Also photo-1514944298352 was not food.
-- ====================================================================

UPDATE public.menu_items
SET image_url = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60'
WHERE name = 'Paneer Tikka Platter';

UPDATE public.menu_items
SET image_url = 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800&auto=format&fit=crop&q=60'
WHERE name = 'Crispy Corn Delight';

UPDATE public.menu_items
SET image_url = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&auto=format&fit=crop&q=60'
WHERE name = 'Chicken Malai Tikka';

UPDATE public.menu_items
SET image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60'
WHERE name = 'Seekh Kebab Supreme';

-- Verify: should return 0 rows if fix was successful
SELECT name, image_url
FROM public.menu_items
WHERE image_url LIKE '%1599488615731%'
   OR image_url LIKE '%1514944298352%';
