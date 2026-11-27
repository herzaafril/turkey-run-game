// Track building. One clear job: lay out one stage's hazards and pickups
// along the metres of the run, from the stage table in config.js.
(function () {
  var FF = window.FF = window.FF || {};

  // Hazard and pickup shapes: width/height in metres, how they threaten.
  //   fence   jump it          pumpkin  rolls at you, jump it
  //   knife   falls from above (shadow first)   oven  tall, jump it (flames telegraph)
  //   ladle   swings overhead, slide under      trap  small, jump it
  //   hay     hide inside (hold slide)          corn/feather/pie/chili  pickups
  var SHAPES = {
    fence:   { w: 1.6, h: 1.1 },
    pumpkin: { w: 1.1, h: 1.0 },
    knife:   { w: 0.7, h: 1.6 },
    oven:    { w: 2.6, h: 2.2 },
    ladle:   { w: 2.2, h: 1.4 },
    trap:    { w: 0.9, h: 0.5 },
    hay:     { w: 2.6, h: 1.7 },
    corn:    { w: 0.7, h: 0.9 },
    feather: { w: 0.7, h: 0.9 },
    pie:     { w: 0.8, h: 0.7 },
    chili:   { w: 0.7, h: 0.7 }
  };
  FF.SHAPES = SHAPES;

  // Build the full 1,200 m track. `startAt` is the metre the stage begins.
  function buildTrack(rng) {
    var objects = [];
    var at = 0;
    FF.STAGES.forEach(function (stage, stageIndex) {
      var end = at + stage.length;
      var x = at + 30; // a clear run-up at each stage start
      while (x < end - 14) {
        var kind = rng.pick(stage.kinds);
        objects.push(makeObject(kind, x, stageIndex, rng));
        // A little trail of corn sometimes follows a hazard.
        if (rng.next() < 0.45) {
          var n = rng.int(2, 4);
          for (var i = 0; i < n; i++) {
            objects.push(makeObject('corn', x + 3 + i * 1.6, stageIndex, rng));
          }
        }
        // Rare treats: a shield feather, a pie, a chili.
        var roll = rng.next();
        if (roll < 0.07) objects.push(makeObject('feather', x + rng.range(6, 10), stageIndex, rng));
        else if (roll < 0.12) objects.push(makeObject('pie', x + rng.range(6, 10), stageIndex, rng));
        else if (roll < 0.16) objects.push(makeObject('chili', x + rng.range(6, 10), stageIndex, rng));
        x += rng.range(stage.hazardGap[0], stage.hazardGap[1]);
      }
      at = end;
    });
    objects.sort(function (a, b) { return a.x - b.x; });
    return objects;
  }

  function makeObject(kind, x, stageIndex, rng) {
    var shape = SHAPES[kind];
    return {
      kind: kind,
      x: x,                       // metres along the run
      w: shape.w, h: shape.h,
      stage: stageIndex,
      state: 'idle',              // knives: idle -> falling -> stuck
      y: 0,                       // metres above ground (knives, pickups bob)
      vy: 0,
      phase: rng.next() * Math.PI * 2,
      taken: false,
      hitDone: false,
      nearMissDone: false
    };
  }

  FF.buildTrack = buildTrack;
})();
