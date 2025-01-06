class LeagueTable {
    constructor() {
        this.tableBody = document.getElementById('table-body');
        this.sortButtons = document.querySelectorAll('.table-controls button');
        this.currentSort = { field: 'points', direction: 'desc' };
        
        // Get category from URL path
        this.category = window.location.pathname.includes('/u17/') ? 'u17' : 'open-age';
        this.teams = [];
        
        this.init();
    }

    async fetchTeamData() {
        try {
            const response = await fetch(`/assets/data/${this.category}/teams.json`);
            if (!response.ok) throw new Error('Failed to fetch team data');
            const data = await response.json();
            
            // Calculate additional stats for each team
            this.teams = data.teams.map(team => ({
                ...team,
                points: (team.won * 3) + team.drawn,
                gd: team.gf - team.ga
            }));
        } catch (error) {
            console.error('Failed to load team data:', error);
            throw error;
        }
    }


    setupEventListeners() {
        this.sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sortField = button.dataset.sort;
                this.handleSort(sortField);
            });
        });
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
        this.sortButtons.forEach(button => {
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
            if (a[field] !== b[field]) {
                comparison = a[field] - b[field];
            } else {
                // Tiebreakers in order: Points → GD → Goals For
                if (a.points !== b.points) comparison = a.points - b.points;
                else if (a.gd !== b.gd) comparison = a.gd - b.gd;
                else comparison = a.gf - b.gf;
            }
            
            return direction === 'desc' ? -comparison : comparison;
        });
    }

    renderTable() {
        const sortedTeams = this.sortTeams();
        
        this.tableBody.innerHTML = sortedTeams.map((team, index) => `
            <tr class="${index < 4 ? 'qualification-zone' : ''}">
                <td>${index + 1}</td>
                <td>
                    <div class="team-info">
                        <img src="${team.crest}" alt="${team.name} crest" class="team-crest">
                        <span>${team.name}</span>
                    </div>
                </td>
                <td>${team.played}</td>
                <td>${team.won}</td>
                <td>${team.drawn}</td>
                <td>${team.lost}</td>
                <td><strong>${team.points}</strong></td>
                <td>${team.gd > 0 ? '+' : ''}${team.gd}</td>
                <td>${team.gf}</td>
                <td>${team.ga}</td>
            </tr>
        `).join('');
    }

    handleError() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="error-message">
                    <div>
                        <p>Unable to load league table</p>
                        <button onclick="window.location.reload()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Initialize based on the page
document.addEventListener('DOMContentLoaded', () => new LeagueTable());
