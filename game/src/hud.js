// HUD and screens. One clear job: the score/distance/lives bar during a
// run, and the title, pause and end screens around it.
(function () {
  var FF = window.FF = window.FF || {};

  function panel(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(40,20,8,0.88)';
    ctx.strokeStyle = '#e8a83e'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.fill(); ctx.stroke();
  }

  function drawHUD(ctx, game) {
    var t = game.turkey;
    // Top bar.
    ctx.fillStyle = 'rgba(40,20,8,0.82)';
    ctx.fillRect(0, 0, FF.W, 58);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE ' + game.score, 22, 38);
    ctx.textAlign = 'center';
    ctx.fillText(FF.STAGES[game.stageIndex].name, FF.W / 2, 38);
    ctx.textAlign = 'right';
    ctx.fillText('DIST ' + Math.floor(t.dist) + ' / ' + FF.TOTAL_LENGTH + ' m', FF.W - 250, 38);

    // Lives as feathers.
    for (var i = 0; i < FF.LIVES; i++) {
      var fx = FF.W - 210 + i * 34;
      ctx.fillStyle = i < game.lives ? '#ffd34d' : 'rgba(255,255,255,0.22)';
      ctx.save(); ctx.translate(fx, 30); ctx.rotate(0.5);
      ctx.beginPath(); ctx.ellipse(0, 0, 7, 15, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    if (game.shield) {
      ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(FF.W - 60, 29, 15, 0, 7); ctx.stroke();
      ctx.fillStyle = '#ffd34d';
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('S', FF.W - 60, 35);
    }

    // Farmer proximity bar, bottom left: fills red as he closes in.
    var danger = 1 - Math.min(1, game.farmer.gap / 40);
    ctx.fillStyle = 'rgba(40,20,8,0.75)';
    ctx.fillRect(18, FF.H - 46, 270, 30);
    ctx.fillStyle = danger > 0.75 ? '#ff4b3a' : '#e8762a';
    ctx.fillRect(22, FF.H - 42, 262 * danger, 22);
    ctx.fillStyle = '#fff8e8';
    ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(game.farmer.state === 'search' ? 'FARMER SEARCHING…' : 'FARMER ' + Math.max(0, Math.round(game.farmer.gap)) + ' m', 30, FF.H - 25);

    // Dash pip, bottom right.
    ctx.fillStyle = 'rgba(40,20,8,0.75)';
    ctx.fillRect(FF.W - 188, FF.H - 46, 170, 30);
    var ready = t.dashCooldown <= 0;
    ctx.fillStyle = ready ? '#7ad67a' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(FF.W - 184, FF.H - 42, 162 * (ready ? 1 : 1 - t.dashCooldown / FF.DASH_COOLDOWN), 22);
    ctx.fillStyle = '#fff8e8';
    ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('DASH', FF.W - 103, FF.H - 25);

    // Stage banner.
    if (game.banner > 0) {
      ctx.globalAlpha = Math.min(1, game.banner);
      ctx.fillStyle = 'rgba(40,20,8,0.8)';
      ctx.fillRect(FF.W / 2 - 320, 120, 640, 74);
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(FF.STAGES[game.stageIndex].name, FF.W / 2, 170);
      ctx.globalAlpha = 1;
    }
    if (game.farmer.spottedFlash > 0) {
      ctx.fillStyle = 'rgba(214,59,42,0.16)';
      ctx.fillRect(0, 58, FF.W, FF.H - 58);
    }
  }

  function drawTitle(ctx, game) {
    panel(ctx, 240, 60, 800, 430);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('FEATHER FUGITIVE', FF.W / 2, 150);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'italic 28px sans-serif';
    ctx.fillText("— a turkey's Thanksgiving breakout —", FF.W / 2, 192);
    ctx.fillStyle = '#fff8e8';
    ctx.font = '24px sans-serif';
    ctx.fillText('Dinner is at 6pm and YOU are the menu. Outrun the farmer', FF.W / 2, 244);
    ctx.fillText('through the farmyard, the barn and the kitchen — dodge the', FF.W / 2, 278);
    ctx.fillText('carving knives, leap the oven, and reach the forest gate.', FF.W / 2, 312);
    ctx.font = '22px sans-serif';
    ctx.fillText('← → pace   ·   SPACE jump (twice = flap)   ·   ↓ slide & hide in hay', FF.W / 2, 362);
    ctx.fillText('SHIFT dash   ·   P pause   ·   M mute   ·   click also jumps', FF.W / 2, 396);
    ctx.fillText('Corn scores. A golden feather shields one hit. Pie = speed.', FF.W / 2, 430);
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Press SPACE or click to run', FF.W / 2, 472);
    if (game.best > 0) {
      ctx.fillStyle = '#ffe9a8';
      ctx.font = '20px sans-serif';
      ctx.fillText('Best score: ' + game.best, FF.W / 2, 540);
    }
  }

  function drawEnd(ctx, game, escaped) {
    panel(ctx, 520, 100, 620, 400);
    ctx.textAlign = 'center';
    if (escaped) {
      ctx.fillStyle = '#7ad67a';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText('ESCAPED!', 830, 200);
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'italic 25px sans-serif';
      ctx.fillText('Pardoned by the President. Dinner is cancelled.', 830, 244);
    } else {
      ctx.fillStyle = '#ff6b5e';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText('CAUGHT!', 830, 200);
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'italic 25px sans-serif';
      ctx.fillText('The farmer got his Thanksgiving dinner… almost.', 830, 244);
    }
    ctx.fillStyle = '#fff8e8';
    ctx.font = '26px sans-serif';
    ctx.fillText('Distance: ' + Math.floor(game.turkey.dist) + ' m', 830, 306);
    ctx.fillText('Score: ' + game.score, 830, 348);
    ctx.fillText('Best: ' + game.best, 830, 390);
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Press R or click to run again', 830, 458);
  }

  function drawPaused(ctx) {
    ctx.fillStyle = 'rgba(20,10,4,0.55)';
    ctx.fillRect(0, 0, FF.W, FF.H);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 56px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PAUSED', FF.W / 2, 340);
    ctx.font = '24px sans-serif';
    ctx.fillText('Press P to keep running', FF.W / 2, 390);
  }

  FF.drawHUD = drawHUD;
  FF.drawTitle = drawTitle;
  FF.drawEnd = drawEnd;
  FF.drawPaused = drawPaused;
})();
