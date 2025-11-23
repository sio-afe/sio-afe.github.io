-- Analyze Database Structure
-- This script examines all tables and their relationships

-- ============================================
-- 1. List all tables with row counts
-- ============================================
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. Show all columns for each table
-- ============================================

-- REGISTRATION TABLES
SELECT 'team_registrations' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'team_registrations'
ORDER BY ordinal_position;

SELECT 'team_players' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'team_players'
ORDER BY ordinal_position;

-- TOURNAMENT TABLES
SELECT 'teams' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'teams'
ORDER BY ordinal_position;

SELECT 'players' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'players'
ORDER BY ordinal_position;

SELECT 'matches' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'matches'
ORDER BY ordinal_position;

SELECT 'goals' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'goals'
ORDER BY ordinal_position;

-- ============================================
-- 3. Check for duplicate/similar tables
-- ============================================

-- Check if there are multiple team-related tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%team%' OR
    table_name LIKE '%player%' OR
    table_name LIKE '%match%' OR
    table_name LIKE '%fixture%'
  )
ORDER BY table_name;

-- ============================================
-- 4. Analyze relationships
-- ============================================

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- ANALYSIS SUMMARY
-- ============================================

/*
EXPECTED STRUCTURE:

REGISTRATION PHASE (User-facing):
├── team_registrations (main registration form)
│   ├── team_name, captain_email, formation, status
│   └── Links to: team_players
├── team_players (roster during registration)
│   ├── player_name, position, player_image
│   └── Links to: team_registrations
└── tournament_config (slot management)

TOURNAMENT PHASE (Admin/Public):
├── teams (standings table)
│   ├── name, points, won, lost, formation
│   ├── Links to: team_registrations (via registration_id)
│   └── Created by: confirm_registration_to_tournament()
├── players (tournament roster)
│   ├── name, position, player_image, position_x, position_y
│   ├── Links to: teams, team_players (via registration_player_id)
│   └── Created by: confirm_registration_to_tournament()
├── matches (fixtures)
│   ├── home_team_id, away_team_id, scores
│   └── Links to: teams
└── goals (match events)
    ├── scorer_name, assist_name, minute
    └── Links to: matches, teams

POTENTIAL ISSUES TO CHECK:
1. Do we have both 'matches' and 'fixtures' tables? (REDUNDANT)
2. Are 'standings' separate from 'teams'? (REDUNDANT)
3. Is 'team_complete_info' a table or view? (Should be VIEW)
4. Do we have 'teams_with_contacts'? (Should be VIEW)
5. Are there old migration tables left over?
*/

