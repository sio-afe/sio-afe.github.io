// Import only what we need
import { getClient, getTeams, getMatches, getTopScorers } from '../supabase-client.js'
import { 
    startMatch, 
    completeMatch, 
    addMatchEvent as addMatchEventToDb, 
    getMatchDetails, 
    getMatchEvents, 
    subscribeToMatch, 
    subscribeToMatchEvents 
} from './match-api.js'
import { handleMatchCompletion } from './team-progression.js'

// Wait for DOM and Supabase initialization
async function waitForInit() {
    try {
        await window.waitForSupabase();
        const client = await getClient();
        window.supabaseClient = client;
        return client;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        throw error;
    }
}

// Get the tournament category from the page data attribute
const tournamentContainer = document.querySelector('.tournament-container')
const category = tournamentContainer?.dataset.category

// Default team logo path
const DEFAULT_TEAM_LOGO = '/assets/data/open-age/team-logos/default.png'

// Current match state
let currentMatch = null;

// Module-level variables for event modal
let eventModal = null;
let eventForm = null;

// Function to show notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// User view functionality
async function initializeUserView() {
    const userView = document.querySelector('.user-view');
    if (!userView) return;

    try {
        // Try to find an in-progress match first
        const { data: match, error } = await supabaseClient
            .from('matches')
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .eq('status', 'in_progress')
            .eq('category', category)
            .single();

        if (match) {
            currentMatch = match;
            updateMatchDisplay(match);
            updateMatchStats();
            setupMatchSubscriptions(match.id);
        } else {
            // If no in-progress match, get the latest completed match
            const { data: completedMatch, error: completedError } = await supabaseClient
                .from('matches')
                .select(`
                    *,
                    home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                    away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
                `)
                .eq('status', 'completed')
                .eq('category', category)
                .order('match_date', { ascending: false })
                .limit(1)
                .single();

            if (!completedError && completedMatch) {
                currentMatch = completedMatch;
                updateMatchDisplay(completedMatch);
                updateMatchStats();
                showMatchCompletionCelebration();
                }
            }
        } catch (error) {
        console.error('Error initializing user view:', error);
        showNotification('Error loading match data', 'error');
    }
}

// Admin view functionality
async function initializeAdminView() {
    const adminView = document.querySelector('.admin-view');
    if (!adminView) return;

    try {
        // Initialize admin controls
        const startMatchBtn = adminView.querySelector('.start-match-btn');
        const completeMatchBtn = adminView.querySelector('.update-status-btn');
        const addStatsBtn = adminView.querySelector('.add-stats-btn');

        // Load matches for dropdown
        await loadMatchesForDropdown();

        // Initialize event listeners
        if (startMatchBtn) {
            startMatchBtn.addEventListener('click', handleStartMatch);
        }

        if (completeMatchBtn) {
            completeMatchBtn.addEventListener('click', handleCompleteMatch);
        }

        if (addStatsBtn) {
            addStatsBtn.addEventListener('click', handleAddStats);
        }

        // Initialize event modal
        initializeEventModal();

    } catch (error) {
        console.error('Error initializing admin view:', error);
        showNotification('Error initializing admin controls', 'error');
    }
}

// Admin event handlers
async function handleStartMatch() {
            if (!currentMatch) {
                showNotification('Please select a match first', 'error');
                return;
            }
            try {
                const { data: updatedMatch, error } = await startMatch(currentMatch.id);
                if (error) throw error;
                
                currentMatch = updatedMatch;
                updateMatchDisplay(updatedMatch);
                showNotification('Match started successfully', 'success');
            } catch (error) {
                console.error('Error starting match:', error);
                showNotification('Error starting match', 'error');
            }
    }

async function handleCompleteMatch() {
            if (!currentMatch) {
                showNotification('Please select a match first', 'error');
                return;
            }
            try {
                const { data: updatedMatch, error } = await completeMatch(currentMatch.id);
                if (error) throw error;
                
                currentMatch = updatedMatch;
                updateMatchDisplay(updatedMatch);
                await handleMatchCompletion(updatedMatch);
        showMatchCompletionCelebration();
        showWinnerNotification(updatedMatch);
        
                await Promise.all([
            loadMatches(),
            loadTopScorers()
                ]);
            } catch (error) {
                console.error('Error completing match:', error);
                showNotification('Error completing match', 'error');
            }
    }

function handleAddStats() {
            if (!currentMatch) {
                showNotification('Please select a match first', 'error');
                return;
            }
    const eventModal = document.querySelector('.event-modal');
            if (eventModal) {
                eventModal.style.display = 'flex';
                
                // Reset form if exists
                const eventForm = eventModal.querySelector('#eventForm');
                if (eventForm) {
                    eventForm.reset();
                }

                // Update team names in the dropdown
                const teamSelect = eventModal.querySelector('select[name="team"]');
                if (teamSelect) {
                    const homeOption = teamSelect.querySelector('option[value="home"]');
                    const awayOption = teamSelect.querySelector('option[value="away"]');
                    if (homeOption && currentMatch.home_team) {
                        homeOption.textContent = currentMatch.home_team.name;
                    }
                    if (awayOption && currentMatch.away_team) {
                        awayOption.textContent = currentMatch.away_team.name;
                    }
                }
            }
    }

async function handleEventSubmit(e) {
            e.preventDefault();
    const formData = new FormData(e.target);
            const eventData = {
                team: formData.get('team'),
                playerName: formData.get('playerName'),
                assistName: formData.get('assistName'),
                minute: parseInt(formData.get('minute'))
            };
            await addMatchEvent(eventData);
}

// Helper functions
async function showWinnersPlacardAfterFireworks() {
    try {
        const category = document.querySelector('.tournament-container').dataset.category;
        const { data: winners, error } = await window.supabaseClient
            .from('teams')
            .select('name, crest_url, points')
            .eq('category', category)
            .order('points', { ascending: false })
            .limit(3);

        if (error || !winners || winners.length === 0) {
            console.error('Error fetching winners:', error);
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes goldFlare {
                0% { 
                    transform: translate(-150%, -150%) rotate(45deg);
                    opacity: 0;
                    filter: blur(5px);
                }
                25% {
                    opacity: 0.6;
                    filter: blur(8px);
                }
                50% {
                    filter: blur(10px);
                }
                75% {
                    opacity: 0.6;
                    filter: blur(8px);
                }
                100% { 
                    transform: translate(150%, 150%) rotate(45deg);
                    opacity: 0;
                    filter: blur(5px);
                }
            }
            
            .winners-placard {
                position: relative;
                overflow: hidden;
            }
            
            .winners-placard::before {
                content: '';
                position: absolute;
                top: -100%;
                left: -100%;
                width: 300%;
                height: 150px;
                background: linear-gradient(
                    90deg,
                    transparent 0%,
                    rgba(255, 215, 0, 0.01) 10%,
                    rgba(255, 215, 0, 0.05) 20%,
                    rgba(255, 215, 0, 0.1) 30%,
                    rgba(255, 215, 0, 0.2) 40%,
                    rgba(255, 215, 0, 0.4) 45%,
                    rgba(255, 215, 0, 0.6) 48%,
                    rgba(255, 215, 0, 0.8) 50%,
                    rgba(255, 215, 0, 0.6) 52%,
                    rgba(255, 215, 0, 0.4) 55%,
                    rgba(255, 215, 0, 0.2) 60%,
                    rgba(255, 215, 0, 0.1) 70%,
                    rgba(255, 215, 0, 0.05) 80%,
                    rgba(255, 215, 0, 0.01) 90%,
                    transparent 100%
                );
                animation: none;
                pointer-events: none;
                opacity: 0;
                transform-origin: 0 0;
                filter: blur(8px);
                mix-blend-mode: screen;
            }

            .winners-placard.show-flare::before {
                animation: goldFlare 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
            }
            
            @media (max-width: 768px) {
                .winners-placard {
                    padding: 12px !important;
                }
                .winner-title {
                    font-size: 18px !important;
                    margin-bottom: 8px !important;
                }
                .main-winner-crest {
                    width: 60px !important;
                    height: 60px !important;
                }
                .main-winner h3 {
                    font-size: 16px !important;
                }
                .main-winner p {
                    font-size: 12px !important;
                    margin: 3px 0 !important;
                }
            }
        `;
        document.head.appendChild(style);

        const placard = document.createElement('div');
        placard.style.position = 'fixed';
        placard.style.top = '50%';
        placard.style.left = '50%';
        placard.style.transform = 'translate(-50%, -50%) scale(0.95)';
        placard.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 20, 0.95))';
        placard.style.padding = '20px';
        placard.style.color = 'white';
        placard.style.textAlign = 'center';
        placard.style.opacity = '0';
        placard.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
        placard.style.zIndex = '10000';
        placard.style.width = '85%';
        placard.style.maxWidth = '400px';
        placard.style.borderRadius = '15px';
        placard.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.3)';
        placard.style.border = '2px solid gold';

        const winnerContent = `
            <div class="winners-placard">
                <h2 class="winner-title" style="color: gold; font-size: 24px; margin: 0 0 15px 0; 
                    text-shadow: 0 0 10px rgba(255,215,0,0.5);">
                    🏆 Muqawama Champions 🏆
                </h2>
                
                <div class="main-winner" style="margin: 0; padding: 15px; 
                    background: linear-gradient(45deg, rgba(255,215,0,0.1), rgba(255,215,0,0.2));
                    border-radius: 12px; border: 2px solid gold;">
                    <img src="${winners[0].crest_url || '/assets/data/open-age/team-logos/default.png'}" 
                        class="main-winner-crest"
                        style="width: 100px; height: 100px; object-fit: contain; margin: 5px auto;
                        filter: drop-shadow(0 0 10px rgba(255,215,0,0.5));" />
                    <h3 style="color: gold; font-size: 28px; margin: 15px 0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                        ${winners[0].name}
                    </h3>
                    <p style="color: #FFF; font-size: 16px; margin: 10px 0;">
                        Champions of Muqawama Tournament
                    </p>
                    <p style="color: gold; font-size: 16px; margin: 10px 0;">
                        ${winners[0].points} Points
                    </p>
                </div>
            </div>
        `;

        placard.innerHTML = winnerContent;
        document.body.appendChild(placard);

        setTimeout(() => {
            placard.style.opacity = '1';
            placard.style.transform = 'translate(-50%, -50%) scale(1)';
            
            // Add flare after placard appears
            setTimeout(() => {
                placard.querySelector('.winners-placard').classList.add('show-flare');
            }, 500);
            
            setTimeout(() => {
                placard.style.opacity = '0';
                placard.style.transform = 'translate(-50%, -50%) scale(0.95)';
                setTimeout(() => {
                    placard.remove();
                    style.remove();
                }, 1000);
            }, 7000);
        }, 100);
    } catch (error) {
        console.error('Error showing winners placard:', error);
    }
}

function showMatchCompletionCelebration() {
    const celebrationOverlay = document.querySelector('.celebration-overlay');
    if (celebrationOverlay) {
        celebrationOverlay.classList.add('active');
        const fireworks = celebrationOverlay.querySelectorAll('.firework');
        fireworks.forEach((firework, index) => {
            firework.style.animation = `explode ${2 + index * 0.5}s ease-out forwards ${index * 0.3}s`;
        });
        
        // Initialize fireworks effect and show placard together
        $('.tournament-container').fireworks();
        showWinnersPlacardAfterFireworks();
        
        setTimeout(() => {
            celebrationOverlay.classList.remove('active');
        }, 4000);
    }
}

function showWinnerNotification(match) {
    const homeScore = parseInt(match.home_score) || 0;
    const awayScore = parseInt(match.away_score) || 0;
    let message = 'Match Completed! ';
    if (homeScore > awayScore) {
        message += `${match.home_team.name} wins!`;
    } else if (awayScore > homeScore) {
        message += `${match.away_team.name} wins!`;
    } else {
        message += "It's a draw!";
    }
    showNotification(message, 'success');
}

// Initialize based on user role
async function initializeView() {
    try {
        const client = await getClient();
        const { data: { user } } = await client.auth.getUser();
        
        if (!user) {
            document.querySelector('.user-view').style.display = 'block';
            document.querySelector('.admin-view').style.display = 'none';
            await initializeUserView();
        return;
    }

        const { data: adminUser } = await client
            .from('admin_users')
            .select('role')
            .eq('email', user.email)
            .single();

        if (adminUser) {
            console.log('Admin user detected, showing admin view');
            document.querySelector('.admin-view').style.display = 'block';
            document.querySelector('.user-view').style.display = 'none';
            await initializeAdminView();
        } else {
            console.log('Non-admin user detected, showing user view');
            document.querySelector('.user-view').style.display = 'block';
            document.querySelector('.admin-view').style.display = 'none';
            await initializeUserView();
        }
    } catch (error) {
        console.error('Error initializing view:', error);
        document.querySelector('.user-view').style.display = 'block';
        document.querySelector('.admin-view').style.display = 'none';
        await initializeUserView();
    }
}

// Load and display tournament data
async function loadTournamentData() {
  if (!category) {
        console.error('Tournament category not found');
        return;
  }

  try {
    await Promise.all([
      loadTeams(),
      loadMatches(),
      loadTopScorers()
        ]);
        
        // Initialize filters after loading data
        initializeFilterButtons();
        
  } catch (error) {
        console.error('Error loading tournament data:', error);
        showNotification('Error loading tournament data', 'error');
  }
}

// Load teams and update league table
async function loadTeams() {
  try {
        const { data: teams, error } = await getTeams(category);
        if (error) throw error;

    // Store teams in a variable accessible to the sorting functions
    window.currentTeams = teams;

    // Initial sort by points
    sortAndDisplayTeams('points');

    // Add event listeners to sort buttons if not already added
    initializeSortButtons();

  } catch (error) {
        console.error('Error loading teams:', error);
        showNotification('Error updating league table', 'error');
    }
}

// Load matches and update fixtures
async function loadMatches() {
    try {
        const { data: matches, error } = await getMatches(category);
        if (error) throw error;

        // Store matches globally for bracket view
        window.currentMatches = matches;

        // Update match display if needed
        if (currentMatch) {
            const updatedMatch = matches.find(m => m.id === currentMatch.id);
            if (updatedMatch) {
                currentMatch = updatedMatch;
                updateMatchDisplay(updatedMatch);
            }
        }

        // Fetch match events for all matches
        const matchEventsPromises = matches.map(match => getMatchEvents(match.id));
        const matchEventsResults = await Promise.all(matchEventsPromises);
        const matchEvents = matchEventsResults.reduce((acc, result, index) => {
            acc[matches[index].id] = result.data || [];
            return acc;
        }, {});

        // Update fixtures display
        const fixturesList = document.getElementById('fixtures-list');
        if (fixturesList) {
            fixturesList.innerHTML = matches.map(match => {
                const matchDate = new Date(match.match_date);
                const formattedDate = matchDate.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                // Subtract 5 hours and 30 minutes to convert IST to UTC
                matchDate.setHours(matchDate.getHours() - 5);
                matchDate.setMinutes(matchDate.getMinutes() - 30);
                const formattedTime = matchDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

                let statusBadge = '';
                if (match.status === 'in_progress') {
                    statusBadge = '<span class="live-badge">Live</span>';
                } else if (match.status === 'completed') {
                    statusBadge = '<span class="completed-badge">Completed</span>';
                }

                // Format match events
                const events = matchEvents[match.id] || [];
                const homeEvents = events.filter(event => event.team_id === match.home_team_id);
                const awayEvents = events.filter(event => event.team_id === match.away_team_id);
                
                return `
                    <div class="fixture">
                        <div class="fixture-teams">
                            <div class="team home">
                                <img src="${match.home_team?.crest_url || DEFAULT_TEAM_LOGO}" alt="${match.home_team?.name || 'TBD'}" class="team-crest">
                                <span class="team-name">${match.home_team?.name || 'TBD'}</span>
                                ${!match.home_team && document.querySelector('.admin-view')?.style.display !== 'none' ? 
                                    `<button class="edit-team-btn" data-match-id="${match.id}" data-team-type="home">
                                        <i class="fas fa-edit"></i>
                                    </button>` : ''}
                                <span class="score">${match.home_score || '0'}</span>
                            </div>
                            <div class="vs-badge">VS</div>
                            <div class="team away">
                                <img src="${match.away_team?.crest_url || DEFAULT_TEAM_LOGO}" alt="${match.away_team?.name || 'TBD'}" class="team-crest">
                                <span class="team-name">${match.away_team?.name || 'TBD'}</span>
                                ${!match.away_team && document.querySelector('.admin-view')?.style.display !== 'none' ? 
                                    `<button class="edit-team-btn" data-match-id="${match.id}" data-team-type="away">
                                        <i class="fas fa-edit"></i>
                                    </button>` : ''}
                                <span class="score">${match.away_score || '0'}</span>
                            </div>
                        </div>
                        <div class="fixture-meta">
                            <div class="meta-row">
                                ${statusBadge}
                                <span class="group-badge">${match.match_type || 'Match'}</span>
                            </div>
                            <div class="meta-row">
                                <div class="meta-item">
                                    <i class="far fa-calendar"></i>
                                    <span class="date-badge">${formattedDate}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="far fa-clock"></i>
                                    <span class="time-badge">${formattedTime}</span>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span class="venue-badge">${match.venue || 'TBD'}</span>
                                </div>
                            </div>
                        </div>
                        ${(homeEvents.length > 0 || awayEvents.length > 0) ? `
                            <div class="fixture-stats">
                                <div class="stats-row">
                                    <div class="team-stats home-stats">
                                        ${homeEvents.map(event => `
                                            <div class="scorer">
                                                <span class="scorer-name">${event.scorer_name}</span>
                                                <span class="goal-icon"><i class="fas fa-futbol"></i></span>
                                                <span class="goal-minute">${event.minute}'</span>
                                                ${event.assist_name ? `
                                                    <div class="assist-info">
                                                        <span class="assist-icon"><i class="fas fa-hands-helping"></i></span>
                                                        <span class="assist-name">${event.assist_name}</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="team-stats away-stats">
                                        ${awayEvents.map(event => `
                                            <div class="scorer">
                                                <span class="scorer-name">${event.scorer_name}</span>
                                                <span class="goal-icon"><i class="fas fa-futbol"></i></span>
                                                <span class="goal-minute">${event.minute}'</span>
                                                ${event.assist_name ? `
                                                    <div class="assist-info">
                                                        <span class="assist-icon"><i class="fas fa-hands-helping"></i></span>
                                                        <span class="assist-name">${event.assist_name}</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

    } catch (error) {
        console.error('Error loading matches:', error);
        showNotification('Error loading matches', 'error');
    }
}

// Load top scorers and assists
async function loadTopScorers() {
  try {
        const client = await getClient();
        const [scorersResult, assistsResult] = await Promise.all([
            client.rpc('get_top_scorers', { category_param: category }),
            client.rpc('get_top_assists', { category_param: category })
        ]);

        if (scorersResult.error) throw scorersResult.error;
        if (assistsResult.error) throw assistsResult.error;

        const scorers = scorersResult.data;
        const assists = assistsResult.data;

        // Update top scorers list
        const scorersList = document.getElementById('scorers-list');
        const assistsList = document.getElementById('assists-list');

        if (scorersList) {
            scorersList.innerHTML = formatStatsList(scorers, 'goals');
        }

        if (assistsList) {
            assistsList.innerHTML = formatStatsList(assists, 'assists');
        }

    } catch (error) {
        console.error('Error loading top scorers and assists:', error);
        showNotification('Error updating statistics', 'error');
    }
}

// Helper functions
function formatStatsList(stats, type) {
    if (!stats || stats.length === 0) {
        return `
            <div class="no-stats">
                <i class="fas ${type === 'goals' ? 'fa-futbol' : 'fa-hands-helping'}"></i>
                <p>No statistics available</p>
            </div>`;
    }

    return `
        <div class="stats-wrapper">
            ${stats.map((stat, index) => `
                <div class="stat-row ${index < 3 ? 'top-' + (index + 1) : ''}">
                    <div class="rank">
                        ${index < 3 ? 
                            `<i class="fas fa-trophy trophy-${index + 1}"></i>` : 
                            `<span class="position">${index + 1}</span>`
                        }
        </div>
                    <div class="player-info">
                        <div class="player-name">
                            ${type === 'goals' ? stat.scorer_name : stat.assist_name}
                            <span class="stat-count">
                                ${type === 'goals' ? 
                                    `<i class="fas fa-futbol"></i> ${stat.goals_count}` : 
                                    `<i class="fas fa-hands-helping"></i> ${stat.assists_count}`
                                }
                            </span>
      </div>
                        <div class="team-name">
                            <i class="fas fa-shield-alt"></i> ${stat.team_name}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Initialize sort buttons
function initializeSortButtons() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    
    // Set initial active state on points button
    const pointsButton = document.querySelector('[data-sort="points"]');
    if (pointsButton) {
        pointsButton.classList.add('active');
    }

    sortButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // First remove active class from all buttons
            sortButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class only to clicked button
            button.classList.add('active');

            // Perform the sort
            const sortType = button.dataset.sort;
            sortAndDisplayTeams(sortType);
        });
    });
}

// Sort and display teams
function sortAndDisplayTeams(sortType) {
    if (!window.currentTeams) return;

    const teams = [...window.currentTeams];
    
    switch(sortType) {
        case 'points':
            teams.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const bGD = b.goals_for - b.goals_against;
                const aGD = a.goals_for - a.goals_against;
                if (bGD !== aGD) return bGD - aGD;
                return b.goals_for - a.goals_for;
            });
                break;
        case 'gd':
            teams.sort((a, b) => {
                const bGD = b.goals_for - b.goals_against;
                const aGD = a.goals_for - a.goals_against;
                if (bGD !== aGD) return bGD - aGD;
                if (b.points !== a.points) return b.points - a.points;
                return b.goals_for - a.goals_for;
            });
                break;
        case 'goals':
            teams.sort((a, b) => {
                if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
                if (b.points !== a.points) return b.points - a.points;
                const bGD = b.goals_for - b.goals_against;
                const aGD = a.goals_for - a.goals_against;
                return bGD - aGD;
            });
                break;
        }

    // Update league table
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    tableBody.innerHTML = teams.map((team, index) => `
        <tr class="${index < 4 ? 'qualification-zone' : ''}">
            <td>${index + 1}</td>
            <td class="team-name-cell">
                <div class="team-info">
                    <img src="${team.crest_url || DEFAULT_TEAM_LOGO}" 
                         alt="${team.name}" class="team-crest" loading="lazy">
                    ${team.name}
                    </div>
            </td>
            <td>${team.group_name || '-'}</td>
            <td>${team.played || 0}</td>
            <td>${team.won || 0}</td>
            <td>${team.drawn || 0}</td>
            <td>${team.lost || 0}</td>
            <td>${team.points || 0}</td>
            <td>${(team.goals_for || 0) - (team.goals_against || 0)}</td>
            <td>${team.goals_for || 0}</td>
            <td>${team.goals_against || 0}</td>
        </tr>
            `).join('');
}

// Load matches for dropdown
async function loadMatchesForDropdown() {
    try {
        const { data: matches, error } = await supabaseClient
            .from('matches')
            .select(`
                id,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url),
                match_date,
                scheduled_time,
                venue,
                status,
                match_type
            `)
            .eq('category', category)
            .order('match_date');

        if (error) throw error;

        console.log('Loaded matches:', matches);

        const matchDropdown = document.querySelector('.match-dropdown');
        if (!matchDropdown) return;

        const options = matches
            .filter(match => match.home_team && match.away_team) // Filter out matches with missing team data
            .map(match => {
                const matchDate = new Date(match.match_date);
                const formattedDate = matchDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                return `
                    <option value="${match.id}" 
                            data-home-team="${match.home_team?.name || 'TBD'}"
                            data-away-team="${match.away_team?.name || 'TBD'}"
                            data-home-crest="${match.home_team?.crest_url || DEFAULT_TEAM_LOGO}"
                            data-away-crest="${match.away_team?.crest_url || DEFAULT_TEAM_LOGO}"
                            data-status="${match.status || 'scheduled'}"
                            data-match-type="${match.match_type || ''}"
                            ${match.status === 'completed' ? 'disabled' : ''}
                            ${currentMatch && match.id === currentMatch.id ? 'selected' : ''}>
                        ${match.home_team?.name || 'TBD'} vs ${match.away_team?.name || 'TBD'} (${formattedDate})
                    </option>
                `;
            }).join('');

        matchDropdown.innerHTML = '<option value="">Select Match</option>' + options;

        // Add change event listener
        matchDropdown.addEventListener('change', handleMatchSelection);

    } catch (error) {
        console.error('Error loading matches:', error);
        showNotification('Error loading matches. Please try again later.', 'error');
    }
}

// Handle match selection
async function handleMatchSelection(event) {
    const matchId = event.target.value;
    if (!matchId) {
        resetMatchDisplay();
        return;
    }

    try {
        const { data: match, error } = await getMatchDetails(matchId);
        if (error) throw error;

        currentMatch = match;
        updateMatchDisplay(match);
        await updateMatchStats();

        // Update button visibility based on match status
        updateMatchStatusButtons(match.status);

        // Set up real-time subscriptions for this match
        setupMatchSubscriptions(matchId);
    } catch (error) {
        console.error('Error loading match details:', error);
        showNotification('Error loading match details', 'error');
    }
}

// Reset match display
function resetMatchDisplay() {
    const adminView = document.querySelector('.admin-view');
    if (!adminView) return;

    adminView.querySelector('.team.home .team-name').textContent = 'TBD';
    adminView.querySelector('.team.away .team-name').textContent = 'TBD';
    adminView.querySelector('.team.home img').src = DEFAULT_TEAM_LOGO;
    adminView.querySelector('.team.away img').src = DEFAULT_TEAM_LOGO;
    adminView.querySelector('[data-field="home-score"]').textContent = '-';
    adminView.querySelector('[data-field="away-score"]').textContent = '-';
    adminView.querySelector('.date').textContent = 'TBD';
    adminView.querySelector('.time').textContent = 'TBD';
    adminView.querySelector('.venue').textContent = 'TBD';

    // Reset buttons - hide all when no match is selected
    currentMatch = null;
    updateMatchStatusButtons(null);
}

// Update match display
function updateMatchDisplay(match) {
    const userView = document.querySelector('.user-view');
    if (!userView) return;

    // Hide loading state and show teams row
    const loadingState = userView.querySelector('.loading-state');
    const teamsRow = userView.querySelector('.teams-row');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    if (teamsRow) {
        teamsRow.style.display = 'grid';
    }

    // Update match type title
    const matchTitle = document.getElementById('matchTypeTitle');
    if (matchTitle) {
        matchTitle.textContent = match.stage || 'Match';
    }

    // Update team names and logos
    const homeTeamName = userView.querySelector('.team.home .team-name');
    const awayTeamName = userView.querySelector('.team.away .team-name');
    const homeTeamLogo = userView.querySelector('.team.home .team-logo');
    const awayTeamLogo = userView.querySelector('.team.away .team-logo');
    const homeScore = userView.querySelector('.team.home .score');
    const awayScore = userView.querySelector('.team.away .score');

    if (homeTeamName && match.home_team) {
        homeTeamName.textContent = match.home_team.name;
    }
    if (awayTeamName && match.away_team) {
        awayTeamName.textContent = match.away_team.name;
    }

    // Update team logos with proper error handling
    if (homeTeamLogo && match.home_team) {
        homeTeamLogo.src = match.home_team.crest_url || '/assets/data/open-age/team-logos/default.png';
        homeTeamLogo.classList.remove('shimmer');
        homeTeamLogo.onerror = () => {
            homeTeamLogo.src = '/assets/data/open-age/team-logos/default.png';
        };
    }
    if (awayTeamLogo && match.away_team) {
        awayTeamLogo.src = match.away_team.crest_url || '/assets/data/open-age/team-logos/default.png';
        awayTeamLogo.classList.remove('shimmer');
        awayTeamLogo.onerror = () => {
            awayTeamLogo.src = '/assets/data/open-age/team-logos/default.png';
        };
    }

    // Update scores
    if (homeScore) {
        homeScore.textContent = match.home_score !== null ? match.home_score : '-';
    }
    if (awayScore) {
        awayScore.textContent = match.away_score !== null ? match.away_score : '-';
    }

    // Update match status badge
    const statusBadge = userView.querySelector('.match-status-badge');
    if (statusBadge) {
        statusBadge.textContent = match.status === 'in_progress' ? 'LIVE' :
                                match.status === 'completed' ? 'COMPLETED' : 'UPCOMING';
        statusBadge.className = `match-status-badge ${match.status}`;
    }

    // Update match details
    const dateElement = userView.querySelector('.match-meta .date');
    const timeElement = userView.querySelector('.match-meta .time');
    const venueElement = userView.querySelector('.match-meta .venue');

    if (dateElement) {
        const matchDate = new Date(match.match_date);
        dateElement.textContent = matchDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    if (timeElement) {
        // Use the scheduled_time field directly
        if (match.scheduled_time) {
            // Parse time in HH:mm format (24-hour)
            const [hours, minutes] = match.scheduled_time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours));
            date.setMinutes(parseInt(minutes));
            
            timeElement.textContent = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } else {
            timeElement.textContent = 'TBD';
        }
    }
    if (venueElement) {
        venueElement.textContent = match.venue || 'TBD';
    }

    // Show celebration overlay for completed matches
    if (match.status === 'completed') {
        const celebrationOverlay = document.querySelector('.celebration-overlay');
        if (celebrationOverlay) {
            celebrationOverlay.classList.add('active');
            setTimeout(() => {
                celebrationOverlay.classList.remove('active');
            }, 4000);
        }
    }
}

// Update match status buttons
function updateMatchStatusButtons(status) {
    const startMatchBtn = document.querySelector('.start-match-btn');
    const completeMatchBtn = document.querySelector('.update-status-btn');
    const addStatsBtn = document.querySelector('.add-stats-btn');
    
    if (!startMatchBtn || !completeMatchBtn || !addStatsBtn) return;

    // Hide all buttons first
    startMatchBtn.style.display = 'none';
    completeMatchBtn.style.display = 'none';
    addStatsBtn.style.display = 'none';

    // Show appropriate buttons based on status
    if (!currentMatch) {
        return; // Don't show any buttons if no match is selected
    }

    switch(status) {
        case 'scheduled':
            startMatchBtn.style.display = 'block';
            startMatchBtn.disabled = false;
            break;
            
        case 'in_progress':
            completeMatchBtn.style.display = 'block';
            completeMatchBtn.textContent = 'Mark as Completed';
            completeMatchBtn.classList.remove('completed');
            completeMatchBtn.disabled = false;
            addStatsBtn.style.display = 'block';
            break;
            
        case 'completed':
            completeMatchBtn.style.display = 'block';
            completeMatchBtn.textContent = 'Match Completed';
            completeMatchBtn.classList.add('completed');
            completeMatchBtn.disabled = true;
            break;
    }
}

// Set up match subscriptions
function setupMatchSubscriptions(matchId) {
    // Clean up existing subscriptions
    if (window.matchSubscription) {
        window.matchSubscription.unsubscribe();
    }
    if (window.eventsSubscription) {
        window.eventsSubscription.unsubscribe();
    }

    // Subscribe to match updates
    window.matchSubscription = subscribeToMatch(matchId, async (payload) => {
        const { data: match, error } = await getMatchDetails(matchId);
        if (!error && match) {
            currentMatch = match;
            await Promise.all([
                updateMatchDisplay(match),
                loadTopScorers()
            ]);
        }
    });

    // Subscribe to match events
    window.eventsSubscription = subscribeToMatchEvents(matchId, async () => {
        await Promise.all([
            updateMatchStats(),
            loadTopScorers()
        ]);
    });
}

// Update match stats
async function updateMatchStats() {
    if (!currentMatch) return;

    try {
        const { data: events, error } = await getMatchEvents(currentMatch.id);
        if (error) throw error;

        // Group events by team
        const homeEvents = events.filter(e => e.team_id === currentMatch.home_team_id);
        const awayEvents = events.filter(e => e.team_id === currentMatch.away_team_id);

        // Update stats in admin view
        const adminView = document.querySelector('.admin-view');
        if (!adminView) return;

        const homeStats = adminView.querySelector('.team-stats.home');
        const awayStats = adminView.querySelector('.team-stats.away');

        if (homeStats) {
            homeStats.innerHTML = formatMatchEvents(homeEvents, 'home');
        }

        if (awayStats) {
            awayStats.innerHTML = formatMatchEvents(awayEvents, 'away');
        }
    } catch (error) {
        console.error('Error updating match stats:', error);
        showNotification('Error updating match stats', 'error');
    }
}

// Format match events for display
function formatMatchEvents(events, teamType) {
    if (!events || !events.length) return '';

    const sortedEvents = events.sort((a, b) => a.minute - b.minute);
    
    return sortedEvents.map(event => {
        const goalEvent = document.createElement('div');
        goalEvent.className = 'goal-event';
        
        const scorerSpan = document.createElement('span');
        scorerSpan.className = 'scorer';
        scorerSpan.textContent = event.scorer_name;
        
        const minuteSpan = document.createElement('span');
        minuteSpan.className = 'goal-minute';
        minuteSpan.textContent = `${event.minute}'`;
        
        if (teamType === 'home') {
            goalEvent.appendChild(scorerSpan);
            if (event.assist_name) {
                const assistSpan = document.createElement('span');
                assistSpan.className = 'assist';
                assistSpan.textContent = ` (assist: ${event.assist_name})`;
                goalEvent.appendChild(assistSpan);
            }
            goalEvent.appendChild(minuteSpan);
        } else {
            goalEvent.appendChild(minuteSpan);
            if (event.assist_name) {
                const assistSpan = document.createElement('span');
                assistSpan.className = 'assist';
                assistSpan.textContent = ` (assist: ${event.assist_name})`;
                goalEvent.appendChild(assistSpan);
            }
            goalEvent.appendChild(scorerSpan);
        }
        
        return goalEvent.outerHTML;
    }).join('');
}

// Initialize event modal handlers
function initializeEventModal() {
    eventModal = document.querySelector('.event-modal');
    const cancelBtn = eventModal?.querySelector('.cancel-btn');
    eventForm = eventModal?.querySelector('#eventForm');

    if (eventModal) {
        // Close modal when clicking outside
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                eventModal.style.display = 'none';
                if (eventForm) eventForm.reset();
            }
        });

        // Close modal when clicking cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                eventModal.style.display = 'none';
                if (eventForm) eventForm.reset();
            });
        }

        // Handle form submission
        if (eventForm) {
            eventForm.addEventListener('submit', handleEventFormSubmit);
        }
    }
}

// Initialize team selection modal
function initializeTeamSelectionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal team-selection-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Select Team</h3>
            <select id="teamSelect" class="team-select">
                <option value="">Select a team...</option>
            </select>
            <div class="modal-buttons">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="button" class="confirm-btn">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close modal when clicking cancel
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Handle team selection confirmation
    modal.querySelector('.confirm-btn').addEventListener('click', async () => {
        const select = modal.querySelector('#teamSelect');
        const teamId = select.value;
        const matchId = modal.dataset.matchId;
        const teamType = modal.dataset.teamType;

        if (!teamId || !matchId || !teamType) {
            showNotification('Please select a team', 'error');
            return;
        }

        try {
            const updateData = {};
            updateData[`${teamType}_team_id`] = teamId;

            const { data: updatedMatch, error } = await supabaseClient
            .from('matches')
            .update(updateData)
            .eq('id', matchId)
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .single();

            if (error) throw error;

            // Update the display
            await loadMatches();
            showNotification('Team updated successfully', 'success');
            modal.style.display = 'none';
    } catch (error) {
            console.error('Error updating team:', error);
            showNotification('Error updating team', 'error');
        }
    });

    return modal;
}

// Handle team edit button click
async function handleTeamEdit(event) {
    const button = event.target.closest('.edit-team-btn');
    if (!button) return;

    const matchId = button.dataset.matchId;
    const teamType = button.dataset.teamType;

    try {
        // Get available teams
        const { data: teams, error } = await getTeams(category);
        if (error) throw error;

        // Get the modal
        let modal = document.querySelector('.team-selection-modal');
        if (!modal) {
            modal = initializeTeamSelectionModal();
        }

        // Update modal data attributes
        modal.dataset.matchId = matchId;
        modal.dataset.teamType = teamType;

        // Update select options
        const select = modal.querySelector('#teamSelect');
        select.innerHTML = `
            <option value="">Select a team...</option>
            ${teams.map(team => `
                <option value="${team.id}">${team.name}</option>
            `).join('')}
        `;

        // Show modal
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading teams:', error);
        showNotification('Error loading teams', 'error');
    }
}

// Add event listener for team edit buttons
document.addEventListener('click', handleTeamEdit);

// Initialize filter buttons
function initializeFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filter = button.dataset.filter;
            filterFixtures(filter);
        });
    });
}

// Filter fixtures based on status
function filterFixtures(filter) {
    const fixtures = document.querySelectorAll('#fixtures-list .fixture');
    
    fixtures.forEach(fixture => {
        const hasLiveBadge = fixture.querySelector('.live-badge');
        const hasCompletedBadge = fixture.querySelector('.completed-badge');
        
        switch(filter) {
            case 'all':
                fixture.style.display = 'block';
                break;
            case 'live':
                fixture.style.display = hasLiveBadge ? 'block' : 'none';
                break;
            case 'completed':
                fixture.style.display = hasCompletedBadge ? 'block' : 'none';
                break;
            case 'upcoming':
                fixture.style.display = (!hasLiveBadge && !hasCompletedBadge) ? 'block' : 'none';
                break;
        }
    });
}

// Handle event form submission
async function handleEventFormSubmit(e) {
    e.preventDefault();
    
    if (!eventModal || !eventForm || !currentMatch) {
        console.error('Event modal, form, or current match not initialized');
        showNotification('Error: Form not properly initialized', 'error');
        return;
    }

    try {
        const formData = new FormData(eventForm);
        const teamType = formData.get('team'); // 'home' or 'away'
        const teamId = teamType === 'home' ? currentMatch.home_team_id : currentMatch.away_team_id;

        const eventData = {
            match_id: currentMatch.id,
            team_id: teamId,
            scorer_name: formData.get('playerName'),
            assist_name: formData.get('assistName') || null,
            minute: parseInt(formData.get('minute')),
            type: 'goal'
        };

        console.log('Adding match event with data:', eventData);

        const { error: eventError } = await addMatchEventToDb(eventData);
        if (eventError) throw eventError;

        // Update the match score
        const updateData = {};
        if (teamType === 'home') {
            updateData.home_score = (parseInt(currentMatch.home_score) || 0) + 1;
        } else {
            updateData.away_score = (parseInt(currentMatch.away_score) || 0) + 1;
        }

        const { data: updatedMatch, error: updateError } = await supabaseClient
            .from('matches')
            .update(updateData)
            .eq('id', currentMatch.id)
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .single();

        if (updateError) throw updateError;

        currentMatch = updatedMatch;
        updateMatchDisplay(updatedMatch);

        showNotification('Event added successfully', 'success');
        eventModal.style.display = 'none';
        eventForm.reset();
        
        // Update match stats and other displays
        await Promise.all([
            updateMatchStats(),
            loadTopScorers(),
            loadMatches()
        ]);
    } catch (error) {
        console.error('Error adding event:', error);
        showNotification('Error adding event: ' + error.message, 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Waiting for Supabase initialization...');
        const client = await waitForInit();
        console.log('Supabase initialized successfully');
        
        const matchContainer = document.querySelector('.final-match-card');
        if (!matchContainer) {
            console.log('Not on final match page, exiting');
            return;
        }

        // Create celebration overlay if it doesn't exist
        if (!document.querySelector('.celebration-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'celebration-overlay';
            overlay.innerHTML = `
                <div class="firework"></div>
                <div class="firework"></div>
                <div class="firework"></div>
                <div class="firework"></div>
                <div class="firework"></div>
            `;
            document.body.appendChild(overlay);
        }

        window.supabaseClient = client;
        await initializeView();
        await loadTournamentData();

        // Check if match is completed and show fireworks
        const { data: match } = await client
            .from('matches')
            .select('*')
            .eq('category', document.querySelector('.tournament-container').dataset.category)
            .eq('stage', 'final')
            .single();

        if (match && match.status === 'completed') {
            // Initialize fireworks and show winners
            $('.tournament-container').fireworks();
            // Show winners placard after fireworks
            setTimeout(showWinnersPlacardAfterFireworks, 0); // Show immediately with fireworks
        }

    } catch (error) {
        console.error('Error initializing:', error);
        showNotification('Error initializing application', 'error');
    }
});

// Add styles for team selection modal and edit buttons
const styles = document.createElement('style');
styles.textContent = `
    .team-selection-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }

    .team-selection-modal .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        min-width: 300px;
    }

    .team-selection-modal h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
    }

    .team-selection-modal .team-select {
        width: 100%;
        padding: 8px;
        margin-bottom: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .team-selection-modal .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .team-selection-modal button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .team-selection-modal .cancel-btn {
        background-color: #ddd;
    }

    .team-selection-modal .confirm-btn {
        background-color: #4CAF50;
        color: white;
    }

    .edit-team-btn {
        padding: 4px 8px;
        background: none;
        border: none;
        cursor: pointer;
        color: #666;
        margin-left: 5px;
    }

    .edit-team-btn:hover {
        color: #4CAF50;
    }

    .fixture .team {
        position: relative;
    }

    .fixture .team .edit-team-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .fixture .team.home .edit-team-btn {
        right: -5px;
    }

    .fixture .team.away .edit-team-btn {
        left: -5px;
    }
`;
document.head.appendChild(styles);