-- Fix 403 errors on notifications table
-- This fixes RLS policies to allow notification creation

-- First, check if notifications table exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
  ) THEN
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "System can create notifications" ON notifications;
    DROP POLICY IF EXISTS "Allow authenticated users to create notifications" ON notifications;
    
    -- Enable RLS
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Users can view their own notifications
    CREATE POLICY "Users can view their own notifications"
      ON notifications
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Policy: Allow system/authenticated users to create notifications
    -- This allows the backend to create notifications for any user
    CREATE POLICY "Allow authenticated users to create notifications"
      ON notifications
      FOR INSERT
      WITH CHECK (true);
    
    -- Policy: Users can update their own notifications (mark as read)
    CREATE POLICY "Users can update their own notifications"
      ON notifications
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- Policy: Users can delete their own notifications
    CREATE POLICY "Users can delete their own notifications"
      ON notifications
      FOR DELETE
      USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Notifications policies fixed successfully';
    
  ELSE
    RAISE NOTICE 'Notifications table does not exist - skipping';
  END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;
