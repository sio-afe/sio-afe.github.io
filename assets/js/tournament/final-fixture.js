document.addEventListener('DOMContentLoaded', async function() {
    // Get the current page category (open-age or u17)
    const category = document.querySelector('.tournament-container').dataset.category;
    
    // Fetch data from JSON files
    try {
        const fixturesResponse = await fetch(`/assets/data/${category}/fixtures.json`);
        const teamsResponse = await fetch(`/assets/data/${category}/teams.json`);
        
        const fixturesData = await fixturesResponse.json();
        const teamsData = await teamsResponse.json();

        // Initialize the page with the data
        initializePage(fixturesData.fixtures, teamsData.teams);
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

function initializePage(fixtures, teams) {
    // Initialize sorting buttons
    initializeSortButtons(teams);
    
    // Initialize filter buttons
    initializeFilterButtons(fixtures);
    
    // Initial render of table and fixtures
    renderLeagueTable(teams);
    renderFixtures(fixtures);
}

function initializeSortButtons(teams) {
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const sortBy = this.dataset.sort;
            sortTable(teams, sortBy);
        });
    });
}

function initializeFilterButtons(fixtures) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterBy = this.dataset.filter;
            filterFixtures(fixtures, filterBy);
        });
    });
}

function sortTable(teams, sortBy) {
    const sortedTeams = [...teams].sort((a, b) => {
        switch(sortBy) {
            case 'points':
                return b.points - a.points;
            case 'gd':
                return (b.gf - b.ga) - (a.gf - a.ga);
            case 'goals':
                return b.gf - a.gf;
            default:
                return b.points - a.points;
        }
    });
    
    renderLeagueTable(sortedTeams);
}

function filterFixtures(fixtures, filterBy) {
    const filteredFixtures = filterBy === 'all' 
        ? fixtures 
        : fixtures.filter(fixture => fixture.status === filterBy);
    
    renderFixtures(filteredFixtures);
}

function renderLeagueTable(teams) {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    tableBody.innerHTML = teams.map((team, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <div class="team-info">
                    ${team.crest ? `<img src="${team.crest}" class="team-crest" alt="${team.name}">` : ''}
                    ${team.name}
                </div>
            </td>
            <td>${team.played}</td>
            <td>${team.won}</td>
            <td>${team.drawn}</td>
            <td>${team.lost}</td>
            <td data-points="${team.points || 0}">${team.points || 0}</td>
            <td data-gd="${(team.gf || 0) - (team.ga || 0)}">${(team.gf || 0) - (team.ga || 0)}</td>
            <td data-goals="${team.gf || 0}">${team.gf || 0}</td>
            <td>${team.ga || 0}</td>
        </tr>
    `).join('');
}

function renderFixtures(fixtures) {
    const fixturesList = document.getElementById('fixtures-list');
    if (!fixturesList) return;

    fixturesList.innerHTML = fixtures.map(fixture => `
        <div class="fixture" data-status="${fixture.status}">
            <div class="fixture-teams">
                <span class="home-team">${fixture.homeTeam}</span>
                <span class="score">
                    ${fixture.status === 'upcoming' ? 'vs' : 
                      `${fixture.homeScore || 0} - ${fixture.awayScore || 0}`}
                </span>
                <span class="away-team">${fixture.awayTeam}</span>
            </div>
            <div class="fixture-meta">
                ${fixture.status === 'live' ? 
                    `<span class="live-badge">LIVE</span>` : 
                  fixture.status === 'completed' ? 
                    `<span class="completed-badge">FT</span>` :
                    `<span class="date-badge">${fixture.date} ${fixture.time}</span>`}
                <span class="venue">${fixture.venue}</span>
            </div>
        </div>
    `).join('');
} 