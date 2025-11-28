-- Fix RLS Policies for Admin Access
-- This allows super admins to view ALL registrations and data

-- First, let's check if we need to create a function to check admin status
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user's email is a super admin
  RETURN (
    SELECT email FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('admin@sio-abulfazal.org')
  ) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy for team_registrations to allow admins to see all
DROP POLICY IF EXISTS "Admins can view all registrations" ON team_registrations;

CREATE POLICY "Admins can view all registrations"
ON team_registrations
FOR SELECT
USING (
  auth.uid() = user_id  -- Users can see their own
  OR is_super_admin()   -- Super admins can see all
);

-- Allow admins to view all team players
DROP POLICY IF EXISTS "Admins can view all players" ON team_players;

CREATE POLICY "Admins can view all players"
ON team_players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_registrations 
    WHERE team_registrations.id = team_players.team_id 
    AND team_registrations.user_id = auth.uid()
  )
  OR is_super_admin()
);

-- Allow admins to view all teams
DROP POLICY IF EXISTS "Anyone can view teams" ON teams;

CREATE POLICY "Anyone can view teams"
ON teams
FOR SELECT
USING (true);  -- All teams are public for viewing standings

-- Allow admins to view all matches
DROP POLICY IF EXISTS "Anyone can view matches" ON matches;

CREATE POLICY "Anyone can view matches"
ON matches
FOR SELECT
USING (true);  -- All matches are public

-- Allow admins to view all goals
DROP POLICY IF EXISTS "Anyone can view goals" ON goals;

CREATE POLICY "Anyone can view goals"
ON goals
FOR SELECT
USING (true);  -- All goals are public

-- Grant admins ability to update team_registrations status
DROP POLICY IF EXISTS "Admins can update all registrations" ON team_registrations;

CREATE POLICY "Admins can update all registrations"
ON team_registrations
FOR UPDATE
USING (
  auth.uid() = user_id
  OR is_super_admin()
)
WITH CHECK (
  auth.uid() = user_id
  OR is_super_admin()
);

-- Grant admins ability to delete registrations
DROP POLICY IF EXISTS "Admins can delete registrations" ON team_registrations;

CREATE POLICY "Admins can delete registrations"
ON team_registrations
FOR DELETE
USING (is_super_admin());

-- Grant admins ability to insert/update/delete teams
DROP POLICY IF EXISTS "Admins can manage teams" ON teams;

CREATE POLICY "Admins can manage teams"
ON teams
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Grant admins ability to manage matches
DROP POLICY IF EXISTS "Admins can manage matches" ON matches;

CREATE POLICY "Admins can manage matches"
ON matches
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Grant admins ability to manage goals
DROP POLICY IF EXISTS "Admins can manage goals" ON goals;

CREATE POLICY "Admins can manage goals"
ON goals
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Grant admins ability to manage team_players
DROP POLICY IF EXISTS "Admins can manage players" ON team_players;

CREATE POLICY "Admins can manage players"
ON team_players
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM team_registrations 
    WHERE team_registrations.id = team_players.team_id 
    AND team_registrations.user_id = auth.uid()
  )
  OR is_super_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_registrations 
    WHERE team_registrations.id = team_players.team_id 
    AND team_registrations.user_id = auth.uid()
  )
  OR is_super_admin()
);

-- Show confirmation
SELECT 'Admin RLS policies updated successfully!' as message;

-- Test the admin function
SELECT 
  'Current user is admin: ' || is_super_admin()::text as admin_check,
  'Current user email: ' || (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email;

