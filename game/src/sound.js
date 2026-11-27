// Sound. One clear job: little WebAudio synth effects — no audio files,
// everything is oscillators, so the game plays fully offline.
(function () {
  var FF = window.FF = window.FF || {};

  var ctx = null;
  var muted = false;

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (muted) return;
    var c = ac(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, delay) {
    if (muted) return;
    var c = ac(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var gain = c.createGain(); gain.gain.value = vol || 0.1;
    src.connect(gain); gain.connect(c.destination);
    src.start(t0);
  }

  FF.sound = {
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },
    gobble: function () { tone(520, 0.09, 'square', 0.07, 300); tone(640, 0.08, 'square', 0.06, 380, 0.09); },
    flap: function () { noise(0.12, 0.08); tone(400, 0.1, 'triangle', 0.06, 700); },
    slide: function () { noise(0.18, 0.06); },
    dash: function () { noise(0.22, 0.1); tone(300, 0.2, 'sawtooth', 0.05, 900); },
    corn: function () { tone(880, 0.07, 'sine', 0.1); tone(1320, 0.1, 'sine', 0.09, null, 0.06); },
    feather: function () { tone(660, 0.1, 'triangle', 0.1); tone(990, 0.14, 'triangle', 0.1, null, 0.08); },
    pie: function () { tone(440, 0.09, 'square', 0.07); tone(660, 0.09, 'square', 0.07, null, 0.08); tone(880, 0.14, 'square', 0.07, null, 0.16); },
    chili: function () { tone(700, 0.16, 'sawtooth', 0.08, 1400); },
    knife: function () { tone(2400, 0.16, 'sine', 0.07, 900); },
    close: function () { tone(1040, 0.08, 'sine', 0.08); },
    hit: function () { tone(200, 0.22, 'sawtooth', 0.14, 60); noise(0.15, 0.12); },
    shieldBreak: function () { tone(1200, 0.18, 'triangle', 0.12, 300); },
    spotted: function () { tone(300, 0.12, 'square', 0.12, 520); tone(300, 0.12, 'square', 0.12, 520, 0.15); },
    lost: function () { tone(600, 0.12, 'sine', 0.09, 900); tone(900, 0.16, 'sine', 0.09, 1200, 0.1); },
    stage: function () { tone(523, 0.12, 'triangle', 0.1); tone(659, 0.12, 'triangle', 0.1, null, 0.1); tone(784, 0.2, 'triangle', 0.1, null, 0.2); },
    escaped: function () {
      [523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.22, 'triangle', 0.11, null, i * 0.13); });
      tone(1318, 0.5, 'triangle', 0.11, null, 0.55);
    },
    caught: function () {
      tone(392, 0.25, 'sawtooth', 0.09, 370);
      tone(370, 0.25, 'sawtooth', 0.09, 349, 0.26);
      tone(349, 0.55, 'sawtooth', 0.09, 262, 0.52);
    }
  };
})();
