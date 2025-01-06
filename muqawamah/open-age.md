---
layout: page
title: "Muqawamah Open Age Tournament 2024"
permalink: /muqawamah/open-age/
category: open-age
scripts:
  - /assets/js/tournament/final-fixture.js
styles:
  - /assets/css/tournament.css
---

{% include tournament/final-fixture.html %}

<!-- Add this for fireworks -->
<canvas id="fireworksCanvas"></canvas>

<!-- Add these event trigger buttons for testing -->
<div class="test-buttons" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
  <button onclick="document.dispatchEvent(new Event('goalScored'))">Test Goal</button>
  <button onclick="document.dispatchEvent(new Event('matchEnd'))">Test Match End</button>
</div>

