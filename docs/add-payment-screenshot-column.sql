-- Add payment_screenshot column to team_registrations table
-- This column stores the base64-encoded payment screenshot image

ALTER TABLE team_registrations
ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN team_registrations.payment_screenshot IS 'Base64-encoded payment screenshot image uploaded by the team captain';

-- Update status values to include pending_verification
-- The status field now supports: 'draft', 'submitted', 'pending_verification', 'confirmed', 'cancelled'


