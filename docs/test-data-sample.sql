-- SAMPLE DATA NOTICE
-- --------------------------------------------------
-- The comprehensive seeding logic now lives in
-- docs/COMPLETE_TEST_SETUP.sql. Run that file to:
--   • insert two registration records (Team Atlas FC / Team Nova FC)
--   • add their players
--   • confirm them into the tournament standings
--   • create a test match + goals
--
-- This helper file simply reminds you of the new entry point.
DO $$
BEGIN
  RAISE NOTICE 'Please run docs/COMPLETE_TEST_SETUP.sql for the full test dataset.';
END $$;
