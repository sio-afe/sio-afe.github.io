-- ============================================
-- COMPLETE TOURNAMENT MANAGEMENT SCHEMA (FIXED)
-- Ensures all tables match what the admin panel expects
-- Handles existing views properly
-- ============================================

-- ============================================
-- PART 1: DROP EXISTING VIEWS FIRST
-- ============================================

-- Drop views that might conflict
DROP VIEW IF EXISTS standings CASCADE;
DROP VIEW IF EXISTS match_results CASCADE;
DROP VIEW IF EXISTS top_scorers CASCADE;
DROP VIEW IF EXISTS top_assisters CASCADE;

-- ============================================
-- PART 2: TEAMS TABLE (Tournament Standings)
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
    registration_id UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teams_name_category_key'
    ) THEN
        ALTER TABLE teams ADD CONSTRAINT teams_name_category_key UNIQUE(name, category);
    END IF;
END $$;

-- Add foreign key to registration_id if column exists in team_registrations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_registrations') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'teams_registration_id_fkey'
        ) THEN
            ALTER TABLE teams 
            ADD CONSTRAINT teams_registration_id_fkey 
            FOREIGN KEY (registration_id) 
            REFERENCES team_registrations(id);
        END IF;
    END IF;
END $$;

-- ============================================
-- PART 3: MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID,
    away_team_id UUID,
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

-- Add foreign keys if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'matches_home_team_id_fkey'
    ) THEN
        ALTER TABLE matches 
        ADD CONSTRAINT matches_home_team_id_fkey 
        FOREIGN KEY (home_team_id) 
        REFERENCES teams(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'matches_away_team_id_fkey'
    ) THEN
        ALTER TABLE matches 
        ADD CONSTRAINT matches_away_team_id_fkey 
        FOREIGN KEY (away_team_id) 
        REFERENCES teams(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- PART 4: BACKUP AND RECREATE GOALS TABLE
-- ============================================

-- Step 1: Backup existing goals if table exists and has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goals') THEN
        -- Check if goals table has data
        IF (SELECT COUNT(*) FROM goals) > 0 THEN
            -- Create backup table with timestamp
            EXECUTE format('CREATE TABLE goals_backup_%s AS SELECT * FROM goals', 
                          to_char(now(), 'YYYYMMDD_HH24MISS'));
            RAISE NOTICE 'Backed up goals to goals_backup_%', to_char(now(), 'YYYYMMDD_HH24MISS');
        END IF;
    END IF;
END $$;

-- Step 2: Drop and recreate goals table
DROP TABLE IF EXISTS goals CASCADE;

-- Step 3: Create new goals table with proper structure
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL,
    team_id UUID NOT NULL,
    scorer_id UUID NOT NULL,
    assister_id UUID,
    minute INTEGER CHECK (minute >= 0 AND minute <= 120),
    goal_type TEXT DEFAULT 'open_play' CHECK (goal_type IN ('open_play', 'penalty', 'free_kick', 'header', 'own_goal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys to goals table
DO $$
BEGIN
    -- FK to matches
    ALTER TABLE goals 
    ADD CONSTRAINT goals_match_id_fkey 
    FOREIGN KEY (match_id) 
    REFERENCES matches(id) ON DELETE CASCADE;
    
    -- FK to teams
    ALTER TABLE goals 
    ADD CONSTRAINT goals_team_id_fkey 
    FOREIGN KEY (team_id) 
    REFERENCES teams(id) ON DELETE CASCADE;
    
    -- FK to team_players for scorer
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_players') THEN
        ALTER TABLE goals 
        ADD CONSTRAINT goals_scorer_id_fkey 
        FOREIGN KEY (scorer_id) 
        REFERENCES team_players(id) ON DELETE CASCADE;
        
        ALTER TABLE goals 
        ADD CONSTRAINT goals_assister_id_fkey 
        FOREIGN KEY (assister_id) 
        REFERENCES team_players(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- PART 5: INDEXES FOR PERFORMANCE
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
-- PART 6: ROW LEVEL SECURITY
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
-- PART 7: TRIGGERS FOR AUTO-UPDATE
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
-- PART 8: VIEWS (Now safe to create)
-- ============================================

-- View for standings (sorted teams)
CREATE VIEW standings AS
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
CREATE VIEW match_results AS
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

-- View for top scorers (only if team_players exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_players') THEN
        EXECUTE '
        CREATE VIEW top_scorers AS
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
        ORDER BY goals_scored DESC, tp.player_name';
        
        EXECUTE '
        CREATE VIEW top_assisters AS
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
        ORDER BY assists DESC, tp.player_name';
    END IF;
END $$;

-- ============================================
-- PART 9: VERIFICATION
-- ============================================

DO $$
DECLARE
    team_count INT;
    match_count INT;
    goal_count INT;
    has_scorer_id BOOLEAN;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEMA MIGRATION COMPLETE';
    RAISE NOTICE '========================================';
    
    -- Count data
    SELECT COUNT(*) INTO team_count FROM teams;
    SELECT COUNT(*) INTO match_count FROM matches;
    SELECT COUNT(*) INTO goal_count FROM goals;
    
    RAISE NOTICE 'Teams: %', team_count;
    RAISE NOTICE 'Matches: %', match_count;
    RAISE NOTICE 'Goals: %', goal_count;
    
    -- Verify goals structure
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'scorer_id'
    ) INTO has_scorer_id;
    
    IF has_scorer_id THEN
        RAISE NOTICE '✅ Goals table has correct structure (scorer_id)';
    ELSE
        RAISE WARNING '❌ Goals table missing scorer_id column';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ READY TO USE ADMIN PANEL';
    RAISE NOTICE 'Visit: /admin/goals to test';
    RAISE NOTICE '========================================';
END $$;

-- Show final table structure
SELECT 
    'goals' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;

