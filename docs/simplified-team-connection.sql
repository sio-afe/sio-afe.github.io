-- Simplified Team Connection - Best of Both Worlds
-- This makes the link between registration and tournament seamless

-- ============================================
-- ENHANCED VIEW: Combine Registration + Tournament Data
-- ============================================

-- View that shows complete team information
CREATE OR REPLACE VIEW team_complete_info AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.crest_url,
  t.captain,
  t.formation,
  t.category,
  t.group_name,
  t.played,
  t.won,
  t.drawn,
  t.lost,
  t.goals_for,
  t.goals_against,
  t.points,
  (t.goals_for - t.goals_against) as goal_difference,
  -- Link to registration
  tr.id as registration_id,
  tr.captain_email,
  tr.captain_phone,
  tr.status as registration_status,
  tr.submitted_at,
  tr.confirmed_at,
  -- Player count
  (SELECT COUNT(*) FROM players WHERE team_id = t.id) as player_count
FROM teams t
LEFT JOIN team_registrations tr ON t.registration_id = tr.id;

-- ============================================
-- SIMPLIFIED QUERIES
-- ============================================

-- Get standings (simple!)
CREATE OR REPLACE VIEW standings AS
SELECT 
  team_id,
  team_name,
  crest_url,
  formation,
  category,
  group_name,
  played,
  won,
  drawn,
  lost,
  goals_for,
  goals_against,
  goal_difference,
  points
FROM team_complete_info
ORDER BY category, points DESC, goal_difference DESC, goals_for DESC;

-- Get team with contact info (for admin)
CREATE OR REPLACE VIEW teams_with_contacts AS
SELECT 
  team_id,
  team_name,
  captain,
  captain_email,
  captain_phone,
  category,
  points,
  registration_status
FROM team_complete_info;

-- ============================================
-- AUTOMATIC SYNC FUNCTION
-- ============================================

-- Function to sync registration changes to tournament team
CREATE OR REPLACE FUNCTION sync_registration_to_tournament()
RETURNS TRIGGER AS $$
BEGIN
  -- If team logo or formation changes in registration
  -- Update it in tournament team too
  IF NEW.tournament_team_id IS NOT NULL THEN
    UPDATE teams
    SET 
      crest_url = NEW.team_logo,
      formation = NEW.formation,
      updated_at = NOW()
    WHERE id = NEW.tournament_team_id
      AND (crest_url != NEW.team_logo OR formation != NEW.formation);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-sync changes
DROP TRIGGER IF EXISTS sync_registration_changes ON team_registrations;
CREATE TRIGGER sync_registration_changes
  AFTER UPDATE ON team_registrations
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION sync_registration_to_tournament();

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Frontend: Get standings (super simple)
-- SELECT * FROM standings WHERE category = 'open-age';

-- Frontend: Get team with contact info
-- SELECT * FROM teams_with_contacts WHERE team_id = 'uuid';

-- Frontend: Get complete team info
-- SELECT * FROM team_complete_info WHERE team_id = 'uuid';

-- ============================================
-- BENEFITS
-- ============================================

/*
✅ Separate tables (clean architecture)
✅ Simple queries (use views)
✅ Automatic sync (triggers handle it)
✅ No duplicate data
✅ Fast standings queries
✅ Contact info available when needed
✅ Registration data preserved
✅ Tournament data isolated

BEST OF BOTH WORLDS!
*/

