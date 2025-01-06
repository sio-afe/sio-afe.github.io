document.addEventListener('DOMContentLoaded', async function() {
    // Get the current page category (open-age or u17)
    const category = document.querySelector('.tournament-container').dataset.category;
    console.log('Category:', category);
    
    // Fetch data from JSON files
    try {
        const fixturesResponse = await fetch(`/assets/data/${category}/fixtures.json`);
        const teamsResponse = await fetch(`/assets/data/${category}/teams.json`);
        const statisticsResponse = await fetch(`/assets/data/${category}/statistics.json`);
        
        const fixturesData = await fixturesResponse.json();
        const teamsData = await teamsResponse.json();
        const statisticsData = await statisticsResponse.json();

        console.log('Teams data:', teamsData);

        // Create a map of team names to their crests
        const teamCrestMap = {};
        teamsData.teams.forEach(team => {
            console.log('Mapping team:', team.name, 'Crest:', team.crest);
            teamCrestMap[team.name] = team.crest;
        });

        console.log('Team crest map:', teamCrestMap);

        // Add team crests to fixtures
        const fixturesWithCrests = fixturesData.fixtures.map(fixture => {
            console.log('Processing fixture:', fixture.homeTeam, 'vs', fixture.awayTeam);
            const mappedFixture = {
                ...fixture,
                homeTeamCrest: teamCrestMap[fixture.homeTeam],
                awayTeamCrest: teamCrestMap[fixture.awayTeam]
            };
            console.log('Mapped crests:', mappedFixture.homeTeamCrest, mappedFixture.awayTeamCrest);
            return mappedFixture;
        });

        console.log('Fixtures with crests:', fixturesWithCrests);

        // Initialize the page with the data
        initializePage(fixturesWithCrests, teamsData.teams, statisticsData);
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

function initializePage(fixtures, teams, statistics) {
    // Initialize popup first
    initTeamPopup();
    
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

    const defaultLogo = '/assets/data/open-age/team-logos/default.png';

    tableBody.innerHTML = teams.map((team, index) => {
        // Handle team logo path
        const logoPath = team.crest ? 
            (team.crest.startsWith('/') ? team.crest : `/assets/data/open-age/team-logos/${team.crest}`) : 
            defaultLogo;
            
        return `
        <tr>
            <td>${index + 1}</td>
            <td class="team-name-cell" data-team='${JSON.stringify(team)}'>
                <div class="team-info">
                    <img src="${logoPath}" 
                         class="team-crest" 
                         alt="${team.name}"
                         onerror="this.src='${defaultLogo}'">
                    ${team.name}
                </div>
            </td>
            <td>${team.group}</td>
            <td>${team.played || 0}</td>
            <td>${team.won || 0}</td>
            <td>${team.drawn || 0}</td>
            <td>${team.lost || 0}</td>
            <td>${team.points || 0}</td>
            <td>${(team.gf || 0) - (team.ga || 0)}</td>
            <td>${team.gf || 0}</td>
            <td>${team.ga || 0}</td>
        </tr>
    `}).join('');

    // Add click event listeners to team cells
    const teamCells = tableBody.querySelectorAll('.team-name-cell');
    teamCells.forEach(cell => {
        cell.addEventListener('click', () => {
            const teamData = JSON.parse(cell.dataset.team);
            showTeamPopup(teamData);
        });
    });
}

function renderFixtures(fixtures) {
    const fixturesList = document.getElementById('fixtures-list');
    if (!fixturesList) return;

    const defaultLogo = '/assets/data/open-age/team-logos/default.png';
    const category = document.querySelector('.tournament-container').dataset.category;

    // Function to get team logo path
    function getTeamLogoPath(crest) {
        if (!crest) return defaultLogo;
        return crest.startsWith('/') ? crest : `/assets/data/${category}/team-logos/${crest}`;
    }

    fixturesList.innerHTML = fixtures.map(fixture => `
        <div class="fixture" data-status="${fixture.status}">
            <div class="fixture-teams">
                <span class="home-team">
                    <img src="${getTeamLogoPath(fixture.homeTeamCrest)}" 
                         class="team-crest" 
                         alt="${fixture.homeTeam}"
                         onerror="this.src='${defaultLogo}'">
                    ${fixture.homeTeam}
                </span>
                <span class="score">
                    ${fixture.status === 'upcoming' ? 'vs' : 
                      `${fixture.homeScore || 0} - ${fixture.awayScore || 0}`}
                </span>
                <span class="away-team">
                    <img src="${getTeamLogoPath(fixture.awayTeamCrest)}" 
                         class="team-crest" 
                         alt="${fixture.awayTeam}"
                         onerror="this.src='${defaultLogo}'">
                    ${fixture.awayTeam}
                </span>
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
    const defaultLogo = '/assets/data/open-age/team-logos/default.png';
    const category = document.querySelector('.tournament-container').dataset.category;

    // Function to get team logo path
    function getTeamLogoPath(crest) {
        if (!crest) return defaultLogo;
        return crest.startsWith('/') ? crest : `/assets/data/${category}/team-logos/${crest}`;
    }
    
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
                        <img src="${getTeamLogoPath(match.homeTeamCrest)}" 
                             class="team-crest" 
                             alt="${match.homeTeam}"
                             onerror="this.src='${defaultLogo}'">
                        <span class="team-name">${match.homeTeam}</span>
                        <span class="team-score">${match.status === 'upcoming' ? '-' : match.homeScore || 0}</span>
                    </div>
                    <div class="team-bracket">
                        <img src="${getTeamLogoPath(match.awayTeamCrest)}" 
                             class="team-crest" 
                             alt="${match.awayTeam}"
                             onerror="this.src='${defaultLogo}'">
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

// Team Popup Functionality
function initTeamPopup() {
  const popup = document.getElementById('team-popup');
  if (!popup) return;

  const closeBtn = popup.querySelector('.close-popup');
  if (closeBtn) {
    // Close popup when clicking the close button
    closeBtn.addEventListener('click', () => {
      popup.classList.remove('active');
    });
  }

  // Close popup when clicking outside
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.classList.remove('active');
    }
  });

  // Close popup when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
      popup.classList.remove('active');
    }
  });
}

function showTeamPopup(teamData) {
    const popup = document.getElementById('team-popup');
    if (!popup) return;
    
    const defaultLogo = '/assets/data/open-age/team-logos/default.png';
    
    // Update popup content with team data
    const logo = popup.querySelector('.team-popup-logo');
    if (logo) {
        // Handle team logo path
        const logoPath = teamData.crest ? 
            (teamData.crest.startsWith('/') ? teamData.crest : `/assets/data/open-age/team-logos/${teamData.crest}`) : 
            defaultLogo;
        
        logo.src = logoPath;
        logo.alt = `${teamData.name} Logo`;
        
        // Set up error handler for fallback to default logo
        logo.onerror = function() {
            this.src = defaultLogo;
        };
    }
    
    const elements = {
        '.team-popup-name': teamData.name,
        '.captain-name': teamData.captain || 'N/A',
        '.matches-played': teamData.played || '0',
        '.matches-won': teamData.won || '0',
        '.matches-lost': teamData.lost || '0',
        '.matches-drawn': teamData.drawn || '0',
        '.goals-for': teamData.gf || '0',
        '.goals-against': teamData.ga || '0',
        '.goal-difference': (teamData.gf || 0) - (teamData.ga || 0),
        '.points': teamData.points || '0'
    };

    for (const [selector, value] of Object.entries(elements)) {
        const element = popup.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    // Show popup
    popup.classList.add('active');
}

// Function to handle team name click in the table
function handleTeamClick(teamData) {
  if (!teamData) return;
  showTeamPopup(teamData);
} 