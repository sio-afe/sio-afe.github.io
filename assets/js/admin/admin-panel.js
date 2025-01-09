import { supabase, signIn, signOut, getTeams, getMatches, updateMatch, addGoal, getMatchGoals, getTopScorers, isAdmin } from '../supabase-client.js'

// DOM Elements
const adminPanel = document.getElementById('admin-panel')
const adminLogin = document.getElementById('admin-login')
const loginForm = document.getElementById('login-form')
const logoutBtn = document.getElementById('admin-logout')

// Tab Elements
const tabBtns = document.querySelectorAll('.tab-btn')
const tabContents = document.querySelectorAll('.tab-content')

// Matches Tab Elements
const matchesList = document.querySelector('.matches-list')
const addMatchBtn = document.getElementById('add-match-btn')
const matchModal = document.getElementById('match-modal')
const matchForm = document.getElementById('match-form')
const matchDetailsModal = document.getElementById('match-details-modal')
const addGoalModal = document.getElementById('add-goal-modal')
const goalForm = document.getElementById('goal-form')

// Teams Tab Elements
const teamsList = document.querySelector('.teams-list')
const addTeamBtn = document.getElementById('add-team-btn')
const teamModal = document.getElementById('team-modal')
const teamForm = document.getElementById('team-form')

// Players Tab Elements
const playersList = document.querySelector('.players-list')
const addPlayerBtn = document.getElementById('add-player-btn')
const playerModal = document.getElementById('player-modal')
const playerForm = document.getElementById('player-form')

// Initialize Admin Panel
async function initAdminPanel() {
  const adminStatus = await isAdmin()
  if (adminStatus) {
    adminLogin.style.display = 'none'
    adminPanel.style.display = 'block'
    loadInitialData()
  } else {
    adminLogin.style.display = 'flex'
    adminPanel.style.display = 'none'
  }
}

// Authentication
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = e.target.email.value
  const password = e.target.password.value

  const { error } = await signIn(email, password)
  if (error) {
    alert('Login failed: ' + error.message)
  } else {
    initAdminPanel()
  }
})

logoutBtn.addEventListener('click', async () => {
  const { error } = await signOut()
  if (!error) {
    adminPanel.style.display = 'none'
    adminLogin.style.display = 'flex'
  }
})

// Tab Switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab
    
    tabBtns.forEach(b => b.classList.remove('active'))
    tabContents.forEach(c => c.classList.remove('active'))
    
    btn.classList.add('active')
    document.getElementById(`${tabName}-tab`).classList.add('active')
  })
})

// Matches Management
async function loadMatches(category = 'open-age') {
  const { data: matches, error } = await getMatches(category)
  if (error) {
    console.error('Error loading matches:', error)
    return
  }

  matchesList.innerHTML = matches.map(match => `
    <div class="match-item" data-id="${match.id}">
      <div class="match-teams">
        <span>${match.home_team.name}</span>
        <span class="vs">VS</span>
        <span>${match.away_team.name}</span>
      </div>
      <div class="match-info">
        <span>${new Date(match.match_date).toLocaleString()}</span>
        <span>${match.venue}</span>
        <span class="match-status ${match.status}">${match.status}</span>
      </div>
      <button class="admin-btn edit-match">Manage</button>
    </div>
  `).join('')

  // Add event listeners to edit buttons
  document.querySelectorAll('.edit-match').forEach(btn => {
    btn.addEventListener('click', () => {
      const matchId = btn.closest('.match-item').dataset.id
      openMatchDetails(matchId)
    })
  })
}

async function openMatchDetails(matchId) {
  const { data: match, error } = await getMatches('open-age') // You'll need to handle category properly
  if (error) return

  const matchData = match.find(m => m.id === matchId)
  if (!matchData) return

  // Populate match details modal
  const homeTeamName = matchDetailsModal.querySelector('.home-team .team-name')
  const awayTeamName = matchDetailsModal.querySelector('.away-team .team-name')
  const homeScore = matchDetailsModal.querySelector('.home-score')
  const awayScore = matchDetailsModal.querySelector('.away-score')

  homeTeamName.textContent = matchData.home_team.name
  awayTeamName.textContent = matchData.away_team.name
  homeScore.value = matchData.home_score
  awayScore.value = matchData.away_score

  // Load goals
  loadMatchGoals(matchId)

  // Show modal
  matchDetailsModal.classList.add('active')
}

async function loadMatchGoals(matchId) {
  const { data: goals, error } = await getMatchGoals(matchId)
  if (error) return

  const goalsList = matchDetailsModal.querySelector('.goals-list')
  goalsList.innerHTML = goals.map(goal => `
    <div class="goal-item">
      <span>${goal.scorer_name} (${goal.team.name})</span>
      ${goal.assist_name ? `<span>Assist: ${goal.assist_name}</span>` : ''}
      <span>${goal.minute}'</span>
    </div>
  `).join('')
}

// Teams Management
async function loadTeams(category = 'open-age') {
  const { data: teams, error } = await getTeams(category)
  if (error) {
    console.error('Error loading teams:', error)
    return
  }

  teamsList.innerHTML = teams.map(team => `
    <div class="team-item" data-id="${team.id}">
      <img src="${team.crest_url || '/assets/data/open-age/team-logos/default.png'}" alt="${team.name}" class="team-logo">
      <div class="team-info">
        <h4>${team.name}</h4>
        <p>Captain: ${team.captain || 'Not assigned'}</p>
        <p>Group: ${team.group_name || 'Not assigned'}</p>
      </div>
      <button class="admin-btn edit-team">Edit</button>
    </div>
  `).join('')

  // Add event listeners to edit buttons
  document.querySelectorAll('.edit-team').forEach(btn => {
    btn.addEventListener('click', () => {
      const teamId = btn.closest('.team-item').dataset.id
      openTeamEdit(teamId)
    })
  })
}

// Players Management
async function loadPlayers(teamId = null) {
  const query = supabase
    .from('players')
    .select(`
      *,
      team:teams(name)
    `)
    .order('team_id')
    
  if (teamId) {
    query.eq('team_id', teamId)
  }

  const { data: players, error } = await query
  if (error) {
    console.error('Error loading players:', error)
    return
  }

  playersList.innerHTML = players.map(player => `
    <div class="player-item" data-id="${player.id}">
      <div class="player-info">
        <h4>${player.name}</h4>
        <p>Team: ${player.team.name}</p>
        <p>Number: ${player.number || 'N/A'}</p>
        <p>Position: ${player.position || 'N/A'}</p>
      </div>
      <button class="admin-btn edit-player">Edit</button>
    </div>
  `).join('')

  // Add event listeners to edit buttons
  document.querySelectorAll('.edit-player').forEach(btn => {
    btn.addEventListener('click', () => {
      const playerId = btn.closest('.player-item').dataset.id
      openPlayerEdit(playerId)
    })
  })
}

// Initial Data Load
async function loadInitialData() {
  await Promise.all([
    loadMatches(),
    loadTeams(),
    loadPlayers()
  ])
}

// Modal Management
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active')
  })
}

document.querySelectorAll('.modal .cancel').forEach(btn => {
  btn.addEventListener('click', closeAllModals)
})

// Event Listeners for Add Buttons
addMatchBtn.addEventListener('click', () => {
  matchModal.classList.add('active')
})

addTeamBtn.addEventListener('click', () => {
  teamModal.classList.add('active')
})

addPlayerBtn.addEventListener('click', () => {
  playerModal.classList.add('active')
})

// Form Submissions
matchForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  // Handle match creation/update
})

teamForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  // Handle team creation/update
})

playerForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  // Handle player creation/update
})

// Initialize
document.addEventListener('DOMContentLoaded', initAdminPanel)

// Realtime Subscriptions
supabase
  .channel('public:matches')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
    loadMatches()
  })
  .subscribe()

supabase
  .channel('public:teams')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
    loadTeams()
  })
  .subscribe()

supabase
  .channel('public:players')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
    loadPlayers()
  })
  .subscribe() 