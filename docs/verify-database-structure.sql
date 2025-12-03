-- ============================================
-- DATABASE STRUCTURE VERIFICATION SCRIPT
-- Run this to check if your database matches what the admin panel expects
-- ============================================

-- Check 1: Does goals table have the right columns?
DO $$
DECLARE
    has_scorer_id BOOLEAN;
    has_scorer_name BOOLEAN;
    result TEXT;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'CHECKING GOALS TABLE STRUCTURE';
    RAISE NOTICE '==========================================';
    
    -- Check for scorer_id column
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'scorer_id'
    ) INTO has_scorer_id;
    
    -- Check for scorer_name column
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'scorer_name'
    ) INTO has_scorer_name;
    
    IF has_scorer_id THEN
        RAISE NOTICE '✅ goals table has scorer_id (CORRECT - matches admin panel)';
    ELSE
        RAISE WARNING '❌ goals table missing scorer_id column';
    END IF;
    
    IF has_scorer_name THEN
        RAISE WARNING '⚠️  goals table has scorer_name (OLD SCHEMA - should be scorer_id)';
    END IF;
    
    IF has_scorer_id AND NOT has_scorer_name THEN
        RAISE NOTICE '✅ GOALS TABLE IS CORRECT';
    ELSIF NOT has_scorer_id AND has_scorer_name THEN
        RAISE WARNING '❌ GOALS TABLE NEEDS MIGRATION (run fix-goals-schema.sql)';
    ELSE
        RAISE NOTICE 'ℹ️  Goals table structure unclear';
    END IF;
END $$;

-- Check 2: Show all columns in goals table
SELECT 
    '=== GOALS TABLE COLUMNS ===' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;

-- Check 3: Show foreign key relationships
SELECT 
    '=== GOALS TABLE FOREIGN KEYS ===' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'goals';

-- Check 4: Verify teams table structure
SELECT 
    '=== TEAMS TABLE COLUMNS ===' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'teams'
    AND column_name IN ('id', 'name', 'category', 'played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'points')
ORDER BY ordinal_position;

-- Check 5: Verify matches table structure
SELECT 
    '=== MATCHES TABLE COLUMNS ===' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'matches'
    AND column_name IN ('id', 'home_team_id', 'away_team_id', 'home_score', 'away_score', 'status', 'category')
ORDER BY ordinal_position;

-- Check 6: Verify team_players table structure
SELECT 
    '=== TEAM_PLAYERS TABLE COLUMNS ===' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'team_players'
    AND column_name IN ('id', 'team_id', 'player_name', 'position', 'player_image')
ORDER BY ordinal_position;

-- Check 7: Count existing data
SELECT '=== DATA COUNT ===' as info;

SELECT 
    'teams' as table_name, 
    COUNT(*) as row_count,
    COUNT(CASE WHEN category = 'open-age' THEN 1 END) as open_age_count,
    COUNT(CASE WHEN category = 'u17' THEN 1 END) as u17_count
FROM teams
UNION ALL
SELECT 
    'matches' as table_name, 
    COUNT(*) as row_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count
FROM matches
UNION ALL
SELECT 
    'goals' as table_name, 
    COUNT(*) as row_count,
    COUNT(DISTINCT match_id) as unique_matches,
    0 as other_count
FROM goals
UNION ALL
SELECT 
    'team_registrations' as table_name, 
    COUNT(*) as row_count,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count
FROM team_registrations
UNION ALL
SELECT 
    'team_players' as table_name, 
    COUNT(*) as row_count,
    COUNT(CASE WHEN is_substitute = false THEN 1 END) as starters_count,
    COUNT(CASE WHEN is_substitute = true THEN 1 END) as subs_count
FROM team_players;

-- Check 8: Sample data check
DO $$
DECLARE
    goal_count INT;
    team_player_count INT;
BEGIN
    SELECT COUNT(*) INTO goal_count FROM goals;
    SELECT COUNT(*) INTO team_player_count FROM team_players;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'SUMMARY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Goals recorded: %', goal_count;
    RAISE NOTICE 'Team players: %', team_player_count;
    
    IF goal_count > 0 AND team_player_count > 0 THEN
        RAISE NOTICE '✅ You have data to work with';
    ELSIF goal_count = 0 THEN
        RAISE NOTICE 'ℹ️  No goals recorded yet';
    END IF;
END $$;

-- Check 9: Test if admin panel queries will work
-- This simulates what StatisticsViewer.jsx does
DO $$
DECLARE
    can_query BOOLEAN := true;
    error_msg TEXT;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'TESTING ADMIN PANEL QUERIES';
    RAISE NOTICE '==========================================';
    
    -- Test query 1: Top scorers (what Statistics page needs)
    BEGIN
        PERFORM 
            scorer_id,
            COUNT(*) as goal_count
        FROM goals
        GROUP BY scorer_id
        LIMIT 1;
        RAISE NOTICE '✅ Top scorers query will work';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ Top scorers query will FAIL: %', SQLERRM;
        can_query := false;
    END;
    
    -- Test query 2: Goals with player info (what Goals Manager needs)
    BEGIN
        PERFORM 
            g.*,
            tp.player_name
        FROM goals g
        JOIN team_players tp ON g.scorer_id = tp.id
        LIMIT 1;
        RAISE NOTICE '✅ Goals with player info query will work';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ Goals with player info query will FAIL: %', SQLERRM;
        can_query := false;
    END;
    
    IF can_query THEN
        RAISE NOTICE '==========================================';
        RAISE NOTICE '✅ DATABASE IS READY FOR ADMIN PANEL';
        RAISE NOTICE '==========================================';
    ELSE
        RAISE WARNING '==========================================';
        RAISE WARNING '❌ DATABASE NEEDS MIGRATION';
        RAISE WARNING 'Run: docs/fix-goals-schema.sql or complete-tournament-schema.sql';
        RAISE WARNING '==========================================';
    END IF;
END $$;

