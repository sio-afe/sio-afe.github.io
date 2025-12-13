-- ============================================
-- CARDS TABLE
-- ============================================
-- Stores yellow and red cards for matches

CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.team_players(id) ON DELETE CASCADE,
    card_type TEXT NOT NULL CHECK (card_type IN ('yellow', 'red')),
    minute INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cards_match_id ON public.cards(match_id);
CREATE INDEX IF NOT EXISTS idx_cards_player_id ON public.cards(player_id);
CREATE INDEX IF NOT EXISTS idx_cards_team_id ON public.cards(team_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cards
CREATE POLICY "Anyone can read cards" ON public.cards
    FOR SELECT USING (true);

-- Allow authenticated users (admins) to insert/update/delete cards
CREATE POLICY "Admins can manage cards" ON public.cards
    FOR ALL USING (true);

