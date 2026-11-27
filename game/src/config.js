// Feather Fugitive — shared constants and the stage table.
// One clear job: every number the game tunes by lives here.
(function () {
  var FF = window.FF = window.FF || {};

  FF.W = 1280;            // logical canvas width
  FF.H = 720;             // logical canvas height
  FF.GROUND_Y = 612;      // ground line in pixels
  FF.PX_PER_M = 26;       // world metres -> screen pixels
  FF.TURKEY_X = 320;      // turkey's fixed screen anchor (world scrolls past)

  FF.GRAVITY = 2600;      // px/s^2
  FF.JUMP_V = 980;        // first jump velocity
  FF.FLAP_V = 760;        // second (flap) jump velocity
  FF.BASE_SPEED = 9.2;    // m/s
  FF.MIN_SPEED = 6.0;     // slowest pace (holding back)
  FF.MAX_SPEED = 14.5;    // fastest pace (sprinting)
  FF.DASH_TIME = 0.55;    // seconds of dash burst
  FF.DASH_COOLDOWN = 1.5; // seconds before the next dash
  FF.DASH_BOOST = 7.0;    // extra m/s while dashing
  FF.SLIDE_TIME = 0.62;   // seconds a slide lasts
  FF.HIDE_TIME = 2.5;     // seconds hidden in hay before the farmer loses the trail
  FF.INVULN_TIME = 1.1;   // seconds of grace after a hit
  FF.LIVES = 3;           // feathers

  FF.SCORE_CORN = 50;
  FF.SCORE_NEAR_MISS = 25;
  FF.SCORE_ESCAPE_BONUS = 500;

  // Three stages: farmyard -> barn -> kitchen. Each is 400 m; the forest
  // gate at 1,200 m ends the run in an escape.
  FF.STAGES = [
    {
      name: 'STAGE 1 — FARMYARD',
      length: 400,
      skyTop: '#ffd9a0', skyBottom: '#ff9e64', ground: '#8a5a2b', groundDark: '#6e451f',
      far: '#c96f3f', near: '#a8542a',
      farmerSpeed: 9.4,            // m/s the farmer runs at in this stage
      hazardGap: [26, 40],         // metres between hazards
      kinds: ['fence', 'pumpkin', 'fence', 'knife', 'hay']
    },
    {
      name: 'STAGE 2 — THE BARN',
      length: 400,
      skyTop: '#7a3b1e', skyBottom: '#a8542a', ground: '#6e4a22', groundDark: '#54370f',
      far: '#5d2f16', near: '#47230e',
      farmerSpeed: 10.0,
      hazardGap: [22, 34],
      kinds: ['fence', 'trap', 'knife', 'pumpkin', 'hay', 'knife']
    },
    {
      name: 'STAGE 3 — THE KITCHEN',
      length: 400,
      skyTop: '#e8e3d8', skyBottom: '#cfc4ae', ground: '#9b8b74', groundDark: '#7d6f59',
      far: '#b7a98f', near: '#9a8a6d',
      farmerSpeed: 10.6,
      hazardGap: [19, 30],
      kinds: ['oven', 'knife', 'ladle', 'oven', 'trap', 'hay', 'knife']
    }
  ];
  FF.TOTAL_LENGTH = 1200; // metres to the forest gate
})();
