---
layout: default
permalink: /muqawamah/open-age/
category: open-age
show_back_button: true
scripts:
  - /assets/js/tournament/fireworks.js
  - /assets/js/tournament/final-fixture.js
styles:
  - /assets/css/tournament.css
---

{% include tournament/final-fixture.html %}

<!-- Add this for fireworks -->
<canvas id="fireworksCanvas"></canvas>

<!-- Add these event trigger buttons for testing -->
<!-- <div class="test-buttons">
  <button class="test-btn" onclick="document.dispatchEvent(new Event('goalScored'))">Test Goal</button>
  <button class="test-btn" onclick="document.dispatchEvent(new Event('matchEnd'))">Test Match End</button>
</div> -->
