-- Sync ALL tournament players from registration players (team_players) across ALL teams.
-- This version DOES NOT rely on ON CONFLICT (so it works even if you don't have a unique index/constraint).
--
-- What it does:
--  1) de-duplicate players rows by registration_player_id (keeps newest created_at)
--  2) UPDATE existing tournament players from team_players (by registration_player_id)
--  3) INSERT missing tournament players (where NOT EXISTS)
--  4) OPTIONAL DELETE tournament players that no longer exist in team_players
--
-- Run this in Supabase SQL Editor.
-- Notes:
-- - We materialize the source rows into a TEMP table so we can reuse it across multiple statements.
-- - Change v_delete_missing to false if you don't want removals reflected in tournament players.
DO $$
DECLARE
  v_delete_missing boolean := true;
BEGIN
  -- 0) De-duplicate any existing duplicates (keeps newest created_at)
  WITH d AS (
    SELECT
      id,
      registration_player_id,
      ROW_NUMBER() OVER (
        PARTITION BY registration_player_id
        ORDER BY created_at DESC NULLS LAST, id DESC
      ) AS rn
    FROM public.players
    WHERE registration_player_id IS NOT NULL
  )
  DELETE FROM public.players p
  USING d
  WHERE p.id = d.id
    AND d.rn > 1;

  -- 1) Build source rows (TEMP table) from team_players for ALL mapped teams
  EXECUTE $sql$
    CREATE TEMP TABLE tmp_src_players ON COMMIT DROP AS
    WITH team_map AS (
      SELECT
        t.id  AS team_id,
        t.registration_id AS registration_team_id
      FROM public.teams t
      WHERE t.registration_id IS NOT NULL
    )
    SELECT
      tm.team_id,
      tp.id AS registration_player_id,
      tp.player_name AS name,
      tp.position,
      tp.is_substitute,
      tp.player_image,
      tp.position_x,
      tp.position_y
    FROM team_map tm
    JOIN public.team_players tp
      ON tp.team_id = tm.registration_team_id;
  $sql$;

  -- 2) UPDATE existing tournament players
  UPDATE public.players p
  SET
    team_id       = s.team_id,
    name          = s.name,
    position      = s.position,
    is_substitute = s.is_substitute,
    player_image  = s.player_image,
    position_x    = s.position_x,
    position_y    = s.position_y
  FROM tmp_src_players s
  WHERE p.registration_player_id = s.registration_player_id;

  -- 3) INSERT missing tournament players
  INSERT INTO public.players (
    team_id,
    registration_player_id,
    name,
    position,
    is_substitute,
    player_image,
    position_x,
    position_y
  )
  SELECT
    s.team_id,
    s.registration_player_id,
    s.name,
    s.position,
    s.is_substitute,
    s.player_image,
    s.position_x,
    s.position_y
  FROM tmp_src_players s
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.players p
    WHERE p.registration_player_id = s.registration_player_id
  );

  -- 4) OPTIONAL DELETE: remove tournament players removed from registration
  IF v_delete_missing THEN
    WITH team_map AS (
      SELECT
        t.id  AS tournament_team_id,
        t.registration_id AS registration_team_id
      FROM public.teams t
      WHERE t.registration_id IS NOT NULL
    )
    DELETE FROM public.players p
    USING team_map tm
    WHERE p.team_id = tm.tournament_team_id
      AND p.registration_player_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.team_players tp
        WHERE tp.id = p.registration_player_id
          AND tp.team_id = tm.registration_team_id
      );
  END IF;

  -- 5) Final de-dupe pass (just in case)
  WITH d2 AS (
    SELECT
      id,
      registration_player_id,
      ROW_NUMBER() OVER (
        PARTITION BY registration_player_id
        ORDER BY created_at DESC NULLS LAST, id DESC
      ) AS rn
    FROM public.players
    WHERE registration_player_id IS NOT NULL
  )
  DELETE FROM public.players p
  USING d2
  WHERE p.id = d2.id
    AND d2.rn > 1;
END $$;

-- Quick verification summary:
SELECT
  t.category,
  COUNT(*) AS tournament_teams,
  SUM((SELECT COUNT(*) FROM public.players p WHERE p.team_id = t.id)) AS tournament_players
FROM public.teams t
WHERE t.registration_id IS NOT NULL
GROUP BY t.category
ORDER BY t.category;


