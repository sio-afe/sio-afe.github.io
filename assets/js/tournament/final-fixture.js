document.addEventListener('DOMContentLoaded', async function() {
    // Get the current page category (open-age or u17)
    const category = document.querySelector('.tournament-container').dataset.category;
    
    // Fetch data from JSON files
    try {
        const fixturesResponse = await fetch(`/assets/data/${category}/fixtures.json`);
        const teamsResponse = await fetch(`/assets/data/${category}/teams.json`);
        const statisticsResponse = await fetch(`/assets/data/${category}/statistics.json`);
        
        const fixturesData = await fixturesResponse.json();
        const teamsData = await teamsResponse.json();
        const statisticsData = await statisticsResponse.json();

        // Initialize the page with the data
        initializePage(fixturesData.fixtures, teamsData.teams, statisticsData);
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

function initializePage(fixtures, teams, statistics) {
    // Initialize sorting buttons
    initializeSortButtons(teams);
    
    // Initialize filter buttons
    initializeFilterButtons(fixtures);
    
    // Initialize view buttons
    initializeViewButtons(fixtures);
    
    // Initial render of table and fixtures
    renderLeagueTable(teams);
    renderFixtures(fixtures);
    renderBracket(fixtures);
    
    // Render statistics
    renderStatistics(statistics);
}

function initializeViewButtons(fixtures) {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const viewType = this.dataset.view;
            switchView(viewType);
        });
    });
}

function switchView(viewType) {
    const viewContents = document.querySelectorAll('.view-content');
    viewContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeView = viewType === 'list' ? 
        document.getElementById('fixtures-list') : 
        document.getElementById('bracket-view');
    
    if (activeView) {
        activeView.classList.add('active');
    }
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
            <td>${team.group}</td>
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
                <span class="stage">${fixture.stage}</span>
            </div>
        </div>
    `).join('');
}

function renderBracket(fixtures) {
    // Get unique groups from fixtures
    const groups = [...new Set(fixtures
        .filter(f => f.stage.startsWith('Group '))
        .map(f => f.stage.replace('Group ', '')))];
    
    // Render group stage matches
    renderGroupMatches(fixtures, groups);
    
    // Render knockout stages
    renderKnockoutMatches(fixtures);
}

function renderGroupMatches(fixtures, groups) {
    // Remove any existing group containers that aren't needed
    const groupsContainer = document.querySelector('.groups-container');
    if (groupsContainer) {
        // Clear existing groups
        groupsContainer.innerHTML = groups.map(group => `
            <div class="group" data-group="${group}">
                <h4>Group ${group}</h4>
                <div class="group-matches"></div>
            </div>
        `).join('');
    }
    
    // Render matches for each existing group
    groups.forEach(group => {
        const groupMatches = fixtures.filter(f => f.stage === `Group ${group}`);
        const groupContainer = document.querySelector(`.group[data-group="${group}"] .group-matches`);
        
        if (groupContainer) {
            groupContainer.innerHTML = groupMatches.map(match => `
                <div class="bracket-match">
                    <div class="team-bracket">
                        <span class="team-name">${match.homeTeam}</span>
                        <span class="team-score">${match.status === 'upcoming' ? '-' : match.homeScore || 0}</span>
                    </div>
                    <div class="team-bracket">
                        <span class="team-name">${match.awayTeam}</span>
                        <span class="team-score">${match.status === 'upcoming' ? '-' : match.awayScore || 0}</span>
                    </div>
                </div>
            `).join('');
        }
    });
}

function renderKnockoutMatches(fixtures) {
    // Render Quarter Finals
    const quarterFinals = fixtures.filter(f => f.stage === 'Quarter Final');
    renderKnockoutRound(quarterFinals, '.quarter-finals .bracket-matches');
    
    // Render Semi Finals
    const semiFinals = fixtures.filter(f => f.stage === 'Semi Final');
    renderKnockoutRound(semiFinals, '.semi-finals .bracket-matches');
    
    // Render Finals
    const finals = fixtures.filter(f => f.stage === 'Final');
    renderKnockoutRound(finals, '.finals .bracket-matches');
}

function renderKnockoutRound(matches, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    container.innerHTML = matches.map(match => `
        <div class="bracket-match">
            <div class="team-bracket">
                <span class="team-name">${match.homeTeam}</span>
                <span class="team-score">${match.status === 'upcoming' ? '-' : match.homeScore || 0}</span>
            </div>
            <div class="team-bracket">
                <span class="team-name">${match.awayTeam}</span>
                <span class="team-score">${match.status === 'upcoming' ? '-' : match.awayScore || 0}</span>
            </div>
        </div>
    `).join('');
}

function renderStatistics(statistics) {
    // Render top scorers
    const scorersList = document.getElementById('scorers-list');
    if (scorersList && statistics.topScorers) {
        scorersList.innerHTML = statistics.topScorers.map(scorer => `
            <div class="stats-list-item">
                <div class="player-info">
                    <span class="player-name">${scorer.name}</span>
                    <span class="player-team">${scorer.team}</span>
                </div>
                <div class="stats-info">
                    <span class="stat-value">${scorer.goals}</span>
                    <span class="stat-label">Goals (${scorer.matches} matches)</span>
                </div>
            </div>
        `).join('');
    }

    // Render top assists
    const assistsList = document.getElementById('assists-list');
    if (assistsList && statistics.topAssists) {
        assistsList.innerHTML = statistics.topAssists.map(player => `
            <div class="stats-list-item">
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <span class="player-team">${player.team}</span>
                </div>
                <div class="stats-info">
                    <span class="stat-value">${player.assists}</span>
                    <span class="stat-label">Assists (${player.matches} matches)</span>
                </div>
            </div>
        `).join('');
    }

    // Render clean sheets
    const cleanSheetsList = document.getElementById('clean-sheets-list');
    if (cleanSheetsList && statistics.cleanSheets) {
        cleanSheetsList.innerHTML = statistics.cleanSheets.map(player => `
            <div class="stats-list-item">
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <span class="player-team">${player.team}</span>
                </div>
                <div class="stats-info">
                    <span class="stat-value">${player.cleanSheets}</span>
                    <span class="stat-label">Clean Sheets (${player.matches} matches)</span>
                </div>
            </div>
        `).join('');
    }
} 