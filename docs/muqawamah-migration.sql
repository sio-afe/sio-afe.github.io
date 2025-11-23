-- Safe Migration Script for Existing Database
-- This adds slot tracking to your existing schema without breaking anything

-- ============================================
-- STEP 1: Add new columns to existing tables (if they don't exist)
-- ============================================

-- Add tournament_team_id to team_registrations if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_registrations' AND column_name = 'tournament_team_id'
  ) THEN
    ALTER TABLE team_registrations ADD COLUMN tournament_team_id UUID;
  END IF;
END $$;

-- Add confirmed_at to team_registrations if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_registrations' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE team_registrations ADD COLUMN confirmed_at TIMESTAMP;
  END IF;
END $$;

-- Update status check constraint to include 'rejected'
ALTER TABLE team_registrations DROP CONSTRAINT IF EXISTS team_registrations_status_check;
ALTER TABLE team_registrations ADD CONSTRAINT team_registrations_status_check 
  CHECK (status IN ('draft', 'submitted', 'confirmed', 'rejected'));

-- ============================================
-- STEP 2: Create tournament_config table
-- ============================================

CREATE TABLE IF NOT EXISTS tournament_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(20) NOT NULL UNIQUE CHECK (category IN ('open-age', 'u17')),
  total_slots INTEGER NOT NULL DEFAULT 12,
  registration_open BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP,
  tournament_start_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default configuration (safe - won't duplicate)
INSERT INTO tournament_config (category, total_slots, registration_open)
VALUES 
  ('open-age', 12, true),
  ('u17', 12, true)
ON CONFLICT (category) DO NOTHING;

-- ============================================
-- STEP 3: Create/Replace Views
-- ============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS registration_slots;

-- Create registration slots view
CREATE VIEW registration_slots AS
SELECT 
  tc.category,
  tc.total_slots,
  tc.registration_open,
  tc.registration_deadline,
  COUNT(tr.id) FILTER (WHERE tr.status IN ('submitted', 'confirmed')) as registered_teams,
  tc.total_slots - COUNT(tr.id) FILTER (WHERE tr.status IN ('submitted', 'confirmed')) as available_slots,
  ROUND(
    (COUNT(tr.id) FILTER (WHERE tr.status IN ('submitted', 'confirmed'))::NUMERIC / tc.total_slots::NUMERIC) * 100, 
    1
  ) as fill_percentage
FROM tournament_config tc
LEFT JOIN team_registrations tr ON tc.category = tr.category
GROUP BY tc.category, tc.total_slots, tc.registration_open, tc.registration_deadline;

-- ============================================
-- STEP 4: Create/Replace Functions
-- ============================================

-- Function to check if slots are available
CREATE OR REPLACE FUNCTION check_slots_available(category_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  available INTEGER;
  is_open BOOLEAN;
BEGIN
  SELECT available_slots, registration_open 
  INTO available, is_open
  FROM registration_slots
  WHERE category = category_param;
  
  RETURN (available > 0 AND is_open);
END;
$$ LANGUAGE plpgsql;

-- Function to get registration statistics
CREATE OR REPLACE FUNCTION get_registration_stats()
RETURNS TABLE (
  category TEXT,
  total_slots INTEGER,
  registered_teams BIGINT,
  available_slots BIGINT,
  fill_percentage NUMERIC,
  registration_open BOOLEAN,
  is_full BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.category::TEXT,
    rs.total_slots,
    rs.registered_teams,
    rs.available_slots,
    rs.fill_percentage,
    rs.registration_open,
    (rs.available_slots = 0) as is_full
  FROM registration_slots rs
  ORDER BY rs.category;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm registration and create tournament team
CREATE OR REPLACE FUNCTION confirm_registration_to_tournament(registration_id UUID)
RETURNS UUID AS $$
DECLARE
  new_team_id UUID;
  reg_record RECORD;
BEGIN
  -- Get registration details
  SELECT * INTO reg_record
  FROM team_registrations
  WHERE id = registration_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found: %', registration_id;
  END IF;
  
  -- Check if already confirmed
  IF reg_record.tournament_team_id IS NOT NULL THEN
    RETURN reg_record.tournament_team_id;
  END IF;
  
  -- Check if slots available
  IF NOT check_slots_available(reg_record.category) THEN
    RAISE EXCEPTION 'No slots available for category: %', reg_record.category;
  END IF;
  
  -- Create tournament team
  INSERT INTO teams (name, crest_url, captain, category)
  VALUES (
    reg_record.team_name,
    reg_record.team_logo,
    reg_record.captain_name,
    reg_record.category
  )
  RETURNING id INTO new_team_id;
  
  -- Update registration with tournament team link
  UPDATE team_registrations
  SET 
    status = 'confirmed',
    confirmed_at = NOW(),
    tournament_team_id = new_team_id
  WHERE id = registration_id;
  
  RETURN new_team_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: Create/Replace Triggers
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS enforce_registration_slots ON team_registrations;
DROP TRIGGER IF EXISTS update_tournament_config_timestamp_trigger ON tournament_config;

-- Trigger to prevent registration when slots are full
CREATE OR REPLACE FUNCTION check_registration_slots()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for new submissions or status changes to submitted
  IF (TG_OP = 'INSERT' AND NEW.status = 'submitted') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'submitted' AND OLD.status != 'submitted') THEN
    
    IF NOT check_slots_available(NEW.category) THEN
      RAISE EXCEPTION 'Registration closed: No slots available for % category', NEW.category;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_registration_slots
  BEFORE INSERT OR UPDATE ON team_registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_registration_slots();

-- Trigger to update tournament_config timestamp
CREATE OR REPLACE FUNCTION update_tournament_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tournament_config_timestamp_trigger
  BEFORE UPDATE ON tournament_config
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_config_timestamp();

-- ============================================
-- STEP 6: Update RLS Policies
-- ============================================

-- Enable RLS on tournament_config
ALTER TABLE tournament_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tournament config is viewable by everyone" ON tournament_config;
DROP POLICY IF EXISTS "Tournament config is modifiable by admins" ON tournament_config;
DROP POLICY IF EXISTS "Users can update own teams" ON team_registrations;

-- Tournament config is viewable by everyone
CREATE POLICY "Tournament config is viewable by everyone"
  ON tournament_config FOR SELECT
  USING (true);

-- Only authenticated admins can modify tournament config
CREATE POLICY "Tournament config is modifiable by admins"
  ON tournament_config FOR ALL
  USING (auth.role() = 'authenticated');

-- Update policy for team_registrations
CREATE POLICY "Users can update own teams" ON team_registrations
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    (status IN ('draft', 'submitted'))
  );

-- ============================================
-- STEP 7: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_team_registrations_category_status 
  ON team_registrations(category, status);

CREATE INDEX IF NOT EXISTS idx_team_registrations_user_id 
  ON team_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_team_registrations_submitted_at 
  ON team_registrations(submitted_at);

CREATE INDEX IF NOT EXISTS idx_tournament_config_category 
  ON tournament_config(category);

-- ============================================
-- STEP 8: Verify Migration
-- ============================================

-- Test queries to verify everything works
DO $$
BEGIN
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Testing slot tracking...';
  
  -- Test registration slots view
  IF EXISTS (SELECT 1 FROM registration_slots) THEN
    RAISE NOTICE '✓ registration_slots view working';
  END IF;
  
  -- Test functions
  IF check_slots_available('open-age') IS NOT NULL THEN
    RAISE NOTICE '✓ check_slots_available function working';
  END IF;
  
  RAISE NOTICE '=== All systems operational ===';
END $$;

-- Display current slot status
SELECT 
  category,
  total_slots,
  registered_teams,
  available_slots,
  fill_percentage || '%' as fill_rate,
  CASE 
    WHEN registration_open THEN '✓ Open'
    ELSE '✗ Closed'
  END as status
FROM registration_slots
ORDER BY category;

