-- Fix Double-Counted Standings
-- This script resets all team stats and recalculates them from completed GROUP stage matches only

-- Step 1: Reset all team stats to zero
UPDATE public.teams
SET 
    played = 0,
    won = 0,
    drawn = 0,
    lost = 0,
    goals_for = 0,
    goals_against = 0,
    points = 0,
    updated_at = now();

-- Step 2: Recalculate stats from completed GROUP STAGE matches only
-- Update home team stats for all completed group matches
UPDATE public.teams t
SET
    played = t.played + subq.matches_played,
    won = t.won + subq.wins,
    drawn = t.drawn + subq.draws,
    lost = t.lost + subq.losses,
    goals_for = t.goals_for + subq.gf,
    goals_against = t.goals_against + subq.ga,
    points = t.points + subq.pts,
    updated_at = now()
FROM (
    SELECT 
        home_team_id AS team_id,
        COUNT(*) AS matches_played,
        SUM(CASE WHEN home_score > away_score THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN home_score = away_score THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN home_score < away_score THEN 1 ELSE 0 END) AS losses,
        SUM(home_score) AS gf,
        SUM(away_score) AS ga,
        SUM(CASE 
            WHEN home_score > away_score THEN 3
            WHEN home_score = away_score THEN 1
            ELSE 0
        END) AS pts
    FROM public.matches
    WHERE status = 'completed' 
    AND match_type = 'group'  -- Only group stage matches!
    GROUP BY home_team_id
) subq
WHERE t.id = subq.team_id;

-- Update away team stats for all completed group matches
UPDATE public.teams t
SET
    played = t.played + subq.matches_played,
    won = t.won + subq.wins,
    drawn = t.drawn + subq.draws,
    lost = t.lost + subq.losses,
    goals_for = t.goals_for + subq.gf,
    goals_against = t.goals_against + subq.ga,
    points = t.points + subq.pts,
    updated_at = now()
FROM (
    SELECT 
        away_team_id AS team_id,
        COUNT(*) AS matches_played,
        SUM(CASE WHEN away_score > home_score THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN home_score = away_score THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN away_score < home_score THEN 1 ELSE 0 END) AS losses,
        SUM(away_score) AS gf,
        SUM(home_score) AS ga,
        SUM(CASE 
            WHEN away_score > home_score THEN 3
            WHEN home_score = away_score THEN 1
            ELSE 0
        END) AS pts
    FROM public.matches
    WHERE status = 'completed'
    AND match_type = 'group'  -- Only group stage matches!
    GROUP BY away_team_id
) subq
WHERE t.id = subq.team_id;

-- Step 3: Verify the results
SELECT 
    name,
    played AS P,
    won AS W,
    drawn AS D,
    lost AS L,
    goals_for AS GF,
    goals_against AS GA,
    (goals_for - goals_against) AS GD,
    points AS PTS
FROM public.teams
WHERE category = 'open-age'
ORDER BY points DESC, (goals_for - goals_against) DESC, goals_for DESC;

-- Show completed group stage matches count
SELECT 
    'Completed group stage matches' AS info,
    COUNT(*) AS count
FROM public.matches
WHERE status = 'completed' AND match_type = 'group';

