-- ============================================
-- CLEAR ALL TABLE DATA (EXCEPT AUTH)
-- ============================================
-- This script clears all data from tables in the public schema
-- while preserving the auth schema and table structures

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clear data from all tables (in reverse dependency order to avoid FK issues)
-- Using DO block to safely truncate tables that exist

DO $$
BEGIN
  -- Clear dependent tables first
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_players') THEN
    TRUNCATE TABLE team_players CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'players') THEN
    TRUNCATE TABLE players CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN
    TRUNCATE TABLE matches CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    TRUNCATE TABLE teams CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_registrations') THEN
    TRUNCATE TABLE team_registrations CASCADE;
  END IF;
  
  -- Clear configuration and slot tables
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registration_slots') THEN
    TRUNCATE TABLE registration_slots CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_config') THEN
    TRUNCATE TABLE tournament_config CASCADE;
  END IF;
  
  -- Clear any other tables that might exist
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coupons') THEN
    TRUNCATE TABLE coupons CASCADE;
  END IF;
END $$;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Reset sequences if they exist (optional, but good practice)
-- Note: TRUNCATE already resets sequences, but including for completeness
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq_record.sequence_name) || ' RESTART WITH 1';
    END LOOP;
END $$;

-- Re-initialize tournament_config with default values
INSERT INTO tournament_config (category, total_slots, registration_open)
VALUES 
  ('open-age', 12, true),
  ('u17', 12, true)
ON CONFLICT (category) DO UPDATE SET
  total_slots = EXCLUDED.total_slots,
  registration_open = EXCLUDED.registration_open;

-- Re-initialize registration_slots table
INSERT INTO registration_slots (category, total_slots, filled_slots, available_slots, registration_open, status)
VALUES 
  ('open-age', 12, 0, 12, true, 'open'),
  ('u17', 12, 0, 12, true, 'open')
ON CONFLICT (category) DO UPDATE SET
  total_slots = EXCLUDED.total_slots,
  filled_slots = EXCLUDED.filled_slots,
  available_slots = EXCLUDED.available_slots,
  registration_open = EXCLUDED.registration_open,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All table data cleared successfully (auth schema preserved)';
    RAISE NOTICE '✅ Tournament config and registration slots re-initialized';
END $$;

