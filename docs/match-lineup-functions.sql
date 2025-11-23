-- Functions to get match lineup data for display
-- Run this AFTER the tournament schema is set up

-- Function to get full match details with lineups
CREATE OR REPLACE FUNCTION get_match_details(match_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'match', json_build_object(
      'id', m.id,
      'match_date', m.match_date,
      'scheduled_time', m.scheduled_time,
      'venue', m.venue,
      'status', m.status,
      'home_score', m.home_score,
      'away_score', m.away_score,
      'match_type', m.match_type
    ),
    'home_team', json_build_object(
      'id', ht.id,
      'name', ht.name,
      'crest_url', ht.crest_url,
      'formation', ht.formation,
      'captain', ht.captain,
      'players', (
        SELECT json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'number', p.number,
            'position', p.position,
            'is_substitute', p.is_substitute,
            'player_image', p.player_image,
            'position_x', p.position_x,
            'position_y', p.position_y
          )
          ORDER BY p.is_substitute, p.position
        )
        FROM players p
        WHERE p.team_id = ht.id
      )
    ),
    'away_team', json_build_object(
      'id', at.id,
      'name', at.name,
      'crest_url', at.crest_url,
      'formation', at.formation,
      'captain', at.captain,
      'players', (
        SELECT json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'number', p.number,
            'position', p.position,
            'is_substitute', p.is_substitute,
            'player_image', p.player_image,
            'position_x', p.position_x,
            'position_y', p.position_y
          )
          ORDER BY p.is_substitute, p.position
        )
        FROM players p
        WHERE p.team_id = at.id
      )
    ),
    'goals', (
      SELECT json_agg(
        json_build_object(
          'id', g.id,
          'scorer_name', g.scorer_name,
          'assist_name', g.assist_name,
          'minute', g.minute,
          'team_id', g.team_id,
          'team_name', CASE 
            WHEN g.team_id = ht.id THEN ht.name 
            ELSE at.name 
          END
        )
        ORDER BY g.minute
      )
      FROM goals g
      WHERE g.match_id = m.id
    )
  ) INTO result
  FROM matches m
  JOIN teams ht ON m.home_team_id = ht.id
  JOIN teams at ON m.away_team_id = at.id
  WHERE m.id = match_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get team lineup (for any team)
CREATE OR REPLACE FUNCTION get_team_lineup(team_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'team', json_build_object(
      'id', t.id,
      'name', t.name,
      'crest_url', t.crest_url,
      'formation', t.formation,
      'captain', t.captain
    ),
    'starting_xi', (
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'number', p.number,
          'position', p.position,
          'player_image', p.player_image,
          'position_x', p.position_x,
          'position_y', p.position_y
        )
        ORDER BY p.position
      )
      FROM players p
      WHERE p.team_id = t.id AND p.is_substitute = false
    ),
    'substitutes', (
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'number', p.number,
          'position', p.position,
          'player_image', p.player_image
        )
        ORDER BY p.name
      )
      FROM players p
      WHERE p.team_id = t.id AND p.is_substitute = true
    )
  ) INTO result
  FROM teams t
  WHERE t.id = team_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT get_match_details('match-uuid-here');
-- SELECT get_team_lineup('team-uuid-here');

-- Sample query to get match with lineups (alternative to function)
/*
SELECT 
  m.*,
  json_build_object(
    'id', ht.id,
    'name', ht.name,
    'formation', ht.formation,
    'crest_url', ht.crest_url
  ) as home_team,
  json_build_object(
    'id', at.id,
    'name', at.name,
    'formation', at.formation,
    'crest_url', at.crest_url
  ) as away_team,
  (
    SELECT json_agg(
      json_build_object(
        'name', p.name,
        'position', p.position,
        'image', p.player_image,
        'x', p.position_x,
        'y', p.position_y,
        'is_sub', p.is_substitute
      )
    )
    FROM players p
    WHERE p.team_id = ht.id
  ) as home_players,
  (
    SELECT json_agg(
      json_build_object(
        'name', p.name,
        'position', p.position,
        'image', p.player_image,
        'x', p.position_x,
        'y', p.position_y,
        'is_sub', p.is_substitute
      )
    )
    FROM players p
    WHERE p.team_id = at.id
  ) as away_players
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE m.id = 'match-uuid';
*/

