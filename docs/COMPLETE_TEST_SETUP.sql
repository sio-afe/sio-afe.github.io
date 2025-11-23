-- COMPLETE TEST SETUP: Registration → Standings → Match
-- Use this script to seed TWO demo teams that flow through the
-- actual registration ➜ confirmation ➜ standings pipeline.
--
-- ✅ Run AFTER these scripts:
--    1. docs/muqawamah-migration.sql
--    2. docs/database-schema-safe.sql
--    3. docs/confirm-registration-enhanced.sql
--
-- Feel free to rename the teams/logos, but keep the UUIDs so the
-- cleanup section can safely re-run this script.

-- ============================================
-- SAMPLE IDENTIFIERS
-- ============================================
-- Team Atlas FC registration ID → a1111111-2222-3333-4444-555555555555
-- Team Nova FC  registration ID → b1111111-2222-3333-4444-555555555555
-- Sample match ID               → c1111111-2222-3333-4444-555555555555

-- ============================================
-- STEP 0 · CLEAN PREVIOUS SAMPLE DATA
-- ============================================
DO $$
BEGIN
  -- Remove goals & match
  DELETE FROM goals WHERE match_id = 'c1111111-2222-3333-4444-555555555555';
  DELETE FROM matches WHERE id = 'c1111111-2222-3333-4444-555555555555';

  -- Remove tournament players/teams tied to sample team names
  DELETE FROM players
  WHERE team_id IN (
    SELECT id FROM teams WHERE name IN ('Team Atlas FC', 'Team Nova FC')
  );

  DELETE FROM teams WHERE name IN ('Team Atlas FC', 'Team Nova FC');

  -- Remove registration-phase players/teams tied to sample IDs
  DELETE FROM team_players
  WHERE team_id IN (
    'a1111111-2222-3333-4444-555555555555',
    'b1111111-2222-3333-4444-555555555555'
  );

  DELETE FROM team_registrations
  WHERE id IN (
    'a1111111-2222-3333-4444-555555555555',
    'b1111111-2222-3333-4444-555555555555'
  );
END $$;

-- Ensure tournament_config rows exist
INSERT INTO tournament_config (category, total_slots, registration_open)
VALUES
  ('open-age', 12, true),
  ('u17', 12, true)
ON CONFLICT (category) DO UPDATE SET
  total_slots = EXCLUDED.total_slots,
  registration_open = EXCLUDED.registration_open;

-- ============================================
-- STEP 1 · CREATE REGISTRATIONS
-- ============================================
INSERT INTO team_registrations (
  id,
  user_id,
  team_name,
  category,
  team_logo,
  captain_name,
  captain_email,
  captain_phone,
  formation,
  status,
  created_at,
  submitted_at
) VALUES
(
  'a1111111-2222-3333-4444-555555555555',
  NULL,
  'Team Atlas FC',
  'open-age',
  'https://upload.wikimedia.org/wikipedia/commons/9/9f/A_team_placeholder.svg',
  'Aaliyah Idris',
  'atlas.captain@example.com',
  '+1 555 111 2222',
  '1-3-2-1',
  'submitted',
  NOW(),
  NOW()
),
(
  'b1111111-2222-3333-4444-555555555555',
  NULL,
  'Team Nova FC',
  'open-age',
  'https://upload.wikimedia.org/wikipedia/commons/3/3c/Placeholder_team_logo.svg',
  'Noah Kareem',
  'nova.captain@example.com',
  '+1 555 333 4444',
  '1-2-3-1',
  'submitted',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  team_name = EXCLUDED.team_name,
  captain_name = EXCLUDED.captain_name,
  formation = EXCLUDED.formation,
  status = EXCLUDED.status,
  submitted_at = EXCLUDED.submitted_at;

-- ============================================
-- STEP 2 · ADD PLAYERS (7 starters + 3 subs EACH)
-- ============================================
DELETE FROM team_players
WHERE team_id IN (
  'a1111111-2222-3333-4444-555555555555',
  'b1111111-2222-3333-4444-555555555555'
);

-- Team Atlas FC · 1-3-2-1
INSERT INTO team_players (team_id, player_name, position, is_substitute, player_image, position_x, position_y)
VALUES
  ('a1111111-2222-3333-4444-555555555555', 'Atlas GK',  'GK',  false, NULL, 50, 92),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas RB',  'RB',  false, NULL, 70, 72),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas CB',  'CB',  false, NULL, 50, 72),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas LB',  'LB',  false, NULL, 30, 72),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas CM1', 'CM',  false, NULL, 38, 48),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas CM2', 'CM',  false, NULL, 62, 48),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas ST',  'ST',  false, NULL, 50, 25),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas Sub1','SUB', true,  NULL, 15, 8),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas Sub2','SUB', true,  NULL, 35, 8),
  ('a1111111-2222-3333-4444-555555555555', 'Atlas Sub3','SUB', true,  NULL, 70, 8);

-- Team Nova FC · 1-2-3-1
INSERT INTO team_players (team_id, player_name, position, is_substitute, player_image, position_x, position_y)
VALUES
  ('b1111111-2222-3333-4444-555555555555', 'Nova GK',  'GK',  false, NULL, 50, 92),
  ('b1111111-2222-3333-4444-555555555555', 'Nova CB1', 'CB',  false, NULL, 40, 72),
  ('b1111111-2222-3333-4444-555555555555', 'Nova CB2', 'CB',  false, NULL, 60, 72),
  ('b1111111-2222-3333-4444-555555555555', 'Nova LW',  'LW',  false, NULL, 25, 45),
  ('b1111111-2222-3333-4444-555555555555', 'Nova CAM', 'CAM', false, NULL, 50, 42),
  ('b1111111-2222-3333-4444-555555555555', 'Nova RW',  'RW',  false, NULL, 75, 45),
  ('b1111111-2222-3333-4444-555555555555', 'Nova ST',  'ST',  false, NULL, 50, 18),
  ('b1111111-2222-3333-4444-555555555555', 'Nova Sub1','SUB', true,  NULL, 20, 8),
  ('b1111111-2222-3333-4444-555555555555', 'Nova Sub2','SUB', true,  NULL, 40, 8),
  ('b1111111-2222-3333-4444-555555555555', 'Nova Sub3','SUB', true,  NULL, 70, 8);

-- ============================================
-- STEP 3 · CONFIRM TOURNAMENT ENTRIES
-- ============================================
SELECT confirm_registration_to_tournament('a1111111-2222-3333-4444-555555555555');
SELECT confirm_registration_to_tournament('b1111111-2222-3333-4444-555555555555');

-- ============================================
-- STEP 4 · CREATE MATCH + GOALS
-- ============================================
INSERT INTO matches (
  id,
  home_team_id,
  away_team_id,
  home_score,
  away_score,
  match_date,
  scheduled_time,
  match_number,
  venue,
  status,
  category,
  match_type
) VALUES (
  'c1111111-2222-3333-4444-555555555555',
  (SELECT tournament_team_id FROM team_registrations WHERE id = 'a1111111-2222-3333-4444-555555555555'),
  (SELECT tournament_team_id FROM team_registrations WHERE id = 'b1111111-2222-3333-4444-555555555555'),
  3,
  2,
  timezone('UTC', NOW())::date,
  '18:00',
  1,
  'Central Arena',
  'scheduled',
  'open-age',
  'group'
)
ON CONFLICT (id) DO UPDATE SET
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  match_date = EXCLUDED.match_date,
  status = EXCLUDED.status;

DELETE FROM goals WHERE match_id = 'c1111111-2222-3333-4444-555555555555';
INSERT INTO goals (match_id, team_id, scorer_name, assist_name, minute)
VALUES
  ('c1111111-2222-3333-4444-555555555555', (SELECT tournament_team_id FROM team_registrations WHERE id = 'a1111111-2222-3333-4444-555555555555'), 'Atlas ST',  'Atlas CAM', 12),
  ('c1111111-2222-3333-4444-555555555555', (SELECT tournament_team_id FROM team_registrations WHERE id = 'b1111111-2222-3333-4444-555555555555'), 'Nova ST',   'Nova LW', 24),
  ('c1111111-2222-3333-4444-555555555555', (SELECT tournament_team_id FROM team_registrations WHERE id = 'a1111111-2222-3333-4444-555555555555'), 'Atlas CM1', 'Atlas CM2', 37),
  ('c1111111-2222-3333-4444-555555555555', (SELECT tournament_team_id FROM team_registrations WHERE id = 'b1111111-2222-3333-4444-555555555555'), 'Nova CAM',  NULL,       49),
  ('c1111111-2222-3333-4444-555555555555', (SELECT tournament_team_id FROM team_registrations WHERE id = 'a1111111-2222-3333-4444-555555555555'), 'Atlas ST',  'Atlas RB', 63);

-- Mark match as completed to trigger standings update
UPDATE matches
SET status = 'completed'
WHERE id = 'c1111111-2222-3333-4444-555555555555';

-- ==========================================
-- STEP 5 · QUICK VERIFICATION QUERIES
-- ==========================================

-- Standings snapshot
SELECT name, played, won, drawn, lost, goals_for, goals_against, (goals_for - goals_against) AS gd, points
FROM teams
WHERE name IN ('Team Atlas FC', 'Team Nova FC');

-- Match summary
SELECT 
  m.id,
  ht.name AS home_team,
  at.name AS away_team,
  m.home_score,
  m.away_score,
  m.status,
  m.match_date
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE m.id = 'c1111111-2222-3333-4444-555555555555';

-- Goals timeline
SELECT 
  g.minute,
  g.scorer_name,
  g.assist_name,
  t.name AS team_name
FROM goals g
JOIN teams t ON g.team_id = t.id
WHERE g.match_id = 'c1111111-2222-3333-4444-555555555555'
ORDER BY g.minute;

-- Ensure players copied into tournament roster
SELECT 
  t.name,
  COUNT(*) FILTER (WHERE p.is_substitute = false) AS starters,
  COUNT(*) FILTER (WHERE p.is_substitute = true) AS substitutes
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.name IN ('Team Atlas FC', 'Team Nova FC')
GROUP BY t.name;

-- ✅ All done! Visit /muqawamah/2026/open-age/ to see live data.
