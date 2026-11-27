// Hazards and pickups. One clear job: move the world's dangers (falling
// knives, rolling pumpkins, swinging ladles, oven flames), test them
// against the turkey, and hand out hits, near misses and pickups.
(function () {
  var FF = window.FF = window.FF || {};

  var PICKUPS = { corn: 1, feather: 1, pie: 1, chili: 1 };

  function overlaps(a, b) {
    return a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2];
  }

  // The box a hazard threatens, in world metres, or null when it is safe
  // right now (a knife still hanging, an oven between flame jets).
  function hazardBox(o, time) {
    switch (o.kind) {
      case 'fence': return [o.x - o.w / 2, o.x + o.w / 2, 0, o.h];
      case 'trap': return [o.x - o.w / 2, o.x + o.w / 2, 0, o.h];
      case 'pumpkin': return [o.x - o.w / 2, o.x + o.w / 2, 0, o.h];
      case 'knife':
        if (o.state === 'idle') return null; // still hanging, shadow only
        return [o.x - o.w / 2, o.x + o.w / 2, o.y, o.y + o.h];
      case 'oven': {
        var jet = (time + o.phase) % 3.2 < 1.1; // flame jets on a cycle
        return [o.x - o.w / 2, o.x + o.w / 2, 0, jet ? o.h + 0.9 : o.h];
      }
      case 'ladle': {
        var swing = Math.sin(time * 2.1 + o.phase);
        var cx = o.x + swing * 0.9;
        return [cx - 0.55, cx + 0.55, 0.95, 2.35]; // slide under it
      }
      default: return null;
    }
  }

  // Advance every object near the turkey. `game` carries score/lives/shield
  // and the callbacks for a hit; returns nothing, mutates game state.
  function updateHazards(game, dt) {
    var t = game.turkey;
    var box = FF.turkeyBox(t);
    t.hidden = false;

    for (var i = 0; i < game.objects.length; i++) {
      var o = game.objects[i];
      if (o.taken) continue;
      var dx = o.x - t.dist;
      if (dx < -8 || dx > 70) continue;

      // --- motion ------------------------------------------------------
      if (o.kind === 'knife') {
        if (o.state === 'idle') {
          o.y = 7.5; // hanging high, shadow on the ground
          // Fall so the blade lands a few metres ahead of the turkey:
          // fall time from 7.5 m at 22 m/s^2 is ~0.83 s; trigger at
          // ~1.18 s of travel so a steady runner meets a stuck knife to
          // jump, a sprinter risks running under the falling blade.
          var trigger = Math.max(6, t.speed * 1.18);
          if (dx < trigger && dx > 1.5) { o.state = 'falling'; o.vy = 0; FF.sound.knife(); }
        } else if (o.state === 'falling') {
          o.vy += 22 * dt; o.y -= o.vy * dt;
          if (o.y <= 0) { o.y = 0; o.state = 'stuck'; }
        }
      } else if (o.kind === 'pumpkin') {
        o.x -= 3.4 * dt; // rolls toward the turkey
        o.phase += dt * 6;
      }

      // --- hiding ------------------------------------------------------
      if (o.kind === 'hay') {
        if (t.sliding > 0 && t.grounded && Math.abs(dx) < o.w / 2) t.hidden = true;
        continue;
      }

      // --- pickups -----------------------------------------------------
      if (PICKUPS[o.kind]) {
        var bob = 0.55 + Math.sin(game.time * 3 + o.phase) * 0.12;
        var pbox = [o.x - 0.5, o.x + 0.5, bob - 0.45, bob + 0.45];
        if (overlaps(box, pbox)) {
          o.taken = true;
          collect(game, o.kind);
        }
        continue;
      }

      // --- danger ------------------------------------------------------
      var hb = hazardBox(o, game.time);
      if (!hb) continue;
      if (overlaps(box, hb)) {
        if (!o.hitDone && t.invuln <= 0 && !t.hidden) {
          o.hitDone = true;
          game.onHit(o);
        }
      } else if (!o.nearMissDone && Math.abs(dx) < 1.1 && t.invuln <= 0) {
        // Passed within a hair: a narrow escape, worth points.
        var near = [hb[0] - 0.35, hb[1] + 0.35, hb[2] - 0.3, hb[3] + 0.3];
        if (overlaps(box, near)) {
          o.nearMissDone = true;
          game.score += FF.SCORE_NEAR_MISS;
          FF.popups.push({ text: 'CLOSE! +' + FF.SCORE_NEAR_MISS, t: 0, life: 0.9, x: FF.TURKEY_X + 30, y: 380, color: '#b8f0c8' });
          FF.sound.close();
        }
      }
    }
  }

  function collect(game, kind) {
    var t = game.turkey;
    if (kind === 'corn') {
      game.score += FF.SCORE_CORN;
      FF.popups.push({ text: '+' + FF.SCORE_CORN, t: 0, life: 0.8, x: FF.TURKEY_X + 20, y: 420, color: '#ffe9a8' });
      FF.sound.corn();
    } else if (kind === 'feather') {
      game.shield = true;
      FF.popups.push({ text: 'SHIELD!', t: 0, life: 1.1, x: FF.TURKEY_X, y: 360, color: '#ffd34d' });
      FF.sound.feather();
    } else if (kind === 'pie') {
      t.boost = 3;
      FF.popups.push({ text: 'PIE POWER!', t: 0, life: 1.1, x: FF.TURKEY_X, y: 360, color: '#ffb3a0' });
      FF.sound.pie();
    } else if (kind === 'chili') {
      t.dashCooldown = 0;
      t.dashing = Math.max(t.dashing, 0.4);
      FF.popups.push({ text: 'HOT!', t: 0, life: 1.0, x: FF.TURKEY_X, y: 360, color: '#ff8a7a' });
      FF.sound.chili();
    }
  }

  FF.updateHazards = updateHazards;
  FF.hazardBox = hazardBox;
})();
