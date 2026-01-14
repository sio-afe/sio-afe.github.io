-- Fix missing players for team with registration_id: 3f6dcd32-eb5e-4dec-a325-b4ee89abad6c
-- This script copies players from team_players to players table

DO $$ 
DECLARE
  team_record RECORD;
  player_record RECORD;
  players_copied INT := 0;
BEGIN
  -- Get the tournament team
  SELECT * INTO team_record
  FROM teams
  WHERE registration_id = '3f6dcd32-eb5e-4dec-a325-b4ee89abad6c';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team with registration_id 3f6dcd32-eb5e-4dec-a325-b4ee89abad6c not found in teams table';
  END IF;
  
  RAISE NOTICE 'Found team: % (ID: %)', team_record.name, team_record.id;
  
  -- Check if players already exist
  IF EXISTS (SELECT 1 FROM players WHERE team_id = team_record.id) THEN
    RAISE NOTICE 'Warning: Players already exist for this team. Skipping...';
    RETURN;
  END IF;
  
  -- Copy players from team_players to players table
  FOR player_record IN 
    SELECT * FROM team_players 
    WHERE team_id = '3f6dcd32-eb5e-4dec-a325-b4ee89abad6c'
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
      team_record.id,
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
  
  RAISE NOTICE '✓ Successfully copied % players to tournament roster', players_copied;
  
  IF players_copied = 0 THEN
    RAISE WARNING 'No players found in team_players for registration_id: 3f6dcd32-eb5e-4dec-a325-b4ee89abad6c';
  END IF;
END $$;

-- Verify the fix
SELECT 
  t.name AS team_name,
  t.id AS team_id,
  t.registration_id,
  COUNT(p.id) AS player_count
FROM teams t
LEFT JOIN players p ON p.team_id = t.id
WHERE t.registration_id = '3f6dcd32-eb5e-4dec-a325-b4ee89abad6c'
GROUP BY t.name, t.id, t.registration_id;

-- Also show the players that were copied
SELECT 
  p.name AS player_name,
  p.position,
  p.is_substitute,
  t.name AS team_name
FROM players p
JOIN teams t ON t.id = p.team_id
WHERE t.registration_id = '3f6dcd32-eb5e-4dec-a325-b4ee89abad6c'
ORDER BY p.is_substitute, p.name;









