-- Add payment-related fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pay-at-restaurant';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeout', 'delivery'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;

-- Update payments table to include more details
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Add RLS policy for users to update their own order payment status
DROP POLICY IF EXISTS "Users can update own order payment" ON orders;
CREATE POLICY "Users can update own order payment" ON orders 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status(
  p_order_id UUID,
  p_payment_status TEXT,
  p_payment_id TEXT DEFAULT NULL,
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update order payment status
  UPDATE orders
  SET 
    payment_status = p_payment_status,
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Insert payment record if payment_id provided
  IF p_payment_id IS NOT NULL THEN
    INSERT INTO payments (
      order_id,
      amount,
      payment_method,
      transaction_id,
      razorpay_payment_id,
      status
    )
    SELECT 
      p_order_id,
      total,
      payment_method,
      p_transaction_id,
      p_payment_id,
      p_payment_status
    FROM orders
    WHERE id = p_order_id;
  END IF;

  RETURN TRUE;
END;
$$;
