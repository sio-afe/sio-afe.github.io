-- Add last_saved_step column to team_registrations table
-- This tracks which step the user was on when they saved their progress

-- Add the column if it doesn't exist
ALTER TABLE team_registrations 
ADD COLUMN IF NOT EXISTS last_saved_step INTEGER DEFAULT 1;

-- Update existing records to have a reasonable default based on their status
UPDATE team_registrations 
SET last_saved_step = CASE 
  WHEN status = 'confirmed' THEN 5
  WHEN status = 'pending_payment' THEN 4
  ELSE 1
END
WHERE last_saved_step IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN team_registrations.last_saved_step IS 'Tracks the last step (1-5) where user saved their progress during registration';

