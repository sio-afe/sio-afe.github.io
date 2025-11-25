-- ============================================
-- AUTO-UPDATE registration_slots TABLE
-- ============================================
-- This script creates a trigger that automatically updates the registration_slots table
-- whenever a team_registrations record is confirmed or status changes

-- First, ensure registration_slots table exists (if it's a view, drop it first)
DROP VIEW IF EXISTS registration_slots CASCADE;

-- Create registration_slots table if it doesn't exist
CREATE TABLE IF NOT EXISTS registration_slots (
  category VARCHAR(20) PRIMARY KEY CHECK (category IN ('open-age', 'u17')),
  total_slots INTEGER NOT NULL DEFAULT 12,
  filled_slots INTEGER NOT NULL DEFAULT 0,
  available_slots INTEGER NOT NULL DEFAULT 12,
  registration_open BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'almost_full', 'full')),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Function to sync registration_slots table with confirmed teams
CREATE OR REPLACE FUNCTION sync_registration_slots()
RETURNS TRIGGER AS $$
DECLARE
  confirmed_count INTEGER;
  total_slots_val INTEGER;
  available_slots_val INTEGER;
  category_val VARCHAR(20);
BEGIN
  -- Determine which category to update
  IF TG_OP = 'DELETE' THEN
    category_val := OLD.category;
  ELSE
    category_val := NEW.category;
  END IF;
  
  -- Only process if status is or was 'confirmed', or if it's a delete
  IF TG_OP = 'DELETE' OR 
     (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR
     (TG_OP = 'UPDATE' AND (NEW.status = 'confirmed' OR OLD.status = 'confirmed')) THEN
    
    -- Get total slots for the category
    SELECT total_slots INTO total_slots_val
    FROM tournament_config
    WHERE category = category_val;
    
    -- If no config found, use default
    IF total_slots_val IS NULL THEN
      total_slots_val := 12;
    END IF;
    
    -- Count confirmed teams for this category
    SELECT COUNT(*) INTO confirmed_count
    FROM team_registrations
    WHERE category = category_val
      AND status = 'confirmed';
    
    -- Calculate available slots
    available_slots_val := total_slots_val - confirmed_count;
    
    -- Update or insert into registration_slots table
    INSERT INTO registration_slots (category, total_slots, filled_slots, available_slots, registration_open, status)
    VALUES (
      category_val,
      total_slots_val,
      confirmed_count,
      available_slots_val,
      true,
      CASE 
        WHEN available_slots_val = 0 THEN 'full'
        WHEN available_slots_val <= 3 THEN 'almost_full'
        ELSE 'open'
      END
    )
    ON CONFLICT (category) 
    DO UPDATE SET
      filled_slots = confirmed_count,
      available_slots = available_slots_val,
      status = CASE 
        WHEN available_slots_val = 0 THEN 'full'
        WHEN available_slots_val <= 3 THEN 'almost_full'
        ELSE 'open'
      END,
      updated_at = NOW();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update registration_slots
DROP TRIGGER IF EXISTS update_registration_slots_trigger ON team_registrations;

CREATE TRIGGER update_registration_slots_trigger
  AFTER INSERT OR UPDATE OF status OR DELETE ON team_registrations
  FOR EACH ROW
  EXECUTE FUNCTION sync_registration_slots();

-- Function to initialize registration_slots table from existing confirmed teams
CREATE OR REPLACE FUNCTION initialize_registration_slots()
RETURNS void AS $$
DECLARE
  category_rec RECORD;
  confirmed_count INTEGER;
  total_slots_val INTEGER;
  available_slots_val INTEGER;
BEGIN
  -- Loop through each category
  FOR category_rec IN 
    SELECT DISTINCT category FROM tournament_config
  LOOP
    -- Get total slots
    SELECT total_slots INTO total_slots_val
    FROM tournament_config
    WHERE category = category_rec.category;
    
    IF total_slots_val IS NULL THEN
      total_slots_val := 12;
    END IF;
    
    -- Count confirmed teams
    SELECT COUNT(*) INTO confirmed_count
    FROM team_registrations
    WHERE category = category_rec.category
      AND status = 'confirmed';
    
    -- Calculate available
    available_slots_val := total_slots_val - confirmed_count;
    
    -- Insert or update
    INSERT INTO registration_slots (category, total_slots, filled_slots, available_slots, registration_open, status)
    VALUES (
      category_rec.category,
      total_slots_val,
      confirmed_count,
      available_slots_val,
      true,
      CASE 
        WHEN available_slots_val = 0 THEN 'full'
        WHEN available_slots_val <= 3 THEN 'almost_full'
        ELSE 'open'
      END
    )
    ON CONFLICT (category) 
    DO UPDATE SET
      filled_slots = confirmed_count,
      available_slots = available_slots_val,
      status = CASE 
        WHEN available_slots_val = 0 THEN 'full'
        WHEN available_slots_val <= 3 THEN 'almost_full'
        ELSE 'open'
      END,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run initialization to sync existing data
SELECT initialize_registration_slots();

