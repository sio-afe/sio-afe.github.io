-- Fix: Only update standings for GROUP STAGE matches
-- Knockout matches (quarter-final, semi-final, final, third-place) should NOT affect standings

-- Drop the old trigger first
DROP TRIGGER IF EXISTS update_match_team_stats_trigger ON public.matches;

-- Create the updated function that checks for group stage
CREATE OR REPLACE FUNCTION update_match_team_stats()
RETURNS trigger AS $$
BEGIN
    -- Only proceed if:
    -- 1. Match is being marked as completed
    -- 2. Match is a GROUP STAGE match (not knockout)
    IF (TG_OP = 'UPDATE' 
        AND NEW.status = 'completed' 
        AND OLD.status != 'completed'
        AND NEW.match_type = 'group') THEN
        
        -- Update home team stats
        UPDATE public.teams
        SET 
            played = played + 1,
            won = won + CASE WHEN NEW.home_score > NEW.away_score THEN 1 ELSE 0 END,
            drawn = drawn + CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
            lost = lost + CASE WHEN NEW.home_score < NEW.away_score THEN 1 ELSE 0 END,
            goals_for = goals_for + NEW.home_score,
            goals_against = goals_against + NEW.away_score,
            points = points + CASE 
                WHEN NEW.home_score > NEW.away_score THEN 3
                WHEN NEW.home_score = NEW.away_score THEN 1
                ELSE 0
            END,
            updated_at = now()
        WHERE id = NEW.home_team_id;

        -- Update away team stats
        UPDATE public.teams
        SET 
            played = played + 1,
            won = won + CASE WHEN NEW.away_score > NEW.home_score THEN 1 ELSE 0 END,
            drawn = drawn + CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
            lost = lost + CASE WHEN NEW.away_score < NEW.home_score THEN 1 ELSE 0 END,
            goals_for = goals_for + NEW.away_score,
            goals_against = goals_against + NEW.home_score,
            points = points + CASE 
                WHEN NEW.away_score > NEW.home_score THEN 3
                WHEN NEW.home_score = NEW.away_score THEN 1
                ELSE 0
            END,
            updated_at = now()
        WHERE id = NEW.away_team_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_match_team_stats_trigger
    AFTER UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION update_match_team_stats();

-- Verify the function was created
SELECT 'Trigger updated! Knockout matches will no longer affect standings.' AS status;

