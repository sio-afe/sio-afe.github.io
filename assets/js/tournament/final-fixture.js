// Import only what we need
import { supabaseClient, getTeams, getMatches, getTopScorers } from '../supabase-client.js'

// Wait for DOM and Supabase initialization
async function waitForInit() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.supabaseClient) {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// Get the tournament category from the page data attribute
const tournamentContainer = document.querySelector('.tournament-container')
const category = tournamentContainer?.dataset.category

// Default team logo path
const DEFAULT_TEAM_LOGO = '/assets/img/default-team-logo.png'

// Load and display tournament data
async function loadTournamentData() {
  if (!category) {
    console.error('Tournament category not found')
    return
  }

  try {
    await Promise.all([
      loadTeams(),
      loadMatches(),
      loadTopScorers()
    ])
  } catch (error) {
    console.error('Error loading tournament data:', error)
  }
}

// Load teams and update league table
async function loadTeams() {
  try {
    const { data: teams, error } = await getTeams(category)
    if (error) throw error

    // Sort teams by points, then goal difference, then goals scored
    teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const bGD = b.goals_for - b.goals_against
      const aGD = a.goals_for - a.goals_against
      if (bGD !== aGD) return bGD - aGD
      return b.goals_for - a.goals_for
    })

    // Update league table
    const tableBody = document.getElementById('table-body')
    if (!tableBody) return

    tableBody.innerHTML = teams.map((team, index) => `
      <tr>
        <td>${index + 1}</td>
        <td class="team-name-cell">
          <div class="team-info">
            <img src="${team.crest_url || DEFAULT_TEAM_LOGO}" 
                 alt="${team.name}" class="team-crest" loading="lazy">
            ${team.name}
          </div>
        </td>
        <td>${team.group_name || '-'}</td>
        <td>${team.matches_played || 0}</td>
        <td>${team.matches_won || 0}</td>
        <td>${team.matches_drawn || 0}</td>
        <td>${team.matches_lost || 0}</td>
        <td>${team.points || 0}</td>
        <td>${(team.goals_for || 0) - (team.goals_against || 0)}</td>
        <td>${team.goals_for || 0}</td>
        <td>${team.goals_against || 0}</td>
      </tr>
    `).join('')

    // Also update the bracket view to use the same default logo
    const bracketMatches = document.querySelectorAll('.bracket-match')
    bracketMatches.forEach(match => {
      const images = match.querySelectorAll('img[src*="default.png"]')
      images.forEach(img => {
        if (img.src.includes('default.png')) {
          img.src = DEFAULT_TEAM_LOGO
        }
      })
    })
  } catch (error) {
    console.error('Error loading teams:', error)
  }
}

// Load matches and update fixtures
async function loadMatches() {
  try {
    const { data: matches, error } = await getMatches(category)
    if (error) throw error

    // Update fixtures list
    const fixturesList = document.getElementById('fixtures-list')
    if (!fixturesList) return

    fixturesList.innerHTML = matches.map(match => {
      const matchDate = new Date(match.match_date)
      const formattedDate = matchDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      const formattedTime = matchDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })

      return `
        <div class="fixture" data-match-id="${match.id}">
          <div class="fixture-teams">
            <div class="team home">
              <img src="${match.home_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}" 
                   alt="${match.home_team?.name}" class="team-crest" loading="lazy">
              <span class="team-name">${match.home_team?.name || 'TBD'}</span>
              <span class="score">${match.home_score || 0}</span>
            </div>
            <div class="vs">VS</div>
            <div class="team away">
              <img src="${match.away_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}" 
                   alt="${match.away_team?.name}" class="team-crest" loading="lazy">
              <span class="team-name">${match.away_team?.name || 'TBD'}</span>
              <span class="score">${match.away_score || 0}</span>
            </div>
          </div>
          <div class="fixture-meta">
            <div class="meta-row">
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span class="date">${formattedDate}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span class="time">${formattedTime}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span class="venue">${match.venue || 'TBD'}</span>
              </div>
            </div>
            ${match.status !== 'scheduled' ? 
              `<span class="match-status ${match.status.toLowerCase()}">${match.status}</span>` : ''}
          </div>
        </div>
      `
    }).join('')

    // Update bracket view
    updateBracketView(matches)
  } catch (error) {
    console.error('Error loading matches:', error)
  }
}

// Load top scorers
async function loadTopScorers() {
  try {
    const { data: scorers, error } = await getTopScorers(category)
    if (error) throw error

    // Update top scorers list if it exists
    const scorersList = document.querySelector('.top-scorers-list')
    if (!scorersList) return

    scorersList.innerHTML = scorers.map(scorer => `
      <div class="scorer-item">
        <div class="scorer-info">
          <span class="scorer-name">${scorer.player_name}</span>
          <span class="scorer-team">${scorer.team_name}</span>
        </div>
        <div class="scorer-goals">${scorer.goals}</div>
      </div>
    `).join('')
  } catch (error) {
    console.error('Error loading top scorers:', error)
  }
}

// Update the bracket view with match data
function updateBracketView(matches) {
  try {
    const bracketMatches = {
      'quarter-final': document.querySelector('.quarter-finals .bracket-matches'),
      'semi-final': document.querySelector('.semi-finals .bracket-matches'),
      'final': document.querySelector('.finals .bracket-matches')
    }

    // Group matches by type
    const matchesByType = matches.reduce((acc, match) => {
      if (match.match_type && match.match_type !== 'group') {
        if (!acc[match.match_type]) {
          acc[match.match_type] = []
        }
        acc[match.match_type].push(match)
      }
      return acc
    }, {})

    // Update each bracket section
    Object.entries(matchesByType).forEach(([type, typeMatches]) => {
      const bracketSection = bracketMatches[type]
      if (bracketSection) {
        bracketSection.innerHTML = typeMatches.map(match => `
          <div class="bracket-match">
            <div class="team-bracket">
              <img src="${match.home_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}" 
                   alt="${match.home_team?.name}" class="team-crest" loading="lazy">
              <span class="team-name">${match.home_team?.name || 'TBD'}</span>
              <span class="team-score">${match.home_score || 0}</span>
            </div>
            <div class="team-bracket">
              <img src="${match.away_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}" 
                   alt="${match.away_team?.name}" class="team-crest" loading="lazy">
              <span class="team-name">${match.away_team?.name || 'TBD'}</span>
              <span class="team-score">${match.away_score || 0}</span>
            </div>
          </div>
        `).join('')
      }
    })
  } catch (error) {
    console.error('Error updating bracket view:', error)
  }
}

// Initialize
async function init() {
    try {
        // Wait for Supabase to initialize
        await waitForInit();
        
        if (!category) {
            console.error('Tournament category not found');
            return;
        }

        await loadTournamentData();

        // Set up real-time subscriptions
        const matchesChannel = supabaseClient
            .channel('public:matches')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'matches' }, 
                () => loadMatches()
            )
            .subscribe();

        const teamsChannel = supabaseClient
            .channel('public:teams')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'teams' }, 
                () => loadTeams()
            )
            .subscribe();

        // Clean up subscriptions
        window.addEventListener('beforeunload', () => {
            matchesChannel.unsubscribe();
            teamsChannel.unsubscribe();
        });
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init) 