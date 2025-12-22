/**
 * Supabase Connection Integration Tests
 * 
 * These tests verify the REAL Supabase connection works.
 * Run with: npm run test:supabase or make test-supabase
 * 
 * NOTE: These tests require network access and a valid Supabase instance.
 * They are skipped by default in CI (when SKIP_SUPABASE_TESTS=true)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Skip these tests in CI or when env var is set
const SKIP_TESTS = process.env.SKIP_SUPABASE_TESTS === 'true' || process.env.CI === 'true';

// Supabase configuration (same as main client)
const supabaseUrl = 'https://uzieoxfqkglcoistswxq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aWVveGZxa2dsY29pc3Rzd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQwODIsImV4cCI6MjA3OTMyMDA4Mn0.iXOQmg_xIfRJaUI7HACjnCk9JAMcs0X9a770XUP5cb8';

let supabase;

beforeAll(() => {
  if (!SKIP_TESTS) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
});

describe.skipIf(SKIP_TESTS)('Supabase Connection Tests', () => {
  
  describe('Database Connection', () => {
    
    it('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('count')
        .limit(1);
      
      expect(error).toBeNull();
    });
    
    it('should fetch teams table', async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, category')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
    
    it('should fetch matches table', async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, home_team_id, away_team_id, status')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
    
    it('should fetch players table', async () => {
      // Try team_players first (actual table name)
      let result = await supabase
        .from('team_players')
        .select('*')
        .limit(5);
      
      // Fallback to players if team_players doesn't exist
      if (result.error) {
        result = await supabase
          .from('players')
          .select('*')
          .limit(5);
      }
      
      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });
    
    it('should fetch goals table', async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });
  
  describe('Table Relationships', () => {
    
    it('should fetch matches with team details', async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          home_score,
          away_score,
          status,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .limit(3);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('home_team');
        expect(data[0]).toHaveProperty('away_team');
      }
    });
    
    it('should fetch players with team details', async () => {
      // Try team_players first
      let result = await supabase
        .from('team_players')
        .select(`*, team:teams(id, name)`)
        .limit(3);
      
      // Fallback to players if needed
      if (result.error) {
        result = await supabase
          .from('players')
          .select(`*, team:teams(id, name)`)
          .limit(3);
      }
      
      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });
    
    it('should fetch goals with match details', async () => {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          match:matches(id, home_team_id, away_team_id)
        `)
        .limit(3);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });
  
  describe('Filtering & Sorting', () => {
    
    it('should filter teams by category', async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, category')
        .eq('category', 'open-age')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      
      if (data && data.length > 0) {
        data.forEach(team => {
          expect(team.category).toBe('open-age');
        });
      }
    });
    
    it('should filter matches by status', async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, status')
        .eq('status', 'completed')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      
      if (data && data.length > 0) {
        data.forEach(match => {
          expect(match.status).toBe('completed');
        });
      }
    });
    
    it('should sort teams by points descending', async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, points')
        .order('points', { ascending: false })
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      
      if (data && data.length > 1) {
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].points).toBeGreaterThanOrEqual(data[i + 1].points);
        }
      }
    });
  });
  
  describe('Error Handling', () => {
    
    it('should return error for non-existent table', async () => {
      const { data, error } = await supabase
        .from('non_existent_table')
        .select('*')
        .limit(1);
      
      expect(error).not.toBeNull();
    });
    
    it('should handle non-matching filter gracefully', async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', -99999) // Non-existent ID
        .limit(1);
      
      // Either empty array or error is acceptable
      if (!error) {
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
      }
    });
  });
  
  describe('Data Integrity', () => {
    
    it('should have valid team structure', async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      
      if (data && data.length > 0) {
        const team = data[0];
        expect(team).toHaveProperty('id');
        expect(team).toHaveProperty('name');
        expect(team).toHaveProperty('category');
      }
    });
    
    it('should have valid match structure', async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      
      if (data && data.length > 0) {
        const match = data[0];
        expect(match).toHaveProperty('id');
        expect(match).toHaveProperty('home_team_id');
        expect(match).toHaveProperty('away_team_id');
        expect(match).toHaveProperty('status');
      }
    });
    
    it('should have valid player structure', async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      
      if (data && data.length > 0) {
        const player = data[0];
        expect(player).toHaveProperty('id');
        // Column might be 'player_name' or 'name' depending on schema
        expect(player.player_name || player.name).toBeDefined();
        expect(player).toHaveProperty('team_id');
      }
    });
  });
});

// Summary test for quick health check
describe.skipIf(SKIP_TESTS)('Supabase Health Check', () => {
  
  it('should pass all basic connectivity checks', async () => {
    const checks = {
      teams: false,
      matches: false,
      players: false,
      goals: false,
    };
    
    // Check teams
    const { error: teamsError } = await supabase.from('teams').select('*').limit(1);
    checks.teams = !teamsError;
    
    // Check matches
    const { error: matchesError } = await supabase.from('matches').select('*').limit(1);
    checks.matches = !matchesError;
    
    // Check players (try team_players first, then players)
    let playersResult = await supabase.from('team_players').select('*').limit(1);
    if (playersResult.error) {
      playersResult = await supabase.from('players').select('*').limit(1);
    }
    checks.players = !playersResult.error;
    
    // Check goals
    const { error: goalsError } = await supabase.from('goals').select('*').limit(1);
    checks.goals = !goalsError;
    
    console.log('Supabase Health Check Results:', checks);
    
    expect(checks.teams).toBe(true);
    expect(checks.matches).toBe(true);
    expect(checks.players).toBe(true);
    expect(checks.goals).toBe(true);
  });
});

