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
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- Create index on transaction_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_registrations_transaction_id 
ON team_registrations(transaction_id);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_team_registrations_payment_status 
ON team_registrations(payment_status);

