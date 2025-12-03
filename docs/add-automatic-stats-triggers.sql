-- ============================================
-- AUTOMATIC TEAM STATISTICS TRIGGERS
-- Optional: Auto-update team stats when matches are completed
-- ============================================

-- This is OPTIONAL because your Match Recorder already handles this
-- Only use if you want database-level automation

-- ============================================
-- TRIGGER FUNCTION: Update Team Stats
-- ============================================

CREATE OR REPLACE FUNCTION update_team_stats_on_match_complete()
RETURNS TRIGGER AS $$
DECLARE
    home_team_record RECORD;
    away_team_record RECORD;
    old_home_score INT;
    old_away_score INT;
BEGIN
    -- Only process when status changes to 'completed' or when completed match is updated
    IF NEW.status = 'completed' THEN
        
        -- Get current team stats
        SELECT * INTO home_team_record FROM teams WHERE id = NEW.home_team_id;
        SELECT * INTO away_team_record FROM teams WHERE id = NEW.away_team_id;
        
        -- If this is an UPDATE of an already completed match, reverse old stats first
        IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
            old_home_score := OLD.home_score;
            old_away_score := OLD.away_score;
            
            -- Reverse old stats for home team
            UPDATE teams SET
                played = GREATEST(played - 1, 0),
                goals_for = GREATEST(goals_for - old_home_score, 0),
                goals_against = GREATEST(goals_against - old_away_score, 0),
                won = CASE WHEN old_home_score > old_away_score THEN GREATEST(won - 1, 0) ELSE won END,
                drawn = CASE WHEN old_home_score = old_away_score THEN GREATEST(drawn - 1, 0) ELSE drawn END,
                lost = CASE WHEN old_home_score < old_away_score THEN GREATEST(lost - 1, 0) ELSE lost END,
                points = GREATEST(
                    CASE 
                        WHEN old_home_score > old_away_score THEN points - 3
                        WHEN old_home_score = old_away_score THEN points - 1
                        ELSE points
                    END, 0)
            WHERE id = NEW.home_team_id;
            
            -- Reverse old stats for away team
            UPDATE teams SET
                played = GREATEST(played - 1, 0),
                goals_for = GREATEST(goals_for - old_away_score, 0),
                goals_against = GREATEST(goals_against - old_home_score, 0),
                won = CASE WHEN old_away_score > old_home_score THEN GREATEST(won - 1, 0) ELSE won END,
                drawn = CASE WHEN old_away_score = old_home_score THEN GREATEST(drawn - 1, 0) ELSE drawn END,
                lost = CASE WHEN old_away_score < old_home_score THEN GREATEST(lost - 1, 0) ELSE lost END,
                points = GREATEST(
                    CASE 
                        WHEN old_away_score > old_home_score THEN points - 3
                        WHEN old_away_score = old_home_score THEN points - 1
                        ELSE points
                    END, 0)
            WHERE id = NEW.away_team_id;
        END IF;
        
        -- Apply new stats for home team
        UPDATE teams SET
            played = played + 1,
            goals_for = goals_for + NEW.home_score,
            goals_against = goals_against + NEW.away_score,
            won = CASE WHEN NEW.home_score > NEW.away_score THEN won + 1 ELSE won END,
            drawn = CASE WHEN NEW.home_score = NEW.away_score THEN drawn + 1 ELSE drawn END,
            lost = CASE WHEN NEW.home_score < NEW.away_score THEN lost + 1 ELSE lost END,
            points = points + 
                CASE 
                    WHEN NEW.home_score > NEW.away_score THEN 3
                    WHEN NEW.home_score = NEW.away_score THEN 1
                    ELSE 0
                END
        WHERE id = NEW.home_team_id;
        
        -- Apply new stats for away team
        UPDATE teams SET
            played = played + 1,
            goals_for = goals_for + NEW.away_score,
            goals_against = goals_against + NEW.home_score,
            won = CASE WHEN NEW.away_score > NEW.home_score THEN won + 1 ELSE won END,
            drawn = CASE WHEN NEW.away_score = NEW.home_score THEN drawn + 1 ELSE drawn END,
            lost = CASE WHEN NEW.away_score < NEW.home_score THEN lost + 1 ELSE lost END,
            points = points + 
                CASE 
                    WHEN NEW.away_score > NEW.home_score THEN 3
                    WHEN NEW.away_score = NEW.home_score THEN 1
                    ELSE 0
                END
        WHERE id = NEW.away_team_id;
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed' THEN
        -- Match was completed but now is not - reverse the stats
        UPDATE teams SET
            played = GREATEST(played - 1, 0),
            goals_for = GREATEST(goals_for - OLD.home_score, 0),
            goals_against = GREATEST(goals_against - OLD.away_score, 0),
            won = CASE WHEN OLD.home_score > OLD.away_score THEN GREATEST(won - 1, 0) ELSE won END,
            drawn = CASE WHEN OLD.home_score = OLD.away_score THEN GREATEST(drawn - 1, 0) ELSE drawn END,
            lost = CASE WHEN OLD.home_score < OLD.away_score THEN GREATEST(lost - 1, 0) ELSE lost END,
            points = GREATEST(
                CASE 
                    WHEN OLD.home_score > OLD.away_score THEN points - 3
                    WHEN OLD.home_score = OLD.away_score THEN points - 1
                    ELSE points
                END, 0)
        WHERE id = OLD.home_team_id;
        
        UPDATE teams SET
            played = GREATEST(played - 1, 0),
            goals_for = GREATEST(goals_for - OLD.away_score, 0),
            goals_against = GREATEST(goals_against - OLD.home_score, 0),
            won = CASE WHEN OLD.away_score > OLD.home_score THEN GREATEST(won - 1, 0) ELSE won END,
            drawn = CASE WHEN OLD.away_score = OLD.home_score THEN GREATEST(drawn - 1, 0) ELSE drawn END,
            lost = CASE WHEN OLD.away_score < OLD.home_score THEN GREATEST(lost - 1, 0) ELSE lost END,
            points = GREATEST(
                CASE 
                    WHEN OLD.away_score > OLD.home_score THEN points - 3
                    WHEN OLD.away_score = OLD.home_score THEN points - 1
                    ELSE points
                END, 0)
        WHERE id = OLD.away_team_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE THE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS auto_update_team_stats ON matches;

CREATE TRIGGER auto_update_team_stats
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_team_stats_on_match_complete();

-- ============================================
-- NOTES
-- ============================================

/*
⚠️  IMPORTANT: Your Match Recorder ALREADY updates stats!

This trigger is OPTIONAL and provides database-level automation.

PROS of using triggers:
✅ Stats update even if someone edits database directly
✅ Ensures data consistency at database level
✅ Works with any client (not just React admin)

CONS of using triggers:
❌ Duplicates logic (both React and database do it)
❌ Could cause issues if both run at same time
❌ Harder to debug

RECOMMENDATION:
- If your Match Recorder works fine, DON'T add this trigger
- Only add if you need database-level enforcement
- If you add it, REMOVE the updateTeamStats() calls from React code

TO REMOVE THIS TRIGGER:
DROP TRIGGER IF EXISTS auto_update_team_stats ON matches;
DROP FUNCTION IF EXISTS update_team_stats_on_match_complete();
*/

