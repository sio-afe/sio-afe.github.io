-- Drop existing tables if they exist
drop table if exists public.goals cascade;
drop table if exists public.matches cascade;
drop table if exists public.players cascade;
drop table if exists public.teams cascade;

-- Create Teams Table
create table public.teams (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    crest_url text,
    captain text,
    played integer default 0 not null,
    won integer default 0 not null,
    drawn integer default 0 not null,
    lost integer default 0 not null,
    goals_for integer default 0 not null,
    goals_against integer default 0 not null,
    points integer default 0 not null,
    group_name text,
    category text not null, -- 'open-age' or 'u17'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Add unique constraint for team name within category
    unique(name, category)
);

-- Create Matches Table
create table public.matches (
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
create table public.goals (
    id uuid default gen_random_uuid() primary key,
    match_id uuid references public.matches(id),
    team_id uuid references public.teams(id),
    scorer_name text not null,
    assist_name text,
    minute integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Players Table
create table public.players (
    id uuid default gen_random_uuid() primary key,
    team_id uuid references public.teams(id),
    name text not null,
    number integer,
    position text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Functions for Stats

-- Function to calculate points for a team
create or replace function calculate_team_points(wins integer, draws integer)
returns integer as $$
begin
    return (wins * 3) + draws;
end;
$$ language plpgsql;

-- Function to calculate goal difference
create or replace function calculate_goal_difference(goals_for integer, goals_against integer)
returns integer as $$
begin
    return goals_for - goals_against;
end;
$$ language plpgsql;

-- Function to update team stats
create or replace function update_match_team_stats()
returns trigger as $$
begin
    -- Only proceed if the match is being marked as completed
    if (TG_OP = 'UPDATE' and NEW.status = 'completed' and OLD.status != 'completed') then
        -- Update home team stats
        update public.teams
        set 
            played = played + 1,
            won = won + case when NEW.home_score > NEW.away_score then 1 else 0 end,
            drawn = drawn + case when NEW.home_score = NEW.away_score then 1 else 0 end,
            lost = lost + case when NEW.home_score < NEW.away_score then 1 else 0 end,
            goals_for = goals_for + NEW.home_score,
            goals_against = goals_against + NEW.away_score,
            points = points + case 
                when NEW.home_score > NEW.away_score then 3
                when NEW.home_score = NEW.away_score then 1
                else 0
            end,
            updated_at = now()
        where id = NEW.home_team_id;

        -- Update away team stats
        update public.teams
        set 
            played = played + 1,
            won = won + case when NEW.away_score > NEW.home_score then 1 else 0 end,
            drawn = drawn + case when NEW.home_score = NEW.away_score then 1 else 0 end,
            lost = lost + case when NEW.away_score < NEW.home_score then 1 else 0 end,
            goals_for = goals_for + NEW.away_score,
            goals_against = goals_against + NEW.home_score,
            points = points + case 
                when NEW.away_score > NEW.home_score then 3
                when NEW.home_score = NEW.away_score then 1
                else 0
            end,
            updated_at = now()
        where id = NEW.away_team_id;
    end if;

    return NEW;
end;
$$ language plpgsql;

-- Create trigger for updating team stats
drop trigger if exists update_match_team_stats_trigger on public.matches;
create trigger update_match_team_stats_trigger
    after update on public.matches
    for each row
    execute function update_match_team_stats();

-- Create index for team stats
create index idx_teams_category_points on public.teams(category, points desc);
create index idx_teams_group_points on public.teams(group_name, points desc);

-- Function to get top scorers
create or replace function get_top_scorers(category_param text)
returns table (
    scorer_name text,
    team_name text,
    goals_count bigint
) as $$
begin
    return query
    select 
        g.scorer_name,
        t.name as team_name,
        count(*) as goals_count
    from public.goals g
    join public.matches m on g.match_id = m.id
    join public.teams t on g.team_id = t.id
    where m.category = category_param
    group by g.scorer_name, t.name
    order by goals_count desc, g.scorer_name asc
    limit 10;
end;
$$ language plpgsql;

-- Function to get top assists
create or replace function get_top_assists(category_param text)
returns table (
    assist_name text,
    team_name text,
    assists_count bigint
) as $$
begin
    return query
    select 
        g.assist_name,
        t.name as team_name,
        count(*) as assists_count
    from public.goals g
    join public.matches m on g.match_id = m.id
    join public.teams t on g.team_id = t.id
    where m.category = category_param
    and g.assist_name is not null
    group by g.assist_name, t.name
    order by assists_count desc, g.assist_name asc
    limit 10;
end;
$$ language plpgsql;

-- Enable Row Level Security
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.goals enable row level security;
alter table public.players enable row level security;

-- Row Level Security Policies

-- Teams Policies
create policy "Teams are viewable by everyone"
    on public.teams for select
    using (true);

create policy "Teams are insertable by authenticated users"
    on public.teams for insert
    with check (auth.role() = 'authenticated');

create policy "Teams are updatable by authenticated users"
    on public.teams for update
    using (auth.role() = 'authenticated');

create policy "Teams are deletable by authenticated users"
    on public.teams for delete
    using (auth.role() = 'authenticated');

-- Matches Policies
create policy "Matches are viewable by everyone"
    on public.matches for select
    using (true);

create policy "Matches are insertable by authenticated users"
    on public.matches for insert
    with check (auth.role() = 'authenticated');

create policy "Matches are updatable by authenticated users"
    on public.matches for update
    using (auth.role() = 'authenticated');

create policy "Matches are deletable by authenticated users"
    on public.matches for delete
    using (auth.role() = 'authenticated');

-- Goals Policies
create policy "Goals are viewable by everyone"
    on public.goals for select
    using (true);

create policy "Goals are insertable by authenticated users"
    on public.goals for insert
    with check (auth.role() = 'authenticated');

create policy "Goals are updatable by authenticated users"
    on public.goals for update
    using (auth.role() = 'authenticated');

create policy "Goals are deletable by authenticated users"
    on public.goals for delete
    using (auth.role() = 'authenticated');

-- Players Policies
create policy "Players are viewable by everyone"
    on public.players for select
    using (true);

create policy "Players are insertable by authenticated users"
    on public.players for insert
    with check (auth.role() = 'authenticated');

create policy "Players are updatable by authenticated users"
    on public.players for update
    using (auth.role() = 'authenticated');

create policy "Players are deletable by authenticated users"
    on public.players for delete
    using (auth.role() = 'authenticated');

-- Function to update team progression
create or replace function update_team_progression()
returns trigger as $$
declare
    category_val text;
    match_type_val text;
    all_completed boolean;
begin
    -- Get match details
    select category, match_type into category_val, match_type_val
    from public.matches
    where id = NEW.id;

    -- Check if all matches of current type are completed
    select bool_and(status = 'completed') into all_completed
    from public.matches
    where category = category_val and match_type = match_type_val;

    -- If all matches of current type are completed, create next round matches
    if all_completed then
        case match_type_val
            when 'group' then
                -- Create quarter-final matches
                -- This will be handled by the application logic
                -- as it requires complex team selection based on group standings
                null;
            when 'quarter-final' then
                -- Create semi-final matches
                -- This will be handled by the application logic
                -- as it requires determining winners and creating proper matchups
                null;
            when 'semi-final' then
                -- Create final match
                -- This will be handled by the application logic
                -- as it requires determining winners and creating the final
                null;
            else
                null;
        end case;
    end if;

    return NEW;
end;
$$ language plpgsql;

-- Create trigger for team progression
create trigger update_team_progression_after_match
    after update of status
    on public.matches
    for each row
    when (OLD.status != 'completed' and NEW.status = 'completed')
    execute function update_team_progression();

-- Create index for faster match queries
create index idx_matches_category_type_status on public.matches(category, match_type, status);
create index idx_matches_scheduled_time on public.matches(scheduled_time);
create index idx_matches_match_number on public.matches(match_number);

-- Function to reset and recalculate team stats
create or replace function reset_and_recalculate_team_stats()
returns void as $$
begin
    -- First reset all team stats to 0
    update public.teams
    set 
        played = 0,
        won = 0,
        drawn = 0,
        lost = 0,
        goals_for = 0,
        goals_against = 0,
        points = 0,
        updated_at = now();

    -- Then recalculate based on completed matches
    with match_stats as (
        select 
            team_id,
            count(*) as played,
            sum(case when is_winner then 1 else 0 end) as won,
            sum(case when is_draw then 1 else 0 end) as drawn,
            sum(case when not is_winner and not is_draw then 1 else 0 end) as lost,
            sum(goals_scored) as goals_for,
            sum(goals_against) as goals_against
        from (
            -- Home team stats
            select 
                home_team_id as team_id,
                home_score > away_score as is_winner,
                home_score = away_score as is_draw,
                home_score as goals_scored,
                away_score as goals_against
            from public.matches
            where status = 'completed'
            union all
            -- Away team stats
            select 
                away_team_id as team_id,
                away_score > home_score as is_winner,
                away_score = home_score as is_draw,
                away_score as goals_scored,
                home_score as goals_against
            from public.matches
            where status = 'completed'
        ) team_matches
        group by team_id
    )
    update public.teams t
    set 
        played = ms.played,
        won = ms.won,
        drawn = ms.drawn,
        lost = ms.lost,
        goals_for = ms.goals_for,
        goals_against = ms.goals_against,
        points = (ms.won * 3) + ms.drawn,
        updated_at = now()
    from match_stats ms
    where t.id = ms.team_id;
end;
$$ language plpgsql; 