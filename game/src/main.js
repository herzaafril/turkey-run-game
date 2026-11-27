// Feather Fugitive — main loop. One clear job: own the game state
// (title / play / paused / caught / escaped), step the world each frame,
// and hand the frame to the renderer and HUD.
(function () {
  var FF = window.FF = window.FF || {};

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  function loadBest() {
    try { return parseInt(localStorage.getItem('feather-fugitive-best') || '0', 10) || 0; }
    catch (e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem('feather-fugitive-best', String(v)); } catch (e) { /* private mode */ }
  }

  var game = {
    state: 'title',
    turkey: FF.makeTurkey(),
    farmer: FF.makeFarmer(),
    objects: [],
    stageIndex: 0,
    score: 0,
    lives: FF.LIVES,
    shield: false,
    time: 0,
    banner: 0,
    best: loadBest(),
    shot: null,
    onHit: onHit
  };
  FF.game = game;

  function startRun(seed) {
    var rng = FF.makeRng(seed || (Date.now() % 100000));
    game.turkey = FF.makeTurkey();
    game.farmer = FF.makeFarmer();
    game.objects = FF.buildTrack(rng);
    game.stageIndex = 0;
    game.score = 0;
    game.lives = FF.LIVES;
    game.shield = false;
    game.banner = 2.2;
    game.state = 'play';
    FF.popups.length = 0;
    FF.particles.length = 0;
    FF.sound.stage();
  }

  function endRun(escaped) {
    if (escaped) game.score += FF.SCORE_ESCAPE_BONUS;
    if (game.score > game.best) { game.best = game.score; saveBest(game.best); }
    game.state = escaped ? 'escaped' : 'caught';
    if (escaped) FF.sound.escaped(); else FF.sound.caught();
    FF.burst(FF.TURKEY_X, FF.GROUND_Y - 60, escaped ? '#7ad67a' : '#d9a441', 26);
  }

  function onHit() {
    var t = game.turkey;
    if (game.shield) {
      game.shield = false;
      t.invuln = FF.INVULN_TIME;
      FF.popups.push({ text: 'SHIELD SAVED YOU!', t: 0, life: 1.2, x: FF.TURKEY_X, y: 340, color: '#ffd34d' });
      FF.sound.shieldBreak();
      return;
    }
    game.lives -= 1;
    t.invuln = FF.INVULN_TIME;
    game.farmer.gap = Math.max(1.2, game.farmer.gap - 4); // a stumble lets him close in
    FF.burst(FF.TURKEY_X, FF.GROUND_Y - t.y - 40, '#e8a83e', 16);
    FF.sound.hit();
    if (game.lives <= 0) endRun(false);
  }

  function stageOf(dist) {
    var at = 0;
    for (var i = 0; i < FF.STAGES.length; i++) {
      at += FF.STAGES[i].length;
      if (dist < at) return i;
    }
    return FF.STAGES.length - 1;
  }

  function step(dt) {
    var input = FF.input;
    if (input.mutePressed) FF.sound.toggleMute();

    if (game.state === 'title') {
      game.time += dt;
      game.turkey.runPhase += dt * 6;
      if (input.confirmPressed) startRun();
      return;
    }
    if (game.state === 'caught' || game.state === 'escaped') {
      game.time += dt;
      if (input.restartPressed || input.clicked) startRun();
      return;
    }
    if (input.pausePressed) {
      game.state = game.state === 'paused' ? 'play' : 'paused';
    }
    if (game.state === 'paused') return;

    game.time += dt;
    if (game.banner > 0) game.banner -= dt;

    var speed = FF.updateTurkey(game.turkey, input, dt);
    FF.updateHazards(game, dt);
    var caught = FF.updateFarmer(game.farmer, game.turkey, FF.STAGES[game.stageIndex], speed, dt);
    if (caught && game.state === 'play') { endRun(false); return; }

    var s = stageOf(game.turkey.dist);
    if (s !== game.stageIndex) {
      game.stageIndex = s;
      game.banner = 2.2;
      FF.sound.stage();
    }
    if (game.turkey.dist >= FF.TOTAL_LENGTH && game.state === 'play') endRun(true);
  }

  function draw(dt) {
    if (game.state === 'title') {
      FF.drawGame(ctx, game, dt);
      FF.drawTitle(ctx, game);
    } else if (game.state === 'caught' || game.state === 'escaped') {
      FF.drawGame(ctx, game, dt);
      FF.drawEnd(ctx, game, game.state === 'escaped');
    } else {
      FF.drawGame(ctx, game, dt);
      FF.drawHUD(ctx, game);
      if (game.state === 'paused') FF.drawPaused(ctx);
    }
  }

  // Shot mode: ?shot=cover|title|kitchen|escaped stages a fixed moment
  // and holds it (particles and popups still settle), for screenshots.
  var params = new URLSearchParams(location.search);
  var shotName = params.get('shot');
  if (shotName) {
    game.shot = shotName;
    FF.stageShot(game, shotName);
  } else {
    game.objects = FF.buildTrack(FF.makeRng(7));
    game.turkey.dist = 6;
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (game.shot) {
      // Hold the staged moment; only particles/popups animate.
      game.time += dt * 0.25;
      draw(dt);
    } else {
      step(dt);
      draw(dt);
      FF.input.consume();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
