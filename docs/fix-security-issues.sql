-- ============================================================
-- FIX SECURITY ISSUES
-- ============================================================
-- This script fixes Supabase database linter security errors:
-- 1. Removes SECURITY DEFINER from views
-- 2. Enables RLS on registration_slots table
-- ============================================================

-- ============================================================
-- ISSUE 1: SECURITY DEFINER VIEWS
-- ============================================================
-- Problem: Views with SECURITY DEFINER run with creator's permissions
-- Solution: Recreate views without SECURITY DEFINER
-- ============================================================

-- Drop and recreate: standings view
DROP VIEW IF EXISTS public.standings CASCADE;

CREATE OR REPLACE VIEW public.standings AS
SELECT 
  teams.id,
  teams.name,
  teams.crest_url,
  teams.category,
  teams.group_name,
  teams.played,
  teams.won,
  teams.drawn,
  teams.lost,
  teams.goals_for,
  teams.goals_against,
  (teams.goals_for - teams.goals_against) AS goal_difference,
  teams.points
FROM teams
ORDER BY teams.category, teams.points DESC, (teams.goals_for - teams.goals_against) DESC, teams.goals_for DESC;

-- Grant public access to standings view
GRANT SELECT ON public.standings TO anon;
GRANT SELECT ON public.standings TO authenticated;

-- ============================================================

-- Drop and recreate: top_scorers view
DROP VIEW IF EXISTS public.top_scorers CASCADE;

CREATE OR REPLACE VIEW public.top_scorers AS
SELECT 
  tp.id,
  tp.player_name,
  tp.player_image,
  t.name AS team_name,
  t.crest_url AS team_logo,
  t.category,
  COUNT(g.id) AS goals
FROM team_players tp
JOIN goals g ON g.scorer_id = tp.id
JOIN teams t ON g.team_id = t.id
GROUP BY tp.id, tp.player_name, tp.player_image, t.name, t.crest_url, t.category
ORDER BY goals DESC, tp.player_name;

-- Grant public access to top_scorers view
GRANT SELECT ON public.top_scorers TO anon;
GRANT SELECT ON public.top_scorers TO authenticated;

-- ============================================================

-- Drop and recreate: top_assisters view
DROP VIEW IF EXISTS public.top_assisters CASCADE;

CREATE OR REPLACE VIEW public.top_assisters AS
SELECT 
  tp.id,
  tp.player_name,
  tp.player_image,
  t.name AS team_name,
  t.crest_url AS team_logo,
  t.category,
  COUNT(g.id) AS assists
FROM team_players tp
JOIN goals g ON g.assister_id = tp.id
JOIN teams t ON g.team_id = t.id
GROUP BY tp.id, tp.player_name, tp.player_image, t.name, t.crest_url, t.category
ORDER BY assists DESC, tp.player_name;

-- Grant public access to top_assisters view
GRANT SELECT ON public.top_assisters TO anon;
GRANT SELECT ON public.top_assisters TO authenticated;

-- ============================================================

-- Drop and recreate: team_complete_info view
DROP VIEW IF EXISTS public.team_complete_info CASCADE;

CREATE OR REPLACE VIEW public.team_complete_info AS
SELECT 
  t.id,
  t.name,
  t.crest_url,
  t.captain,
  t.category,
  t.formation,
  t.played,
  t.won,
  t.drawn,
  t.lost,
  t.goals_for,
  t.goals_against,
  (t.goals_for - t.goals_against) AS goal_difference,
  t.points,
  t.registration_id,
  tr.team_name AS registration_team_name,
  tr.captain_name AS registration_captain_name,
  tr.captain_email,
  tr.captain_phone,
  COUNT(DISTINCT tp.id) AS total_players
FROM teams t
LEFT JOIN team_registrations tr ON t.registration_id = tr.id
LEFT JOIN team_players tp ON tp.team_id = t.registration_id
GROUP BY 
  t.id, t.name, t.crest_url, t.captain, t.category, t.formation,
  t.played, t.won, t.drawn, t.lost, t.goals_for, t.goals_against,
  t.points, t.registration_id, tr.team_name, tr.captain_name,
  tr.captain_email, tr.captain_phone;

-- Grant public access to team_complete_info view
GRANT SELECT ON public.team_complete_info TO anon;
GRANT SELECT ON public.team_complete_info TO authenticated;

-- ============================================================

-- Drop and recreate: match_results view
DROP VIEW IF EXISTS public.match_results CASCADE;

CREATE OR REPLACE VIEW public.match_results AS
SELECT 
  m.id AS match_id,
  m.match_number,
  m.match_date,
  m.scheduled_time,
  m.venue,
  m.status,
  m.category,
  m.match_type,
  
  -- Home Team Info
  ht.id AS home_team_id,
  ht.name AS home_team_name,
  ht.crest_url AS home_team_logo,
  m.home_score,
  
  -- Away Team Info
  at.id AS away_team_id,
  at.name AS away_team_name,
  at.crest_url AS away_team_logo,
  m.away_score,
  
  -- Match Result
  CASE 
    WHEN m.status = 'completed' AND m.home_score > m.away_score THEN 'home_win'
    WHEN m.status = 'completed' AND m.away_score > m.home_score THEN 'away_win'
    WHEN m.status = 'completed' AND m.home_score = m.away_score THEN 'draw'
    ELSE 'scheduled'
  END AS result,
  
  -- Goals Count
  (SELECT COUNT(*) FROM goals WHERE goals.match_id = m.id) AS total_goals
  
FROM matches m
LEFT JOIN teams ht ON m.home_team_id = ht.id
LEFT JOIN teams at ON m.away_team_id = at.id
ORDER BY m.match_date DESC, m.scheduled_time DESC;

-- Grant public access to match_results view
GRANT SELECT ON public.match_results TO anon;
GRANT SELECT ON public.match_results TO authenticated;

-- ============================================================
-- ISSUE 2: RLS DISABLED ON REGISTRATION_SLOTS TABLE
-- ============================================================
-- Problem: registration_slots table is public but RLS is not enabled
-- Solution: Enable RLS and create appropriate policies
-- ============================================================

-- Enable Row Level Security on registration_slots
ALTER TABLE public.registration_slots ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public SELECT access (anyone can view slots)
CREATE POLICY "Allow public read access to registration slots"
ON public.registration_slots
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 2: Only authenticated admins can INSERT/UPDATE/DELETE
-- (Assuming you have an admin check - adjust as needed)
CREATE POLICY "Allow authenticated users to modify registration slots"
ON public.registration_slots
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- If you want to restrict modifications to specific admin users, replace the above policy with:
-- CREATE POLICY "Only admins can modify registration slots"
-- ON public.registration_slots
-- FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'email' = 'your-admin-email@example.com')
-- WITH CHECK (auth.jwt() ->> 'email' = 'your-admin-email@example.com');

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check that views exist and don't have SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('standings', 'top_scorers', 'top_assisters', 'team_complete_info', 'match_results')
ORDER BY viewname;

-- Check RLS is enabled on registration_slots
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'registration_slots';

-- Check policies on registration_slots
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'registration_slots';

-- ============================================================
-- RELOAD SCHEMA CACHE
-- ============================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- SUCCESS! 🎉
-- ============================================================
-- All security issues should now be resolved:
-- ✅ Views no longer use SECURITY DEFINER
-- ✅ RLS is enabled on registration_slots
-- ✅ Appropriate policies are in place
-- ============================================================

