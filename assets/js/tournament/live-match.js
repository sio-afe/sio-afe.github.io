import { supabaseClient } from '../supabase-client.js';
import { getMatchDetails, getMatchEvents } from './match-api.js';

// Default team logo path
const DEFAULT_TEAM_LOGO = '/assets/data/open-age/team-logos/default.png';

// Live Match Handler Component
export class LiveMatchHandler {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentMatch = null;
        this.matchSubscription = null;
        this.goalsSubscription = null;
        this.initialize();
    }

    // Match type mapping
    getFormattedMatchType(type) {
        const matchTypeMap = {
            'group': 'Group Match',
            'quarter-final': 'Quarter Final Match',
            'semi-final': 'Semi Final Match',
            'final': 'Final Match'
        };
        return matchTypeMap[type] || 'Match';
    }

    // Get formatted match title with status
    getFormattedMatchTitle(match) {
        const baseTitle = this.getFormattedMatchType(match.match_type);
        if (match.status === 'completed') {
            return `${baseTitle} (Completed)`;
        }
        return baseTitle;
    }

    async initialize() {
        try {
            await this.fetchLastInProgressMatch();
            this.setupRealtimeSubscription();
        } catch (error) {
            console.error('Error initializing live match handler:', error);
            this.showNotification('Error initializing live match view', 'error');
        }
    }

    async fetchLastInProgressMatch() {
        try {
            // Get the tournament category from the page data attribute
            const tournamentContainer = document.querySelector('.tournament-container');
            const category = tournamentContainer?.dataset.category;

            if (!category) {
                console.error('Tournament category not found');
                return;
            }

            const { data: match, error } = await this.supabase
                .from('matches')
                .select(`
                    *,
                    home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                    away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
                `)
                .eq('status', 'in_progress')
                .eq('category', category)
                .order('match_date', { ascending: false })
                .limit(1)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    // No matches found
                    this.showNotification('No live matches at the moment', 'info');
                    return;
                }
                throw error;
            }

            if (match) {
                this.currentMatch = match;
                this.updateMatchDisplay(match);
                await this.fetchMatchStats(match.id);
                this.showNotification('Live match data loaded', 'success');
            }
        } catch (error) {
            console.error('Error fetching match:', error);
            this.showNotification('Error loading live match', 'error');
        }
    }

    async fetchMatchStats(matchId) {
        try {
            const { data: events, error } = await getMatchEvents(matchId);
            
            if (error) throw error;

            if (events) {
                this.updateMatchStats(events);
            }
        } catch (error) {
            console.error('Error fetching match stats:', error);
            this.showNotification('Error loading match statistics', 'error');
        }
    }

    updateMatchDisplay(match) {
        if (!match || !match.home_team || !match.away_team) {
            console.error('Invalid match data:', match);
            return;
        }

        try {
            // Update match title/type
            const matchTitle = document.querySelector('.match-title');
            if (matchTitle) matchTitle.textContent = this.getFormattedMatchTitle(match);

            // Update match card status
            const matchCard = document.querySelector('.final-match-card');
            if (matchCard) {
                matchCard.classList.remove('live', 'completed', 'upcoming');
                matchCard.classList.add(match.status === 'in_progress' ? 'live' : 
                                     match.status === 'completed' ? 'completed' : 'upcoming');
            }

            // Update status badge
            const statusBadge = document.querySelector('.match-status-badge');
            if (statusBadge) {
                statusBadge.className = 'match-status-badge'; // Reset classes
                if (match.status === 'in_progress') {
                    statusBadge.classList.add('live');
                    statusBadge.textContent = '🔴 LIVE';
                } else if (match.status === 'completed') {
                    statusBadge.classList.add('completed');
                    statusBadge.textContent = '✓ COMPLETED';
                } else {
                    statusBadge.classList.add('upcoming');
                    statusBadge.textContent = '⏰ UPCOMING';
                }
            }

            // Update team names
            const homeTeamName = document.querySelector('.user-view .home .team-name');
            const awayTeamName = document.querySelector('.user-view .away .team-name');
            if (homeTeamName) homeTeamName.textContent = match.home_team.name;
            if (awayTeamName) awayTeamName.textContent = match.away_team.name;

            // Update team logos
            const homeLogo = document.querySelector('.user-view .home .team-logo');
            const awayLogo = document.querySelector('.user-view .away .team-logo');
            if (homeLogo) homeLogo.src = match.home_team.crest_url || DEFAULT_TEAM_LOGO;
            if (awayLogo) awayLogo.src = match.away_team.crest_url || DEFAULT_TEAM_LOGO;

            // Update scores
            const homeScore = document.querySelector('.user-view .home .score');
            const awayScore = document.querySelector('.user-view .away .score');
            if (homeScore) homeScore.textContent = match.home_score || '0';
            if (awayScore) awayScore.textContent = match.away_score || '0';

            // Update match details
            this.updateMatchDetails(match);
        } catch (error) {
            console.error('Error updating match display:', error);
            this.showNotification('Error updating match display', 'error');
        }
    }

    updateMatchDetails(match) {
        try {
            const matchDate = new Date(match.match_date);
            
            // Update date
            const dateElement = document.querySelector('.user-view .date');
            if (dateElement) {
                dateElement.textContent = matchDate.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }

            // Update time
            const timeElement = document.querySelector('.user-view .time');
            if (timeElement) {
                timeElement.textContent = matchDate.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            // Update venue
            const venueElement = document.querySelector('.user-view .venue');
            if (venueElement) {
                venueElement.textContent = match.venue || 'TBD';
            }
        } catch (error) {
            console.error('Error updating match details:', error);
        }
    }

    updateMatchStats(events) {
        try {
            // Clear existing stats
            const homeStats = document.querySelector('.user-view .team-stats.home');
            const awayStats = document.querySelector('.user-view .team-stats.away');
            
            if (!homeStats || !awayStats) return;

            homeStats.innerHTML = '';
            awayStats.innerHTML = '';

            if (events && events.length > 0 && this.currentMatch) {
                // Group events by team
                const homeEvents = events.filter(event => event.team_id === this.currentMatch.home_team_id);
                const awayEvents = events.filter(event => event.team_id === this.currentMatch.away_team_id);

                // Update stats displays
                homeStats.innerHTML = this.formatMatchEvents(homeEvents, 'home');
                awayStats.innerHTML = this.formatMatchEvents(awayEvents, 'away');
            } else {
                homeStats.innerHTML = '<div class="no-stats"></div>';
                awayStats.innerHTML = '<div class="no-stats"></div>';
            }
        } catch (error) {
            console.error('Error updating match stats:', error);
            this.showNotification('Error updating match statistics', 'error');
        }
    }

    formatMatchEvents(events, teamType) {
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

    setupRealtimeSubscription() {
        try {
            // Clean up existing subscriptions
            this.cleanupSubscriptions();

            const tournamentContainer = document.querySelector('.tournament-container');
            const category = tournamentContainer?.dataset.category;

            // Subscribe to match updates
            this.matchSubscription = this.supabase
                .channel('live_match_updates')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'matches',
                    filter: `status=eq.in_progress,category=eq.${category}`
                }, () => {
                    this.fetchLastInProgressMatch();
                })
                .subscribe();

            // Subscribe to goal updates if there's a current match
            if (this.currentMatch) {
                this.goalsSubscription = this.supabase
                    .channel('goal_updates')
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'goals',
                        filter: `match_id=eq.${this.currentMatch.id}`
                    }, () => {
                        this.fetchMatchStats(this.currentMatch.id);
                    })
                    .subscribe();
            }
        } catch (error) {
            console.error('Error setting up realtime subscriptions:', error);
            this.showNotification('Error setting up live updates', 'error');
        }
    }

    cleanupSubscriptions() {
        if (this.matchSubscription) {
            this.matchSubscription.unsubscribe();
            this.matchSubscription = null;
        }
        if (this.goalsSubscription) {
            this.goalsSubscription.unsubscribe();
            this.goalsSubscription = null;
        }
    }

    showNotification(message, type = 'info') {
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

    // Clean up method
    destroy() {
        this.cleanupSubscriptions();
    }
}

// Initialize the live match handler when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const liveMatchHandler = new LiveMatchHandler();
    
    // Store the instance in window for potential future access
    window.liveMatchHandler = liveMatchHandler;
}); 