-- Drop existing tables if they exist
drop table if exists public.goals cascade;
drop table if exists public.matches cascade;
drop table if exists public.players cascade;
drop table if exists public.teams cascade;
drop table if exists public.admin_users cascade;

-- Create Teams Table
create table public.teams (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    crest_url text,
    captain text,
    played integer default 0,
    won integer default 0,
    drawn integer default 0,
    lost integer default 0,
    goals_for integer default 0,
    goals_against integer default 0,
    points integer default 0,
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
    venue text,
    status text default 'scheduled', -- 'scheduled', 'live', 'completed'
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

-- Create Admin Users Table
create table public.admin_users (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    role text default 'editor', -- 'admin' or 'editor'
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

-- Function to update team stats after a match
create or replace function update_team_stats()
returns trigger as $$
begin
    -- Update home team stats
    update public.teams
    set 
        played = played + 1,
        won = won + (case when NEW.home_score > NEW.away_score then 1 else 0 end),
        drawn = drawn + (case when NEW.home_score = NEW.away_score then 1 else 0 end),
        lost = lost + (case when NEW.home_score < NEW.away_score then 1 else 0 end),
        goals_for = goals_for + NEW.home_score,
        goals_against = goals_against + NEW.away_score,
        points = calculate_team_points(
            won + (case when NEW.home_score > NEW.away_score then 1 else 0 end),
            drawn + (case when NEW.home_score = NEW.away_score then 1 else 0 end)
        ),
        updated_at = now()
    where id = NEW.home_team_id;

    -- Update away team stats
    update public.teams
    set 
        played = played + 1,
        won = won + (case when NEW.away_score > NEW.home_score then 1 else 0 end),
        drawn = drawn + (case when NEW.home_score = NEW.away_score then 1 else 0 end),
        lost = lost + (case when NEW.away_score < NEW.home_score then 1 else 0 end),
        goals_for = goals_for + NEW.away_score,
        goals_against = goals_against + NEW.home_score,
        points = calculate_team_points(
            won + (case when NEW.away_score > NEW.home_score then 1 else 0 end),
            drawn + (case when NEW.home_score = NEW.away_score then 1 else 0 end)
        ),
        updated_at = now()
    where id = NEW.away_team_id;

    return NEW;
end;
$$ language plpgsql;

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
    order by goals_count desc
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

create policy "Teams are insertable by admins"
    on public.teams for insert
    with check (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Teams are updatable by admins"
    on public.teams for update
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Teams are deletable by admins"
    on public.teams for delete
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

-- Matches Policies
create policy "Matches are viewable by everyone"
    on public.matches for select
    using (true);

create policy "Matches are insertable by admins"
    on public.matches for insert
    with check (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Matches are updatable by admins"
    on public.matches for update
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Matches are deletable by admins"
    on public.matches for delete
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

-- Goals Policies
create policy "Goals are viewable by everyone"
    on public.goals for select
    using (true);

create policy "Goals are insertable by admins"
    on public.goals for insert
    with check (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Goals are updatable by admins"
    on public.goals for update
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Goals are deletable by admins"
    on public.goals for delete
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

-- Players Policies
create policy "Players are viewable by everyone"
    on public.players for select
    using (true);

create policy "Players are insertable by admins"
    on public.players for insert
    with check (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Players are updatable by admins"
    on public.players for update
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

create policy "Players are deletable by admins"
    on public.players for delete
    using (auth.role() = 'authenticated' and exists (
        select 1 from public.admin_users where email = auth.email()
    ));

-- Create trigger for match stats
create trigger update_team_stats_after_match
    after update of status
    on public.matches
    for each row
    when (OLD.status != 'completed' and NEW.status = 'completed')
    execute function update_team_stats(); 