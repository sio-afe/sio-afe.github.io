-- ================================================
-- Tournament Groups & Knockout Auto-Configuration
-- ================================================

-- 1. Add group column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS tournament_group VARCHAR(1) DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN teams.tournament_group IS 'Tournament group assignment: A, B, C, D';

-- 2. Add aggregate card columns for tiebreaker calculations
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;

-- 3. Create tournament_settings table for configuration
CREATE TABLE IF NOT EXISTS tournament_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category VARCHAR(20) NOT NULL DEFAULT 'open-age',
  total_groups INTEGER DEFAULT 4,
  teams_per_group INTEGER DEFAULT 3,
  teams_qualifying_per_group INTEGER DEFAULT 2,
  knockout_format VARCHAR(20) DEFAULT 'quarter-final', -- 'quarter-final', 'semi-final'
  group_stage_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category)
);

-- Insert default settings
INSERT INTO tournament_settings (category, total_groups, teams_per_group, teams_qualifying_per_group, knockout_format)
VALUES 
  ('open-age', 4, 3, 2, 'quarter-final'),
  ('u17', 4, 3, 2, 'quarter-final')
ON CONFLICT (category) DO NOTHING;

-- 4. Create function to calculate team cards from matches
CREATE OR REPLACE FUNCTION update_team_cards()
RETURNS TRIGGER AS $$
BEGIN
  -- Update yellow cards count for the team
  UPDATE teams 
  SET yellow_cards = (
    SELECT COUNT(*) 
    FROM cards c
    JOIN matches m ON c.match_id = m.id
    WHERE c.team_id = NEW.team_id 
    AND c.card_type = 'yellow'
    AND m.match_type = 'group'
  ),
  red_cards = (
    SELECT COUNT(*) 
    FROM cards c
    JOIN matches m ON c.match_id = m.id
    WHERE c.team_id = NEW.team_id 
    AND c.card_type = 'red'
    AND m.match_type = 'group'
  )
  WHERE id = NEW.team_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to update team cards when cards are added
DROP TRIGGER IF EXISTS update_team_cards_trigger ON cards;
CREATE TRIGGER update_team_cards_trigger
AFTER INSERT OR UPDATE OR DELETE ON cards
FOR EACH ROW
EXECUTE FUNCTION update_team_cards();

-- 6. Create knockout_bracket table to store bracket configuration
CREATE TABLE IF NOT EXISTS knockout_bracket (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  round VARCHAR(20) NOT NULL, -- 'quarter-final', 'semi-final', 'final', 'third-place'
  match_number INTEGER NOT NULL,
  home_slot VARCHAR(10), -- 'A1', 'B2', etc. (group position) or 'QF1', 'SF1' (winner of previous)
  away_slot VARCHAR(10),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  match_id UUID REFERENCES matches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, round, match_number)
);

-- 7. Function to get team standings with tiebreakers
CREATE OR REPLACE FUNCTION get_group_standings(p_category VARCHAR, p_group VARCHAR DEFAULT NULL)
RETURNS TABLE (
  team_id UUID,
  team_name VARCHAR,
  crest_url TEXT,
  tournament_group VARCHAR,
  played INTEGER,
  won INTEGER,
  drawn INTEGER,
  lost INTEGER,
  goals_for INTEGER,
  goals_against INTEGER,
  goal_difference INTEGER,
  points INTEGER,
  yellow_cards INTEGER,
  red_cards INTEGER,
  rank_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH team_stats AS (
    SELECT 
      t.id AS team_id,
      t.name AS team_name,
      t.crest_url,
      t.tournament_group,
      COALESCE(t.played, 0) AS played,
      COALESCE(t.won, 0) AS won,
      COALESCE(t.drawn, 0) AS drawn,
      COALESCE(t.lost, 0) AS lost,
      COALESCE(t.goals_for, 0) AS goals_for,
      COALESCE(t.goals_against, 0) AS goals_against,
      COALESCE(t.goals_for, 0) - COALESCE(t.goals_against, 0) AS goal_difference,
      COALESCE(t.points, 0) AS points,
      COALESCE(t.yellow_cards, 0) AS yellow_cards,
      COALESCE(t.red_cards, 0) AS red_cards
    FROM teams t
    WHERE t.category = p_category
    AND (p_group IS NULL OR t.tournament_group = p_group)
  )
  SELECT 
    ts.*,
    ROW_NUMBER() OVER (
      PARTITION BY ts.tournament_group
      ORDER BY 
        ts.points DESC,
        ts.goal_difference DESC,
        ts.goals_for DESC,
        ts.yellow_cards ASC,  -- Fewer yellow cards is better
        ts.red_cards ASC,     -- Fewer red cards is better
        ts.team_name ASC      -- Alphabetical as final tiebreaker
    )::INTEGER AS rank_position
  FROM team_stats ts
  ORDER BY ts.tournament_group, rank_position;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to auto-configure knockout matches
CREATE OR REPLACE FUNCTION configure_knockout_matches(p_category VARCHAR)
RETURNS TEXT AS $$
DECLARE
  v_settings RECORD;
  v_group_winners RECORD;
  v_bracket_config JSONB;
  v_match_id UUID;
  v_result TEXT := '';
BEGIN
  -- Get tournament settings
  SELECT * INTO v_settings 
  FROM tournament_settings 
  WHERE category = p_category;
  
  IF NOT FOUND THEN
    RETURN 'ERROR: No tournament settings found for category: ' || p_category;
  END IF;
  
  -- Check if group stage is complete
  IF NOT v_settings.group_stage_complete THEN
    RETURN 'ERROR: Group stage is not marked as complete';
  END IF;
  
  -- Clear existing knockout bracket for this category
  DELETE FROM knockout_bracket WHERE category = p_category;
  
  -- Standard 4-group bracket with top 2 qualifying:
  -- QF1: A1 vs B2
  -- QF2: B1 vs A2  
  -- QF3: C1 vs D2
  -- QF4: D1 vs C2
  -- SF1: Winner QF1 vs Winner QF3
  -- SF2: Winner QF2 vs Winner QF4
  -- Final: Winner SF1 vs Winner SF2
  
  -- Insert Quarter-Final bracket slots
  INSERT INTO knockout_bracket (category, round, match_number, home_slot, away_slot)
  VALUES 
    (p_category, 'quarter-final', 1, 'A1', 'B2'),
    (p_category, 'quarter-final', 2, 'B1', 'A2'),
    (p_category, 'quarter-final', 3, 'C1', 'D2'),
    (p_category, 'quarter-final', 4, 'D1', 'C2');
  
  -- Insert Semi-Final bracket slots
  INSERT INTO knockout_bracket (category, round, match_number, home_slot, away_slot)
  VALUES 
    (p_category, 'semi-final', 1, 'QF1', 'QF3'),
    (p_category, 'semi-final', 2, 'QF2', 'QF4');
  
  -- Insert Final bracket slot
  INSERT INTO knockout_bracket (category, round, match_number, home_slot, away_slot)
  VALUES 
    (p_category, 'final', 1, 'SF1', 'SF2');
  
  -- Insert Third Place bracket slot
  INSERT INTO knockout_bracket (category, round, match_number, home_slot, away_slot)
  VALUES 
    (p_category, 'third-place', 1, 'SF1L', 'SF2L');  -- L = Loser
  
  -- Now populate Quarter-Final matches with actual teams
  FOR v_group_winners IN 
    SELECT * FROM get_group_standings(p_category)
    WHERE rank_position <= v_settings.teams_qualifying_per_group
  LOOP
    -- Update bracket with team IDs based on slot
    UPDATE knockout_bracket 
    SET home_team_id = v_group_winners.team_id
    WHERE category = p_category 
    AND home_slot = v_group_winners.tournament_group || v_group_winners.rank_position::TEXT;
    
    UPDATE knockout_bracket 
    SET away_team_id = v_group_winners.team_id
    WHERE category = p_category 
    AND away_slot = v_group_winners.tournament_group || v_group_winners.rank_position::TEXT;
  END LOOP;
  
  -- Create actual match fixtures for Quarter-Finals
  FOR v_group_winners IN 
    SELECT * FROM knockout_bracket 
    WHERE category = p_category 
    AND round = 'quarter-final'
    AND home_team_id IS NOT NULL 
    AND away_team_id IS NOT NULL
  LOOP
    -- Check if match already exists
    SELECT id INTO v_match_id
    FROM matches 
    WHERE home_team_id = v_group_winners.home_team_id 
    AND away_team_id = v_group_winners.away_team_id
    AND match_type = 'quarter-final'
    AND category = p_category;
    
    IF NOT FOUND THEN
      -- Create the match
      INSERT INTO matches (
        home_team_id, 
        away_team_id, 
        category, 
        match_type, 
        status,
        match_number
      )
      VALUES (
        v_group_winners.home_team_id,
        v_group_winners.away_team_id,
        p_category,
        'quarter-final',
        'scheduled',
        v_group_winners.match_number
      )
      RETURNING id INTO v_match_id;
    END IF;
    
    -- Update bracket with match ID
    UPDATE knockout_bracket 
    SET match_id = v_match_id
    WHERE id = v_group_winners.id;
    
    v_result := v_result || 'Created QF' || v_group_winners.match_number || ' match. ';
  END LOOP;
  
  RETURN 'SUCCESS: ' || v_result;
END;
$$ LANGUAGE plpgsql;

-- 9. Grant permissions
GRANT SELECT ON tournament_settings TO anon, authenticated;
GRANT SELECT ON knockout_bracket TO anon, authenticated;
GRANT ALL ON tournament_settings TO service_role;
GRANT ALL ON knockout_bracket TO service_role;

