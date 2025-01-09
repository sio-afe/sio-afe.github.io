// Import required dependencies
import { supabaseClient } from '../supabase-client.js';

// Function to create a match date with specific time
function createMatchDateTime(date, timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const matchDate = new Date(date);
    matchDate.setHours(hours, minutes, 0, 0);
    return matchDate;
}

// Function to calculate team standings in a group
async function calculateGroupStandings(category, groupName) {
    try {
        const { data: matches, error } = await supabaseClient
            .from('matches')
            .select(`
                id,
                home_team_id,
                away_team_id,
                home_score,
                away_score,
                status,
                match_type
            `)
            .eq('category', category)
            .eq('match_type', 'group')
            .eq('status', 'completed');

        if (error) throw error;

        // Create a map to store team statistics
        const teamStats = new Map();

        // Calculate points and goal differences for each team
        matches.forEach(match => {
            const homeTeamId = match.home_team_id;
            const awayTeamId = match.away_team_id;
            const homeScore = match.home_score || 0;
            const awayScore = match.away_score || 0;

            // Initialize team stats if not exists
            if (!teamStats.has(homeTeamId)) {
                teamStats.set(homeTeamId, { points: 0, goalDiff: 0, goalsFor: 0, goalsAgainst: 0, matches: 0 });
            }
            if (!teamStats.has(awayTeamId)) {
                teamStats.set(awayTeamId, { points: 0, goalDiff: 0, goalsFor: 0, goalsAgainst: 0, matches: 0 });
            }

            // Update home team stats
            const homeStats = teamStats.get(homeTeamId);
            homeStats.matches++;
            homeStats.goalsFor += homeScore;
            homeStats.goalsAgainst += awayScore;
            homeStats.goalDiff = homeStats.goalsFor - homeStats.goalsAgainst;

            // Update away team stats
            const awayStats = teamStats.get(awayTeamId);
            awayStats.matches++;
            awayStats.goalsFor += awayScore;
            awayStats.goalsAgainst += homeScore;
            awayStats.goalDiff = awayStats.goalsFor - awayStats.goalsAgainst;

            // Assign points based on match result
            if (homeScore > awayScore) {
                homeStats.points += 3;
            } else if (awayScore > homeScore) {
                awayStats.points += 3;
            } else {
                homeStats.points += 1;
                awayStats.points += 1;
            }
        });

        // Convert Map to array and sort teams
        const standings = Array.from(teamStats.entries()).map(([teamId, stats]) => ({
            teamId,
            ...stats
        }));

        // Sort teams by points, then goal difference, then goals scored
        standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            return b.goalsFor - a.goalsFor;
        });

        return standings;
    } catch (error) {
        console.error('Error calculating group standings:', error);
        throw error;
    }
}

// Function to determine teams that advance to knockout stages
async function determineKnockoutTeams(category) {
    try {
        // Get tournament date from any existing match
        const { data: matchDate } = await supabaseClient
            .from('matches')
            .select('match_date')
            .eq('category', category)
            .limit(1)
            .single();

        if (!matchDate) {
            throw new Error('No match date found for tournament');
        }

        // Get group standings with group information
        const { data: teams, error } = await supabaseClient
            .from('teams')
            .select(`
                id,
                name,
                group_name,
                points,
                goals_for,
                goals_against
            `)
            .eq('category', category);

        if (error) throw error;

        // Group teams by their groups
        const groupedTeams = teams.reduce((acc, team) => {
            if (!acc[team.group_name]) {
                acc[team.group_name] = [];
            }
            acc[team.group_name].push(team);
            return acc;
        }, {});

        // Sort teams within each group
        Object.keys(groupedTeams).forEach(group => {
            groupedTeams[group].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const bGD = b.goals_for - b.goals_against;
                const aGD = a.goals_for - a.goals_against;
                if (bGD !== aGD) return bGD - aGD;
                return b.goals_for - a.goals_for;
            });
        });

        // Get winners and runners-up from each group
        const groupA = groupedTeams['A'] || [];
        const groupB = groupedTeams['B'] || [];
        const groupC = groupedTeams['C'] || [];
        const groupD = groupedTeams['D'] || [];

        const advancingTeams = {
            groupAWinner: groupA[0]?.id,
            groupARunnerUp: groupA[1]?.id,
            groupBWinner: groupB[0]?.id,
            groupBRunnerUp: groupB[1]?.id,
            groupCWinner: groupC[0]?.id,
            groupCRunnerUp: groupC[1]?.id,
            groupDWinner: groupD[0]?.id,
            groupDRunnerUp: groupD[1]?.id
        };

        // Update knockout stage matches
        await updateKnockoutMatches(category, advancingTeams, matchDate.match_date);

        return advancingTeams;
    } catch (error) {
        console.error('Error determining knockout teams:', error);
        throw error;
    }
}

// Function to update knockout stage matches
async function updateKnockoutMatches(category, advancingTeams, tournamentDate) {
    try {
        // Create quarter-final matches according to the specified format
        const quarterFinalMatches = [
            {
                // QF1: Winner of Group A vs Runner-up of Group B
                home_team_id: advancingTeams.groupAWinner,
                away_team_id: advancingTeams.groupBRunnerUp,
                match_number: 1,
                scheduled_time: '14:00',
                match_date: createMatchDateTime(tournamentDate, '14:00')
            },
            {
                // QF2: Winner of Group B vs Runner-up of Group A
                home_team_id: advancingTeams.groupBWinner,
                away_team_id: advancingTeams.groupARunnerUp,
                match_number: 2,
                scheduled_time: '14:30',
                match_date: createMatchDateTime(tournamentDate, '14:30')
            },
            {
                // QF3: Winner of Group C vs Runner-up of Group D
                home_team_id: advancingTeams.groupCWinner,
                away_team_id: advancingTeams.groupDRunnerUp,
                match_number: 3,
                scheduled_time: '15:00',
                match_date: createMatchDateTime(tournamentDate, '15:00')
            },
            {
                // QF4: Winner of Group D vs Runner-up of Group C
                home_team_id: advancingTeams.groupDWinner,
                away_team_id: advancingTeams.groupCRunnerUp,
                match_number: 4,
                scheduled_time: '15:30',
                match_date: createMatchDateTime(tournamentDate, '15:30')
            }
        ];

        // Create or update quarter-final matches
        for (const match of quarterFinalMatches) {
            await supabaseClient
                .from('matches')
                .upsert({
                    category,
                    match_type: 'quarter-final',
                    home_team_id: match.home_team_id,
                    away_team_id: match.away_team_id,
                    status: 'scheduled',
                    match_number: match.match_number,
                    scheduled_time: match.scheduled_time,
                    match_date: match.match_date,
                    venue: 'Main Ground' // You might want to make this configurable
                });
        }
    } catch (error) {
        console.error('Error updating knockout matches:', error);
        throw error;
    }
}

// Function to determine semi-final teams based on quarter-final results
async function determineSemiFinalTeams(category) {
    try {
        const { data: quarterFinals, error } = await supabaseClient
            .from('matches')
            .select('*')
            .eq('category', category)
            .eq('match_type', 'quarter-final')
            .eq('status', 'completed')
            .order('match_number');

        if (error) throw error;

        const winners = quarterFinals.map(match => {
            const homeScore = match.home_score || 0;
            const awayScore = match.away_score || 0;
            return {
                teamId: homeScore > awayScore ? match.home_team_id : match.away_team_id,
                matchNumber: match.match_number
            };
        });

        // Create semi-final matches if all quarter-finals are completed
        if (winners.length === 4) {
            const tournamentDate = quarterFinals[0].match_date;

            const semiFinalMatches = [
                {
                    // SF1: Winner of QF1 vs Winner of QF3
                    home_team_id: winners[0].teamId, // QF1 winner
                    away_team_id: winners[2].teamId, // QF3 winner
                    match_number: 1,
                    scheduled_time: '16:45',
                    match_date: createMatchDateTime(tournamentDate, '16:45')
                },
                {
                    // SF2: Winner of QF2 vs Winner of QF4
                    home_team_id: winners[1].teamId, // QF2 winner
                    away_team_id: winners[3].teamId, // QF4 winner
                    match_number: 2,
                    scheduled_time: '17:15',
                    match_date: createMatchDateTime(tournamentDate, '17:15')
                }
            ];

            // Create or update semi-final matches
            for (const match of semiFinalMatches) {
                await supabaseClient
                    .from('matches')
                    .upsert({
                        category,
                        match_type: 'semi-final',
                        home_team_id: match.home_team_id,
                        away_team_id: match.away_team_id,
                        status: 'scheduled',
                        match_number: match.match_number,
                        scheduled_time: match.scheduled_time,
                        match_date: match.match_date,
                        venue: 'Main Ground'
                    });
            }
        }
    } catch (error) {
        console.error('Error determining semi-final teams:', error);
        throw error;
    }
}

// Function to determine final teams based on semi-final results
async function determineFinalTeams(category) {
    try {
        const { data: semiFinals, error } = await supabaseClient
            .from('matches')
            .select('*')
            .eq('category', category)
            .eq('match_type', 'semi-final')
            .eq('status', 'completed')
            .order('match_number');

        if (error) throw error;

        const winners = semiFinals.map(match => {
            const homeScore = match.home_score || 0;
            const awayScore = match.away_score || 0;
            return homeScore > awayScore ? match.home_team_id : match.away_team_id;
        });

        // Create final match if both semi-finals are completed
        if (winners.length === 2) {
            const tournamentDate = semiFinals[0].match_date;
            
            await supabaseClient
                .from('matches')
                .upsert({
                    category,
                    match_type: 'final',
                    home_team_id: winners[0],
                    away_team_id: winners[1],
                    status: 'scheduled',
                    match_number: 1,
                    scheduled_time: '17:45',
                    match_date: createMatchDateTime(tournamentDate, '17:45'),
                    venue: 'Main Ground'
                });
        }
    } catch (error) {
        console.error('Error determining final teams:', error);
        throw error;
    }
}

// Function to handle automatic progression after match completion
async function handleMatchCompletion(match) {
    try {
        const { category, match_type } = match;

        switch (match_type) {
            case 'group':
                // Check if all group matches are completed
                const { data: groupMatches, error: groupError } = await supabaseClient
                    .from('matches')
                    .select('status')
                    .eq('category', category)
                    .eq('match_type', 'group');

                if (groupError) throw groupError;

                const allGroupMatchesCompleted = groupMatches.every(m => m.status === 'completed');
                if (allGroupMatchesCompleted) {
                    await determineKnockoutTeams(category);
                }
                break;

            case 'quarter-final':
                // Check if all quarter-finals are completed
                const { data: quarterFinals, error: qfError } = await supabaseClient
                    .from('matches')
                    .select('status')
                    .eq('category', category)
                    .eq('match_type', 'quarter-final');

                if (qfError) throw qfError;

                const allQuarterFinalsCompleted = quarterFinals.every(m => m.status === 'completed');
                if (allQuarterFinalsCompleted) {
                    await determineSemiFinalTeams(category);
                }
                break;

            case 'semi-final':
                // Check if all semi-finals are completed
                const { data: semiFinals, error: sfError } = await supabaseClient
                    .from('matches')
                    .select('status')
                    .eq('category', category)
                    .eq('match_type', 'semi-final');

                if (sfError) throw sfError;

                const allSemiFinalsCompleted = semiFinals.every(m => m.status === 'completed');
                if (allSemiFinalsCompleted) {
                    await determineFinalTeams(category);
                }
                break;
        }
    } catch (error) {
        console.error('Error handling match completion:', error);
        throw error;
    }
}

export {
    calculateGroupStandings,
    determineKnockoutTeams,
    determineSemiFinalTeams,
    determineFinalTeams,
    handleMatchCompletion
}; 