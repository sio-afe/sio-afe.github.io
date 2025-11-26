-- Fix RLS policies for team_registrations table
-- This allows authenticated users to manage their own registrations

-- First, enable RLS if not already enabled
ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own registrations" ON team_registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON team_registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON team_registrations;
DROP POLICY IF EXISTS "Users can delete their own registrations" ON team_registrations;

-- Allow users to SELECT their own registrations
CREATE POLICY "Users can view their own registrations"
ON team_registrations
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to INSERT their own registrations
CREATE POLICY "Users can insert their own registrations"
ON team_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own registrations
CREATE POLICY "Users can update their own registrations"
ON team_registrations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own registrations (optional)
CREATE POLICY "Users can delete their own registrations"
ON team_registrations
FOR DELETE
USING (auth.uid() = user_id);


-- Also fix team_players table RLS
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their team players" ON team_players;
DROP POLICY IF EXISTS "Users can view their team players" ON team_players;
DROP POLICY IF EXISTS "Users can insert their team players" ON team_players;
DROP POLICY IF EXISTS "Users can update their team players" ON team_players;
DROP POLICY IF EXISTS "Users can delete their team players" ON team_players;

-- Allow users to manage players for their own teams
CREATE POLICY "Users can view their team players"
ON team_players
FOR SELECT
USING (
  team_id IN (SELECT id FROM team_registrations WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their team players"
ON team_players
FOR INSERT
WITH CHECK (
  team_id IN (SELECT id FROM team_registrations WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their team players"
ON team_players
FOR UPDATE
USING (
  team_id IN (SELECT id FROM team_registrations WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their team players"
ON team_players
FOR DELETE
USING (
  team_id IN (SELECT id FROM team_registrations WHERE user_id = auth.uid())
);

