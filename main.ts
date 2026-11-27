// Feather Fugitive — hand-in program for turkey-run-game-01 (Node 22,
// standard library only). It validates the entry against the gate's caps
// (game/ size and file count, screenshot count/size/dimensions), copies
// game/ and screenshots/ to /output, and writes /output/dossier.json with
// buildDossier from the vendored make.fun library, byte for byte as the
// gate rebuilds it. Runs twice with identical bytes: no clocks, no
// randomness, no network.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  throw new Error(`Feather Fugitive hand-in: ${message}`);
}

// Walk a directory, returning every file and directory path under it.
function walk(dir: string, base = ''): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const rel = base ? `${base}/${name}` : name;
    found.push(rel);
    if (statSync(join(dir, name)).isDirectory()) found.push(...walk(join(dir, name), rel));
  }
  return found;
}

// Read a PNG or JPEG's pixel dimensions from its header bytes.
function imageSize(buf: Buffer, name: string): [number, number] {
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return [buf.readUInt32BE(16), buf.readUInt32BE(20)]; // PNG IHDR
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2; // JPEG: walk segments to the start-of-frame marker
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      }
      i += 2 + len;
    }
  }
  return fail(`${name} is not a whole PNG or JPEG`);
}

function validateGame(gameDir: string): void {
  if (!existsSync(join(gameDir, 'index.html'))) fail('game/index.html is missing');
  const entries = walk(gameDir);
  if (entries.length > 993) fail(`game/ holds ${entries.length} entries, over the 993 cap`);
  let total = 0;
  for (const rel of entries) {
    if (Buffer.byteLength(rel, 'utf8') > 1000) fail(`game/${rel} path is over 1000 bytes`);
    const st = statSync(join(gameDir, rel));
    if (st.isFile()) total += st.size;
  }
  if (total > 48 * 1024 * 1024) fail(`game/ is ${total} bytes, over the 48 MiB cap`);
  const indexBytes = statSync(join(gameDir, 'index.html')).size;
  if (indexBytes > 1024 * 1024) fail(`game/index.html is ${indexBytes} bytes, over the 1 MiB cap`);
}

function validateScreenshots(shotsDir: string): void {
  if (!existsSync(shotsDir)) fail('screenshots/ is missing');
  const names = readdirSync(shotsDir).filter((n) => !n.startsWith('.')).sort();
  if (names.length < 3 || names.length > 4) fail(`screenshots/ holds ${names.length} images, need 3 or 4`);
  for (const name of names) {
    const buf = readFileSync(join(shotsDir, name));
    if (buf.length === 0) fail(`${name} is empty`);
    if (buf.length > 256 * 1024) fail(`${name} is ${buf.length} bytes, over the 256 KiB cap`);
    const [w, h] = imageSize(buf, name);
    const longSide = Math.max(w, h);
    const shortSide = Math.min(w, h);
    if (longSide > 1280) fail(`${name} long side ${longSide}px is over 1280`);
    if (shortSide < 480) fail(`${name} short side ${shortSide}px is under 480`);
  }
}

const gameDir = join(here, 'game');
const shotsDir = join(here, 'screenshots');
validateGame(gameDir);
validateScreenshots(shotsDir);

mkdirSync(out, { recursive: true });
cpSync(gameDir, join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The dossier the judge reads, written with the gate's own caps so the
// bytes match the gate's rebuild exactly.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
if (Buffer.byteLength(dossier, 'utf8') > 1572864) fail('dossier.json is over the 1.5 MiB cap');
writeFileSync(join(out, 'dossier.json'), dossier);

// Post-copy check: every copied file is present in /output with the same
// size as its source, so a truncated copy can never pass silently.
for (const rel of walk(gameDir)) {
  const src = join(gameDir, rel);
  if (!statSync(src).isFile()) continue;
  const dst = join(out, 'game', rel);
  if (!existsSync(dst)) fail(`game/${rel} did not copy to /output`);
  if (statSync(dst).size !== statSync(src).size) fail(`game/${rel} copied with a different size`);
}
for (const name of readdirSync(shotsDir).filter((n) => !n.startsWith('.'))) {
  const dst = join(out, 'screenshots', name);
  if (!existsSync(dst)) fail(`screenshots/${name} did not copy to /output`);
  if (statSync(dst).size !== statSync(join(shotsDir, name)).size) fail(`screenshots/${name} copied with a different size`);
}

console.log(`Feather Fugitive: game/ and screenshots/ copied to ${out}, dossier.json ${Buffer.byteLength(dossier, 'utf8')} bytes`);
