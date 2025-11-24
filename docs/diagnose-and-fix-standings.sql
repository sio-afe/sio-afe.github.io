-- ============================================
-- DIAGNOSE AND FIX STANDINGS ISSUE
-- ============================================

-- 1. Check if teams exist
SELECT 
  'Teams Check' AS check_type,
  name, 
  played, 
  won, 
  drawn, 
  lost, 
  goals_for, 
  goals_against, 
  points,
  (goals_for - goals_against) AS goal_diff
FROM teams
WHERE name IN ('Team Atlas FC', 'Team Nova FC')
ORDER BY name;

-- 2. Check if match exists and status
SELECT 
  'Match Check' AS check_type,
  m.id,
  ht.name AS home_team,
  m.home_score,
  m.away_score,
  at.name AS away_team,
  m.status,
  m.match_date
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE ht.name = 'Team Atlas FC' 
  AND at.name = 'Team Nova FC';

-- 3. Check if trigger exists
SELECT 
  'Trigger Check' AS check_type,
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'update_match_team_stats_trigger';

-- 4. MANUAL FIX: Recalculate standings from all completed matches
-- This will reset and recalculate all team stats

DO $$
DECLARE
  team_record RECORD;
  match_record RECORD;
BEGIN
  -- Reset all team stats for open-age category
  UPDATE teams
  SET 
    played = 0,
    won = 0,
    drawn = 0,
    lost = 0,
    goals_for = 0,
    goals_against = 0,
    points = 0
  WHERE category = 'open-age';

  RAISE NOTICE '✓ Reset all team stats';

  -- Loop through all completed matches and update stats
  FOR match_record IN 
    SELECT 
      m.id,
      m.home_team_id,
      m.away_team_id,
      m.home_score,
      m.away_score
    FROM matches m
    WHERE m.status = 'completed' 
      AND m.category = 'open-age'
    ORDER BY m.match_date, m.scheduled_time
  LOOP
    -- Update home team
    UPDATE teams
    SET 
      played = played + 1,
      won = won + CASE WHEN match_record.home_score > match_record.away_score THEN 1 ELSE 0 END,
      drawn = drawn + CASE WHEN match_record.home_score = match_record.away_score THEN 1 ELSE 0 END,
      lost = lost + CASE WHEN match_record.home_score < match_record.away_score THEN 1 ELSE 0 END,
      goals_for = goals_for + match_record.home_score,
      goals_against = goals_against + match_record.away_score,
      points = points + CASE 
        WHEN match_record.home_score > match_record.away_score THEN 3
        WHEN match_record.home_score = match_record.away_score THEN 1
        ELSE 0
      END
    WHERE id = match_record.home_team_id;

    -- Update away team
    UPDATE teams
    SET 
      played = played + 1,
      won = won + CASE WHEN match_record.away_score > match_record.home_score THEN 1 ELSE 0 END,
      drawn = drawn + CASE WHEN match_record.away_score = match_record.home_score THEN 1 ELSE 0 END,
      lost = lost + CASE WHEN match_record.away_score < match_record.home_score THEN 1 ELSE 0 END,
      goals_for = goals_for + match_record.away_score,
      goals_against = goals_against + match_record.home_score,
      points = points + CASE 
        WHEN match_record.away_score > match_record.home_score THEN 3
        WHEN match_record.away_score = match_record.home_score THEN 1
        ELSE 0
      END
    WHERE id = match_record.away_team_id;

    RAISE NOTICE '✓ Updated stats for match %', match_record.id;
  END LOOP;

  RAISE NOTICE '✅ Standings recalculated successfully';
END $$;

-- 5. Verify the fix
SELECT 
  'Final Standings' AS result_type,
  name, 
  played, 
  won, 
  drawn, 
  lost, 
  goals_for, 
  goals_against, 
  (goals_for - goals_against) AS gd,
  points
FROM teams
WHERE category = 'open-age'
ORDER BY points DESC, (goals_for - goals_against) DESC, goals_for DESC;

