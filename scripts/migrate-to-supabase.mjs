import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to read JSON file
function readJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time) {
    const [timeStr, period] = time.split(' ');
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Function to migrate teams
async function migrateTeams() {
    console.log('Migrating teams...')
    
    // Read teams data
    const u17Teams = readJsonFile('assets/data/u17/teams.json')
    const openAgeTeams = readJsonFile('assets/data/open-age/teams.json')

    // Helper function to get crest URL
    function getCrestUrl(team, category) {
        const defaultLogo = '/assets/data/open-age/team-logos/default.png'
        
        if (!team.crest) return defaultLogo
        if (team.crest.startsWith('http')) return team.crest
        if (team.crest.includes('.jpg') || team.crest.includes('.jpeg') || team.crest.includes('.png')) {
            return `/assets/data/${category}/team-logos/${team.crest}`
        }
        return defaultLogo
    }

    // Delete existing tournament data (but keep admin_users)
    console.log('Wiping tournament tables...')
    try {
        // Delete in correct order to maintain referential integrity
        const { error: goalsError } = await supabase
            .from('goals')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000')

        if (goalsError) {
            console.error('Error deleting goals:', goalsError)
            return null
        }

        const { error: matchesError } = await supabase
            .from('matches')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000')

        if (matchesError) {
            console.error('Error deleting matches:', matchesError)
            return null
        }

        const { error: teamsError } = await supabase
            .from('teams')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000')

        if (teamsError) {
            console.error('Error deleting teams:', teamsError)
            return null
        }

        console.log('Successfully wiped tournament tables')
    } catch (error) {
        console.error('Error wiping tables:', error)
        return null
    }

    // Prepare teams data for insertion
    const teamsToInsert = [
        ...u17Teams.teams.map(team => ({
            name: team.name,
            crest_url: getCrestUrl(team, 'u17'),
            captain: team.captain || null,
            played: team.played || 0,
            won: team.won || 0,
            drawn: team.drawn || 0,
            lost: team.lost || 0,
            goals_for: team.gf || 0,
            goals_against: team.ga || 0,
            points: ((team.won || 0) * 3) + (team.drawn || 0),
            group_name: team.group,
            category: 'u17'
        })),
        ...openAgeTeams.teams.map(team => ({
            name: team.name,
            crest_url: getCrestUrl(team, 'open-age'),
            captain: team.captain || null,
            played: team.played || 0,
            won: team.won || 0,
            drawn: team.drawn || 0,
            lost: team.lost || 0,
            goals_for: team.gf || 0,
            goals_against: team.ga || 0,
            points: ((team.won || 0) * 3) + (team.drawn || 0),
            group_name: team.group,
            category: 'open-age'
        }))
    ]

    // Insert all teams at once
    console.log('Inserting new teams...')
    const { data: insertedTeams, error: insertError } = await supabase
        .from('teams')
        .insert(teamsToInsert)
        .select()

    if (insertError) {
        console.error('Error inserting teams:', insertError)
        return null
    }

    console.log(`Successfully inserted ${insertedTeams.length} teams`)
    return insertedTeams
}

// Function to migrate matches
async function migrateMatches(teams) {
    console.log('Migrating matches...')
    
    // Read fixtures data
    const u17Fixtures = readJsonFile('assets/data/u17/fixtures.json')
    const openAgeFixtures = readJsonFile('assets/data/open-age/fixtures.json')

    // Create a map of team names to IDs
    const teamMap = teams.reduce((acc, team) => {
        acc[`${team.name}-${team.category}`] = team.id
        return acc
    }, {})

    // Helper function to convert match type
    function getMatchType(stage) {
        if (stage.includes('Group')) return 'group'
        if (stage.includes('Quarter')) return 'quarter-final'
        if (stage.includes('Semi')) return 'semi-final'
        if (stage.includes('Third')) return 'third-place'
        if (stage.includes('Final') && !stage.includes('Quarter') && !stage.includes('Semi')) return 'final'
        return 'group'
    }

    // Helper function to get team ID
    function getTeamId(teamName, category) {
        return teamName !== 'TBD' ? teamMap[`${teamName}-${category}`] : null
    }

    // Prepare matches data for insertion
    const matchesToInsert = [
        ...u17Fixtures.fixtures.map(fixture => ({
            home_team_id: getTeamId(fixture.homeTeam, 'u17'),
            away_team_id: getTeamId(fixture.awayTeam, 'u17'),
            home_score: fixture.homeScore || 0,
            away_score: fixture.awayScore || 0,
            match_date: `${fixture.date}T${convertTo24Hour(fixture.time)}:00Z`,
            venue: fixture.venue,
            status: fixture.status === 'upcoming' ? 'scheduled' : fixture.status,
            category: 'u17',
            match_type: getMatchType(fixture.stage)
        })),
        ...openAgeFixtures.fixtures.map(fixture => ({
            home_team_id: getTeamId(fixture.homeTeam, 'open-age'),
            away_team_id: getTeamId(fixture.awayTeam, 'open-age'),
            home_score: fixture.homeScore || 0,
            away_score: fixture.awayScore || 0,
            match_date: `${fixture.date}T${convertTo24Hour(fixture.time)}:00Z`,
            venue: fixture.venue,
            status: fixture.status === 'upcoming' ? 'scheduled' : fixture.status,
            category: 'open-age',
            match_type: getMatchType(fixture.stage)
        }))
    ]

    // Insert matches
    const { data: insertedMatches, error } = await supabase
        .from('matches')
        .insert(matchesToInsert)
        .select()

    if (error) {
        console.error('Error inserting matches:', error)
        return
    }

    console.log(`Inserted ${insertedMatches.length} matches`)
}

// Main migration function
async function migrate() {
    try {
        console.log('Starting migration...')
        const teams = await migrateTeams()
        if (teams) {
            await migrateMatches(teams)
        }
        console.log('Migration completed successfully!')
    } catch (error) {
        console.error('Migration failed:', error)
    }
}

// Run migration
migrate() 