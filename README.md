[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/herzaafril/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/herzaafril/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

# Feather Fugitive

A turkey escape game for the make.fun bounty
[Make the best turkey escape game](https://make.fun/bounty/turkey-run-game-01),
entered by @herza-afril.

Dinner is at 6pm and you are the menu. Outrun the farmer through the
farmyard, the barn and the kitchen: pace with ←/→, jump (twice = flap),
slide, dash, and hide in haystacks while he searches. Dodge the carving
knives, leap the oven, grab corn, and reach the forest gate at 1,200 m —
or get caught and become Thanksgiving dinner.

- `game/` — the playable game: static files, canvas 2D, WebAudio synth
  sound, no network, no libraries. Open `game/index.html` in a desktop
  browser (or serve it with `node serve.ts`).
- `main.ts` — the Node 22 hand-in program: validates the entry against
  the gate's caps, copies `game/` and `screenshots/` to `/output`, and
  writes `/output/dossier.json` with `buildDossier` from
  `vendor/makefun-game.ts` (the kit's copy, unchanged).
- `screenshots/` — real renders of the game's own code (`?shot=` scenes
  in `game/src/shots.js`): a run in play, the title screen, the kitchen
  stage, and the escaped end screen.

Source is split by job under `game/src/`: `config.js` (constants and the
stage table), `random.js` (seeded RNG), `level.js` (track building),
`turkey.js` (player movement), `farmer.js` (pursuer AI: chase, search,
corner), `hazards.js` (dangers, pickups, collisions), `render.js` (all
drawing), `hud.js` (HUD and screens), `input.js` (keyboard and mouse),
`sound.js` (synth effects), `shots.js` (screenshot staging), `main.js`
(state machine and loop).
