-- Quick check of current standings data

-- Teams
SELECT 
  name, 
  played, 
  won, 
  drawn, 
  lost, 
  goals_for AS gf, 
  goals_against AS ga, 
  (goals_for - goals_against) AS gd,
  points AS pts
FROM teams
WHERE category = 'open-age'
ORDER BY points DESC, (goals_for - goals_against) DESC;

-- Completed matches
SELECT 
  ht.name AS home,
  m.home_score,
  m.away_score,
  at.name AS away,
  m.status,
  m.match_date
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE m.category = 'open-age'
ORDER BY m.match_date, m.scheduled_time;

