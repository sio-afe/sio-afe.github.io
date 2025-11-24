-- =====================================================
-- ONE-OFF MATCH: b7a36902-5066-4405-a40a-f32b47ff5e59 vs c68e073a-d865-447a-866e-fc391269c823
-- =====================================================
-- Run this in Supabase SQL editor (or psql) AFTER the schema + base data exist.
-- It inserts a completed match so standings + stats update immediately.

DO $$
DECLARE
  home_team uuid := 'b7a36902-5066-4405-a40a-f32b47ff5e59';
  away_team uuid := 'c68e073a-d865-447a-866e-fc391269c823';
  new_match uuid := 'dd111111-2222-3333-4444-555555555555';
BEGIN
  -- Sanity check to make sure both teams exist
  IF NOT EXISTS (SELECT 1 FROM teams WHERE id = home_team) THEN
    RAISE EXCEPTION 'Home team % not found in teams table', home_team;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM teams WHERE id = away_team) THEN
    RAISE EXCEPTION 'Away team % not found in teams table', away_team;
  END IF;

  -- Insert or update the match record
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
  )
  VALUES (
    new_match,
    home_team,
    away_team,
    2,                 -- home score
    1,                 -- away score
    timezone('UTC', NOW())::date,
    '19:30',
    2,
    'Community Arena',
    'completed',
    'open-age',
    'group'
  )
  ON CONFLICT (id) DO UPDATE SET
    home_team_id = EXCLUDED.home_team_id,
    away_team_id = EXCLUDED.away_team_id,
    home_score   = EXCLUDED.home_score,
    away_score   = EXCLUDED.away_score,
    match_date   = EXCLUDED.match_date,
    scheduled_time = EXCLUDED.scheduled_time,
    match_number = EXCLUDED.match_number,
    venue        = EXCLUDED.venue,
    status       = EXCLUDED.status,
    category     = EXCLUDED.category,
    match_type   = EXCLUDED.match_type;

  -- Reset any prior goals for this match and seed a light timeline
  DELETE FROM goals WHERE match_id = new_match;

  INSERT INTO goals (match_id, team_id, scorer_name, assist_name, minute)
  VALUES
    (new_match, home_team, 'Home ST',    'Home CAM', 18),
    (new_match, away_team, 'Away LW',    NULL,       41),
    (new_match, home_team, 'Home CM1',   'Home RB',  56);

  -- Ensure the match is marked completed (trigger updates standings)
  UPDATE matches
  SET status = 'completed'
  WHERE id = new_match;

  RAISE NOTICE '✅ Added match % between % and %', new_match, home_team, away_team;
END $$;

-- Optional quick verification
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
WHERE m.id = 'dd111111-2222-3333-4444-555555555555';

