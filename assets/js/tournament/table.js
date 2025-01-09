class LeagueTable {
    constructor(category) {
        this.category = category;
        this.tableBody = document.getElementById('table-body');
        this.popup = document.getElementById('team-popup');
        this.closePopupBtn = this.popup?.querySelector('.close-popup');
        this.currentSort = {
            field: 'points',
            direction: 'desc'
        };

        // Initialize event listeners
        this.initEventListeners();
        
        // Initial fetch and render
        this.fetchTeamData().then(() => {
            this.renderTable();
        });

        // Subscribe to team updates
        this.subscribeToTeamUpdates();
    }

    initEventListeners() {
        // Sort button listeners
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const field = btn.dataset.sort;
                this.handleSort(field);
            });
        });

        // Add team click listener
        if (this.tableBody) {
            this.tableBody.addEventListener('click', (e) => {
                const teamCell = e.target.closest('.team-name-cell');
                if (teamCell) {
                    const teamId = teamCell.dataset.teamId;
                    const team = this.teams.find(t => t.id === teamId);
                    if (team) {
                        this.showTeamPopup(team);
                    }
                }
            });
        }

        // Close popup handlers
        if (this.closePopupBtn) {
            this.closePopupBtn.addEventListener('click', () => {
                this.popup.classList.remove('active');
            });
        }

        if (this.popup) {
            this.popup.addEventListener('click', (e) => {
                if (e.target === this.popup) {
                    this.popup.classList.remove('active');
                }
            });
        }
    }

    subscribeToTeamUpdates() {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        const subscription = supabase
            .channel('team_updates')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'teams',
                    filter: `category=eq.${this.category}`
                }, 
                () => {
                    // Refresh team data when any team is updated
                    this.fetchTeamData().then(() => {
                        this.renderTable();
                    });
                }
            )
            .subscribe();

        // Store subscription for cleanup
        this.subscription = subscription;
    }

    async fetchTeamData() {
        try {
            const { data: teams, error } = await window.supabaseClient
                .from('teams')
                .select('*')
                .eq('category', this.category)
                .order('points', { ascending: false });

            if (error) throw error;

            this.teams = teams.map(team => ({
                ...team,
                gd: team.goals_for - team.goals_against // Calculate goal difference
            }));
        } catch (error) {
            console.error('Error fetching team data:', error);
            this.teams = [];
            this.handleError();
        }
    }

    handleSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'desc' ? 'asc' : 'desc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'desc';
        }

        this.updateSortButtonsUI();
        this.renderTable();
    }

    updateSortButtonsUI() {
        document.querySelectorAll('.sort-btn').forEach(button => {
            button.classList.remove('active', 'asc', 'desc');
            if (button.dataset.sort === this.currentSort.field) {
                button.classList.add('active', this.currentSort.direction);
            }
        });
    }

    sortTeams() {
        const { field, direction } = this.currentSort;
        return [...this.teams].sort((a, b) => {
            let comparison = 0;
            
            // Primary sort by selected field
            if (field === 'points') {
                if (b.points !== a.points) comparison = b.points - a.points;
                else if (b.gd !== a.gd) comparison = b.gd - a.gd;
                else comparison = b.goals_for - a.goals_for;
            } else if (field === 'gd') {
                if (b.gd !== a.gd) comparison = b.gd - a.gd;
                else if (b.points !== a.points) comparison = b.points - a.points;
                else comparison = b.goals_for - a.goals_for;
            } else if (field === 'goals') {
                if (b.goals_for !== a.goals_for) comparison = b.goals_for - a.goals_for;
                else if (b.points !== a.points) comparison = b.points - a.points;
                else comparison = b.gd - a.gd;
            }
            
            return direction === 'desc' ? comparison : -comparison;
        });
    }

    renderTable() {
        if (!this.tableBody || !this.teams) return;

        const sortedTeams = this.sortTeams();
        
        this.tableBody.innerHTML = sortedTeams.map((team, index) => `
            <tr class="${index < 4 ? 'qualification-zone' : ''}">
                <td>${index + 1}</td>
                <td class="team-name-cell" data-team-id="${team.id}">
                    <div class="team-info">
                        <img src="${team.crest_url || DEFAULT_TEAM_LOGO}" 
                             alt="${team.name} crest" 
                             class="team-crest"
                             loading="lazy">
                        <span>${team.name}</span>
                    </div>
                </td>
                <td>${team.group_name || '-'}</td>
                <td>${team.played || 0}</td>
                <td>${team.won || 0}</td>
                <td>${team.drawn || 0}</td>
                <td>${team.lost || 0}</td>
                <td><strong>${team.points || 0}</strong></td>
                <td>${team.gd > 0 ? '+' : ''}${team.gd}</td>
                <td>${team.goals_for || 0}</td>
                <td>${team.goals_against || 0}</td>
            </tr>
        `).join('');
    }

    handleError() {
        if (!this.tableBody) return;
        
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="error-message">
                    <div>
                        <p>Unable to load league table</p>
                        <button onclick="window.location.reload()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }

    showTeamPopup(team) {
        if (!this.popup) return;

        // Update popup content
        const logo = this.popup.querySelector('.team-popup-logo');
        const name = this.popup.querySelector('.team-popup-name');
        const captain = this.popup.querySelector('.captain-name');
        const played = this.popup.querySelector('.matches-played');
        const won = this.popup.querySelector('.matches-won');
        const lost = this.popup.querySelector('.matches-lost');
        const drawn = this.popup.querySelector('.matches-drawn');
        const points = this.popup.querySelector('.points');

        if (logo) logo.src = team.crest_url || DEFAULT_TEAM_LOGO;
        if (name) name.textContent = team.name;
        if (captain) captain.textContent = team.captain || 'N/A';
        if (played) played.textContent = team.played || 0;
        if (won) won.textContent = team.won || 0;
        if (lost) lost.textContent = team.lost || 0;
        if (drawn) drawn.textContent = team.drawn || 0;
        if (points) points.textContent = team.points || 0;

        // Show popup
        this.popup.classList.add('active');
    }

    // Cleanup method
    destroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

// Initialize based on the page
document.addEventListener('DOMContentLoaded', () => {
    const tournamentContainer = document.querySelector('.tournament-container');
    const category = tournamentContainer?.dataset.category;
    if (category) {
        window.leagueTable = new LeagueTable(category);
    }
});
