/**
 * Tournament Utils Unit Tests
 * Tests for standings calculations, tiebreakers, and tournament logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compareTeams, STANDARD_BRACKET } from '../../lib/tournamentUtils';

describe('Tournament Utils', () => {
  
  describe('compareTeams - Tiebreaker Logic', () => {
    
    describe('Rule 1: Points comparison', () => {
      it('should rank team with more points higher', () => {
        const teamA = { id: 1, name: 'Team A', points: 9, goals_for: 5, goals_against: 2 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 2 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA ranks higher (negative result)
      });
      
      it('should rank team with fewer points lower', () => {
        const teamA = { id: 1, name: 'Team A', points: 3, goals_for: 2, goals_against: 5 };
        const teamB = { id: 2, name: 'Team B', points: 9, goals_for: 8, goals_against: 1 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeGreaterThan(0); // teamB ranks higher (positive result)
      });
    });
    
    describe('Rule 2: Goal Difference (when points equal)', () => {
      it('should rank team with better goal difference higher when points are equal', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 8, goals_against: 2 }; // GD: +6
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 4 }; // GD: +1
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA ranks higher
      });
      
      it('should handle negative goal differences correctly', () => {
        const teamA = { id: 1, name: 'Team A', points: 3, goals_for: 2, goals_against: 5 }; // GD: -3
        const teamB = { id: 2, name: 'Team B', points: 3, goals_for: 1, goals_against: 6 }; // GD: -5
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA ranks higher (-3 > -5)
      });
    });
    
    describe('Rule 3: Goals For (when points and GD equal)', () => {
      it('should rank team with more goals scored higher when points and GD are equal', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 6, goals_against: 4 }; // GD: +2
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 4, goals_against: 2 }; // GD: +2
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA ranks higher (scored more)
      });
    });
    
    describe('Rule 4: Head-to-Head (when points, GD, and GF equal)', () => {
      it('should rank team that won head-to-head higher', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3 };
        
        const headToHeadResults = {
          '1_2': { home_score: 2, away_score: 1, winner: 1 } // Team A beat Team B
        };
        
        const result = compareTeams(teamA, teamB, headToHeadResults);
        expect(result).toBeLessThan(0); // teamA ranks higher (won h2h)
      });
      
      it('should rank team that lost head-to-head lower', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3 };
        
        const headToHeadResults = {
          '1_2': { home_score: 0, away_score: 2, winner: 2 } // Team B beat Team A
        };
        
        const result = compareTeams(teamA, teamB, headToHeadResults);
        expect(result).toBeGreaterThan(0); // teamB ranks higher (won h2h)
      });
      
      it('should handle reversed key lookup in head-to-head', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3 };
        
        // Result stored with teamB as home
        const headToHeadResults = {
          '2_1': { home_score: 1, away_score: 3, winner: 1 } // Team A won as away team
        };
        
        const result = compareTeams(teamA, teamB, headToHeadResults);
        expect(result).toBeLessThan(0); // teamA ranks higher
      });
      
      it('should not affect ranking if head-to-head was a draw', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 5 };
        
        const headToHeadResults = {
          '1_2': { home_score: 1, away_score: 1, winner: null } // Draw
        };
        
        // Should proceed to yellow cards tiebreaker
        const result = compareTeams(teamA, teamB, headToHeadResults);
        expect(result).toBeLessThan(0); // teamA has fewer yellow cards
      });
    });
    
    describe('Rule 5: Yellow Cards (fewer is better)', () => {
      it('should rank team with fewer yellow cards higher', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2, red_cards: 0 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 5, red_cards: 0 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA ranks higher (fewer yellows)
      });
      
      it('should handle teams with zero yellow cards', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 0, red_cards: 0 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 3, red_cards: 0 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA ranks higher
      });
    });
    
    describe('Rule 6: Red Cards (fewer is better)', () => {
      it('should rank team with fewer red cards higher when yellow cards are equal', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 3, red_cards: 0 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 3, red_cards: 2 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA ranks higher (fewer reds)
      });
    });
    
    describe('Rule 7: Alphabetical (final tiebreaker)', () => {
      it('should rank alphabetically when all other criteria are equal', () => {
        const teamA = { id: 1, name: 'Arsenal', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2, red_cards: 1 };
        const teamB = { id: 2, name: 'Zebras', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2, red_cards: 1 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // Arsenal comes before Zebras
      });
      
      it('should handle same name (return 0)', () => {
        const teamA = { id: 1, name: 'Team Alpha', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2, red_cards: 1 };
        const teamB = { id: 2, name: 'Team Alpha', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2, red_cards: 1 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBe(0); // Equal
      });
    });
    
    describe('Edge Cases', () => {
      it('should handle missing/undefined values gracefully', () => {
        const teamA = { id: 1, name: 'Team A', points: 6 };
        const teamB = { id: 2, name: 'Team B', points: 6 };
        
        // Should not throw
        expect(() => compareTeams(teamA, teamB)).not.toThrow();
      });
      
      it('should treat undefined yellow_cards as 0', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 5 };
        
        const result = compareTeams(teamA, teamB);
        expect(result).toBeLessThan(0); // teamA has 0 yellows (undefined treated as 0)
      });
      
      it('should handle null head-to-head results', () => {
        const teamA = { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3 };
        const teamB = { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3 };
        
        expect(() => compareTeams(teamA, teamB, null)).not.toThrow();
      });
      
      it('should handle empty names', () => {
        const teamA = { id: 1, name: '', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2, red_cards: 1 };
        const teamB = { id: 2, name: '', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2, red_cards: 1 };
        
        expect(() => compareTeams(teamA, teamB)).not.toThrow();
      });
    });
  });
  
  describe('STANDARD_BRACKET configuration', () => {
    it('should have correct quarter-final matchups', () => {
      expect(STANDARD_BRACKET.quarterFinals).toHaveLength(4);
      expect(STANDARD_BRACKET.quarterFinals[0]).toEqual({ match: 1, home: 'A1', away: 'B2' });
      expect(STANDARD_BRACKET.quarterFinals[1]).toEqual({ match: 2, home: 'B1', away: 'A2' });
      expect(STANDARD_BRACKET.quarterFinals[2]).toEqual({ match: 3, home: 'C1', away: 'D2' });
      expect(STANDARD_BRACKET.quarterFinals[3]).toEqual({ match: 4, home: 'D1', away: 'C2' });
    });
    
    it('should have correct semi-final matchups', () => {
      expect(STANDARD_BRACKET.semiFinals).toHaveLength(2);
      expect(STANDARD_BRACKET.semiFinals[0]).toEqual({ match: 1, home: 'QF1', away: 'QF3' });
      expect(STANDARD_BRACKET.semiFinals[1]).toEqual({ match: 2, home: 'QF2', away: 'QF4' });
    });
    
    it('should have correct final matchup', () => {
      expect(STANDARD_BRACKET.final).toEqual({ home: 'SF1', away: 'SF2' });
    });
    
    it('should have correct third-place matchup', () => {
      expect(STANDARD_BRACKET.thirdPlace).toEqual({ home: 'SF1L', away: 'SF2L' });
    });
  });
  
  describe('Sorting multiple teams', () => {
    it('should correctly sort a group of teams', () => {
      const teams = [
        { id: 1, name: 'Team A', points: 3, goals_for: 2, goals_against: 4 },
        { id: 2, name: 'Team B', points: 9, goals_for: 8, goals_against: 1 },
        { id: 3, name: 'Team C', points: 6, goals_for: 5, goals_against: 3 },
        { id: 4, name: 'Team D', points: 6, goals_for: 4, goals_against: 3 },
      ];
      
      const sorted = [...teams].sort((a, b) => compareTeams(a, b));
      
      expect(sorted[0].name).toBe('Team B'); // 9 points
      expect(sorted[1].name).toBe('Team C'); // 6 points, GD +2
      expect(sorted[2].name).toBe('Team D'); // 6 points, GD +1
      expect(sorted[3].name).toBe('Team A'); // 3 points
    });
    
    it('should handle complex tiebreaker scenario', () => {
      const teams = [
        { id: 1, name: 'Team A', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 4 },
        { id: 2, name: 'Team B', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 2 },
        { id: 3, name: 'Team C', points: 6, goals_for: 5, goals_against: 3, yellow_cards: 6 },
      ];
      
      const sorted = [...teams].sort((a, b) => compareTeams(a, b));
      
      expect(sorted[0].name).toBe('Team B'); // Fewest yellow cards
      expect(sorted[1].name).toBe('Team A'); // 4 yellows
      expect(sorted[2].name).toBe('Team C'); // Most yellow cards
    });
  });
});

