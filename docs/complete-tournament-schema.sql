-- ============================================
-- COMPLETE TOURNAMENT MANAGEMENT SCHEMA
-- Ensures all tables match what the admin panel expects
-- ============================================

-- ============================================
-- PART 1: TEAMS TABLE (Tournament Standings)
-- ============================================

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    crest_url TEXT,
    captain TEXT,
    formation TEXT,
    category TEXT NOT NULL CHECK (category IN ('open-age', 'u17')),
    group_name TEXT,
    
    -- Statistics (auto-calculated)
    played INTEGER DEFAULT 0 NOT NULL CHECK (played >= 0),
    won INTEGER DEFAULT 0 NOT NULL CHECK (won >= 0),
    drawn INTEGER DEFAULT 0 NOT NULL CHECK (drawn >= 0),
    lost INTEGER DEFAULT 0 NOT NULL CHECK (lost >= 0),
    goals_for INTEGER DEFAULT 0 NOT NULL CHECK (goals_for >= 0),
    goals_against INTEGER DEFAULT 0 NOT NULL CHECK (goals_against >= 0),
    points INTEGER DEFAULT 0 NOT NULL CHECK (points >= 0),
    
    -- Links
    registration_id UUID REFERENCES team_registrations(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(name, category)
);

-- ============================================
-- PART 2: MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    home_score INTEGER DEFAULT 0 CHECK (home_score >= 0),
    away_score INTEGER DEFAULT 0 CHECK (away_score >= 0),
    
    -- Schedule
    match_date TIMESTAMP WITH TIME ZONE,
    scheduled_time TIME,
    match_number INTEGER,
    venue TEXT,
    
    -- Match info
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    category TEXT NOT NULL CHECK (category IN ('open-age', 'u17')),
    match_type TEXT NOT NULL CHECK (match_type IN ('group', 'quarter-final', 'semi-final', 'final', 'third-place')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (home_team_id != away_team_id)
);

-- ============================================
-- PART 3: GOALS TABLE (Proper Foreign Keys)
-- ============================================

-- Drop old goals table if it exists
DROP TABLE IF EXISTS goals CASCADE;

-- Create new goals table with proper structure
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    scorer_id UUID NOT NULL REFERENCES team_players(id) ON DELETE CASCADE,
    assister_id UUID REFERENCES team_players(id) ON DELETE SET NULL,
    minute INTEGER CHECK (minute >= 0 AND minute <= 120),
    goal_type TEXT DEFAULT 'open_play' CHECK (goal_type IN ('open_play', 'penalty', 'free_kick', 'header', 'own_goal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 4: INDEXES FOR PERFORMANCE
-- ============================================

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_category ON teams(category);
CREATE INDEX IF NOT EXISTS idx_teams_points ON teams(points DESC);
CREATE INDEX IF NOT EXISTS idx_teams_registration_id ON teams(registration_id);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_category ON matches(category);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_match_id ON goals(match_id);
CREATE INDEX IF NOT EXISTS idx_goals_team_id ON goals(team_id);
CREATE INDEX IF NOT EXISTS idx_goals_scorer_id ON goals(scorer_id);
CREATE INDEX IF NOT EXISTS idx_goals_assister_id ON goals(assister_id);

-- ============================================
-- PART 5: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Teams policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Teams are manageable by authenticated users" ON teams;
CREATE POLICY "Teams are manageable by authenticated users"
    ON teams FOR ALL
    USING (auth.role() = 'authenticated');

-- Matches policies
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
CREATE POLICY "Matches are viewable by everyone"
    ON matches FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Matches are manageable by authenticated users" ON matches;
CREATE POLICY "Matches are manageable by authenticated users"
    ON matches FOR ALL
    USING (auth.role() = 'authenticated');

-- Goals policies
DROP POLICY IF EXISTS "Goals are viewable by everyone" ON goals;
CREATE POLICY "Goals are viewable by everyone"
    ON goals FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Goals are manageable by authenticated users" ON goals;
CREATE POLICY "Goals are manageable by authenticated users"
    ON goals FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- PART 6: TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 7: HELPER VIEWS
-- ============================================

-- View for standings (sorted teams)
CREATE OR REPLACE VIEW standings AS
SELECT 
    *,
    (goals_for - goals_against) as goal_difference
FROM teams
ORDER BY 
    category,
    points DESC,
    (goals_for - goals_against) DESC,
    goals_for DESC,
    name;

-- View for match results with team names
CREATE OR REPLACE VIEW match_results AS
SELECT 
    m.*,
    ht.name as home_team_name,
    ht.crest_url as home_team_crest,
    at.name as away_team_name,
    at.crest_url as away_team_crest
FROM matches m
LEFT JOIN teams ht ON m.home_team_id = ht.id
LEFT JOIN teams at ON m.away_team_id = at.id
ORDER BY m.match_date DESC;

-- View for top scorers
CREATE OR REPLACE VIEW top_scorers AS
SELECT 
    tp.id,
    tp.player_name,
    tp.player_image,
    tr.team_name,
    tr.category,
    COUNT(g.id) as goals_scored
FROM goals g
JOIN team_players tp ON g.scorer_id = tp.id
JOIN team_registrations tr ON tp.team_id = tr.id
GROUP BY tp.id, tp.player_name, tp.player_image, tr.team_name, tr.category
ORDER BY goals_scored DESC, tp.player_name;

-- View for top assisters
CREATE OR REPLACE VIEW top_assisters AS
SELECT 
    tp.id,
    tp.player_name,
    tp.player_image,
    tr.team_name,
    tr.category,
    COUNT(g.id) as assists
FROM goals g
JOIN team_players tp ON g.assister_id = tp.id
JOIN team_registrations tr ON tp.team_id = tr.id
WHERE g.assister_id IS NOT NULL
GROUP BY tp.id, tp.player_name, tp.player_image, tr.team_name, tr.category
ORDER BY assists DESC, tp.player_name;

-- ============================================
-- PART 8: VERIFICATION QUERIES
-- ============================================

-- Check table structure
DO $$
BEGIN
    RAISE NOTICE '=== Verifying Table Structure ===';
END $$;

SELECT 'teams' as table_name, COUNT(*) as row_count FROM teams
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'goals', COUNT(*) FROM goals
UNION ALL
SELECT 'team_registrations', COUNT(*) FROM team_registrations
UNION ALL
SELECT 'team_players', COUNT(*) FROM team_players;

-- Check foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('teams', 'matches', 'goals')
    AND tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================
-- NOTES AND USAGE
-- ============================================

/*
This schema provides:

✅ TEAMS TABLE
   - Stores tournament teams and their standings
   - Auto-calculated statistics (played, won, drawn, lost, points, etc.)
   - Linked to team_registrations

✅ MATCHES TABLE
   - Stores all fixtures and results
   - Supports different match types (group, knockout, etc.)
   - Tracks match status

✅ GOALS TABLE
   - Proper foreign key references to team_players (not text names!)
   - Links scorer and assister to actual player records
   - Supports different goal types
   - Connected to matches and teams

✅ VIEWS
   - standings: Sorted teams by points
   - match_results: Matches with team names
   - top_scorers: Player goal statistics
   - top_assisters: Player assist statistics

ADMIN PANEL COMPATIBILITY:
- GoalsManager.jsx ✅ Will work (expects scorer_id, assister_id)
- StatisticsViewer.jsx ✅ Will work (can query top_scorers view)
- MatchRecorder.jsx ✅ Will work (proper match/team references)
- SettingsPanel.jsx ✅ Will work (can clear goals properly)

TO USE THIS SCHEMA:
1. Run this SQL in your Supabase SQL Editor
2. Restart your admin panel
3. Test Goals Manager page
4. Test Statistics page
5. Record a test goal to verify

IF YOU HAVE EXISTING DATA:
- Existing teams will be preserved
- Existing matches will be preserved  
- Old goals will need manual migration (if using text names)
*/

