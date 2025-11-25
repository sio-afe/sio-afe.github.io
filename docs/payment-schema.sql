-- Add payment-related columns to team_registrations table
-- Run this in your Supabase SQL Editor

-- Add payment columns to team_registrations
ALTER TABLE team_registrations
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS easebuzz_access_key TEXT,
ADD COLUMN IF NOT EXISTS easebuzz_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_mode TEXT,
ADD COLUMN IF NOT EXISTS bank_ref_num TEXT,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- Create index on transaction_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_registrations_transaction_id 
ON team_registrations(transaction_id);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_team_registrations_payment_status 
ON team_registrations(payment_status);

-- Update status enum to include payment states
-- Note: If you have a status enum, you may need to update it
-- ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'pending_payment';
-- ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'confirmed';

-- Create coupons table for discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  valid_categories TEXT[], -- Array of categories this coupon is valid for (null = all)
  max_uses INTEGER, -- null = unlimited
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index on coupon code
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Insert some sample coupons (optional)
-- INSERT INTO coupons (code, discount_percent, valid_categories, max_uses, expires_at)
-- VALUES 
--   ('EARLYBIRD20', 20, NULL, 50, '2025-12-31'),
--   ('STUDENT10', 10, ARRAY['u17'], 100, '2026-01-03'),
--   ('WELCOME15', 15, NULL, 25, '2025-12-20');

-- RLS Policies for coupons table
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (for validation)
CREATE POLICY "Anyone can read active coupons" ON coupons
  FOR SELECT USING (is_active = true);

-- Only admins can modify coupons
CREATE POLICY "Only admins can modify coupons" ON coupons
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create a function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons 
  SET used_count = used_count + 1 
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_coupon_usage TO authenticated;

