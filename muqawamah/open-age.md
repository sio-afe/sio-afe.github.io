---
layout: page
title: "Muqawamah Open Age Tournament 2024"
permalink: /muqawamah/open-age/
category: open-age
scripts:
  - /assets/js/tournament/table.js
  - /assets/js/tournament/fixtures.js
  - /assets/js/tournament/stats.js
  - /assets/js/tournament/fireworks.js
styles:
  - /assets/css/tournament.css
---

# Muqawamah Open Age Football Tournament 2024

[←  Tournaments]({{ '/muqawamah/' | relative_url }})
{: .back-button}

{% include tournament/final-fixture.html %}

## League Table
{: #league-table}

<div class="table-controls">
  <button data-sort="points">Sort by Points</button>
  <button data-sort="gd">Sort by Goal Difference</button>
  <button data-sort="goals">Sort by Goals For</button>
</div>

| Position | Team | Played | Won | Drawn | Lost | Points | GD | GF | GA |
|:---------|:-----|:-------|:----|:------|:-----|:-------|:---|:---|:---|
{: .league-table-header}

<div id="table-body"></div>

## Fixture List
{: #fixtures}

<div class="fixture-filters">
  <button data-filter="all" class="active">All</button>
  <button data-filter="upcoming">Upcoming</button>
  <button data-filter="live">Live</button>
  <button data-filter="completed">Completed</button>
</div>

<div id="fixtures-grouped"></div>

## Statistics
{: #stats}

<div class="stats-grid">
  <div class="stat-section">
    <h3>Top Scorers</h3>
    <div id="scorers-list"></div>
  </div>

  <div class="stat-section">
    <h3>Top Assists</h3>
    <div id="assisters-list"></div>
  </div>

  <div class="stat-section">
    <h3>Top Clean Sheets</h3>
    <div id="clean-sheets-list"></div>
  </div>
</div>

<canvas id="fireworksCanvas"></canvas>