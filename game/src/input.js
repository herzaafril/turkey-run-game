// Input. One clear job: keyboard and mouse state, with edge-triggered
// "pressed" flags the game loop consumes once per frame.
(function () {
  var FF = window.FF = window.FF || {};

  var input = {
    left: false, right: false, down: false,
    jumpPressed: false, slidePressed: false, dashPressed: false,
    pausePressed: false, mutePressed: false, restartPressed: false,
    confirmPressed: false, // Space / Enter / click on menus
    clicked: false, clickX: 0, clickY: 0
  };
  FF.input = input;

  var held = {};
  function setHeld(code, on) {
    if (code === 'ArrowLeft' || code === 'KeyA') input.left = on;
    if (code === 'ArrowRight' || code === 'KeyD') input.right = on;
    if (code === 'ArrowDown' || code === 'KeyS') input.down = on;
  }

  document.addEventListener('keydown', function (e) {
    if (e.repeat) { setHeld(e.code, true); return; }
    setHeld(e.code, true);
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') input.jumpPressed = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') input.slidePressed = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') input.dashPressed = true;
    if (e.code === 'KeyP') input.pausePressed = true;
    if (e.code === 'KeyM') input.mutePressed = true;
    if (e.code === 'KeyR') input.restartPressed = true;
    if (e.code === 'Space' || e.code === 'Enter') input.confirmPressed = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) >= 0) e.preventDefault();
  });
  document.addEventListener('keyup', function (e) { setHeld(e.code, false); });

  document.addEventListener('mousedown', function (e) {
    var canvas = document.getElementById('game');
    var r = canvas.getBoundingClientRect();
    input.clickX = (e.clientX - r.left) * (FF.W / r.width);
    input.clickY = (e.clientY - r.top) * (FF.H / r.height);
    input.clicked = true;
    input.jumpPressed = true;   // a click also jumps, mid-run
    input.confirmPressed = true;
  });

  // Called by the loop after each frame's logic: clear the one-frame flags.
  input.consume = function () {
    input.jumpPressed = false;
    input.slidePressed = false;
    input.dashPressed = false;
    input.pausePressed = false;
    input.mutePressed = false;
    input.restartPressed = false;
    input.confirmPressed = false;
    input.clicked = false;
  };
})();
