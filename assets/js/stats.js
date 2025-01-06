class TournamentStats {
    constructor() {
        this.scorersList = document.getElementById('scorers-list');
        this.assistersList = document.getElementById('assisters-list');
        this.cleanSheetsList = document.getElementById('clean-sheets-list');
        this.stats = null;
        this.updateInterval = null;
        
        this.init();
    }

    async init() {
        try {
            await this.fetchStats();
            this.renderStats();
            this.startLiveUpdates();
        } catch (error) {
            console.error('Failed to initialize stats:', error);
            this.handleError();
        }
    }

    async fetchStats() {
        const response = await fetch('/api/tournament/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        this.stats = await response.json();
    }

    startLiveUpdates() {
        // Update stats every 2 minutes
        this.updateInterval = setInterval(async () => {
            if (document.hidden) return;
            await this.updateStats();
        }, 120000);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.updateInterval) {
                clearInterval(this.updateInterval);
            } else {
                this.startLiveUpdates();
            }
        });
    }

    async updateStats() {
        try {
            await this.fetchStats();
            this.renderStats();
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    renderPlayerList(players, type) {
        return players
            .slice(0, 10) // Top 10 only
            .map((player, index) => `
                <li class="stat-item">
                    <span class="position">${index + 1}</span>
                    <div class="player-info">
                        <img src="${player.image}" alt="${player.name}" class="player-image">
                        <div class="player-details">
                            <span class="player-name">${player.name}</span>
                            <span class="team-name">${player.team}</span>
                        </div>
                    </div>
                    <span class="stat-value">
                        ${player[type]}
                        <span class="stat-label">${type === 'goals' ? '⚽' : type === 'assists' ? '👟' : '🧤'}</span>
                    </span>
                </li>
            `).join('');
    }

    renderStats() {
        if (!this.stats) return;

        const { scorers, assists, cleanSheets } = this.stats;

        this.scorersList.innerHTML = this.renderPlayerList(scorers, 'goals');
        this.assistersList.innerHTML = this.renderPlayerList(assists, 'assists');
        this.cleanSheetsList.innerHTML = this.renderPlayerList(cleanSheets, 'cleanSheets');

        // Add achievement badges
        this.addAchievementBadges();
    }

    addAchievementBadges() {
        // Add special badges for achievements
        const topScorer = this.stats.scorers[0];
        if (topScorer?.goals >= 10) {
            this.addBadge(this.scorersList.firstChild, '👑 Golden Boot Leader');
        }

        const topAssister = this.stats.assists[0];
        if (topAssister?.assists >= 8) {
            this.addBadge(this.assistersList.firstChild, '🎯 Playmaker');
        }
    }

    addBadge(element, text) {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        badge.textContent = text;
        element.appendChild(badge);
    }

    handleError() {
        const errorMessage = `
            <div class="error-message">
                <p>Unable to load statistics</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;

        this.scorersList.innerHTML = errorMessage;
        this.assistersList.innerHTML = errorMessage;
        this.cleanSheetsList.innerHTML = errorMessage;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new TournamentStats());