---
layout: page
title: "Muqawamah Open Age Tournament 2024"
permalink: /muqawamah/open-age/
---

<div class="tournament-container">
    <header>
        <h1>Muqawamah Open Age Football Tournament 2024</h1>
        <a href="/muqawamah" class="back-button">← Back to Tournaments</a>
    </header>
    
    <section id="final-fixture">
        <!-- Inserted by JavaScript -->
    </section>

    <section id="league-table">
        <h2>League Table</h2>
        <table>
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Team</th>
                    <th>Played</th>
                    <th>Won</th>
                    <th>Drawn</th>
                    <th>Lost</th>
                    <th>Points</th>
                    <th>GD</th>
                    <th>GF</th>
                    <th>GA</th>
                </tr>
            </thead>
            <tbody id="table-body">
                <!-- Teams will be inserted here by JavaScript -->
            </tbody>
        </table>
    </section>

    <section id="fixtures">
        <h2>Fixture List</h2>
        <ul id="fixtures-grouped">
            <!-- Grouped fixtures will be inserted here by JavaScript -->
        </ul>
    </section>

    <div class="stats-container">
        <section id="top-scorers">
            <h2>Top Scorers</h2>
            <ul id="scorers-list">
                <!-- Top scorers will be inserted here by JavaScript -->
            </ul>
        </section>
        
        <section id="top-assisters">
            <h2>Top Assists</h2>
            <ul id="assisters-list">
                <!-- Top assisters will be inserted here by JavaScript -->
            </ul>
        </section>

        <section id="top-clean-sheets">
            <h2>Top Clean Sheets</h2>
            <ul id="clean-sheets-list">
                <!-- clean sheets will be inserted here by JavaScript -->
            </ul>
        </section>
    </div>
</div>

<canvas id="fireworksCanvas"></canvas>

<style>
/* Same CSS as U17 page */
.tournament-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.back-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #333;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin-bottom: 20px;
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 30px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f5f5f5;
}

#fireworksCanvas {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 999;
}

section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

ul {
    list-style: none;
    padding: 0;
}

ul li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}
</style>

<script src="/muqawamah/open-age-script.js"></script>