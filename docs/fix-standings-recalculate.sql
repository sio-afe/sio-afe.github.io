    -- ============================================
    -- FIX: Recalculate Team Standings from Matches
    -- ============================================
    -- This script recalculates all team statistics from scratch
    -- based on completed matches. Run this if standings are doubled.
    -- ============================================

    -- STEP 1: Reset all team statistics to zero
    UPDATE teams 
    SET 
        played = 0,
        won = 0,
        drawn = 0,
        lost = 0,
        goals_for = 0,
        goals_against = 0,
        points = 0
    WHERE TRUE;

    -- STEP 2: Recalculate statistics for each completed match
    -- Home team stats
    UPDATE teams t
    SET 
        played = COALESCE((
            SELECT COUNT(*)
            FROM matches m
            WHERE (m.home_team_id = t.id OR m.away_team_id = t.id)
            AND m.status = 'completed'
        ), 0),
        
        won = COALESCE((
            SELECT COUNT(*)
            FROM matches m
            WHERE m.status = 'completed'
            AND (
                (m.home_team_id = t.id AND m.home_score > m.away_score)
                OR
                (m.away_team_id = t.id AND m.away_score > m.home_score)
            )
        ), 0),
        
        drawn = COALESCE((
            SELECT COUNT(*)
            FROM matches m
            WHERE (m.home_team_id = t.id OR m.away_team_id = t.id)
            AND m.status = 'completed'
            AND m.home_score = m.away_score
        ), 0),
        
        lost = COALESCE((
            SELECT COUNT(*)
            FROM matches m
            WHERE m.status = 'completed'
            AND (
                (m.home_team_id = t.id AND m.home_score < m.away_score)
                OR
                (m.away_team_id = t.id AND m.away_score < m.home_score)
            )
        ), 0),
        
        goals_for = COALESCE((
            SELECT 
                SUM(CASE 
                    WHEN m.home_team_id = t.id THEN m.home_score 
                    ELSE m.away_score 
                END)
            FROM matches m
            WHERE (m.home_team_id = t.id OR m.away_team_id = t.id)
            AND m.status = 'completed'
        ), 0),
        
        goals_against = COALESCE((
            SELECT 
                SUM(CASE 
                    WHEN m.home_team_id = t.id THEN m.away_score 
                    ELSE m.home_score 
                END)
            FROM matches m
            WHERE (m.home_team_id = t.id OR m.away_team_id = t.id)
            AND m.status = 'completed'
        ), 0),
        
        points = COALESCE((
            SELECT 
                SUM(CASE 
                    -- Win = 3 points
                    WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) THEN 3
                    WHEN (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 3
                    -- Draw = 1 point
                    WHEN m.home_score = m.away_score THEN 1
                    -- Loss = 0 points
                    ELSE 0
                END)
            FROM matches m
            WHERE (m.home_team_id = t.id OR m.away_team_id = t.id)
            AND m.status = 'completed'
        ), 0)
    WHERE TRUE;

    -- STEP 3: Verify the recalculation
    SELECT 
        name as team,
        category,
        played as P,
        won as W,
        drawn as D,
        lost as L,
        goals_for as GF,
        goals_against as GA,
        (goals_for - goals_against) as GD,
        points as PTS
    FROM teams
    ORDER BY 
        category,
        points DESC,
        (goals_for - goals_against) DESC,
        goals_for DESC;

    -- ============================================
    -- INSTRUCTIONS:
    -- ============================================
    -- 1. Copy this entire script
    -- 2. Go to Supabase SQL Editor
    -- 3. Paste and run the script
    -- 4. Check the results table at the bottom
    -- 5. Verify standings are correct
    -- 6. Refresh your admin panel
    -- ============================================

    -- ============================================
    -- WHAT THIS DOES:
    -- ============================================
    -- ✅ Resets all team stats to 0
    -- ✅ Recalculates played, won, drawn, lost from matches
    -- ✅ Recalculates goals for and goals against
    -- ✅ Recalculates points (3 for win, 1 for draw, 0 for loss)
    -- ✅ Shows final standings table for verification
    -- ============================================

