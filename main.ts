// news-1123 — make.fun "Sum up 23 November's world news in one image".
// The picture (entry.png) was drawn as HTML/SVG (source/page.html) and rendered with headless Chrome.
// The grader runs this with no network: it only has to put that PNG at /output/entry.png,
// byte for byte, so both runs produce identical output.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const png = readFileSync(new URL('./entry.png', import.meta.url));

// Refuse to ship something that is not a PNG within the contest's limits
// (max 1024x1024 pixels, max 1 MiB). Each failure gets its own clear message.
const MAX_SIDE = 1024;
const MAX_BYTES = 1_048_576;
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function fail(reason: string): never {
  console.error(`entry.png rejected: ${reason}`);
  process.exit(1);
}

if (png.length < 24) fail(`file too short (${png.length} bytes)`);
if (!png.subarray(0, 8).equals(PNG_SIG)) fail('missing PNG signature');
if (png.toString('latin1', 12, 16) !== 'IHDR') fail('first chunk is not IHDR');
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width === 0 || height === 0) fail(`empty image (${width}x${height})`);
if (width > MAX_SIDE || height > MAX_SIDE) fail(`${width}x${height} exceeds ${MAX_SIDE}x${MAX_SIDE}`);
if (png.length > MAX_BYTES) fail(`${png.length} bytes exceeds ${MAX_BYTES} (1 MiB)`);

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'entry.png');
writeFileSync(outPath, png);

// Read it back so a short or failed write can never pass silently.
if (!readFileSync(outPath).equals(png)) fail(`written file at ${outPath} does not match the source`);
console.log(`wrote ${outPath} (${width}x${height}, ${png.length} bytes)`);
