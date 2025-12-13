-- ============================================
-- ADD PLAYER FROM team_players TO players TABLE
-- ============================================
-- This script adds specific players from team_players to the players (tournament) table
-- 
-- Players to add:
-- 1. Tamanda (SUB) - team_players.id: 'e9a79502-1b7a-4bb9-9dec-3f21f1954fe0'
-- 2. Youssouf Mohamed Maïga (GK) - team_players.id: '7e613a26-bafb-4f33-acc4-bffbf4120c93'
-- 
-- Team registration ID: '2259f907-69fb-48e4-af80-f15d34815d09'

DO $$
DECLARE
  v_tournament_team_id UUID;
  v_registration_id UUID := '2259f907-69fb-48e4-af80-f15d34815d09';
  v_new_gk_id UUID := '7e613a26-bafb-4f33-acc4-bffbf4120c93';
  v_sub_player_id UUID := 'e9a79502-1b7a-4bb9-9dec-3f21f1954fe0';
  v_current_gk_id UUID;
BEGIN
  -- Step 1: Find the tournament team_id from teams table
  SELECT id INTO v_tournament_team_id
  FROM teams
  WHERE registration_id = v_registration_id;
  
  IF v_tournament_team_id IS NULL THEN
    RAISE EXCEPTION 'Tournament team not found for registration_id: %. Please confirm the registration first.', v_registration_id;
  END IF;
  
  RAISE NOTICE 'Found tournament team ID: %', v_tournament_team_id;
  
  -- Step 2: Find current GK in players table and make them a substitute
  SELECT id INTO v_current_gk_id
  FROM players
  WHERE team_id = v_tournament_team_id
    AND position = 'GK'
    AND is_substitute = false
  LIMIT 1;
  
  IF v_current_gk_id IS NOT NULL THEN
    -- Update current GK to be a substitute
    UPDATE players
    SET
      is_substitute = true,
      position = 'SUB'
    WHERE id = v_current_gk_id;
    
    RAISE NOTICE 'Updated previous GK (ID: %) to be a substitute', v_current_gk_id;
  ELSE
    RAISE NOTICE 'No current GK found in players table. Proceeding with adding new GK.';
  END IF;
  
  -- Step 3: Add new GK player (Youssouf Mohamed Maïga)
  IF EXISTS (
    SELECT 1 FROM players 
    WHERE registration_player_id = v_new_gk_id
  ) THEN
    RAISE NOTICE 'New GK player already exists. Updating...';
    
    UPDATE players
    SET
      team_id = v_tournament_team_id,
      name = (SELECT player_name FROM team_players WHERE id = v_new_gk_id),
      position = 'GK',
      is_substitute = false,
      player_image = (SELECT player_image FROM team_players WHERE id = v_new_gk_id),
      position_x = (SELECT position_x FROM team_players WHERE id = v_new_gk_id),
      position_y = (SELECT position_y FROM team_players WHERE id = v_new_gk_id)
    WHERE registration_player_id = v_new_gk_id;
    
    RAISE NOTICE 'GK player updated successfully!';
  ELSE
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
    SELECT
      v_tournament_team_id,
      player_name,
      'GK',  -- Force position to GK
      false,  -- Force is_substitute to false (starter)
      player_image,
      COALESCE(position_x, 50),
      COALESCE(position_y, 92),
      id
    FROM team_players
    WHERE id = v_new_gk_id;
    
    RAISE NOTICE 'New GK player added successfully!';
  END IF;
  
  -- Step 4: Add Tamanda (SUB player)
  IF EXISTS (
    SELECT 1 FROM players 
    WHERE registration_player_id = v_sub_player_id
  ) THEN
    RAISE NOTICE 'SUB player already exists. Updating...';
    
    UPDATE players
    SET
      team_id = v_tournament_team_id,
      name = (SELECT player_name FROM team_players WHERE id = v_sub_player_id),
      position = (SELECT position FROM team_players WHERE id = v_sub_player_id),
      is_substitute = (SELECT is_substitute FROM team_players WHERE id = v_sub_player_id),
      player_image = (SELECT player_image FROM team_players WHERE id = v_sub_player_id),
      position_x = (SELECT position_x FROM team_players WHERE id = v_sub_player_id),
      position_y = (SELECT position_y FROM team_players WHERE id = v_sub_player_id)
    WHERE registration_player_id = v_sub_player_id;
    
    RAISE NOTICE 'SUB player updated successfully!';
  ELSE
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
    SELECT
      v_tournament_team_id,
      player_name,
      position,
      is_substitute,
      player_image,
      position_x,
      position_y,
      id
    FROM team_players
    WHERE id = v_sub_player_id;
    
    RAISE NOTICE 'SUB player added successfully!';
  END IF;
  
  RAISE NOTICE 'All operations completed successfully!';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Verify the new GK player
SELECT 
  p.id,
  p.name,
  p.position,
  p.is_substitute,
  p.team_id,
  t.name as team_name,
  p.registration_player_id
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
WHERE p.registration_player_id = '7e613a26-bafb-4f33-acc4-bffbf4120c93';

-- Verify the SUB player
SELECT 
  p.id,
  p.name,
  p.position,
  p.is_substitute,
  p.team_id,
  t.name as team_name,
  p.registration_player_id
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
WHERE p.registration_player_id = 'e9a79502-1b7a-4bb9-9dec-3f21f1954fe0';

-- Check all GKs for this team
SELECT 
  p.id,
  p.name,
  p.position,
  p.is_substitute,
  p.registration_player_id
FROM players p
WHERE p.team_id = (
  SELECT id FROM teams WHERE registration_id = '2259f907-69fb-48e4-af80-f15d34815d09'
)
AND (p.position = 'GK' OR p.registration_player_id IN ('7e613a26-bafb-4f33-acc4-bffbf4120c93', 'e9a79502-1b7a-4bb9-9dec-3f21f1954fe0'))
ORDER BY p.is_substitute, p.position;

