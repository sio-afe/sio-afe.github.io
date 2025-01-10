class FixtureManager {
    constructor() {
        this.container = document.getElementById('fixtures-grouped');
        this.filterButtons = document.querySelectorAll('.fixture-filters button');
        this.category = window.location.pathname.includes('/u17/') ? 'u17' : 'open-age';
        this.fixtures = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        try {
            await this.fetchFixtures();
            this.setupEventListeners();
            this.startLiveUpdates();
            this.renderFixtures();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.handleError();
        }
    }

    async fetchFixtures() {
        try {
            const response = await fetch(`/assets/data/${this.category}/fixtures.json`);
            if (!response.ok) throw new Error('Failed to fetch fixtures');
            const data = await response.json();
            this.fixtures = data.fixtures;
        } catch (error) {
            console.error('Failed to load fixtures:', error);
            throw error;
        }
    }

    setupEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilterChange(button.dataset.filter);
            });
        });
    }

    handleFilterChange(filter) {
        this.currentFilter = filter;
        this.updateFilterButtonsUI();
        this.renderFixtures();
    }

    updateFilterButtonsUI() {
        this.filterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === this.currentFilter);
        });
    }

    startLiveUpdates() {
        // Update live matches every 30 seconds
        this.liveUpdateInterval = setInterval(async () => {
            if (document.hidden) return;
            await this.updateLiveFixtures();
        }, 30000);

        // Cleanup on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.liveUpdateInterval) {
                clearInterval(this.liveUpdateInterval);
            } else {
                this.startLiveUpdates();
            }
        });
    }

    async updateLiveFixtures() {
        try {
            const response = await fetch('/api/tournament/live-fixtures');
            if (!response.ok) throw new Error('Failed to fetch live fixtures');
            const liveUpdates = await response.json();
            
            this.fixtures = this.fixtures.map(fixture => {
                const update = liveUpdates.find(u => u.id === fixture.id);
                return update || fixture;
            });

            this.renderFixtures();
        } catch (error) {
            console.error('Failed to update live fixtures:', error);
        }
    }

    filterFixtures() {
        if (this.currentFilter === 'all') return this.fixtures;
        return this.fixtures.filter(fixture => fixture.status === this.currentFilter);
    }

    groupFixturesByDate(fixtures) {
        return fixtures.reduce((groups, fixture) => {
            const matchDate = new Date(fixture.match_date);
            const date = matchDate.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            if (!groups[date]) groups[date] = [];
            groups[date].push(fixture);
            return groups;
        }, {});
    }

    getFixtureStatusClass(status) {
        const statusClasses = {
            upcoming: 'status-upcoming',
            live: 'status-live',
            completed: 'status-completed'
        };
        return statusClasses[status] || '';
    }

    renderFixtureScore(fixture) {
        if (fixture.status === 'upcoming') {
            // First try to use the time field from fixtures.json
            if (fixture.time) {
                return `<div class="fixture-time">${fixture.time}</div>`;
            }
            // Then try scheduled_time from database
            if (fixture.scheduled_time) {
                return `<div class="fixture-time">${fixture.scheduled_time}</div>`;
            }
            // Finally fallback to match_date
            const matchDate = new Date(fixture.match_date);
            // Subtract 5 hours and 30 minutes to convert IST to UTC
            matchDate.setHours(matchDate.getHours() - 5);
            matchDate.setMinutes(matchDate.getMinutes() - 30);
            const timeToShow = matchDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            return `<div class="fixture-time">${timeToShow}</div>`;
        }

        return `
            <div class="fixture-score ${fixture.status === 'live' ? 'live' : ''}">
                <span>${fixture.home_score || 0}</span>
                <span>-</span>
                <span>${fixture.away_score || 0}</span>
                ${fixture.status === 'live' ? `<span class="match-minute">${fixture.minute}'</span>` : ''}
            </div>
        `;
    }

    renderFixtures() {
        const filteredFixtures = this.filterFixtures();
        const groupedFixtures = this.groupFixturesByDate(filteredFixtures);
        
        this.container.innerHTML = Object.entries(groupedFixtures)
            .map(([date, fixtures]) => `
                <div class="fixture-group">
                    <h3 class="fixture-date">${date}</h3>
                    ${fixtures.map(fixture => `
                        <div class="fixture-item ${this.getFixtureStatusClass(fixture.status)}">
                            <div class="fixture-teams">
                                <div class="team home">
                                    <img src="${fixture.home_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}" alt="${fixture.home_team?.name || 'Home Team'} crest">
                                    <span>${fixture.home_team?.name || 'TBD'}</span>
                                </div>
                                ${this.renderFixtureScore(fixture)}
                                <div class="team away">
                                    <img src="${fixture.away_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}" alt="${fixture.away_team?.name || 'Away Team'} crest">
                                    <span>${fixture.away_team?.name || 'TBD'}</span>
                                </div>
                            </div>
                            ${fixture.venue ? `<div class="fixture-venue">${fixture.venue}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('');
    }

    handleError() {
        this.container.innerHTML = `
            <div class="error-message">
                <p>Unable to load fixtures</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new FixtureManager());