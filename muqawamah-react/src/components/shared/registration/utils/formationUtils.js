// Valid 7v7 formations (7 starters + 4 subs = 11 total)
export const presetFormations = [
  '1-3-2-1', // Balanced (GK + 3 Defenders + 2 Midfielders + 1 Forward)
  '1-2-3-1', // Attacking (GK + 2 Defenders + 3 Midfielders + 1 Forward)
  '1-2-2-2', // Balanced Attack (GK + 2 Defenders + 2 Midfielders + 2 Forwards)
  '1-3-1-2', // Defensive (GK + 3 Defenders + 1 Midfielder + 2 Forwards)
  '1-4-1-1'  // Ultra Defensive (GK + 4 Defenders + 1 Midfielder + 1 Forward)
];

// Only restrict goalkeeper to their area
// All other players can be positioned anywhere
const GK_ZONE = { min: 85, max: 100 }; // Bottom 15% (85-100%)

// Clamp Y position only for goalkeeper
// All other positions have no restrictions
const clampToZone = (position, y) => {
  // Only restrict goalkeeper
  if (position === 'GK') {
    return Math.max(GK_ZONE.min, Math.min(GK_ZONE.max, y));
  }
  
  // All other players can be positioned anywhere (0-100%)
  return Math.max(0, Math.min(100, y));
};

// Position-based X coordinates (percentage from left)
const POSITION_X_MAP = {
  GK: 50,       // Goalkeeper - center
  CB: 50,       // Center Back - center
  LB: 25,       // Left Back - left side
  RB: 75,       // Right Back - right side
  CDM: 50,      // Defensive Midfielder - center
  CM: 50,       // Central Midfielder - center
  CAM: 50,      // Attacking Midfielder - center
  LM: 20,       // Left Midfielder - left
  RM: 80,       // Right Midfielder - right
  CF: 50,       // Center Forward - center
  ST: 50        // Striker - center
};

// Apply smart positioning based on player positions
export const applySmartPositioning = (players) => {
  const updated = [...players];
  const starters = players.filter((p) => !p.isSubstitute);
  
  // Track how many players of each type we've placed to handle duplicates
  const positionCounts = {};
  
  starters.forEach((player) => {
    const pos = player.position;
    const count = positionCounts[pos] || 0;
    
    let x = POSITION_X_MAP[pos] || 50;
    let y = POSITION_Y_MAP[pos] || 50;
    
    // Adjust X for duplicate positions to spread them out
    if (count > 0) {
      if (pos === 'CB') {
        // Multiple center backs: spread left and right
        x = count === 1 ? 30 : (count === 2 ? 70 : 50);
      } else if (pos === 'CM') {
        // Multiple center mids: spread left and right
        x = count === 1 ? 30 : (count === 2 ? 70 : 50);
      } else if (pos === 'ST' || pos === 'CF') {
        // Multiple forwards: spread left and right
        x = count === 1 ? 30 : (count === 2 ? 70 : 50);
      } else if (pos === 'LB') {
        // Multiple left backs
        x = 20 - (count * 5);
      } else if (pos === 'RB') {
        // Multiple right backs
        x = 80 + (count * 5);
      }
    }
    
    positionCounts[pos] = count + 1;
    
    const playerIndex = players.indexOf(player);
    updated[playerIndex] = { ...player, x, y };
  });
  
  return updated;
};

export const applyFormationToPlayers = (players, formationString) => {
  if (!formationString) {
    console.log('No formation string, using smart positioning');
    return applySmartPositioning(players);
  }

  console.log('applyFormationToPlayers called with:', formationString);
  
  // Parse formation string (e.g., "1-3-2-1" -> [1, 3, 2, 1])
  const formation = formationString.split('-').map(n => parseInt(n, 10)).filter(n => !isNaN(n));
  
  if (formation.length === 0) {
    console.log('Invalid formation, using smart positioning');
    return applySmartPositioning(players);
  }

  const updated = [...players];
  const starters = players.filter((p) => !p.isSubstitute);
  
  // Sort players: GK first, then all others in their current order
  const sortedStarters = [...starters].sort((a, b) => {
    if (a.position === 'GK') return -1;
    if (b.position === 'GK') return 1;
    return 0; // Keep other players in their original order
  });
  
  // Y positions for each row (bottom to top: GK, defenders, midfielders, forwards)
  const rowYPositions = [92, 78, 55, 35, 15]; // Bottom to top
  
  let playerIndex = 0;
  
  formation.forEach((playersInRow, rowIndex) => {
    const yPosition = rowYPositions[rowIndex] || 50;
    
    // Calculate X positions to spread players evenly across the row
    for (let i = 0; i < playersInRow; i++) {
      if (playerIndex >= sortedStarters.length) break;
      
      const player = sortedStarters[playerIndex];
      
      // Spread players evenly across the width
      let xPosition;
      
      if (playersInRow === 1) {
        xPosition = 50;
      } else if (playersInRow === 2) {
        xPosition = i === 0 ? 30 : 70;
      } else if (playersInRow === 3) {
        xPosition = i === 0 ? 20 : (i === 1 ? 50 : 80);
      } else if (playersInRow === 4) {
        xPosition = [15, 35, 65, 85][i];
      } else if (playersInRow === 5) {
        xPosition = [10, 27.5, 50, 72.5, 90][i];
      } else {
        // Generic spacing for any number
        const spacing = 100 / (playersInRow + 1);
        xPosition = spacing * (i + 1);
      }
      
      // Only restrict goalkeeper to their zone
      // All other players can be placed anywhere
      const clampedY = clampToZone(player.position, yPosition);
      
      const fullPlayerIndex = players.indexOf(player);
      updated[fullPlayerIndex] = { 
        ...player, 
        x: xPosition, 
        y: clampedY
      };
      
      playerIndex++;
    }
  });
  
  console.log('Players after formation (GK restricted, others free):', updated.map(p => ({ 
    name: p.name, 
    pos: p.position, 
    x: p.x, 
    y: p.y 
  })));
  
  return updated;
};

