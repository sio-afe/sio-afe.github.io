// Fireworks animation
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Firework {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 2 + 1;
        this.velocityX = Math.random() * 6 - 3;
        this.velocityY = Math.random() * 6 - 3;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class FireworkShow {
    constructor() {
        this.fireworks = [];
    }

    addFirework(x, y, color) {
        const particleCount = Math.random() * 40 + 20;
        for (let i = 0; i < particleCount; i++) {
            this.fireworks.push(new Firework(x, y, color));
        }
    }

    update() {
        this.fireworks = this.fireworks.filter(firework => firework.alpha > 0);
        this.fireworks.forEach(firework => firework.update());
    }

    draw() {
        this.fireworks.forEach(firework => firework.draw());
    }
}

const fireworkShow = new FireworkShow();

function randomColor() {
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function launchFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5;
    const color = randomColor();
    fireworkShow.addFirework(x, y, color);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworkShow.update();
    fireworkShow.draw();
    requestAnimationFrame(animate);
}

// Tournament Data
const tournamentData = {
    teams: [
        { name: "Team A", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 2 },
        { name: "Team B", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3 },
        { name: "Team C", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4 },
        { name: "Team D", played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 9 }
    ],
    fixtures: [
        { date: "2024-03-15", home: "Team A", away: "Team B", homeScore: 2, awayScore: 1 },
        { date: "2024-03-16", home: "Team C", away: "Team D", homeScore: 3, awayScore: 0 },
        // Add more fixtures as needed
    ],
    topScorers: [
        { name: "Player 1", team: "Team A", goals: 4 },
        { name: "Player 2", team: "Team B", goals: 3 },
        // Add more scorers
    ],
    topAssisters: [
        { name: "Player 3", team: "Team A", assists: 3 },
        { name: "Player 4", team: "Team C", assists: 2 },
        // Add more assisters
    ],
    cleanSheets: [
        { name: "Team A", cleanSheets: 2 },
        { name: "Team B", cleanSheets: 1 },
        // Add more clean sheets
    ]
};

// Function to update league table
function updateLeagueTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    // Sort teams by points (assuming 3 for win, 1 for draw)
    const sortedTeams = [...tournamentData.teams].sort((a, b) => {
        const pointsA = (a.won * 3) + a.drawn;
        const pointsB = (b.won * 3) + b.drawn;
        if (pointsB !== pointsA) return pointsB - pointsA;
        return (b.gf - b.ga) - (a.gf - a.ga); // Goal difference as tiebreaker
    });

    tableBody.innerHTML = sortedTeams.map((team, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${team.name}</td>
            <td>${team.played}</td>
            <td>${team.won}</td>
            <td>${team.drawn}</td>
            <td>${team.lost}</td>
            <td>${(team.won * 3) + team.drawn}</td>
            <td>${team.gf - team.ga}</td>
            <td>${team.gf}</td>
            <td>${team.ga}</td>
        </tr>
    `).join('');
}

// Function to update fixtures
function updateFixtures() {
    const fixturesList = document.getElementById('fixtures-grouped');
    if (!fixturesList) return;

    const fixturesHTML = tournamentData.fixtures.map(fixture => `
        <li>
            ${fixture.date}: ${fixture.home} ${fixture.homeScore} - ${fixture.awayScore} ${fixture.away}
        </li>
    `).join('');

    fixturesList.innerHTML = fixturesHTML;
}

// Function to update statistics
function updateStats() {
    // Update top scorers
    const scorersList = document.getElementById('scorers-list');
    if (scorersList) {
        scorersList.innerHTML = tournamentData.topScorers.map(scorer => `
            <li>${scorer.name} (${scorer.team}) - ${scorer.goals} goals</li>
        `).join('');
    }

    // Update top assisters
    const assistersList = document.getElementById('assisters-list');
    if (assistersList) {
        assistersList.innerHTML = tournamentData.topAssisters.map(assister => `
            <li>${assister.name} (${assister.team}) - ${assister.assists} assists</li>
        `).join('');
    }

    // Update clean sheets
    const cleanSheetsList = document.getElementById('clean-sheets-list');
    if (cleanSheetsList) {
        cleanSheetsList.innerHTML = tournamentData.cleanSheets.map(team => `
            <li>${team.name} - ${team.cleanSheets} clean sheets</li>
        `).join('');
    }
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
    updateLeagueTable();
    updateFixtures();
    updateStats();
    
    // Start fireworks if there's a final result
    const finalFixture = document.getElementById('final-fixture');
    if (finalFixture && finalFixture.children.length > 0) {
        const fireworkInterval = setInterval(launchFirework, 500);
        animate();
        
        setTimeout(() => {
            clearInterval(fireworkInterval);
        }, 20000);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});