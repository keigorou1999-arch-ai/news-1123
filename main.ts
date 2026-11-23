// news-1123 — make.fun "Sum up 23 November's world news in one image".
// The picture (entry.png) was drawn as HTML/SVG (source/page.html) and rendered with headless Chrome.
// The grader runs this with no network: it only has to put that PNG at /output/entry.png,
// byte for byte, so both runs produce identical output.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const png = readFileSync(new URL('./entry.png', import.meta.url));

// Refuse to ship something that is not a PNG within the contest's limits.
const isPng = png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (!isPng || width > 1024 || height > 1024 || png.length > 1_048_576) {
  throw new Error(`entry.png out of limits: png=${isPng} ${width}x${height} ${png.length} bytes`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), png);
console.log(`wrote ${join(outDir, 'entry.png')} (${width}x${height}, ${png.length} bytes)`);
