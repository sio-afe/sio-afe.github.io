-- SAFE Tournament Schema (won't drop existing tables)
-- Use CREATE TABLE IF NOT EXISTS instead of DROP + CREATE

-- Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    crest_url text,
    captain text,
    formation text, -- e.g., '1-3-2-1', '1-4-2-1'
    played integer default 0 not null,
    won integer default 0 not null,
    drawn integer default 0 not null,
    lost integer default 0 not null,
    goals_for integer default 0 not null,
    goals_against integer default 0 not null,
    points integer default 0 not null,
    group_name text,
    category text not null, -- 'open-age' or 'u17'
    registration_id uuid, -- Link back to team_registrations
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Add unique constraint for team name within category
    unique(name, category)
);

-- Create Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
    id uuid default gen_random_uuid() primary key,
    home_team_id uuid references public.teams(id),
    away_team_id uuid references public.teams(id),
    home_score integer default 0,
    away_score integer default 0,
    match_date timestamp with time zone,
    scheduled_time time,
    match_number integer,
    venue text,
    status text default 'scheduled', -- 'scheduled', 'in_progress', 'completed'
    category text not null, -- 'open-age' or 'u17'
    match_type text not null, -- 'group', 'quarter-final', 'semi-final', 'final'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id uuid default gen_random_uuid() primary key,
    match_id uuid references public.matches(id),
    team_id uuid references public.teams(id),
    scorer_name text not null,
    assist_name text,
    minute integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Players Table (Enhanced for match lineups)
CREATE TABLE IF NOT EXISTS public.players (
    id uuid default gen_random_uuid() primary key,
    team_id uuid references public.teams(id),
    name text not null,
    number integer,
    position text, -- 'GK', 'CB', 'LB', 'RB', 'CM', 'LM', 'RM', 'ST', 'SUB'
    is_substitute boolean default false,
    player_image text, -- Photo URL from registration
    position_x float, -- X coordinate on field (0-100)
    position_y float, -- Y coordinate on field (0-100)
    registration_player_id uuid, -- Link to team_players table
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Functions for Stats

-- Function to calculate points for a team
CREATE OR REPLACE FUNCTION calculate_team_points(wins integer, draws integer)
RETURNS integer AS $$
BEGIN
    RETURN (wins * 3) + draws;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate goal difference
CREATE OR REPLACE FUNCTION calculate_goal_difference(goals_for integer, goals_against integer)
RETURNS integer AS $$
BEGIN
    RETURN goals_for - goals_against;
END;
$$ LANGUAGE plpgsql;

-- Function to update team stats
CREATE OR REPLACE FUNCTION update_match_team_stats()
RETURNS trigger AS $$
BEGIN
    -- Only proceed if the match is being marked as completed
    IF (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
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

-- Create trigger for updating team stats
DROP TRIGGER IF EXISTS update_match_team_stats_trigger ON public.matches;
CREATE TRIGGER update_match_team_stats_trigger
    AFTER UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION update_match_team_stats();

-- Create indexes for team stats
CREATE INDEX IF NOT EXISTS idx_teams_category_points ON public.teams(category, points DESC);
CREATE INDEX IF NOT EXISTS idx_teams_group_points ON public.teams(group_name, points DESC);

-- Function to get top scorers
CREATE OR REPLACE FUNCTION get_top_scorers(category_param text)
RETURNS TABLE (
    scorer_name text,
    team_name text,
    goals_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.scorer_name,
        t.name AS team_name,
        count(*) AS goals_count
    FROM public.goals g
    JOIN public.matches m ON g.match_id = m.id
    JOIN public.teams t ON g.team_id = t.id
    WHERE m.category = category_param
    GROUP BY g.scorer_name, t.name
    ORDER BY goals_count DESC, g.scorer_name ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to get top assists
CREATE OR REPLACE FUNCTION get_top_assists(category_param text)
RETURNS TABLE (
    assist_name text,
    team_name text,
    assists_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.assist_name,
        t.name AS team_name,
        count(*) AS assists_count
    FROM public.goals g
    JOIN public.matches m ON g.match_id = m.id
    JOIN public.teams t ON g.team_id = t.id
    WHERE m.category = category_param
    AND g.assist_name IS NOT NULL
    GROUP BY g.assist_name, t.name
    ORDER BY assists_count DESC, g.assist_name ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Teams Policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;
CREATE POLICY "Teams are viewable by everyone"
    ON public.teams FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Teams are insertable by authenticated users" ON public.teams;
CREATE POLICY "Teams are insertable by authenticated users"
    ON public.teams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teams are updatable by authenticated users" ON public.teams;
CREATE POLICY "Teams are updatable by authenticated users"
    ON public.teams FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teams are deletable by authenticated users" ON public.teams;
CREATE POLICY "Teams are deletable by authenticated users"
    ON public.teams FOR DELETE
    USING (auth.role() = 'authenticated');

-- Matches Policies
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON public.matches;
CREATE POLICY "Matches are viewable by everyone"
    ON public.matches FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Matches are insertable by authenticated users" ON public.matches;
CREATE POLICY "Matches are insertable by authenticated users"
    ON public.matches FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Matches are updatable by authenticated users" ON public.matches;
CREATE POLICY "Matches are updatable by authenticated users"
    ON public.matches FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Matches are deletable by authenticated users" ON public.matches;
CREATE POLICY "Matches are deletable by authenticated users"
    ON public.matches FOR DELETE
    USING (auth.role() = 'authenticated');

-- Goals Policies
DROP POLICY IF EXISTS "Goals are viewable by everyone" ON public.goals;
CREATE POLICY "Goals are viewable by everyone"
    ON public.goals FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Goals are insertable by authenticated users" ON public.goals;
CREATE POLICY "Goals are insertable by authenticated users"
    ON public.goals FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Goals are updatable by authenticated users" ON public.goals;
CREATE POLICY "Goals are updatable by authenticated users"
    ON public.goals FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Goals are deletable by authenticated users" ON public.goals;
CREATE POLICY "Goals are deletable by authenticated users"
    ON public.goals FOR DELETE
    USING (auth.role() = 'authenticated');

-- Players Policies
DROP POLICY IF EXISTS "Players are viewable by everyone" ON public.players;
CREATE POLICY "Players are viewable by everyone"
    ON public.players FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Players are insertable by authenticated users" ON public.players;
CREATE POLICY "Players are insertable by authenticated users"
    ON public.players FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Players are updatable by authenticated users" ON public.players;
CREATE POLICY "Players are updatable by authenticated users"
    ON public.players FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Players are deletable by authenticated users" ON public.players;
CREATE POLICY "Players are deletable by authenticated users"
    ON public.players FOR DELETE
    USING (auth.role() = 'authenticated');

-- Function to update team progression
CREATE OR REPLACE FUNCTION update_team_progression()
RETURNS trigger AS $$
DECLARE
    category_val text;
    match_type_val text;
    all_completed boolean;
BEGIN
    -- Get match details
    SELECT category, match_type INTO category_val, match_type_val
    FROM public.matches
    WHERE id = NEW.id;

    -- Check if all matches of current type are completed
    SELECT bool_and(status = 'completed') INTO all_completed
    FROM public.matches
    WHERE category = category_val AND match_type = match_type_val;

    -- If all matches of current type are completed, create next round matches
    IF all_completed THEN
        CASE match_type_val
            WHEN 'group' THEN
                -- Create quarter-final matches
                -- This will be handled by the application logic
                -- as it requires complex team selection based on group standings
                NULL;
            WHEN 'quarter-final' THEN
                -- Create semi-final matches
                -- This will be handled by the application logic
                -- as it requires determining winners and creating proper matchups
                NULL;
            WHEN 'semi-final' THEN
                -- Create final match
                -- This will be handled by the application logic
                -- as it requires determining winners and creating the final
                NULL;
            ELSE
                NULL;
        END CASE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team progression
DROP TRIGGER IF EXISTS update_team_progression_after_match ON public.matches;
CREATE TRIGGER update_team_progression_after_match
    AFTER UPDATE OF status
    ON public.matches
    FOR EACH ROW
    WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
    EXECUTE FUNCTION update_team_progression();

-- Create indexes for faster match queries
CREATE INDEX IF NOT EXISTS idx_matches_category_type_status ON public.matches(category, match_type, status);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_time ON public.matches(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_matches_match_number ON public.matches(match_number);

-- Function to reset and recalculate team stats
CREATE OR REPLACE FUNCTION reset_and_recalculate_team_stats()
RETURNS void AS $$
BEGIN
    -- First reset all team stats to 0
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

    -- Then recalculate based on completed matches
    WITH match_stats AS (
        SELECT 
            team_id,
            count(*) AS played,
            sum(CASE WHEN is_winner THEN 1 ELSE 0 END) AS won,
            sum(CASE WHEN is_draw THEN 1 ELSE 0 END) AS drawn,
            sum(CASE WHEN NOT is_winner AND NOT is_draw THEN 1 ELSE 0 END) AS lost,
            sum(goals_scored) AS goals_for,
            sum(goals_against) AS goals_against
        FROM (
            -- Home team stats
            SELECT 
                home_team_id AS team_id,
                home_score > away_score AS is_winner,
                home_score = away_score AS is_draw,
                home_score AS goals_scored,
                away_score AS goals_against
            FROM public.matches
            WHERE status = 'completed'
            UNION ALL
            -- Away team stats
            SELECT 
                away_team_id AS team_id,
                away_score > home_score AS is_winner,
                away_score = home_score AS is_draw,
                away_score AS goals_scored,
                home_score AS goals_against
            FROM public.matches
            WHERE status = 'completed'
        ) team_matches
        GROUP BY team_id
    )
    UPDATE public.teams t
    SET 
        played = ms.played,
        won = ms.won,
        drawn = ms.drawn,
        lost = ms.lost,
        goals_for = ms.goals_for,
        goals_against = ms.goals_against,
        points = (ms.won * 3) + ms.drawn,
        updated_at = now()
    FROM match_stats ms
    WHERE t.id = ms.team_id;
END;
$$ LANGUAGE plpgsql;

-- Verification query
DO $$
BEGIN
    RAISE NOTICE '=== Tournament Schema Setup Complete ===';
    RAISE NOTICE 'Tables created: teams, matches, goals, players';
    RAISE NOTICE 'Functions created: calculate_team_points, calculate_goal_difference, get_top_scorers, get_top_assists';
    RAISE NOTICE 'Triggers created: update_match_team_stats_trigger, update_team_progression_after_match';
    RAISE NOTICE 'Ready to use!';
END $$;

