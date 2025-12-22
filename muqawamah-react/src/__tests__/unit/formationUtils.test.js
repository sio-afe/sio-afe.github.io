/**
 * Formation Utils Unit Tests
 * Tests for football formation positioning logic
 */

import { describe, it, expect } from 'vitest';
import { 
  presetFormations, 
  applyFormationToPlayers,
  applySmartPositioning 
} from '../../components/shared/registration/utils/formationUtils';

describe('Formation Utils', () => {
  
  describe('presetFormations', () => {
    it('should have valid 7v7 formations', () => {
      expect(presetFormations).toContain('1-3-2-1');
      expect(presetFormations).toContain('1-2-3-1');
      expect(presetFormations).toContain('1-2-2-2');
      expect(presetFormations).toContain('1-3-1-2');
      expect(presetFormations).toContain('1-4-1-1');
    });
    
    it('should have formations that sum to 7 players', () => {
      presetFormations.forEach(formation => {
        const parts = formation.split('-').map(Number);
        const total = parts.reduce((sum, n) => sum + n, 0);
        expect(total).toBe(7);
      });
    });
  });
  
  describe('applyFormationToPlayers', () => {
    const createPlayers = () => [
      { id: 1, name: 'GK', position: 'GK', isSubstitute: false },
      { id: 2, name: 'CB1', position: 'CB', isSubstitute: false },
      { id: 3, name: 'CB2', position: 'CB', isSubstitute: false },
      { id: 4, name: 'CB3', position: 'CB', isSubstitute: false },
      { id: 5, name: 'CM1', position: 'CM', isSubstitute: false },
      { id: 6, name: 'CM2', position: 'CM', isSubstitute: false },
      { id: 7, name: 'ST', position: 'ST', isSubstitute: false },
      { id: 8, name: 'Sub1', position: 'CM', isSubstitute: true },
      { id: 9, name: 'Sub2', position: 'CB', isSubstitute: true },
    ];
    
    it('should apply 1-3-2-1 formation correctly', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, '1-3-2-1');
      
      // Should have x and y coordinates assigned
      const starters = result.filter(p => !p.isSubstitute);
      starters.forEach(player => {
        expect(player).toHaveProperty('x');
        expect(player).toHaveProperty('y');
        expect(player.x).toBeGreaterThanOrEqual(0);
        expect(player.x).toBeLessThanOrEqual(100);
        expect(player.y).toBeGreaterThanOrEqual(0);
        expect(player.y).toBeLessThanOrEqual(100);
      });
    });
    
    it('should keep goalkeeper in restricted zone', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, '1-3-2-1');
      
      const gk = result.find(p => p.position === 'GK');
      expect(gk.y).toBeGreaterThanOrEqual(85); // GK zone min
      expect(gk.y).toBeLessThanOrEqual(100); // GK zone max
    });
    
    it('should position goalkeeper in center', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, '1-3-2-1');
      
      const gk = result.find(p => p.position === 'GK');
      expect(gk.x).toBe(50); // Center position
    });
    
    it('should spread 3 defenders evenly', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, '1-3-2-1');
      
      // The second row (index 1 in formation) should have 3 players
      // With positions at 20, 50, 80
      const defenderRow = result.filter(p => 
        !p.isSubstitute && 
        p.position !== 'GK' && 
        p.y >= 70 && p.y <= 85
      );
      
      expect(defenderRow.length).toBe(3);
    });
    
    it('should not modify substitutes', () => {
      const players = createPlayers();
      const originalSubs = players.filter(p => p.isSubstitute);
      
      const result = applyFormationToPlayers(players, '1-3-2-1');
      const resultSubs = result.filter(p => p.isSubstitute);
      
      expect(resultSubs.length).toBe(originalSubs.length);
    });
    
    it('should handle empty formation string', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, '');
      
      // Should fall back to smart positioning
      expect(result).toBeDefined();
      expect(result.length).toBe(players.length);
    });
    
    it('should handle null formation string', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, null);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(players.length);
    });
    
    it('should handle invalid formation string', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, 'invalid');
      
      expect(result).toBeDefined();
      expect(result.length).toBe(players.length);
    });
    
    it('should apply 1-2-2-2 formation correctly', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, '1-2-2-2');
      
      const starters = result.filter(p => !p.isSubstitute);
      expect(starters.length).toBe(7);
      
      // All starters should have positions
      starters.forEach(player => {
        expect(player).toHaveProperty('x');
        expect(player).toHaveProperty('y');
      });
    });
    
    it('should handle 1-4-1-1 ultra defensive formation', () => {
      const players = createPlayers();
      const result = applyFormationToPlayers(players, '1-4-1-1');
      
      const starters = result.filter(p => !p.isSubstitute);
      expect(starters.length).toBe(7);
    });
  });
  
  describe('applySmartPositioning', () => {
    it('should position players based on their position types', () => {
      const players = [
        { id: 1, name: 'GK', position: 'GK', isSubstitute: false },
        { id: 2, name: 'LB', position: 'LB', isSubstitute: false },
        { id: 3, name: 'RB', position: 'RB', isSubstitute: false },
        { id: 4, name: 'CB', position: 'CB', isSubstitute: false },
        { id: 5, name: 'CM', position: 'CM', isSubstitute: false },
        { id: 6, name: 'LM', position: 'LM', isSubstitute: false },
        { id: 7, name: 'ST', position: 'ST', isSubstitute: false },
      ];
      
      const result = applySmartPositioning(players);
      
      // LB should be on left side
      const lb = result.find(p => p.position === 'LB');
      expect(lb.x).toBeLessThan(50);
      
      // RB should be on right side
      const rb = result.find(p => p.position === 'RB');
      expect(rb.x).toBeGreaterThan(50);
      
      // GK should be centered
      const gk = result.find(p => p.position === 'GK');
      expect(gk.x).toBe(50);
    });
    
    it('should spread multiple players with same position', () => {
      const players = [
        { id: 1, name: 'GK', position: 'GK', isSubstitute: false },
        { id: 2, name: 'CB1', position: 'CB', isSubstitute: false },
        { id: 3, name: 'CB2', position: 'CB', isSubstitute: false },
        { id: 4, name: 'CB3', position: 'CB', isSubstitute: false },
        { id: 5, name: 'CM1', position: 'CM', isSubstitute: false },
        { id: 6, name: 'CM2', position: 'CM', isSubstitute: false },
        { id: 7, name: 'ST', position: 'ST', isSubstitute: false },
      ];
      
      const result = applySmartPositioning(players);
      
      // Multiple CBs should be spread across the field
      const cbs = result.filter(p => p.position === 'CB');
      const cbXPositions = cbs.map(p => p.x);
      
      // Should have different X positions
      const uniquePositions = new Set(cbXPositions);
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
    
    it('should not position substitutes', () => {
      const players = [
        { id: 1, name: 'GK', position: 'GK', isSubstitute: false },
        { id: 2, name: 'Sub', position: 'CB', isSubstitute: true },
      ];
      
      const result = applySmartPositioning(players);
      
      // Starter should have position
      const starter = result.find(p => !p.isSubstitute);
      expect(starter).toHaveProperty('x');
      expect(starter).toHaveProperty('y');
    });
  });
  
  describe('X positioning by role', () => {
    const testPositioning = (position, expectedSide) => {
      const players = [
        { id: 1, name: 'Test', position, isSubstitute: false },
      ];
      
      const result = applySmartPositioning(players);
      const player = result[0];
      
      if (expectedSide === 'left') {
        expect(player.x).toBeLessThan(50);
      } else if (expectedSide === 'right') {
        expect(player.x).toBeGreaterThan(50);
      } else {
        expect(player.x).toBe(50);
      }
    };
    
    it('should position LB on left side', () => {
      testPositioning('LB', 'left');
    });
    
    it('should position RB on right side', () => {
      testPositioning('RB', 'right');
    });
    
    it('should position LM on left side', () => {
      testPositioning('LM', 'left');
    });
    
    it('should position RM on right side', () => {
      testPositioning('RM', 'right');
    });
    
    it('should position GK in center', () => {
      testPositioning('GK', 'center');
    });
    
    it('should position CB in center', () => {
      testPositioning('CB', 'center');
    });
    
    it('should position CM in center', () => {
      testPositioning('CM', 'center');
    });
    
    it('should position ST in center', () => {
      testPositioning('ST', 'center');
    });
  });
});

