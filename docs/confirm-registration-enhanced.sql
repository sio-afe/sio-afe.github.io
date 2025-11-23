-- Enhanced function to copy registration data to tournament tables
-- Run this AFTER both migration and tournament schemas are set up

CREATE OR REPLACE FUNCTION confirm_registration_to_tournament(registration_id UUID)
RETURNS UUID AS $$
DECLARE
  new_team_id UUID;
  reg_record RECORD;
  player_record RECORD;
BEGIN
  -- Get registration details
  SELECT * INTO reg_record
  FROM team_registrations
  WHERE id = registration_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found: %', registration_id;
  END IF;
  
  -- Check if already confirmed
  IF reg_record.tournament_team_id IS NOT NULL THEN
    RAISE NOTICE 'Registration already confirmed. Returning existing team ID.';
    RETURN reg_record.tournament_team_id;
  END IF;
  
  -- Check if slots available
  IF NOT check_slots_available(reg_record.category) THEN
    RAISE EXCEPTION 'No slots available for category: %', reg_record.category;
  END IF;
  
  -- Create tournament team with formation
  INSERT INTO teams (
    name, 
    crest_url, 
    captain, 
    category,
    formation,
    registration_id
  )
  VALUES (
    reg_record.team_name,
    reg_record.team_logo,
    reg_record.captain_name,
    reg_record.category,
    reg_record.formation,
    registration_id
  )
  RETURNING id INTO new_team_id;
  
  RAISE NOTICE 'Created tournament team: % (ID: %)', reg_record.team_name, new_team_id;
  
  -- Copy players from team_players to players table
  FOR player_record IN 
    SELECT * FROM team_players WHERE team_id = registration_id
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
      new_team_id,
      player_record.player_name,
      player_record.position,
      player_record.is_substitute,
      player_record.player_image,
      player_record.position_x,
      player_record.position_y,
      player_record.id
    );
  END LOOP;
  
  RAISE NOTICE 'Copied % players to tournament roster', 
    (SELECT COUNT(*) FROM team_players WHERE team_id = registration_id);
  
  -- Update registration with tournament team link
  UPDATE team_registrations
  SET 
    status = 'confirmed',
    confirmed_at = NOW(),
    tournament_team_id = new_team_id
  WHERE id = registration_id;
  
  RAISE NOTICE '✓ Registration confirmed successfully!';
  
  RETURN new_team_id;
END;
$$ LANGUAGE plpgsql;

-- Test the function (example)
-- SELECT confirm_registration_to_tournament('your-registration-uuid-here');

