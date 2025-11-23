-- Database Cleanup and Synchronization Script
-- Removes redundant tables and ensures all tables are properly synced

-- ============================================
-- PART 1: IDENTIFY REDUNDANCIES
-- ============================================

-- Check if we have both 'matches' and 'fixtures' tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fixtures')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches')
    THEN
        RAISE NOTICE '⚠️  REDUNDANCY FOUND: Both "matches" and "fixtures" tables exist!';
        RAISE NOTICE '   Recommendation: Keep "matches", drop "fixtures"';
    END IF;
END $$;

-- Check if 'standings' is a separate table (should be a view)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'standings'
        AND table_type = 'BASE TABLE'
    ) THEN
        RAISE NOTICE '⚠️  REDUNDANCY FOUND: "standings" is a table (should be a view of "teams")';
        RAISE NOTICE '   Recommendation: Drop table, create view';
    END IF;
END $$;

-- Check for unrestricted tables (views without proper RLS)
SELECT 
    table_name,
    'Unrestricted (needs RLS policies)' as issue
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('registration_slots', 'standings', 'team_complete_info', 'teams_with_contacts')
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public'
    AND p.tablename = t.table_name
  );

-- ============================================
-- PART 2: RECOMMENDED CLEANUP ACTIONS
-- ============================================

-- Action 1: Drop 'fixtures' table if it exists (use 'matches' instead)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fixtures') THEN
        -- Check if there's data in fixtures
        DECLARE
            fixture_count INTEGER;
        BEGIN
            SELECT COUNT(*) INTO fixture_count FROM fixtures;
            
            IF fixture_count > 0 THEN
                RAISE NOTICE '⚠️  "fixtures" table has % rows. Migrating to "matches" first...', fixture_count;
                
                -- Migrate data if matches table exists
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN
                    -- This is a placeholder - actual migration would need column mapping
                    RAISE NOTICE '   Please manually verify data before migration!';
                    -- INSERT INTO matches SELECT * FROM fixtures; -- Uncomment after verification
                END IF;
            END IF;
            
            -- Uncomment to actually drop (after data migration)
            -- DROP TABLE IF EXISTS fixtures CASCADE;
            -- RAISE NOTICE '✅ Dropped "fixtures" table';
        END;
    ELSE
        RAISE NOTICE '✅ No "fixtures" table found (good!)';
    END IF;
END $$;

-- Action 2: Ensure 'standings' is a view, not a table
DO $$
BEGIN
    -- Drop table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'standings'
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP TABLE IF EXISTS standings CASCADE;
        RAISE NOTICE '✅ Dropped "standings" table';
    END IF;
    
    -- Create view if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'standings'
    ) THEN
        CREATE VIEW standings AS
        SELECT 
            id as team_id,
            name as team_name,
            crest_url,
            formation,
            category,
            group_name,
            played,
            won,
            drawn,
            lost,
            goals_for,
            goals_against,
            (goals_for - goals_against) as goal_difference,
            points
        FROM teams
        ORDER BY category, points DESC, (goals_for - goals_against) DESC, goals_for DESC;
        
        RAISE NOTICE '✅ Created "standings" view';
    ELSE
        RAISE NOTICE '✅ "standings" view already exists';
    END IF;
END $$;

-- ============================================
-- PART 3: SYNC COLUMN DEFINITIONS
-- ============================================

-- Ensure all required columns exist in teams table
DO $$
BEGIN
    -- Add formation if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'formation') THEN
        ALTER TABLE teams ADD COLUMN formation TEXT;
        RAISE NOTICE '✅ Added "formation" to teams';
    END IF;
    
    -- Add registration_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'registration_id') THEN
        ALTER TABLE teams ADD COLUMN registration_id UUID REFERENCES team_registrations(id);
        RAISE NOTICE '✅ Added "registration_id" to teams';
    END IF;
    
    -- Add category if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'category') THEN
        ALTER TABLE teams ADD COLUMN category TEXT NOT NULL DEFAULT 'open-age';
        RAISE NOTICE '✅ Added "category" to teams';
    END IF;
END $$;

-- Ensure all required columns exist in players table
DO $$
BEGIN
    -- Add is_substitute if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'is_substitute') THEN
        ALTER TABLE players ADD COLUMN is_substitute BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Added "is_substitute" to players';
    END IF;
    
    -- Add player_image if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'player_image') THEN
        ALTER TABLE players ADD COLUMN player_image TEXT;
        RAISE NOTICE '✅ Added "player_image" to players';
    END IF;
    
    -- Add position_x if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'position_x') THEN
        ALTER TABLE players ADD COLUMN position_x FLOAT;
        RAISE NOTICE '✅ Added "position_x" to players';
    END IF;
    
    -- Add position_y if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'position_y') THEN
        ALTER TABLE players ADD COLUMN position_y FLOAT;
        RAISE NOTICE '✅ Added "position_y" to players';
    END IF;
    
    -- Add registration_player_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'registration_player_id') THEN
        ALTER TABLE players ADD COLUMN registration_player_id UUID REFERENCES team_players(id);
        RAISE NOTICE '✅ Added "registration_player_id" to players';
    END IF;
END $$;

-- ============================================
-- PART 4: ENSURE PROPER TABLE STRUCTURE
-- ============================================

-- Verify team_registrations has tournament_team_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_registrations' AND column_name = 'tournament_team_id') THEN
        ALTER TABLE team_registrations ADD COLUMN tournament_team_id UUID REFERENCES teams(id);
        RAISE NOTICE '✅ Added "tournament_team_id" to team_registrations';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_registrations' AND column_name = 'confirmed_at') THEN
        ALTER TABLE team_registrations ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Added "confirmed_at" to team_registrations';
    END IF;
END $$;

-- ============================================
-- PART 5: CREATE/UPDATE ESSENTIAL VIEWS
-- ============================================

-- Rebuild team_complete_info view
DROP VIEW IF EXISTS team_complete_info CASCADE;
CREATE VIEW team_complete_info AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.crest_url,
    t.captain,
    t.formation,
    t.category,
    t.group_name,
    t.played,
    t.won,
    t.drawn,
    t.lost,
    t.goals_for,
    t.goals_against,
    (t.goals_for - t.goals_against) as goal_difference,
    t.points,
    -- Link to registration
    tr.id as registration_id,
    tr.captain_email,
    tr.captain_phone,
    tr.status as registration_status,
    tr.submitted_at,
    tr.confirmed_at,
    -- Player count
    (SELECT COUNT(*) FROM players WHERE team_id = t.id) as player_count
FROM teams t
LEFT JOIN team_registrations tr ON t.registration_id = tr.id;

-- Rebuild registration_slots view
DROP VIEW IF EXISTS registration_slots CASCADE;
CREATE VIEW registration_slots AS
SELECT 
    tc.category,
    tc.total_slots,
    COALESCE(COUNT(tr.id) FILTER (WHERE tr.status IN ('submitted', 'confirmed')), 0)::INTEGER as filled_slots,
    (tc.total_slots - COALESCE(COUNT(tr.id) FILTER (WHERE tr.status IN ('submitted', 'confirmed')), 0))::INTEGER as available_slots,
    tc.registration_open,
    CASE 
        WHEN NOT tc.registration_open THEN 'closed'
        WHEN COALESCE(COUNT(tr.id) FILTER (WHERE tr.status IN ('submitted', 'confirmed')), 0) >= tc.total_slots THEN 'full'
        ELSE 'open'
    END as status
FROM tournament_config tc
LEFT JOIN team_registrations tr ON tr.category = tc.category
GROUP BY tc.category, tc.total_slots, tc.registration_open;


-- ============================================
-- PART 6: VERIFICATION
-- ============================================

-- Show final table structure
SELECT 
    '=== FINAL TABLE STRUCTURE ===' as info;

SELECT 
    'REGISTRATION TABLES' as category,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('team_registrations', 'team_players', 'tournament_config')
ORDER BY table_name;

SELECT 
    'TOURNAMENT TABLES' as category,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('teams', 'players', 'matches', 'goals')
ORDER BY table_name;

SELECT 
    'VIEWS' as category,
    table_name,
    'VIEW' AS object_type
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('standings', 'registration_slots', 'team_complete_info')
ORDER BY table_name;

-- ============================================
-- SUMMARY
-- ============================================

/*
CLEANED UP STRUCTURE:

REGISTRATION PHASE:
✅ team_registrations (table)
✅ team_players (table)
✅ tournament_config (table)
✅ registration_slots (view)

TOURNAMENT PHASE:
✅ teams (table) - This IS the standings
✅ players (table)
✅ matches (table) - NOT fixtures
✅ goals (table)

HELPER VIEWS:
✅ standings (view of teams)
✅ team_complete_info (view joining teams + registrations)

REMOVED/AVOIDED:
❌ fixtures table (use matches)
❌ standings table (use view)
❌ Duplicate team/player tables

LINKS:
- team_registrations.tournament_team_id → teams.id
- teams.registration_id → team_registrations.id
- players.team_id → teams.id
- players.registration_player_id → team_players.id
- matches.home_team_id → teams.id
- matches.away_team_id → teams.id
- goals.match_id → matches.id
- goals.team_id → teams.id
*/

