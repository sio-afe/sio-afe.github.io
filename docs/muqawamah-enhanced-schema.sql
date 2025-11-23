-- Enhanced Muqawama 2026 Registration & Tournament Schema
-- This schema handles both registration and tournament management with slot tracking

-- ============================================
-- REGISTRATION TABLES (Keep existing structure)
-- ============================================

-- Team Registrations (from muqawamah-registration-schema.sql)
CREATE TABLE IF NOT EXISTS team_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users (id),
  team_name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('open-age', 'u17')),
  team_logo TEXT,
  captain_name VARCHAR(100) NOT NULL,
  captain_email VARCHAR(255) NOT NULL,
  captain_phone VARCHAR(20),
  formation VARCHAR(20),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  tournament_team_id UUID, -- Links to teams table when confirmed
  UNIQUE (team_name, category),
  UNIQUE (user_id) -- One registration per user
);

CREATE TABLE IF NOT EXISTS team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES team_registrations (id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  position VARCHAR(20) NOT NULL,
  is_substitute BOOLEAN DEFAULT false,
  player_image TEXT,
  position_x FLOAT,
  position_y FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TOURNAMENT CONFIGURATION
-- ============================================

-- Tournament slots configuration
CREATE TABLE IF NOT EXISTS tournament_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(20) NOT NULL UNIQUE CHECK (category IN ('open-age', 'u17')),
  total_slots INTEGER NOT NULL DEFAULT 12,
  registration_open BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP,
  tournament_start_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default configuration for both categories
INSERT INTO tournament_config (category, total_slots, registration_open)
VALUES 
  ('open-age', 12, true),
  ('u17', 12, true)
ON CONFLICT (category) DO NOTHING;

-- ============================================
-- VIEWS FOR SLOT TRACKING
-- ============================================

-- View to get available slots per category
CREATE OR REPLACE VIEW registration_slots AS
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
-- FUNCTIONS FOR SLOT MANAGEMENT
-- ============================================

-- Function to check if slots are available for a category
CREATE OR REPLACE FUNCTION check_slots_available(category_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  available INTEGER;
BEGIN
  SELECT available_slots INTO available
  FROM registration_slots
  WHERE category = category_param;
  
  RETURN available > 0;
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

-- Function to promote registration to tournament team
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
-- TRIGGERS
-- ============================================

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
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE tournament_config ENABLE ROW LEVEL SECURITY;

-- Tournament config is viewable by everyone
CREATE POLICY "Tournament config is viewable by everyone"
  ON tournament_config FOR SELECT
  USING (true);

-- Only authenticated admins can modify tournament config
CREATE POLICY "Tournament config is modifiable by admins"
  ON tournament_config FOR ALL
  USING (auth.role() = 'authenticated');

-- Update existing RLS policies for team_registrations
DROP POLICY IF EXISTS "Users can update own teams" ON team_registrations;

CREATE POLICY "Users can update own teams" ON team_registrations
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    (status IN ('draft', 'submitted'))
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
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
-- SAMPLE QUERIES FOR FRONTEND
-- ============================================

-- Get available slots for homepage
-- SELECT * FROM registration_slots;

-- Get full registration statistics
-- SELECT * FROM get_registration_stats();

-- Check if category has slots
-- SELECT check_slots_available('open-age');

-- Confirm a registration and create tournament team
-- SELECT confirm_registration_to_tournament('registration-uuid-here');

-- Get all submitted registrations waiting for confirmation
-- SELECT * FROM team_registrations 
-- WHERE status = 'submitted' 
-- ORDER BY submitted_at ASC;

-- Get team standings for a category
-- SELECT * FROM teams 
-- WHERE category = 'open-age' 
-- ORDER BY points DESC, (goals_for - goals_against) DESC;

