-- Fix the status check constraint to include 'registered' status
-- This allows saving draft/incomplete registrations

-- First, drop the existing constraint
ALTER TABLE team_registrations 
DROP CONSTRAINT IF EXISTS team_registrations_status_check;

-- Add the new constraint with all allowed status values
ALTER TABLE team_registrations 
ADD CONSTRAINT team_registrations_status_check 
CHECK (status IN ('registered', 'submitted', 'pending_payment', 'confirmed', 'cancelled'));

-- Add comment for documentation
COMMENT ON COLUMN team_registrations.status IS 'Registration status: registered (draft), submitted, pending_payment, confirmed, cancelled';

