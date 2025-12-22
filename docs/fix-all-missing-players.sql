-- Find and fix ALL teams with missing players
-- This script checks all tournament teams and copies missing players from team_players table

-- STEP 1: Identify teams with missing players
SELECT 
  t.id AS team_id,
  t.name AS team_name,
  t.registration_id,
  COUNT(p.id) AS players_in_tournament,
  (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.registration_id) AS players_in_registration
FROM teams t
LEFT JOIN players p ON p.team_id = t.id
WHERE t.registration_id IS NOT NULL
GROUP BY t.id, t.name, t.registration_id
HAVING COUNT(p.id) = 0  -- No players in tournament
   AND (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.registration_id) > 0; -- But has players in registration

-- STEP 2: Fix all teams with missing players
DO $$ 
DECLARE
  team_record RECORD;
  player_record RECORD;
  total_teams_fixed INT := 0;
  players_copied INT := 0;
BEGIN
  -- Loop through all teams with missing players
  FOR team_record IN 
    SELECT 
      t.id AS team_id,
      t.name AS team_name,
      t.registration_id
    FROM teams t
    LEFT JOIN players p ON p.team_id = t.id
    WHERE t.registration_id IS NOT NULL
    GROUP BY t.id, t.name, t.registration_id
    HAVING COUNT(p.id) = 0
       AND (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.registration_id) > 0
  LOOP
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Fixing team: % (ID: %)', team_record.team_name, team_record.team_id;
    
    players_copied := 0;
    
    -- Copy players from team_players to players table
    FOR player_record IN 
      SELECT * FROM team_players 
      WHERE team_id = team_record.registration_id
    LOOP
      INSERT INTO players (
        team_id,
        name,
        position,
        is_substitute,
        player_image,
        position_x,
        position_y,
        registration_player_id
      )
      VALUES (
        team_record.team_id,
        player_record.player_name,
        player_record.position,
        player_record.is_substitute,
        player_record.player_image,
        player_record.position_x,
        player_record.position_y,
        player_record.id
      );
      
      players_copied := players_copied + 1;
    END LOOP;
    
    RAISE NOTICE '✓ Copied % players for %', players_copied, team_record.team_name;
    total_teams_fixed := total_teams_fixed + 1;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ COMPLETE: Fixed % teams', total_teams_fixed;
END $$;

-- STEP 3: Verify all teams now have players
SELECT 
  t.id AS team_id,
  t.name AS team_name,
  t.category,
  t.registration_id,
  COUNT(p.id) AS player_count,
  STRING_AGG(p.name, ', ' ORDER BY p.is_substitute, p.name) AS players
FROM teams t
LEFT JOIN players p ON p.team_id = t.id
WHERE t.registration_id IS NOT NULL
GROUP BY t.id, t.name, t.category, t.registration_id
ORDER BY t.name;

-- STEP 4: Summary statistics
SELECT 
  'Total tournament teams' AS metric,
  COUNT(*) AS count
FROM teams
WHERE registration_id IS NOT NULL

UNION ALL

SELECT 
  'Teams with players' AS metric,
  COUNT(DISTINCT team_id) AS count
FROM players
WHERE team_id IN (SELECT id FROM teams WHERE registration_id IS NOT NULL)

UNION ALL

SELECT 
  'Teams WITHOUT players' AS metric,
  COUNT(*) AS count
FROM teams t
WHERE t.registration_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id);

