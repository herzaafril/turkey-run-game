// Screenshot staging. One clear job: when the page is opened with
// ?shot=<name>, build a fixed, photogenic moment of the real game (same
// code, same renderer, seed 7) so the screenshots are honest renders:
//   cover   a run in play: mid-jump over a fence, farmer close behind,
//           a carving knife falling ahead, full HUD
//   title   the title screen over the farmyard
//   kitchen stage 3: sliding under a swinging ladle beside a flaming oven
//   escaped the ESCAPED end screen at the forest gate
(function () {
  var FF = window.FF = window.FF || {};

  function stageShot(game, name) {
    var rng = FF.makeRng(7);
    game.objects = FF.buildTrack(rng);
    game.score = 0; game.lives = FF.LIVES; game.shield = false;
    game.time = 12.4; game.banner = 0;

    if (name === 'title') {
      game.state = 'title';
      game.turkey.dist = 6;
      game.farmer.gap = 9;
      return;
    }

    if (name === 'cover') {
      // Stage 1, turkey mid-jump over a fence, farmer 7.5 m back and
      // cornering, a knife falling just ahead, corn trail beyond.
      game.state = 'play';
      game.stageIndex = 0;
      game.turkey.dist = 140;
      game.turkey.y = 95; game.turkey.grounded = false; game.turkey.jumps = 1;
      game.turkey.runPhase = 2.2;
      game.farmer.gap = 7.5; game.farmer.state = 'corner'; game.farmer.runPhase = 1.1;
      game.score = 1450;
      game.objects = game.objects.filter(function (o) { return Math.abs(o.x - 140) > 26; });
      game.objects.push(
        { kind: 'fence', x: 140.4, w: 1.6, h: 1.1, stage: 0, state: 'idle', y: 0, vy: 0, phase: 0, taken: false },
        { kind: 'knife', x: 147, w: 0.7, h: 1.6, stage: 0, state: 'falling', y: 2.6, vy: 4, phase: 0, taken: false },
        { kind: 'corn', x: 150.5, w: 0.7, h: 0.9, stage: 0, state: 'idle', y: 0, vy: 0, phase: 1, taken: false },
        { kind: 'corn', x: 152.1, w: 0.7, h: 0.9, stage: 0, state: 'idle', y: 0, vy: 0, phase: 2, taken: false },
        { kind: 'corn', x: 153.7, w: 0.7, h: 0.9, stage: 0, state: 'idle', y: 0, vy: 0, phase: 3, taken: false },
        { kind: 'hay', x: 160, w: 2.6, h: 1.7, stage: 0, state: 'idle', y: 0, vy: 0, phase: 0, taken: false }
      );
      game.banner = 1.6;
      return;
    }

    if (name === 'kitchen') {
      // Stage 3: turkey sliding under the ladle, oven flaming ahead,
      // farmer searching behind a haystack.
      game.state = 'play';
      game.stageIndex = 2;
      game.turkey.dist = 905;
      game.turkey.sliding = 0.4;
      game.turkey.runPhase = 4.0;
      game.farmer.gap = 11; game.farmer.state = 'chase'; game.farmer.runPhase = 0.4;
      game.score = 5200;
      game.shield = true;
      game.objects = game.objects.filter(function (o) { return Math.abs(o.x - 905) > 30; });
      game.objects.push(
        { kind: 'ladle', x: 905.5, w: 2.2, h: 1.4, stage: 2, state: 'idle', y: 0, vy: 0, phase: 0.9, taken: false },
        { kind: 'oven', x: 912, w: 2.6, h: 2.2, stage: 2, state: 'idle', y: 0, vy: 0, phase: 1.0, taken: false },
        { kind: 'knife', x: 918, w: 0.7, h: 1.6, stage: 2, state: 'idle', y: 7.5, vy: 0, phase: 0, taken: false },
        { kind: 'feather', x: 922, w: 0.7, h: 0.9, stage: 2, state: 'idle', y: 0, vy: 0, phase: 1, taken: false }
      );
      return;
    }

    if (name === 'escaped') {
      game.state = 'escaped';
      game.stageIndex = 2;
      game.turkey.dist = FF.TOTAL_LENGTH;
      game.turkey.runPhase = 3.0;
      game.farmer.gap = 20;
      game.score = 7400 + FF.SCORE_ESCAPE_BONUS;
      game.best = game.score;
      return;
    }
  }

  FF.stageShot = stageShot;
})();
