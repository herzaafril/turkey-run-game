// Seeded random numbers. One clear job: deterministic randomness, so a
// run with the same seed lays out the same track (the screenshot scenes
// rely on this).
(function () {
  var FF = window.FF = window.FF || {};

  function makeRng(seed) {
    var s = (seed >>> 0) || 1;
    function next() {
      // mulberry32
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next: next,
      range: function (lo, hi) { return lo + next() * (hi - lo); },
      int: function (lo, hi) { return Math.floor(lo + next() * (hi - lo + 1)); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; }
    };
  }

  FF.makeRng = makeRng;
})();
