// Rendering. One clear job: draw the world — parallax autumn scenery per
// stage, the turkey, the farmer, hazards, pickups and particles. All art
// is drawn with canvas paths; there are no image files.
(function () {
  var FF = window.FF = window.FF || {};

  FF.popups = [];    // floating text ("CLOSE!", "SPOTTED!", ...)
  FF.particles = []; // feather bursts and dust

  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      FF.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 240 - 40,
        life: 0.7 + Math.random() * 0.5, t: 0, color: color,
        size: 3 + Math.random() * 5
      });
    }
  }
  FF.burst = burst;

  function worldToScreenX(game, metres) {
    return FF.TURKEY_X + (metres - game.turkey.dist) * FF.PX_PER_M;
  }

  // --- scenery -----------------------------------------------------------
  function drawScenery(ctx, game) {
    var stage = FF.STAGES[game.stageIndex];
    var grad = ctx.createLinearGradient(0, 0, 0, FF.H);
    grad.addColorStop(0, stage.skyTop);
    grad.addColorStop(1, stage.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, FF.W, FF.H);

    var scroll = game.turkey.dist * FF.PX_PER_M;
    if (game.stageIndex === 0) drawFarmyard(ctx, scroll, stage);
    else if (game.stageIndex === 1) drawBarn(ctx, scroll, stage);
    else drawKitchen(ctx, scroll, stage);

    // Ground.
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, FF.GROUND_Y, FF.W, FF.H - FF.GROUND_Y);
    ctx.fillStyle = stage.groundDark;
    var off = -(scroll % 90);
    for (var x = off; x < FF.W; x += 90) {
      ctx.fillRect(x, FF.GROUND_Y + 14, 46, 5);
      ctx.fillRect(x + 24, FF.GROUND_Y + 40, 34, 4);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(0, FF.GROUND_Y, FF.W, 3);
  }

  function drawFarmyard(ctx, scroll, stage) {
    // Sun and clouds.
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(1080, 110, 52, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    cloud(ctx, 220 - (scroll * 0.1 % 1500), 90, 1);
    cloud(ctx, 700 - (scroll * 0.08 % 1500), 140, 0.8);
    // Far hills.
    ctx.fillStyle = stage.far;
    hill(ctx, -(scroll * 0.25 % 900), 470, 900, 150);
    hill(ctx, 900 - (scroll * 0.25 % 900), 470, 900, 150);
    // Barn silhouette and trees, mid layer.
    ctx.fillStyle = stage.near;
    var bx = 1000 - (scroll * 0.5 % 1800);
    barn(ctx, bx, 470);
    tree(ctx, 300 - (scroll * 0.5 % 1800), 500, '#b45a24');
    tree(ctx, 1500 - (scroll * 0.5 % 1800), 490, '#c9712f');
    // Fence line.
    ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(FF.W, 560); ctx.stroke();
    ctx.fillStyle = '#7a4a22';
    var fo = -(scroll % 70);
    for (var x = fo; x < FF.W; x += 70) ctx.fillRect(x, 538, 8, 44);
    // Falling leaves.
    ctx.fillStyle = 'rgba(214,120,40,0.8)';
    for (var i = 0; i < 10; i++) {
      var lx = ((i * 173 + scroll * 0.6) % (FF.W + 40)) - 20;
      var ly = 120 + ((i * 97 + scroll * 0.35) % 380);
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(i + scroll * 0.01);
      ctx.fillRect(-5, -2, 10, 4); ctx.restore();
    }
  }

  function drawBarn(ctx, scroll, stage) {
    // Timber beams and hay lofts inside the barn.
    ctx.fillStyle = stage.far;
    var off = -(scroll * 0.4 % 420);
    for (var x = off; x < FF.W; x += 420) {
      ctx.fillRect(x, 60, 26, 470);
      ctx.fillRect(x, 60, 420, 22);
      ctx.fillRect(x + 60, 180, 300, 16); // loft shelf
      ctx.fillStyle = '#d9a441';
      ctx.fillRect(x + 80, 146, 90, 34);  // hay bales on the loft
      ctx.fillRect(x + 200, 146, 90, 34);
      ctx.fillStyle = stage.far;
    }
    // Hanging lanterns.
    ctx.fillStyle = '#ffd98a';
    var lo = -(scroll * 0.6 % 520);
    for (var lx = lo + 200; lx < FF.W; lx += 520) {
      ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx, 82); ctx.lineTo(lx, 150); ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, 166, 15, 0, 7); ctx.fill();
    }
    // Straw floor marks.
    ctx.strokeStyle = 'rgba(217,164,65,0.5)'; ctx.lineWidth = 2;
    var so = -(scroll % 60);
    for (var sx = so; sx < FF.W; sx += 60) {
      ctx.beginPath(); ctx.moveTo(sx, FF.GROUND_Y + 30); ctx.lineTo(sx + 18, FF.GROUND_Y + 44); ctx.stroke();
    }
  }

  function drawKitchen(ctx, scroll, stage) {
    // Tile wall.
    ctx.strokeStyle = 'rgba(120,105,80,0.22)'; ctx.lineWidth = 2;
    var to = -(scroll * 0.3 % 90);
    for (var x = to; x < FF.W; x += 90) {
      ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, FF.GROUND_Y); ctx.stroke();
    }
    for (var y = 120; y < FF.GROUND_Y; y += 90) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FF.W, y); ctx.stroke();
    }
    // Back counter with cabinets and a shelf of jars.
    ctx.fillStyle = '#7d6f59';
    ctx.fillRect(0, 452, FF.W, 14);
    ctx.fillStyle = '#93835f';
    ctx.fillRect(0, 466, FF.W, FF.GROUND_Y - 466);
    ctx.strokeStyle = 'rgba(60,48,32,0.5)'; ctx.lineWidth = 3;
    var ko = -(scroll * 0.45 % 170);
    for (var kx = ko; kx < FF.W; kx += 170) {
      ctx.strokeRect(kx + 12, 480, 146, 110);
      ctx.beginPath(); ctx.moveTo(kx + 85, 480); ctx.lineTo(kx + 85, 590); ctx.stroke();
    }
    ctx.fillStyle = '#6b5c44';
    ctx.fillRect(0, 330, FF.W, 10);
    var jo = -(scroll * 0.4 % 240);
    var jarColors = ['#c96f3f', '#7a9a4a', '#b83a24', '#d9a441'];
    for (var jx = jo + 40, ji = 0; jx < FF.W; jx += 240, ji++) {
      ctx.fillStyle = jarColors[ji % jarColors.length];
      ctx.fillRect(jx, 292, 30, 38);
      ctx.fillRect(jx + 44, 300, 24, 30);
      ctx.fillStyle = '#e8dcc8';
      ctx.fillRect(jx + 3, 286, 24, 7);
    }
    // Hanging pans and a window.
    ctx.fillStyle = '#8d8577';
    var po = -(scroll * 0.5 % 640);
    for (var px = po + 320; px < FF.W; px += 640) {
      ctx.strokeStyle = '#5d564a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(px, 90); ctx.lineTo(px, 140); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, 168, 26, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 70, 160, 20, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#f4e9c8';
    var wx = 900 - (scroll * 0.35 % 1700);
    ctx.fillRect(wx, 110, 190, 150);
    ctx.strokeStyle = '#7d6f59'; ctx.lineWidth = 6; ctx.strokeRect(wx, 110, 190, 150);
    ctx.beginPath(); ctx.moveTo(wx + 95, 110); ctx.lineTo(wx + 95, 260); ctx.stroke();
    // Checkered floor edge.
    ctx.fillStyle = 'rgba(90,75,55,0.35)';
    var co = -(scroll % 64);
    for (var cx = co; cx < FF.W; cx += 64) ctx.fillRect(cx, FF.GROUND_Y + 8, 32, 12);
  }

  function cloud(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 26 * s, 0, 7); ctx.arc(x + 30 * s, y + 4 * s, 20 * s, 0, 7);
    ctx.arc(x - 30 * s, y + 6 * s, 18 * s, 0, 7);
    ctx.fill();
  }
  function hill(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w / 2, y - h, x + w, y);
    ctx.lineTo(x + w, FF.GROUND_Y); ctx.lineTo(x, FF.GROUND_Y);
    ctx.fill();
  }
  function barn(ctx, x, y) {
    ctx.fillRect(x, y - 90, 170, 90);
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 90); ctx.lineTo(x + 85, y - 150); ctx.lineTo(x + 182, y - 90);
    ctx.fill();
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(x + 62, y - 58, 46, 58);
  }
  function tree(ctx, x, y, color) {
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(x - 6, y - 60, 12, 60);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - 95, 48, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 34, y - 70, 32, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 34, y - 70, 32, 0, 7); ctx.fill();
  }

  // --- characters ----------------------------------------------------------
  function drawTurkey(ctx, game) {
    var t = game.turkey;
    var x = FF.TURKEY_X;
    var y = FF.GROUND_Y - t.y;
    var sliding = t.sliding > 0;
    var bodyY = sliding ? y - 26 : y - 46;
    ctx.save();
    if (t.invuln > 0 && Math.floor(game.time * 14) % 2 === 0) ctx.globalAlpha = 0.45;
    if (t.hidden) ctx.globalAlpha = 0.25;

    // Tail fan.
    var fanColors = ['#d3542a', '#e88a2e', '#c23b2a', '#e8a83e', '#b83a24'];
    for (var i = 0; i < 5; i++) {
      var ang = -2.4 + i * 0.42 + Math.sin(t.runPhase * 2 + i) * 0.05;
      ctx.fillStyle = fanColors[i];
      ctx.save();
      ctx.translate(x - 34, bodyY + 6);
      ctx.rotate(ang + (sliding ? 0.5 : 0));
      ctx.beginPath(); ctx.ellipse(-26, 0, 30, 11, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    // Body.
    ctx.fillStyle = '#8a5a33';
    ctx.beginPath(); ctx.ellipse(x, bodyY, sliding ? 52 : 44, sliding ? 26 : 34, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#a4713f';
    ctx.beginPath(); ctx.ellipse(x + 6, bodyY + 6, 30, 20, 0, 0, 7); ctx.fill();
    // Wing (flaps when airborne).
    var flap = t.grounded ? Math.sin(t.runPhase * 3) * 0.25 : Math.sin(game.time * 26) * 0.9;
    ctx.fillStyle = '#6e4525';
    ctx.save();
    ctx.translate(x - 4, bodyY - 4); ctx.rotate(-0.5 - flap);
    ctx.beginPath(); ctx.ellipse(16, 0, 24, 10, 0, 0, 7); ctx.fill();
    ctx.restore();
    // Head.
    var hx = x + (sliding ? 46 : 38), hy = bodyY - (sliding ? 14 : 30);
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath(); ctx.arc(hx, hy, 15, 0, 7); ctx.fill();
    ctx.fillStyle = '#f2a03d'; // beak
    ctx.beginPath(); ctx.moveTo(hx + 12, hy - 3); ctx.lineTo(hx + 26, hy + 2); ctx.lineTo(hx + 12, hy + 7); ctx.fill();
    ctx.fillStyle = '#d63b2a'; // wattle
    ctx.beginPath(); ctx.ellipse(hx + 8, hy + 14, 5, 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#1d1d1d'; // eye (wide with panic)
    ctx.beginPath(); ctx.arc(hx + 5, hy - 4, 3.4, 0, 7); ctx.fill();
    // Legs.
    ctx.strokeStyle = '#f2a03d'; ctx.lineWidth = 4;
    if (t.grounded && !sliding) {
      var s1 = Math.sin(t.runPhase * 3) * 16, s2 = Math.sin(t.runPhase * 3 + Math.PI) * 16;
      ctx.beginPath(); ctx.moveTo(x - 6, y - 14); ctx.lineTo(x - 6 + s1, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 12, y - 14); ctx.lineTo(x + 12 + s2, y); ctx.stroke();
    } else if (!t.grounded) {
      ctx.beginPath(); ctx.moveTo(x - 4, y - 12); ctx.lineTo(x - 14, y + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 12, y - 12); ctx.lineTo(x + 22, y + 4); ctx.stroke();
    }
    // Dash streaks.
    if (t.dashing > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
      for (var d = 0; d < 3; d++) {
        ctx.beginPath();
        ctx.moveTo(x - 60 - d * 26, bodyY - 14 + d * 14);
        ctx.lineTo(x - 26 - d * 26, bodyY - 14 + d * 14);
        ctx.stroke();
      }
    }
    // Shield ring.
    if (game.shield) {
      ctx.strokeStyle = 'rgba(255,211,77,0.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, bodyY - 4, 56, 0, 7); ctx.stroke();
    }
    ctx.restore();
  }

  function drawFarmer(ctx, game) {
    var f = game.farmer;
    var x = FF.TURKEY_X - f.gap * FF.PX_PER_M;
    if (x < -160) return; // off-screen, still coming
    var y = FF.GROUND_Y;
    var lean = f.state === 'corner' ? 0.28 : 0.14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    // Legs.
    var s1 = Math.sin(f.runPhase * 3) * 18, s2 = Math.sin(f.runPhase * 3 + Math.PI) * 18;
    ctx.strokeStyle = '#33415e'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-6, -52); ctx.lineTo(-6 + s1, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -52); ctx.lineTo(8 + s2, 0); ctx.stroke();
    // Overalls + shirt.
    ctx.fillStyle = '#3c5a8a';
    ctx.fillRect(-16, -92, 34, 46);
    ctx.fillStyle = '#c23b2a';
    ctx.fillRect(-18, -128, 38, 40);
    // Arm with pitchfork, raised.
    ctx.strokeStyle = '#c23b2a'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(14, -116); ctx.lineTo(40, -140); ctx.stroke();
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(34, -96); ctx.lineTo(58, -176); ctx.stroke();
    ctx.strokeStyle = '#cfd4d8'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(52, -176); ctx.lineTo(50, -196); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(58, -178); ctx.lineTo(58, -200); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(64, -176); ctx.lineTo(66, -196); ctx.stroke();
    // Head + hat.
    ctx.fillStyle = '#f2c79b';
    ctx.beginPath(); ctx.arc(2, -142, 15, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8c24a';
    ctx.fillRect(-20, -158, 44, 7);
    ctx.fillRect(-12, -174, 28, 18);
    ctx.fillStyle = '#1d1d1d';
    ctx.beginPath(); ctx.arc(8, -144, 2.6, 0, 7); ctx.fill();
    ctx.restore();

    // State bubble: "?" while searching, "!" when he spots the turkey.
    if (f.state === 'search' || f.spottedFlash > 0) {
      var bx = x + 30, by = y - 215;
      ctx.fillStyle = '#fff8e8';
      ctx.beginPath(); ctx.arc(bx, by, 17, 0, 7); ctx.fill();
      ctx.fillStyle = f.spottedFlash > 0 ? '#d63b2a' : '#7a4a22';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.spottedFlash > 0 ? '!' : '?', bx, by + 8);
    }
  }

  // --- objects ---------------------------------------------------------------
  function drawObject(ctx, game, o) {
    var x = worldToScreenX(game, o.x);
    if (x < -140 || x > FF.W + 140) return;
    var gy = FF.GROUND_Y;
    var w = o.w * FF.PX_PER_M, h = o.h * FF.PX_PER_M;
    ctx.save();
    switch (o.kind) {
      case 'fence':
        ctx.fillStyle = '#8a5a2b';
        ctx.fillRect(x - w / 2, gy - h, 7, h);
        ctx.fillRect(x + w / 2 - 7, gy - h, 7, h);
        ctx.fillRect(x - w / 2 - 4, gy - h + 4, w + 8, 7);
        ctx.fillRect(x - w / 2 - 4, gy - h / 2, w + 8, 7);
        break;
      case 'pumpkin':
        ctx.fillStyle = '#e8762a';
        ctx.beginPath(); ctx.ellipse(x, gy - h / 2, w / 2, h / 2, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#c45a1a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(x, gy - h / 2, w / 4, h / 2, 0, 0, 7); ctx.stroke();
        ctx.fillStyle = '#4a7a2a';
        ctx.fillRect(x - 3, gy - h - 7, 6, 9);
        break;
      case 'knife': {
        // Shadow telegraph first, then the falling blade.
        var ky = gy - o.y * FF.PX_PER_M;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(x, gy + 4, o.state === 'idle' ? 12 : 22, 5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#d8dde2';
        ctx.beginPath();
        ctx.moveTo(x - 7, ky - h); ctx.lineTo(x + 7, ky - h); ctx.lineTo(x + 7, ky - 14);
        ctx.lineTo(x, ky); ctx.lineTo(x - 7, ky - 14);
        ctx.fill();
        ctx.fillStyle = '#7a4a22';
        ctx.fillRect(x - 5, ky - h - 16, 10, 16);
        break;
      }
      case 'oven': {
        var jet = (game.time + o.phase) % 3.2 < 1.1;
        ctx.fillStyle = '#5a5f66';
        ctx.fillRect(x - w / 2, gy - h, w, h);
        ctx.fillStyle = '#33373c';
        ctx.fillRect(x - w / 2 + 8, gy - h + 12, w - 16, h * 0.5);
        ctx.fillStyle = jet ? '#ff9a3d' : '#7a4a22';
        ctx.fillRect(x - w / 2 + 12, gy - h + 16, w - 24, h * 0.5 - 8);
        if (jet) {
          ctx.fillStyle = 'rgba(255,140,40,0.85)';
          for (var i = 0; i < 5; i++) {
            var fx = x - w / 2 + 14 + i * (w - 28) / 4;
            var fh = 26 + Math.sin(game.time * 18 + i * 2) * 8;
            ctx.beginPath();
            ctx.moveTo(fx - 7, gy - h - 2); ctx.lineTo(fx, gy - h - fh); ctx.lineTo(fx + 7, gy - h - 2);
            ctx.fill();
          }
        }
        ctx.fillStyle = '#c8ccd0';
        ctx.fillRect(x - w / 2 + 10, gy - 16, w - 20, 5); // handle
        break;
      }
      case 'ladle': {
        var swing = Math.sin(game.time * 2.1 + o.phase);
        var cx = x + swing * 0.9 * FF.PX_PER_M;
        var topY = gy - 150, bowlY = gy - 64;
        ctx.strokeStyle = '#8a8f94'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x, topY); ctx.lineTo(cx, bowlY); ctx.stroke();
        ctx.fillStyle = '#aab0b6';
        ctx.beginPath(); ctx.arc(cx, bowlY + 10, 17, 0, 7); ctx.fill();
        ctx.fillStyle = '#8a8f94';
        ctx.beginPath(); ctx.arc(cx, bowlY + 8, 12, 0, 7); ctx.fill();
        break;
      }
      case 'trap':
        ctx.fillStyle = '#7a4a22';
        ctx.fillRect(x - w / 2, gy - 8, w, 8);
        ctx.strokeStyle = '#c8ccd0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, gy - 8, w / 2, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = '#f2d24b'; // cheese bait
        ctx.beginPath(); ctx.moveTo(x - 8, gy - 8); ctx.lineTo(x + 8, gy - 8); ctx.lineTo(x, gy - 18); ctx.fill();
        break;
      case 'hay':
        ctx.fillStyle = '#d9a441';
        ctx.beginPath(); ctx.ellipse(x, gy - h / 2 + 6, w / 2 + 8, h / 2 + 4, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#b9862f'; ctx.lineWidth = 3;
        for (var j = -2; j <= 2; j++) {
          ctx.beginPath();
          ctx.moveTo(x + j * 12, gy - h + 4);
          ctx.quadraticCurveTo(x + j * 14, gy - h / 2, x + j * 12, gy - 4);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(90,60,10,0.85)';
        ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('HIDE', x, gy - h - 8);
        break;
      case 'corn': case 'feather': case 'pie': case 'chili': {
        var bob = 0.55 + Math.sin(game.time * 3 + o.phase) * 0.12;
        var py = gy - bob * FF.PX_PER_M;
        if (o.kind === 'corn') {
          ctx.fillStyle = '#f2d24b';
          ctx.beginPath(); ctx.ellipse(x, py, 9, 15, 0, 0, 7); ctx.fill();
          ctx.fillStyle = '#5da244';
          ctx.beginPath(); ctx.ellipse(x - 8, py + 10, 6, 12, 0.6, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.ellipse(x + 8, py + 10, 6, 12, -0.6, 0, 7); ctx.fill();
        } else if (o.kind === 'feather') {
          ctx.fillStyle = '#ffd34d';
          ctx.save(); ctx.translate(x, py); ctx.rotate(Math.sin(game.time * 2 + o.phase) * 0.4);
          ctx.beginPath(); ctx.ellipse(0, 0, 8, 17, 0, 0, 7); ctx.fill();
          ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(0, 20); ctx.stroke();
          ctx.restore();
        } else if (o.kind === 'pie') {
          ctx.fillStyle = '#c8ccd0';
          ctx.beginPath(); ctx.ellipse(x, py + 6, 17, 6, 0, 0, 7); ctx.fill();
          ctx.fillStyle = '#e8a83e';
          ctx.beginPath(); ctx.ellipse(x, py, 15, 9, 0, 0, 7); ctx.fill();
          ctx.fillStyle = '#d63b2a';
          ctx.beginPath(); ctx.arc(x, py - 6, 4, 0, 7); ctx.fill();
        } else {
          ctx.fillStyle = '#d63b2a';
          ctx.save(); ctx.translate(x, py); ctx.rotate(0.7);
          ctx.beginPath(); ctx.ellipse(0, 0, 6, 14, 0, 0, 7); ctx.fill();
          ctx.fillStyle = '#4a7a2a'; ctx.fillRect(-2, -18, 5, 6);
          ctx.restore();
        }
        break;
      }
    }
    ctx.restore();
  }

  function drawGate(ctx, game) {
    var x = worldToScreenX(game, FF.TOTAL_LENGTH);
    if (x < -200 || x > FF.W + 200) return;
    ctx.fillStyle = '#2f6e3e';
    ctx.beginPath(); ctx.arc(x - 40, FF.GROUND_Y - 120, 70, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 60, FF.GROUND_Y - 140, 84, 0, 7); ctx.fill();
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(x - 48, FF.GROUND_Y - 80, 14, 80);
    ctx.fillRect(x + 52, FF.GROUND_Y - 90, 14, 90);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FREEDOM', x + 8, FF.GROUND_Y - 190);
  }

  function drawParticles(ctx, dt) {
    for (var i = FF.particles.length - 1; i >= 0; i--) {
      var p = FF.particles[i];
      p.t += dt;
      if (p.t > p.life) { FF.particles.splice(i, 1); continue; }
      p.vy += 700 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.6);
    }
    ctx.globalAlpha = 1;
  }

  function drawPopups(ctx, dt) {
    ctx.textAlign = 'center';
    for (var i = FF.popups.length - 1; i >= 0; i--) {
      var p = FF.popups[i];
      p.t += dt;
      if (p.t > p.life) { FF.popups.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, (p.life - p.t) * 2);
      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillText(p.text, p.x + 2, p.y - p.t * 36 + 2);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y - p.t * 36);
    }
    ctx.globalAlpha = 1;
  }

  // Draw one whole frame of a run in play.
  function drawGame(ctx, game, dt) {
    drawScenery(ctx, game);
    drawGate(ctx, game);
    for (var i = 0; i < game.objects.length; i++) {
      if (!game.objects[i].taken) drawObject(ctx, game, game.objects[i]);
    }
    drawFarmer(ctx, game);
    drawTurkey(ctx, game);
    drawParticles(ctx, dt);
    drawPopups(ctx, dt);
  }

  FF.drawGame = drawGame;
  FF.drawTurkey = drawTurkey;
  FF.drawFarmer = drawFarmer;
  FF.worldToScreenX = worldToScreenX;
})();
