-- ============================================================
-- CLEANUP SCRIPT: Remove Unused Database Tables
-- ============================================================
-- This script safely removes tables that are no longer in use
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ANALYSIS OF TABLES:
-- ====================
-- 1. goals_backup        ❌ UNUSED - Backup from schema migration
-- 2. registration_slots  ✅ IN USE - Used by RegistrationSlots.jsx
-- 3. tournament_config   ❌ UNUSED - Not referenced anywhere in code
-- 4. All other tables    ✅ IN USE - Active in the tournament system

-- ============================================================
-- STEP 1: Backup Data (OPTIONAL - Run if you want to keep backup)
-- ============================================================

-- Uncomment these lines if you want to export data before dropping:
-- COPY goals_backup TO '/tmp/goals_backup_export.csv' WITH CSV HEADER;
-- COPY tournament_config TO '/tmp/tournament_config_export.csv' WITH CSV HEADER;

-- ============================================================
-- STEP 2: Drop Unused Tables
-- ============================================================

-- Drop goals_backup table (backup from old schema migration)
DROP TABLE IF EXISTS goals_backup CASCADE;

-- Drop tournament_config table (replaced by registration_slots)
DROP TABLE IF EXISTS tournament_config CASCADE;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check remaining tables
SELECT 
  table_schema,
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name))) as size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================
-- EXPECTED REMAINING TABLES:
-- ============================================================
-- ✅ goals               - Active (new schema with scorer_id, assister_id)
-- ✅ matches             - Active
-- ✅ players             - Active (tournament players)
-- ✅ registration_slots  - Active (used for registration status display)
-- ✅ team_players        - Active (registration players)
-- ✅ team_registrations  - Active
-- ✅ teams               - Active
-- ============================================================

NOTIFY pgrst, 'reload schema';


