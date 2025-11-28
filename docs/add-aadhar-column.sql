-- Add aadhar_no column to team_players table
-- This column stores the 12-digit Aadhar number for each player

ALTER TABLE team_players
ADD COLUMN IF NOT EXISTS aadhar_no VARCHAR(12);

-- Add a comment for documentation
COMMENT ON COLUMN team_players.aadhar_no IS '12-digit Aadhar identification number';

-- Optional: Add a check constraint to ensure it's exactly 12 digits if provided
ALTER TABLE team_players
ADD CONSTRAINT aadhar_no_length_check 
CHECK (aadhar_no IS NULL OR (aadhar_no ~ '^[0-9]{12}$'));

