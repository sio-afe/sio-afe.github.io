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

// Initialize admin controls
async function initializeAdminControls() {
    const startMatchBtn = document.querySelector('.start-match-btn');
    const completeMatchBtn = document.querySelector('.update-status-btn');
    const addStatsBtn = document.querySelector('.add-stats-btn');
    const eventModal = document.querySelector('.event-modal');
    const eventForm = document.getElementById('eventForm');
    const cancelBtn = document.querySelector('.cancel-btn');
    const userView = document.querySelector('.user-view');
    const adminView = document.querySelector('.admin-view');

    // Initialize view based on admin status
    async function initializeView() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                if (userView) userView.style.display = 'block';
                if (adminView) adminView.style.display = 'none';
                return;
            }

            const { data: adminUser } = await supabase
                .from('admin_users')
                .select('role')
                .eq('email', user.email)
                .single();

            if (adminUser) {
                console.log('Admin user detected, showing admin view');
                if (adminView) {
                    adminView.style.display = 'block';
                    userView.style.display = 'none';
                    // Initialize admin controls
                    await loadMatchesForDropdown();
                    initializeAdminEventListeners();
                }
            } else {
                console.log('Non-admin user detected, showing user view');
                if (userView) {
                    userView.style.display = 'block';
                    adminView.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            if (userView) userView.style.display = 'block';
            if (adminView) adminView.style.display = 'none';
        }
    }

    // Initialize view
    await initializeView();

    function initializeAdminEventListeners() {
        if (startMatchBtn) {
            startMatchBtn.addEventListener('click', async () => {
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
            });
        }

        if (completeMatchBtn) {
            completeMatchBtn.addEventListener('click', async () => {
                if (!currentMatch) {
                    showNotification('Please select a match first', 'error');
                    return;
                }
                try {
                    // Complete the match - the database trigger will handle team stats
                    const { data: updatedMatch, error } = await completeMatch(currentMatch.id);
                    if (error) throw error;
                    
                    currentMatch = updatedMatch;
                    updateMatchDisplay(updatedMatch);

                    // Handle automatic team progression after match completion
                    await handleMatchCompletion(updatedMatch);

                    // Show match completion celebration
                    const celebrationOverlay = document.querySelector('.celebration-overlay');
                    if (celebrationOverlay) {
                        celebrationOverlay.classList.add('active');
                        // Restart firework animations with longer duration
                        const fireworks = celebrationOverlay.querySelectorAll('.firework');
                        fireworks.forEach((firework, index) => {
                            firework.style.animation = 'none';
                            firework.offsetHeight; // Trigger reflow
                            firework.style.animation = `explode ${2 + index * 0.5}s ease-out forwards ${index * 0.3}s`;
                        });
                        // Keep celebration visible longer for match completion
                        setTimeout(() => {
                            celebrationOverlay.classList.remove('active');
                        }, 4000);
                    }

                    // Show winner notification
                    const homeScore = parseInt(updatedMatch.home_score) || 0;
                    const awayScore = parseInt(updatedMatch.away_score) || 0;
                    let message = 'Match Completed! ';
                    if (homeScore > awayScore) {
                        message += `${updatedMatch.home_team.name} wins!`;
                    } else if (awayScore > homeScore) {
                        message += `${updatedMatch.away_team.name} wins!`;
                    } else {
                        message += "It's a draw!";
                    }
                    showNotification(message, 'success');

                    // Only refresh matches and top scorers, table updates via subscription
                    await Promise.all([
                        loadMatches(),       // Update fixtures
                        loadTopScorers()     // Update top scorers
                    ]);

                } catch (error) {
                    console.error('Error completing match:', error);
                    showNotification('Error completing match', 'error');
                }
            });
        }

        if (addStatsBtn) {
            addStatsBtn.addEventListener('click', () => {
                if (!currentMatch) {
                    showNotification('Please select a match first', 'error');
                    return;
                }
                if (eventModal) {
                    eventModal.style.display = 'flex';
                }
            });
        }

        if (eventForm) {
            eventForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(eventForm);
                const eventData = {
                    team: formData.get('team'),
                    playerName: formData.get('playerName'),
                    assistName: formData.get('assistName'),
                    minute: parseInt(formData.get('minute'))
                };
                await addMatchEvent(eventData);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (eventModal) {
                    eventModal.style.display = 'none';
                    if (eventForm) eventForm.reset();
                }
            });
        }

        // Close modal when clicking outside
        if (eventModal) {
            eventModal.addEventListener('click', (e) => {
                if (e.target === eventModal) {
                    eventModal.style.display = 'none';
                    if (eventForm) eventForm.reset();
                }
            });
        }
    }
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

        // For normal users, if no match is currently selected, try to select an in-progress match
        const isAdmin = document.querySelector('.admin-view') !== null;
        if (!isAdmin && !currentMatch) {
            const inProgressMatch = matches.find(match => match.status === 'in_progress');
            if (inProgressMatch) {
                matchDropdown.value = inProgressMatch.id;
                handleMatchSelection({ target: { value: inProgressMatch.id } });
            } else {
                // If no in-progress match, try to find the next scheduled match
                const nextScheduledMatch = matches.find(match => match.status === 'scheduled');
                if (nextScheduledMatch) {
                    matchDropdown.value = nextScheduledMatch.id;
                    handleMatchSelection({ target: { value: nextScheduledMatch.id } });
                }
            }
        }
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

        // Set up real-time subscriptions for this match
        setupMatchSubscriptions(matchId);
    } catch (error) {
        console.error('Error loading match details:', error);
        showNotification('Error loading match details', 'error');
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
                loadTopScorers()     // Update top scorers when match updates
            ]);
        }
    });

    // Subscribe to match events
    window.eventsSubscription = subscribeToMatchEvents(matchId, async () => {
        await Promise.all([
            updateMatchStats(),
            loadTopScorers()  // Update top scorers when events change
        ]);
    });
}

// Update match display
function updateMatchDisplay(match) {
    console.log('🎯 Updating match display with data:', match);
    if (!match || !match.home_team || !match.away_team) {
        console.error('❌ Invalid match data:', match);
        showNotification('Error: Invalid match data', 'error');
        return;
    }

    // Update match title/type
    const titleElement = document.getElementById('matchTypeTitle');
    if (titleElement) {
        console.log('📝 Match type from data:', match.match_type);
        if (!match.match_type) {
            titleElement.textContent = 'Match';
        } else {
            const matchType = match.match_type.toLowerCase();
            console.log('🔄 Processing match type:', matchType);
            switch(matchType) {
                case 'group':
                    titleElement.textContent = 'Group Match';
                    break;
                case 'quarter-final':
                    titleElement.textContent = 'Quarter Final';
                    break;
                case 'semi-final':
                    titleElement.textContent = 'Semi Final';
                    break;
                case 'final':
                    titleElement.textContent = 'Final';
                    break;
                default:
                    titleElement.textContent = 'Match';
            }
        }
    }

    // Update user view
    const userView = document.querySelector('.user-view');
    if (userView) {
        console.log('👥 Updating user view for match:', match.id);
        
        // Update match status data attribute
        userView.dataset.matchStatus = match.status;
        console.log('🔄 Setting match status:', match.status);

        // Update team names and logos
        const homeTeamName = userView.querySelector('.team.home .team-name');
        const awayTeamName = userView.querySelector('.team.away .team-name');
        const homeTeamLogo = userView.querySelector('.team.home img');
        const awayTeamLogo = userView.querySelector('.team.away img');

        if (homeTeamName) homeTeamName.textContent = match.home_team.name || 'TBD';
        if (awayTeamName) awayTeamName.textContent = match.away_team.name || 'TBD';
        if (homeTeamLogo) homeTeamLogo.src = match.home_team.crest_url || DEFAULT_TEAM_LOGO;
        if (awayTeamLogo) awayTeamLogo.src = match.away_team.crest_url || DEFAULT_TEAM_LOGO;

        console.log('⚽ Teams updated:', {
            home: match.home_team.name,
            away: match.away_team.name
        });

        // Update scores
        const homeScore = userView.querySelector('.team.home .score');
        const awayScore = userView.querySelector('.team.away .score');
        if (homeScore) homeScore.textContent = match.home_score || '0';
        if (awayScore) awayScore.textContent = match.away_score || '0';

        console.log('🎯 Scores updated:', {
            home: match.home_score || '0',
            away: match.away_score || '0'
        });

        // Update match details
        updateMatchDetails(userView, match);
        
        // Update status badge
        const statusBadge = userView.querySelector('.match-status-badge');
        if (statusBadge) {
            statusBadge.className = 'match-status-badge'; // Reset classes
            if (match.status === 'in_progress') {
                console.log('🔴 Match is LIVE');
                statusBadge.classList.add('live');
                statusBadge.textContent = '🔴 LIVE';
            } else if (match.status === 'completed') {
                console.log('✅ Match is COMPLETED');
                statusBadge.classList.add('completed');
                statusBadge.textContent = '✓ COMPLETED';
                
                // Show celebration for completed match
                const celebrationOverlay = userView.querySelector('.celebration-overlay');
                if (celebrationOverlay) {
                    console.log('🎉 Showing celebration overlay');
                    celebrationOverlay.classList.add('active');
                    const fireworks = celebrationOverlay.querySelectorAll('.firework');
                    fireworks.forEach((firework, index) => {
                        firework.style.animation = 'none';
                        firework.offsetHeight; // Trigger reflow
                        firework.style.animation = `explode ${2 + index * 0.5}s ease-out forwards ${index * 0.3}s`;
                    });
                    setTimeout(() => {
                        celebrationOverlay.classList.remove('active');
                        console.log('🎉 Celebration overlay removed');
                    }, 4000);
                }
            } else {
                console.log('⏰ Match is UPCOMING');
                statusBadge.classList.add('upcoming');
                statusBadge.textContent = '⏰ UPCOMING';
            }
        }
    }

    // Update admin view if it exists
    const adminView = document.querySelector('.admin-view');
    if (adminView) {
        updateAdminView(match);
    }

    // Update match status buttons
    updateMatchStatusButtons(match.status);
    console.log('✨ Match display update complete');
}

// Update admin view
function updateAdminView(match) {
    const adminView = document.querySelector('.admin-view');
    if (!adminView || !match.home_team || !match.away_team) return;

    // Update team names and crests
    const homeTeamName = adminView.querySelector('.team.home .team-name');
    const awayTeamName = adminView.querySelector('.team.away .team-name');
    const homeTeamLogo = adminView.querySelector('.team.home img');
    const awayTeamLogo = adminView.querySelector('.team.away img');

    if (homeTeamName) homeTeamName.textContent = match.home_team.name || 'TBD';
    if (awayTeamName) awayTeamName.textContent = match.away_team.name || 'TBD';
    if (homeTeamLogo) homeTeamLogo.src = match.home_team.crest_url || DEFAULT_TEAM_LOGO;
    if (awayTeamLogo) awayTeamLogo.src = match.away_team.crest_url || DEFAULT_TEAM_LOGO;

    // Update scores
    const homeScore = adminView.querySelector('[data-field="home-score"]');
    const awayScore = adminView.querySelector('[data-field="away-score"]');
    if (homeScore) homeScore.textContent = match.home_score || '0';
    if (awayScore) awayScore.textContent = match.away_score || '0';

    // Update match details
    updateMatchDetails(adminView, match);
}

// Helper function to convert 24-hour time to 12-hour format
function convertTo12Hour(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'  // Use UTC to avoid timezone conversion
    });
}

// Update match details helper
function updateMatchDetails(view, match) {
    const matchDate = new Date(match.match_date);
    const dateElement = view.querySelector('.date');
    const timeElement = view.querySelector('.time');
    const venueElement = view.querySelector('.venue');

    if (dateElement) {
        dateElement.textContent = matchDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    if (timeElement) {
        // Convert match_date to 12-hour format
        timeElement.textContent = convertTo12Hour(match.match_date);
    }

    if (venueElement) {
        venueElement.textContent = match.venue || 'TBD';
    }
}

// Update match status buttons
function updateMatchStatusButtons(status) {
    const startMatchBtn = document.querySelector('.start-match-btn');
    const completeMatchBtn = document.querySelector('.update-status-btn');
    const addStatsBtn = document.querySelector('.add-stats-btn');
    
    if (!startMatchBtn || !completeMatchBtn || !addStatsBtn) return;

    // Always show the buttons but manage their state
    startMatchBtn.style.display = 'block';
    completeMatchBtn.style.display = 'block';
    addStatsBtn.style.display = 'block';

    if (status === 'completed') {
        startMatchBtn.style.display = 'none';
        completeMatchBtn.textContent = 'Match Completed';
        completeMatchBtn.classList.add('completed');
        completeMatchBtn.disabled = true;
        addStatsBtn.style.display = 'none';
    } else if (status === 'in_progress') {
        startMatchBtn.style.display = 'none';
        completeMatchBtn.textContent = 'Mark as Completed';
        completeMatchBtn.classList.remove('completed');
        completeMatchBtn.disabled = false;
        addStatsBtn.style.display = 'block';
    } else {
        startMatchBtn.disabled = false;
        completeMatchBtn.style.display = 'none';
        addStatsBtn.style.display = 'none';
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

    // Reset buttons
    updateMatchStatusButtons('scheduled');
    currentMatch = null;
}

// Update status button
function updateStatusButton(status) {
    const statusBtn = document.querySelector('.update-status-btn');
    if (!statusBtn) return;

    if (status === 'completed') {
        statusBtn.textContent = 'Match Completed';
        statusBtn.classList.add('completed');
        statusBtn.disabled = true;
    } else {
        statusBtn.textContent = 'Mark as Completed';
        statusBtn.classList.remove('completed');
        statusBtn.disabled = false;
    }
}

// Add match event (goal)
async function addMatchEvent(eventData) {
    if (!currentMatch) {
        showNotification('Please select a match first', 'error');
        return;
    }

    try {
        const teamId = eventData.team === 'home' ? currentMatch.home_team_id : currentMatch.away_team_id;
        const isHome = eventData.team === 'home';
        const newScore = isHome ? 
            (currentMatch.home_score || 0) + 1 : 
            (currentMatch.away_score || 0) + 1;

        // Add event using the API function
        const { data: updatedMatch, error } = await addMatchEventToDb(currentMatch.id, {
            teamId,
            isHome,
            newScore,
            playerName: eventData.playerName,
            assistName: eventData.assistName,
            minute: eventData.minute
        });

        if (error) throw error;

        // Fetch the complete match data with team information
        const { data: fullMatch, error: matchError } = await supabaseClient
            .from('matches')
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .eq('id', currentMatch.id)
            .single();

        if (matchError) throw matchError;

        // Update current match state with complete data
        currentMatch = fullMatch;

        // Show goal celebration
        const celebrationOverlay = document.querySelector('.celebration-overlay');
        if (celebrationOverlay) {
            celebrationOverlay.classList.add('active');
            // Restart firework animations
            const fireworks = celebrationOverlay.querySelectorAll('.firework');
            fireworks.forEach(firework => {
                firework.style.animation = 'none';
                firework.offsetHeight; // Trigger reflow
                firework.style.animation = null;
            });
            // Hide celebration after animation
            setTimeout(() => {
                celebrationOverlay.classList.remove('active');
            }, 2000);
        }

        const teamName = isHome ? currentMatch.home_team?.name : currentMatch.away_team?.name;
        showNotification(`GOAL! ${eventData.playerName} scores for ${teamName || 'the team'}!`, 'success');
        
        // Update all necessary displays
        await Promise.all([
            updateMatchDisplay(currentMatch),
            updateMatchStats(),
            loadMatches(),       // Update fixtures
            loadTopScorers()     // Update top scorers and assists
        ]);

        // Close the event modal and reset form
        const eventModal = document.querySelector('.event-modal');
        const eventForm = document.getElementById('eventForm');
        if (eventModal) {
            eventModal.style.display = 'none';
            if (eventForm) eventForm.reset();
        }

        // Update the fixtures list
        const fixturesList = document.getElementById('fixtures-list');
        if (fixturesList) {
            const fixtureElement = fixturesList.querySelector(`[data-match-id="${currentMatch.id}"]`);
            if (fixtureElement) {
                const homeScore = fixtureElement.querySelector('.team.home .score');
                const awayScore = fixtureElement.querySelector('.team.away .score');
                if (homeScore) homeScore.textContent = currentMatch.home_score || '0';
                if (awayScore) awayScore.textContent = currentMatch.away_score || '0';
            }
        }

    } catch (error) {
        console.error('Error adding match event:', error);
        showNotification('Error adding event', 'error');
    }
}

// Add or update player in the players table
async function addOrUpdatePlayer(playerName, teamId) {
    try {
        // First check if player exists
        const { data: existingPlayer, error: searchError } = await supabaseClient
            .from('players')
            .select('id')
            .eq('name', playerName)
            .eq('team_id', teamId)
            .maybeSingle();

        if (searchError) throw searchError;

        // If player doesn't exist, add them
        if (!existingPlayer) {
            const { error: insertError } = await supabaseClient
                .from('players')
                .insert([{
                    name: playerName,
                    team_id: teamId
                }]);

            if (insertError) throw insertError;
        }
    } catch (error) {
        console.error('Error managing player:', error);
        throw error;
    }
}

// Update match stats display
async function updateMatchStats() {
    if (!currentMatch) return;

    try {
        const { data: goals, error } = await supabaseClient
            .from('goals')
            .select(`
                *,
                team:teams(name)
            `)
            .eq('match_id', currentMatch.id)
            .order('minute');

        if (error) throw error;

        // Group goals by team
        const homeGoals = goals.filter(g => g.team_id === currentMatch.home_team_id);
        const awayGoals = goals.filter(g => g.team_id === currentMatch.away_team_id);

        // Update stats in both views
        ['user-view', 'admin-view'].forEach(viewType => {
            const view = document.querySelector(`.${viewType}`);
            if (!view) return;

            // Ensure stats containers exist
            let homeStats = view.querySelector('.team-stats.home .stats-content');
            let awayStats = view.querySelector('.team-stats.away .stats-content');

            // Create containers if they don't exist
            if (!homeStats) {
                const homeContainer = view.querySelector('.team-stats.home') || createStatsContainer(view, 'home');
                homeStats = homeContainer.querySelector('.stats-content') || createStatsContent(homeContainer);
            }
            if (!awayStats) {
                const awayContainer = view.querySelector('.team-stats.away') || createStatsContainer(view, 'away');
                awayStats = awayContainer.querySelector('.stats-content') || createStatsContent(awayContainer);
            }

            // Update the stats content
            homeStats.innerHTML = formatMatchEvents(homeGoals, 'home');
            awayStats.innerHTML = formatMatchEvents(awayGoals, 'away');
        });
  } catch (error) {
        console.error('Error updating match stats:', error);
        showNotification('Error updating match stats', 'error');
    }
}

// Helper function to create stats container
function createStatsContainer(view, teamType) {
    const container = document.createElement('div');
    container.className = `team-stats ${teamType}`;
    container.innerHTML = `<h3>${teamType.charAt(0).toUpperCase() + teamType.slice(1)} Team Stats</h3>`;
    view.appendChild(container);
    return container;
}

// Helper function to create stats content
function createStatsContent(container) {
    const content = document.createElement('div');
    content.className = 'stats-content';
    container.appendChild(content);
    return content;
}

// Format match events for display
function formatMatchEvents(events, teamType) {
    if (!events.length) return '<div class="no-stats"></div>';

    return events.map(event => `
        <div class="stat-item">
            ${teamType === 'home' ? `
                <span class="stat-player">${event.scorer_name}</span>
                <span class="stat-icon goal">
                    <i class="fas fa-futbol"></i>
                </span>
                <span class="stat-minute">${event.minute}'</span>
            ` : `
                <span class="stat-minute">${event.minute}'</span>
                <span class="stat-icon goal">
                    <i class="fas fa-futbol"></i>
                </span>
                <span class="stat-player">${event.scorer_name}</span>
            `}
            ${event.assist_name ? `
                <div class="assist-info">
                    <span class="stat-icon assist">
                        <i class="fas fa-hands-helping"></i>
                    </span>
                    <span class="stat-player">${event.assist_name}</span>
                </div>
            ` : ''}
        </div>
    `).join('');
}

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

    // Store teams in a variable accessible to the sorting functions
    window.currentTeams = teams;

    // Initial sort by points
    sortAndDisplayTeams('points');

    // Add event listeners to sort buttons if not already added
    initializeSortButtons();

  } catch (error) {
    console.error('Error loading teams:', error)
    showNotification('Error updating league table', 'error')
  }
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

// Load matches and update fixtures
async function loadMatches() {
    try {
        console.log('Loading matches for category:', category);
        
        // First fetch matches with team information
        const client = await getClient();
        const { data: matches, error } = await client
            .from('matches')
            .select(`
                id,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url),
                home_score,
                away_score,
                match_date,
                venue,
                status,
                match_type
            `)
            .eq('category', category)
            .order('match_date');

        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }

        // Then fetch goals separately
        const { data: allGoals, error: goalsError } = await client
            .from('goals')
            .select('*')
            .in('match_id', matches.map(m => m.id));

        if (goalsError) {
            console.error('Error fetching goals:', goalsError);
            throw goalsError;
        }

        // Combine matches with their goals
        const matchesWithGoals = matches.map(match => {
            const matchGoals = allGoals.filter(goal => goal.match_id === match.id);
            return {
                ...match,
                goals: matchGoals.map(goal => ({
                    ...goal,
                    is_home: goal.team_id === match.home_team.id
                }))
            };
        });

        console.log('Fetched matches:', matchesWithGoals);

        const fixturesList = document.getElementById('fixtures-list');
        if (!fixturesList) {
            console.error('Fixtures list element not found');
            return;
        }

        if (!matchesWithGoals || matchesWithGoals.length === 0) {
            console.log('No matches found');
            fixturesList.innerHTML = `
                <div class="no-matches">
                    <p>No matches scheduled yet</p>
                </div>
            `;
            return;
        }

        const fixturesHtml = matchesWithGoals.map(match => {
            console.log('Processing match:', match);
            
            if (!match) {
                console.error('Invalid match data');
                return '';
            }

            // Format date from match_date
            const matchDate = new Date(match.match_date);
            const formattedDate = matchDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            // Format time in 12-hour format
            const formattedTime = convertTo12Hour(match.match_date);

            // Sort goals by minute
            const homeGoals = match.goals
                ?.filter(goal => goal.is_home)
                .sort((a, b) => a.minute - b.minute) || [];
            const awayGoals = match.goals
                ?.filter(goal => !goal.is_home)
                .sort((a, b) => a.minute - b.minute) || [];

            console.log('Match goals:', { homeGoals, awayGoals });

            // Format goal scorers
            const homeScorers = homeGoals.map(goal => `
                <div class="scorer">
                    <span class="goal-icon"><i class="fas fa-futbol"></i></span>
                    <span class="scorer-name">${goal.scorer_name}</span>
                    <span class="goal-minute">${goal.minute}'</span>
                    ${goal.assist_name ? `<span class="assist">(assist: ${goal.assist_name})</span>` : ''}
                </div>
            `).join('');

            const awayScorers = awayGoals.map(goal => `
                <div class="scorer">
                    <span class="goal-icon"><i class="fas fa-futbol"></i></span>
                    <span class="scorer-name">${goal.scorer_name}</span>
                    <span class="goal-minute">${goal.minute}'</span>
                    ${goal.assist_name ? `<span class="assist">(assist: ${goal.assist_name})</span>` : ''}
                </div>
            `).join('');

            return `
                <div class="fixture" data-match-id="${match.id}">
                    <div class="fixture-teams">
                        <div class="team home">
                            <div class="team-info">
                                <img src="${match.home_team?.crest_url || DEFAULT_TEAM_LOGO}" alt="${match.home_team?.name || 'Home Team'}" class="team-logo" loading="lazy">
                                <div class="team-name">${match.home_team?.name || 'TBD'}</div>
                                <div class="score">${match.home_score || 0}</div>
                            </div>
                        </div>
                        <div class="vs-container">
                            <div class="vs-badge">VS</div>
                        </div>
                        <div class="team away">
                            <div class="team-info">
                                <img src="${match.away_team?.crest_url || DEFAULT_TEAM_LOGO}" alt="${match.away_team?.name || 'Away Team'}" class="team-logo" loading="lazy">
                                <div class="team-name">${match.away_team?.name || 'TBD'}</div>
                                <div class="score">${match.away_score || 0}</div>
                            </div>
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
                    ${(match.status === 'completed' || match.status === 'in_progress') && (homeGoals.length > 0 || awayGoals.length > 0) ? `
                        <div class="fixture-stats">
                            <div class="team-stats home-stats">
                                ${homeScorers}
                            </div>
                            <div class="team-stats away-stats">
                                ${awayScorers}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        console.log('Setting fixtures HTML');
        fixturesList.innerHTML = fixturesHtml;
        console.log('Fixtures loaded successfully');

        // Store matches globally for bracket view
        window.currentMatches = matchesWithGoals;

        // Initialize fixture controls after loading matches
        initializeFixtureControls();

    } catch (error) {
        console.error('Error loading matches:', error);
        const fixturesList = document.getElementById('fixtures-list');
        if (fixturesList) {
            fixturesList.innerHTML = `
                <div class="error-message">
                    <p>Error loading matches. Please try again later.</p>
                </div>
            `;
        }
        showNotification('Error loading matches. Please try again later.', 'error');
    }
}

// Load top scorers and assists
async function loadTopScorers() {
  try {
        // Fetch both top scorers and assists in parallel
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

        // Update scorers in fixtures list
        updateFixturesWithStats(scorers, assists);

    } catch (error) {
        console.error('Error loading top scorers and assists:', error);
        showNotification('Error updating statistics', 'error');
    }
}

// Helper function to format stats list
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

// Helper function to update fixtures with stats
function updateFixturesWithStats(scorers, assists) {
    const fixturesList = document.getElementById('fixtures-list');
    if (!fixturesList) return;

    const fixtures = fixturesList.querySelectorAll('.fixture');
    fixtures.forEach(fixture => {
        const homeStats = fixture.querySelector('.team.home .player-stats');
        const awayStats = fixture.querySelector('.team.away .player-stats');
        
        if (homeStats && awayStats) {
            const homeTeamName = fixture.querySelector('.team.home .team-name')?.textContent;
            const awayTeamName = fixture.querySelector('.team.away .team-name')?.textContent;

            const homeTeamScorers = scorers.filter(s => s.team_name === homeTeamName);
            const homeTeamAssists = assists.filter(a => a.team_name === homeTeamName);
            const awayTeamScorers = scorers.filter(s => s.team_name === awayTeamName);
            const awayTeamAssists = assists.filter(a => a.team_name === awayTeamName);

            homeStats.innerHTML = formatTeamStats(homeTeamScorers, homeTeamAssists);
            awayStats.innerHTML = formatTeamStats(awayTeamScorers, awayTeamAssists);
        }
    });
}

// Helper function to format team stats
function formatTeamStats(scorers, assists) {
    let html = '';
    if (scorers.length > 0) {
        html += '<div class="scorers">';
        scorers.forEach(s => {
            html += `<div class="stat">${s.scorer_name} (${s.goals_count})</div>`;
        });
        html += '</div>';
    }
    if (assists.length > 0) {
        html += '<div class="assists">';
        assists.forEach(a => {
            html += `<div class="stat">${a.assist_name} (${a.assists_count} assists)</div>`;
        });
        html += '</div>';
    }
    return html || '<div class="no-stats">No stats</div>';
}

// Initialize fixture filters and view toggles
function initializeFixtureControls() {
    // Initialize filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const fixturesList = document.getElementById('fixtures-list');
    const bracketView = document.getElementById('bracket-view');

    // Set initial active state on 'all' filter
    const allButton = document.querySelector('[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterType = button.dataset.filter;
            filterFixtures(filterType);
        });
    });

    // Initialize view toggle buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all view buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const viewType = button.dataset.view;
            // Toggle between list and bracket view
            if (viewType === 'list') {
                fixturesList.classList.add('active');
                bracketView.classList.remove('active');
            } else {
                fixturesList.classList.remove('active');
                bracketView.classList.add('active');
                updateBracketView(window.currentMatches || []);
            }
        });
    });
}

// Filter fixtures based on selected filter
function filterFixtures(filterType) {
    const fixtures = document.querySelectorAll('.fixture');
    const currentDate = new Date();

    fixtures.forEach(fixture => {
        const matchStatus = fixture.querySelector('.match-status')?.textContent.toLowerCase() || 'scheduled';
        const matchDate = new Date(fixture.querySelector('.date')?.textContent);
        
        let shouldShow = false;
        switch(filterType) {
            case 'all':
                shouldShow = true;
                break;
            case 'upcoming':
                shouldShow = matchStatus === 'scheduled' && matchDate > currentDate;
                break;
            case 'live':
                shouldShow = matchStatus === 'in_progress';
                break;
            case 'completed':
                shouldShow = matchStatus === 'completed';
                break;
        }

        fixture.style.display = shouldShow ? 'block' : 'none';
    });
}

// Update bracket view with match data
function updateBracketView(matches) {
    const bracketMatches = {
        'quarter-final': document.querySelector('.quarter-finals .bracket-matches'),
        'semi-final': document.querySelector('.semi-finals .bracket-matches'),
        'final': document.querySelector('.finals .bracket-matches')
    };

    // Group matches by type
    const matchesByType = matches.reduce((acc, match) => {
        if (match.match_type && match.match_type !== 'group') {
            if (!acc[match.match_type]) {
                acc[match.match_type] = [];
            }
            acc[match.match_type].push(match);
        }
        return acc;
    }, {});

    // Update each bracket section
    Object.entries(bracketMatches).forEach(([type, section]) => {
        if (section && matchesByType[type]) {
            section.innerHTML = matchesByType[type].map(match => `
                <div class="bracket-match">
                    <div class="team-bracket">
                        <img src="${match.home_team?.crest_url || DEFAULT_TEAM_LOGO}" 
                             alt="${match.home_team?.name || 'TBD'}" class="team-crest" loading="lazy">
                        <span class="team-name">${match.home_team?.name || 'TBD'}</span>
                        <span class="team-score">${match.home_score || 0}</span>
                    </div>
                    <div class="team-bracket">
                        <img src="${match.away_team?.crest_url || DEFAULT_TEAM_LOGO}" 
                             alt="${match.away_team?.name || 'TBD'}" class="team-crest" loading="lazy">
                        <span class="team-name">${match.away_team?.name || 'TBD'}</span>
                        <span class="team-score">${match.away_score || 0}</span>
                    </div>
                </div>
            `).join('');
        }
    });
}

// Function to update match type title
function updateMatchTypeTitle(matchData) {
    const titleElement = document.getElementById('matchTypeTitle');
    if (!titleElement) return;

    if (!matchData || !matchData.match_type) {
        titleElement.textContent = 'Match';
        return;
    }

    const matchType = matchData.match_type.toLowerCase();
    switch(matchType) {
        case 'group':
            titleElement.textContent = 'Group Match';
            break;
        case 'quarter-final':
            titleElement.textContent = 'Quarter Final';
            break;
        case 'semi-final':
            titleElement.textContent = 'Semi Final';
            break;
        case 'final':
            titleElement.textContent = 'Final';
            break;
        default:
            titleElement.textContent = 'Match';
    }
}

// Update the loadMatchDetails function to include match type update
async function loadMatchDetails(matchId) {
    try {
        console.log('Loading match details for ID:', matchId);
        const { data: match, error } = await getClient()
            .from('matches')
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .eq('id', matchId)
            .single();

        if (error) throw error;

        console.log('Loaded match details:', match);

        // Update match type title
        updateMatchTypeTitle(match);

        // Update match display and other elements
        currentMatch = match;
        updateMatchDisplay(match);
        await updateMatchStats();

    } catch (error) {
        console.error('Error loading match details:', error);
        showNotification('Error loading match details', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Waiting for Supabase initialization...');
        // Wait for Supabase to initialize
        const client = await waitForInit();
        console.log('Supabase initialized successfully');
        
        // Check if we're in the correct page/context
        const matchContainer = document.querySelector('.final-match-card');
        if (!matchContainer) {
            console.log('Not on final match page, exiting');
            return; // Exit if we're not on the correct page
        }

        // Initialize Supabase client globally
        window.supabaseClient = client;

        // Initialize admin controls
        await initializeAdminControls();

        // Load tournament data
        await loadTournamentData();

    } catch (error) {
        console.error('Error initializing:', error);
        showNotification('Error initializing application', 'error');
    }
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        background: #1d3557;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .notification.error {
        background: #e63946;
    }

    .notification.success {
        background: #2ecc71;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Add styles for the stats display
const statsStyles = `
    .stats-wrapper {
        padding: 0.5rem;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-row {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        margin: 0.5rem 0;
        background: #f8f9fa;
        border-radius: 8px;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-row:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .stat-row.top-1 {
        background: linear-gradient(135deg, #ffd700 0%, #fff7e6 100%);
    }

    .stat-row.top-2 {
        background: linear-gradient(135deg, #c0c0c0 0%, #f5f5f5 100%);
    }

    .stat-row.top-3 {
        background: linear-gradient(135deg, #cd7f32 0%, #faf0e6 100%);
    }

    .rank {
        width: 40px;
        text-align: center;
        font-weight: bold;
    }

    .rank .position {
        display: inline-block;
        width: 24px;
        height: 24px;
        line-height: 24px;
        border-radius: 50%;
        background: #e9ecef;
        color: #495057;
    }

    .trophy-1 { color: #ffd700; }
    .trophy-2 { color: #c0c0c0; }
    .trophy-3 { color: #cd7f32; }

    .player-info {
        flex: 1;
        margin-left: 1rem;
    }

    .player-name {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: #212529;
        margin-bottom: 0.25rem;
    }

    .stat-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: bold;
        color: #1d3557;
    }

    .team-name {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #6c757d;
    }

    .no-stats {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        color: #6c757d;
        background: #f8f9fa;
        border-radius: 8px;
        text-align: center;
    }

    .no-stats i {
        font-size: 2rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .fa-futbol, .fa-hands-helping {
        color: #1d3557;
    }

    .fa-shield-alt {
        color: #6c757d;
    }
`;

// Add the styles to the document
    const style = document.createElement('style');
style.textContent = statsStyles + notificationStyles;
    document.head.appendChild(style);