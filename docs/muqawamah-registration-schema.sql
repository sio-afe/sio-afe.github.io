-- Supabase schema for Muqawama 2026 registrations
CREATE TABLE IF NOT EXISTS team_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users (id),
  team_name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('open-age', 'u17')),
  team_logo TEXT,
  captain_name VARCHAR(100) NOT NULL,
  captain_email VARCHAR(255) NOT NULL,
  captain_phone VARCHAR(20),
  formation VARCHAR(20),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed')),
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  UNIQUE (team_name, category)
);

CREATE TABLE IF NOT EXISTS team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES team_registrations (id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  position VARCHAR(20) NOT NULL,
  is_substitute BOOLEAN DEFAULT false,
  player_image TEXT,
  position_x FLOAT,
  position_y FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own teams" ON team_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own teams" ON team_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own teams" ON team_registrations
  FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Users can view own players" ON team_players
  FOR SELECT USING (
    team_id IN (SELECT id FROM team_registrations WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own players" ON team_players
  FOR ALL USING (
    team_id IN (SELECT id FROM team_registrations WHERE user_id = auth.uid())
  );

