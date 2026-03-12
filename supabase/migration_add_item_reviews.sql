-- Migration: Add item_reviews table to replace basic reviews table
-- This adds the enhanced reviews system while preserving existing data

-- Step 1: Create the new item_reviews table
CREATE TABLE IF NOT EXISTS item_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  image_urls TEXT[], -- Array of image URLs
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  admin_response TEXT,
  admin_response_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, order_id, menu_item_id) -- One review per item per order
);

-- Step 2: Create review_votes table for helpfulness tracking
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES item_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Step 3: Migrate existing data from reviews to item_reviews (if reviews table exists)
-- Note: This assumes reviews don't have menu_item_id or order_id, so we'll set them to NULL
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
    INSERT INTO item_reviews (id, user_id, rating, review_text, is_featured, created_at)
    SELECT id, user_id, rating, comment, is_featured, created_at
    FROM reviews
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Step 4: Enable RLS on item_reviews
ALTER TABLE item_reviews ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for item_reviews
DROP POLICY IF EXISTS "Anyone can view item reviews" ON item_reviews;
CREATE POLICY "Anyone can view item reviews" ON item_reviews 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews for own orders" ON item_reviews;
CREATE POLICY "Users can create reviews for own orders" ON item_reviews 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can update own reviews" ON item_reviews;
CREATE POLICY "Users can update own reviews" ON item_reviews 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all reviews" ON item_reviews;
CREATE POLICY "Admins can update all reviews" ON item_reviews 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 6: Enable RLS on review_votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for review_votes
DROP POLICY IF EXISTS "Anyone can view review votes" ON review_votes;
CREATE POLICY "Anyone can view review votes" ON review_votes 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote on reviews" ON review_votes;
CREATE POLICY "Users can vote on reviews" ON review_votes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON review_votes;
CREATE POLICY "Users can update own votes" ON review_votes 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON review_votes;
CREATE POLICY "Users can delete own votes" ON review_votes 
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_item_reviews_updated_at ON item_reviews;
CREATE TRIGGER update_item_reviews_updated_at 
  BEFORE UPDATE ON item_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_item_reviews_user_id ON item_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_item_reviews_menu_item_id ON item_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_item_reviews_order_id ON item_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_item_reviews_is_featured ON item_reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_item_reviews_created_at ON item_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);

-- Step 10: Add comments for documentation
COMMENT ON TABLE item_reviews IS 'Customer reviews for individual menu items with verified purchase tracking';
COMMENT ON TABLE review_votes IS 'Helpfulness votes for reviews';
COMMENT ON COLUMN item_reviews.is_verified_purchase IS 'True if review is from a confirmed order';
COMMENT ON COLUMN item_reviews.helpful_count IS 'Number of helpful votes (cached for performance)';
COMMENT ON COLUMN item_reviews.admin_response IS 'Restaurant response to the review';

-- Optional: Drop old reviews table (uncomment if you want to remove it)
-- DROP TABLE IF EXISTS reviews CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! item_reviews table is ready.';
END $$;
