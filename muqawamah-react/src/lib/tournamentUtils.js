/**
 * Tournament Utilities
 * Handles group standings, tiebreakers, and knockout bracket configuration
 */

import { supabaseClient } from './supabaseClient';

/**
 * Tiebreaker rules (in order of priority):
 * 1. Points (higher is better)
 * 2. Goal Difference (higher is better)
 * 3. Goals For (higher is better)
 * 4. Head-to-Head result (if applicable)
 * 5. Yellow Cards (fewer is better)
 * 6. Red Cards (fewer is better)
 * 7. Alphabetical (final tiebreaker)
 */

/**
 * Compare two teams for standings sorting
 * Returns negative if teamA ranks higher, positive if teamB ranks higher
 */
export function compareTeams(teamA, teamB, headToHeadResults = null) {
  // 1. Points (higher is better)
  if (teamA.points !== teamB.points) {
    return teamB.points - teamA.points;
  }

  // 2. Goal Difference (higher is better)
  const gdA = (teamA.goals_for || 0) - (teamA.goals_against || 0);
  const gdB = (teamB.goals_for || 0) - (teamB.goals_against || 0);
  if (gdA !== gdB) {
    return gdB - gdA;
  }

  // 3. Goals For (higher is better)
  if ((teamA.goals_for || 0) !== (teamB.goals_for || 0)) {
    return (teamB.goals_for || 0) - (teamA.goals_for || 0);
  }

  // 4. Head-to-Head (if available)
  if (headToHeadResults) {
    const h2hKey = `${teamA.id}_${teamB.id}`;
    const h2hKeyReverse = `${teamB.id}_${teamA.id}`;
    
    if (headToHeadResults[h2hKey]) {
      const result = headToHeadResults[h2hKey];
      if (result.winner === teamA.id) return -1;
      if (result.winner === teamB.id) return 1;
    } else if (headToHeadResults[h2hKeyReverse]) {
      const result = headToHeadResults[h2hKeyReverse];
      if (result.winner === teamA.id) return -1;
      if (result.winner === teamB.id) return 1;
    }
  }

  // 5. Yellow Cards (fewer is better)
  const yellowA = teamA.yellow_cards || 0;
  const yellowB = teamB.yellow_cards || 0;
  if (yellowA !== yellowB) {
    return yellowA - yellowB; // Lower is better
  }

  // 6. Red Cards (fewer is better)
  const redA = teamA.red_cards || 0;
  const redB = teamB.red_cards || 0;
  if (redA !== redB) {
    return redA - redB; // Lower is better
  }

  // 7. Alphabetical (final tiebreaker)
  return (teamA.name || '').localeCompare(teamB.name || '');
}

/**
 * Calculate team cards from the cards table
 */
export async function calculateTeamCards(teamId, category) {
  try {
    const { data: cards, error } = await supabaseClient
      .from('cards')
      .select(`
        card_type,
        match:matches!cards_match_id_fkey(match_type, category)
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    // Only count cards from group stage matches
    const groupCards = (cards || []).filter(
      c => c.match?.match_type === 'group' && c.match?.category === category
    );

    return {
      yellow_cards: groupCards.filter(c => c.card_type === 'yellow').length,
      red_cards: groupCards.filter(c => c.card_type === 'red').length
    };
  } catch (error) {
    console.error('Error calculating team cards:', error);
    return { yellow_cards: 0, red_cards: 0 };
  }
}

/**
 * Get head-to-head results between teams
 */
export async function getHeadToHeadResults(teamIds, category) {
  try {
    const { data: matches, error } = await supabaseClient
      .from('matches')
      .select('home_team_id, away_team_id, home_score, away_score, status')
      .eq('category', category)
      .eq('match_type', 'group')
      .eq('status', 'completed')
      .or(
        teamIds.map(id => `home_team_id.eq.${id}`).join(',') + ',' +
        teamIds.map(id => `away_team_id.eq.${id}`).join(',')
      );

    if (error) throw error;

    const results = {};
    
    (matches || []).forEach(match => {
      // Only include matches between teams in our list
      if (teamIds.includes(match.home_team_id) && teamIds.includes(match.away_team_id)) {
        const key = `${match.home_team_id}_${match.away_team_id}`;
        let winner = null;
        
        if (match.home_score > match.away_score) {
          winner = match.home_team_id;
        } else if (match.away_score > match.home_score) {
          winner = match.away_team_id;
        }
        
        results[key] = {
          home_score: match.home_score,
          away_score: match.away_score,
          winner
        };
      }
    });

    return results;
  } catch (error) {
    console.error('Error getting head-to-head results:', error);
    return {};
  }
}

/**
 * Get sorted group standings with all tiebreakers applied
 */
export async function getGroupStandings(category, group = null) {
  try {
    // Fetch teams
    let query = supabaseClient
      .from('teams')
      .select('*')
      .eq('category', category);

    if (group) {
      query = query.eq('tournament_group', group);
    }

    const { data: teams, error: teamsError } = await query;
    if (teamsError) throw teamsError;

    // Calculate cards for each team
    const teamsWithCards = await Promise.all(
      (teams || []).map(async (team) => {
        const cards = await calculateTeamCards(team.id, category);
        return {
          ...team,
          yellow_cards: team.yellow_cards || cards.yellow_cards,
          red_cards: team.red_cards || cards.red_cards,
          goal_difference: (team.goals_for || 0) - (team.goals_against || 0)
        };
      })
    );

    // Get head-to-head results
    const teamIds = teamsWithCards.map(t => t.id);
    const headToHead = await getHeadToHeadResults(teamIds, category);

    // Group teams by tournament_group
    const groupedTeams = {};
    teamsWithCards.forEach(team => {
      const grp = team.tournament_group || 'Ungrouped';
      if (!groupedTeams[grp]) groupedTeams[grp] = [];
      groupedTeams[grp].push(team);
    });

    // Sort each group
    Object.keys(groupedTeams).forEach(grp => {
      groupedTeams[grp].sort((a, b) => compareTeams(a, b, headToHead));
      // Add position within group
      groupedTeams[grp] = groupedTeams[grp].map((team, idx) => ({
        ...team,
        group_position: idx + 1
      }));
    });

    return groupedTeams;
  } catch (error) {
    console.error('Error getting group standings:', error);
    return {};
  }
}

/**
 * Get flat standings (all teams sorted together)
 */
export async function getFlatStandings(category) {
  const groupedStandings = await getGroupStandings(category);
  
  // Flatten and sort all teams together
  const allTeams = Object.values(groupedStandings).flat();
  
  // Get head-to-head for all teams
  const teamIds = allTeams.map(t => t.id);
  const headToHead = await getHeadToHeadResults(teamIds, category);
  
  // Sort all teams
  allTeams.sort((a, b) => compareTeams(a, b, headToHead));
  
  // Add overall position
  return allTeams.map((team, idx) => ({
    ...team,
    position: idx + 1
  }));
}

/**
 * Get tournament settings
 */
export async function getTournamentSettings(category) {
  try {
    const { data, error } = await supabaseClient
      .from('tournament_settings')
      .select('*')
      .eq('category', category)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return data || {
      total_groups: 4,
      teams_per_group: 3,
      teams_qualifying_per_group: 2,
      knockout_format: 'quarter-final',
      group_stage_complete: false
    };
  } catch (error) {
    console.error('Error getting tournament settings:', error);
    return {
      total_groups: 4,
      teams_per_group: 3,
      teams_qualifying_per_group: 2,
      knockout_format: 'quarter-final',
      group_stage_complete: false
    };
  }
}

/**
 * Get knockout bracket
 */
export async function getKnockoutBracket(category) {
  try {
    const { data, error } = await supabaseClient
      .from('knockout_bracket')
      .select(`
        *,
        home_team:teams!knockout_bracket_home_team_id_fkey(id, name, crest_url),
        away_team:teams!knockout_bracket_away_team_id_fkey(id, name, crest_url),
        match:matches!knockout_bracket_match_id_fkey(
          id, home_score, away_score, status, match_date, scheduled_time
        )
      `)
      .eq('category', category)
      .order('round')
      .order('match_number');

    if (error) throw error;
    
    // Group by round
    const bracket = {
      'quarter-final': [],
      'semi-final': [],
      'third-place': [],
      'final': []
    };
    
    (data || []).forEach(slot => {
      if (bracket[slot.round]) {
        bracket[slot.round].push(slot);
      }
    });

    return bracket;
  } catch (error) {
    console.error('Error getting knockout bracket:', error);
    return {
      'quarter-final': [],
      'semi-final': [],
      'third-place': [],
      'final': []
    };
  }
}

/**
 * Standard bracket configuration for 4 groups, top 2 qualifying
 * QF1: A1 vs B2
 * QF2: B1 vs A2
 * QF3: C1 vs D2
 * QF4: D1 vs C2
 */
export const STANDARD_BRACKET = {
  quarterFinals: [
    { match: 1, home: 'A1', away: 'B2' },
    { match: 2, home: 'B1', away: 'A2' },
    { match: 3, home: 'C1', away: 'D2' },
    { match: 4, home: 'D1', away: 'C2' }
  ],
  semiFinals: [
    { match: 1, home: 'QF1', away: 'QF3' },  // Winner QF1 vs Winner QF3
    { match: 2, home: 'QF2', away: 'QF4' }   // Winner QF2 vs Winner QF4
  ],
  final: { home: 'SF1', away: 'SF2' },
  thirdPlace: { home: 'SF1L', away: 'SF2L' }  // Losers of semi-finals
};

/**
 * Check if all group stage matches are complete
 */
export async function isGroupStageComplete(category) {
  try {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('id, status')
      .eq('category', category)
      .eq('match_type', 'group');

    if (error) throw error;

    const allMatches = data || [];
    const completedMatches = allMatches.filter(m => m.status === 'completed');
    
    return {
      total: allMatches.length,
      completed: completedMatches.length,
      isComplete: allMatches.length > 0 && completedMatches.length === allMatches.length
    };
  } catch (error) {
    console.error('Error checking group stage:', error);
    return { total: 0, completed: 0, isComplete: false };
  }
}

/**
 * Update a team's match stats after knockout match
 * (Knockout matches don't affect league standings, but we track them separately)
 */
export async function updateKnockoutBracketAfterMatch(matchId) {
  try {
    // Get the match details
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;
    if (match.status !== 'completed') return;

    // Determine winner
    const winnerId = match.home_score > match.away_score 
      ? match.home_team_id 
      : match.away_team_id;
    const loserId = match.home_score > match.away_score 
      ? match.away_team_id 
      : match.home_team_id;

    // Find the bracket slot for this match
    const { data: bracketSlot, error: bracketError } = await supabaseClient
      .from('knockout_bracket')
      .select('*')
      .eq('match_id', matchId)
      .single();

    if (bracketError || !bracketSlot) return;

    // Determine which slots should be updated with the winner/loser
    const roundMap = {
      'quarter-final': { 
        winner: `QF${bracketSlot.match_number}`, 
        loser: `QF${bracketSlot.match_number}L` 
      },
      'semi-final': { 
        winner: `SF${bracketSlot.match_number}`, 
        loser: `SF${bracketSlot.match_number}L` 
      }
    };

    const slotInfo = roundMap[bracketSlot.round];
    if (!slotInfo) return;

    // Update next round slots with winner
    await supabaseClient
      .from('knockout_bracket')
      .update({ home_team_id: winnerId })
      .eq('category', match.category)
      .eq('home_slot', slotInfo.winner);

    await supabaseClient
      .from('knockout_bracket')
      .update({ away_team_id: winnerId })
      .eq('category', match.category)
      .eq('away_slot', slotInfo.winner);

    // Update third-place match with loser (for semi-finals)
    if (bracketSlot.round === 'semi-final') {
      await supabaseClient
        .from('knockout_bracket')
        .update({ home_team_id: loserId })
        .eq('category', match.category)
        .eq('home_slot', slotInfo.loser);

      await supabaseClient
        .from('knockout_bracket')
        .update({ away_team_id: loserId })
        .eq('category', match.category)
        .eq('away_slot', slotInfo.loser);
    }

    console.log(`Updated bracket after ${bracketSlot.round} match ${bracketSlot.match_number}`);
  } catch (error) {
    console.error('Error updating knockout bracket:', error);
  }
}

