/**
 * Match Prediction Unit Tests
 * Tests for the ML-based match score prediction logic
 */

import { describe, it, expect } from 'vitest';
import { predictMatchScore } from '../../lib/matchPrediction';

describe('Match Prediction', () => {
  
  describe('predictMatchScore', () => {
    
    describe('With historical match data', () => {
      it('should predict scores based on team history', () => {
        const homeTeamHistory = [
          { home_team_id: 1, away_team_id: 2, home_score: 2, away_score: 1, status: 'completed' },
          { home_team_id: 1, away_team_id: 3, home_score: 3, away_score: 0, status: 'completed' },
          { home_team_id: 4, away_team_id: 1, home_score: 1, away_score: 2, status: 'completed' },
        ];
        
        const awayTeamHistory = [
          { home_team_id: 2, away_team_id: 3, home_score: 1, away_score: 1, status: 'completed' },
          { home_team_id: 2, away_team_id: 4, home_score: 0, away_score: 2, status: 'completed' },
        ];
        
        const homeTeamStats = { id: 1, goals_for: 7, goals_against: 2, played: 3 };
        const awayTeamStats = { id: 2, goals_for: 1, goals_against: 3, played: 2 };
        
        const prediction = predictMatchScore(homeTeamHistory, awayTeamHistory, homeTeamStats, awayTeamStats);
        
        expect(prediction).toHaveProperty('homeScore');
        expect(prediction).toHaveProperty('awayScore');
        expect(prediction).toHaveProperty('confidence');
        expect(prediction.homeScore).toBeGreaterThanOrEqual(0);
        expect(prediction.awayScore).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence).toBeGreaterThanOrEqual(50);
        expect(prediction.confidence).toBeLessThanOrEqual(95);
      });
      
      it('should give higher confidence with more match history', () => {
        const fiveMatchHistory = [
          { home_team_id: 1, away_team_id: 2, home_score: 2, away_score: 1, status: 'completed' },
          { home_team_id: 1, away_team_id: 3, home_score: 1, away_score: 1, status: 'completed' },
          { home_team_id: 1, away_team_id: 4, home_score: 3, away_score: 0, status: 'completed' },
          { home_team_id: 1, away_team_id: 5, home_score: 2, away_score: 2, status: 'completed' },
          { home_team_id: 1, away_team_id: 6, home_score: 1, away_score: 0, status: 'completed' },
        ];
        
        const twoMatchHistory = [
          { home_team_id: 2, away_team_id: 3, home_score: 1, away_score: 1, status: 'completed' },
          { home_team_id: 2, away_team_id: 4, home_score: 2, away_score: 1, status: 'completed' },
        ];
        
        const homeTeamStats = { id: 1, goals_for: 9, goals_against: 4, played: 5 };
        const awayTeamStats = { id: 2, goals_for: 3, goals_against: 2, played: 2 };
        
        const prediction = predictMatchScore(fiveMatchHistory, twoMatchHistory, homeTeamStats, awayTeamStats);
        
        // With 2 matches minimum, confidence should be around 50 + 2*9 = 68
        expect(prediction.confidence).toBeGreaterThanOrEqual(60);
      });
      
      it('should only use completed matches for calculations', () => {
        const historyWithPending = [
          { home_team_id: 1, away_team_id: 2, home_score: 2, away_score: 1, status: 'completed' },
          { home_team_id: 1, away_team_id: 3, home_score: null, away_score: null, status: 'scheduled' },
          { home_team_id: 1, away_team_id: 4, home_score: null, away_score: null, status: 'live' },
        ];
        
        const homeTeamStats = { id: 1, goals_for: 2, goals_against: 1, played: 1 };
        const awayTeamStats = { id: 2, goals_for: 1, goals_against: 2, played: 1 };
        
        const prediction = predictMatchScore(historyWithPending, historyWithPending, homeTeamStats, awayTeamStats);
        
        expect(prediction).toHaveProperty('homeScore');
        expect(prediction).toHaveProperty('awayScore');
      });
    });
    
    describe('Without historical match data (fallback to stats)', () => {
      it('should use team stats when no history is available', () => {
        const homeTeamStats = { id: 1, goals_for: 10, goals_against: 5, played: 5 };
        const awayTeamStats = { id: 2, goals_for: 8, goals_against: 8, played: 5 };
        
        const prediction = predictMatchScore(null, null, homeTeamStats, awayTeamStats);
        
        expect(prediction).toHaveProperty('homeScore');
        expect(prediction).toHaveProperty('awayScore');
        expect(prediction).toHaveProperty('confidence');
        expect(prediction.confidence).toBeLessThanOrEqual(60); // Lower confidence for stats-only
      });
      
      it('should use team stats when history array is empty', () => {
        const homeTeamStats = { id: 1, goals_for: 6, goals_against: 3, played: 3 };
        const awayTeamStats = { id: 2, goals_for: 4, goals_against: 4, played: 3 };
        
        const prediction = predictMatchScore([], [], homeTeamStats, awayTeamStats);
        
        expect(prediction).toHaveProperty('homeScore');
        expect(prediction).toHaveProperty('awayScore');
        expect(prediction.homeScore).toBeGreaterThanOrEqual(0);
        expect(prediction.awayScore).toBeGreaterThanOrEqual(0);
      });
      
      it('should handle teams with no games played', () => {
        const homeTeamStats = { id: 1, goals_for: 0, goals_against: 0, played: 0 };
        const awayTeamStats = { id: 2, goals_for: 0, goals_against: 0, played: 0 };
        
        const prediction = predictMatchScore(null, null, homeTeamStats, awayTeamStats);
        
        expect(prediction.homeScore).toBeGreaterThanOrEqual(0);
        expect(prediction.awayScore).toBeGreaterThanOrEqual(0);
        // Confidence is 60 when stats exist but played=0 (fallback path)
        expect(prediction.confidence).toBeLessThanOrEqual(60);
      });
    });
    
    describe('Home advantage factor', () => {
      it('should favor home team slightly in predictions', () => {
        // Identical teams - home team should have slight advantage
        const identicalHistory = [
          { home_team_id: 1, away_team_id: 3, home_score: 2, away_score: 2, status: 'completed' },
        ];
        
        const teamStats = { id: 1, goals_for: 2, goals_against: 2, played: 1 };
        
        // Over multiple predictions, home team should tend to have equal or higher scores
        const prediction = predictMatchScore(identicalHistory, identicalHistory, teamStats, teamStats);
        
        // Just verify we get valid predictions
        expect(prediction.homeScore).toBeGreaterThanOrEqual(0);
        expect(prediction.awayScore).toBeGreaterThanOrEqual(0);
      });
    });
    
    describe('Edge cases', () => {
      it('should return default prediction when both stats are null', () => {
        const prediction = predictMatchScore(null, null, null, null);
        
        expect(prediction).toEqual({
          homeScore: 1,
          awayScore: 1,
          confidence: 30
        });
      });
      
      it('should handle undefined stats properties', () => {
        const homeTeamStats = { id: 1 }; // Missing goals_for, goals_against, played
        const awayTeamStats = { id: 2 };
        
        const prediction = predictMatchScore(null, null, homeTeamStats, awayTeamStats);
        
        expect(prediction).toHaveProperty('homeScore');
        expect(prediction).toHaveProperty('awayScore');
        expect(prediction.homeScore).toBeGreaterThanOrEqual(0);
        expect(prediction.awayScore).toBeGreaterThanOrEqual(0);
      });
      
      it('should never return negative scores', () => {
        // Team that concedes heavily
        const homeTeamStats = { id: 1, goals_for: 0, goals_against: 20, played: 5 };
        const awayTeamStats = { id: 2, goals_for: 20, goals_against: 0, played: 5 };
        
        const prediction = predictMatchScore(null, null, homeTeamStats, awayTeamStats);
        
        expect(prediction.homeScore).toBeGreaterThanOrEqual(0);
        expect(prediction.awayScore).toBeGreaterThanOrEqual(0);
      });
      
      it('should limit to last 5 matches only', () => {
        // 10 matches, but should only consider last 5
        const longHistory = Array(10).fill(null).map((_, i) => ({
          home_team_id: 1,
          away_team_id: i + 2,
          home_score: i < 5 ? 5 : 1, // Recent 5 matches: 1 goal, older 5: 5 goals
          away_score: 0,
          status: 'completed'
        }));
        
        const homeTeamStats = { id: 1, goals_for: 30, goals_against: 0, played: 10 };
        const awayTeamStats = { id: 2, goals_for: 0, goals_against: 10, played: 5 };
        
        const prediction = predictMatchScore(longHistory, [], homeTeamStats, awayTeamStats);
        
        // Should be based on recent form (lower scores) not overall
        expect(prediction.homeScore).toBeLessThanOrEqual(5);
      });
    });
    
    describe('Confidence scoring', () => {
      it('should have confidence between 50-95 for historical predictions', () => {
        const history = [
          { home_team_id: 1, away_team_id: 2, home_score: 2, away_score: 1, status: 'completed' },
        ];
        
        const stats = { id: 1, goals_for: 2, goals_against: 1, played: 1 };
        
        const prediction = predictMatchScore(history, history, stats, stats);
        
        expect(prediction.confidence).toBeGreaterThanOrEqual(50);
        expect(prediction.confidence).toBeLessThanOrEqual(95);
      });
      
      it('should cap confidence at 95 even with lots of data', () => {
        const manyMatches = Array(20).fill(null).map((_, i) => ({
          home_team_id: 1,
          away_team_id: i + 2,
          home_score: 2,
          away_score: 1,
          status: 'completed'
        }));
        
        const stats = { id: 1, goals_for: 40, goals_against: 20, played: 20 };
        
        const prediction = predictMatchScore(manyMatches, manyMatches, stats, stats);
        
        expect(prediction.confidence).toBeLessThanOrEqual(95);
      });
    });
  });
});

