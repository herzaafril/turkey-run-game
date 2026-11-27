// The farmer. One clear job: the pursuer's brain — he chases while he can
// see the turkey, searches when it hides, and lunges when he corners it.
(function () {
  var FF = window.FF = window.FF || {};

  function makeFarmer() {
    return {
      gap: 30,            // metres behind the turkey
      state: 'chase',     // chase | search | corner
      searchTime: 0,      // seconds spent searching
      lunge: 0,           // seconds of cornering lunge left
      runPhase: 0,
      spottedFlash: 0     // seconds left of the "SPOTTED!" banner
    };
  }

  // `stage` is the current stage row (for the farmer's speed); `turkeySpeed`
  // is how fast the turkey actually moved this step. The farmer runs at his
  // own stage speed, so sprinting, dashing and pie boosts really do gain
  // ground — and standing still while he searches is what hiding buys.
  // Returns 'caught' or null.
  function updateFarmer(f, t, stage, turkeySpeed, dt) {
    var farmerSpeed;
    if (t.hidden) {
      // The turkey is in the hay: the farmer stops and searches.
      if (f.state !== 'search') { f.state = 'search'; f.searchTime = 0; }
      f.searchTime += dt;
      farmerSpeed = 0;
      if (t.hideTime >= FF.HIDE_TIME) {
        // Trail lost: he wanders off and the gap resets.
        f.gap = 26;
        f.state = 'chase';
        t.hideTime = 0;
        FF.popups.push({ text: 'LOST HIM!', t: 0, life: 1.4, x: FF.TURKEY_X, y: 300, color: '#ffe9a8' });
        FF.sound.lost();
      }
    } else {
      if (f.state === 'search') {
        // He sees the turkey again.
        f.state = 'chase';
        f.spottedFlash = 1.2;
        FF.popups.push({ text: 'SPOTTED!', t: 0, life: 1.1, x: FF.TURKEY_X, y: 300, color: '#ff6b5e' });
        FF.sound.spotted();
      }
      farmerSpeed = stage.farmerSpeed;
      if (f.gap > 38) farmerSpeed += 1.2; // hurries to stay in the race
      if (f.gap < 9) {
        // Cornering: he lunges in bursts.
        f.state = 'corner';
        if (f.lunge <= 0) f.lunge = 0.9;
        farmerSpeed += 2.6;
        f.lunge -= dt;
      } else {
        f.state = 'chase';
      }
    }
    if (f.spottedFlash > 0) f.spottedFlash -= dt;

    f.gap += (turkeySpeed - farmerSpeed) * dt;
    if (f.gap > 46) f.gap = 46; // he never falls completely off the farm
    f.runPhase += dt * (5 + Math.max(0, farmerSpeed) * 1.4);
    if (f.gap <= 0.6) return 'caught';
    return null;
  }

  FF.makeFarmer = makeFarmer;
  FF.updateFarmer = updateFarmer;
})();
