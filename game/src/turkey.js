// The turkey. One clear job: the player's movement — pace, jump, flap,
// slide, dash and hiding — and the state the renderer draws from.
(function () {
  var FF = window.FF = window.FF || {};

  function makeTurkey() {
    return {
      dist: 0,            // metres run
      speed: FF.BASE_SPEED,
      y: 0,               // pixels above the ground line
      vy: 0,              // vertical velocity, px/s
      grounded: true,
      jumps: 0,           // jumps used since leaving the ground (2 = flap spent)
      sliding: 0,         // seconds of slide left
      dashing: 0,         // seconds of dash left
      dashCooldown: 0,    // seconds until the next dash
      hidden: false,      // inside a haystack right now
      hideTime: 0,        // seconds spent hidden in this haystack
      invuln: 0,          // seconds of post-hit grace left
      boost: 0,           // seconds of pie boost left
      runPhase: 0,        // leg animation phase
      dead: false
    };
  }

  // Advance the turkey one step. `input` is FF.input's live state.
  function updateTurkey(t, input, dt) {
    // Pace: lean back to slow down, lean in to sprint.
    var target = FF.BASE_SPEED;
    if (input.left) target = FF.MIN_SPEED;
    if (input.right) target = FF.MAX_SPEED;
    if (t.boost > 0) { target += 3.2; t.boost -= dt; }
    t.speed += (target - t.speed) * Math.min(1, dt * 3.5);

    var speed = t.speed;
    if (t.dashing > 0) { speed += FF.DASH_BOOST; t.dashing -= dt; }
    if (t.dashCooldown > 0) t.dashCooldown -= dt;
    if (t.invuln > 0) t.invuln -= dt;

    // Jump, then flap for a second jump in the air.
    if (input.jumpPressed) {
      if (t.grounded) {
        t.vy = -FF.JUMP_V; t.grounded = false; t.jumps = 1;
        FF.sound.gobble();
      } else if (t.jumps < 2) {
        t.vy = -FF.FLAP_V; t.jumps = 2;
        FF.sound.flap();
      }
    }
    // Slide on the ground; holding slide inside hay is hiding (hazards.js
    // sets t.hidden when the turkey overlaps a haystack while sliding).
    if (input.slidePressed && t.grounded && t.sliding <= 0) {
      t.sliding = FF.SLIDE_TIME;
      FF.sound.slide();
    }
    if (t.sliding > 0) {
      t.sliding -= dt;
      speed *= 0.72;
      if (input.down && t.grounded) t.sliding = Math.max(t.sliding, 0.08); // hold to stay down
    }
    // Dash burst.
    if (input.dashPressed && t.dashCooldown <= 0 && t.dashing <= 0) {
      t.dashing = FF.DASH_TIME;
      t.dashCooldown = FF.DASH_COOLDOWN;
      FF.sound.dash();
    }

    // Gravity and ground.
    t.vy += FF.GRAVITY * dt;
    t.y -= t.vy * dt;
    if (t.y <= 0) { t.y = 0; t.vy = 0; t.grounded = true; t.jumps = 0; }

    if (t.hidden) { speed = 0; t.hideTime += dt; }
    else t.hideTime = 0;

    t.dist += speed * dt;
    t.runPhase += dt * (4 + speed * 1.6);
    return speed;
  }

  // The turkey's collision box in world metres: [left, right, bottom, top].
  function turkeyBox(t) {
    var heightM = t.sliding > 0 ? 0.75 : 1.25;
    var bottomM = t.y / FF.PX_PER_M;
    return [t.dist - 0.55, t.dist + 0.55, bottomM, bottomM + heightM];
  }

  FF.makeTurkey = makeTurkey;
  FF.updateTurkey = updateTurkey;
  FF.turkeyBox = turkeyBox;
})();
