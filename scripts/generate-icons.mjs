/**
 * Génère les icônes PNG pour le PWA Lear Track
 * Logo : fond blanc, carré rouge #CC0000 centré, lettre "L" blanche en gras
 * Utilise uniquement les modules natifs Node.js (zlib + fs)
 */
import { createDeflate } from 'zlib';
import { writeFileSync } from 'fs';
import { promisify } from 'util';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// ─── PNG helpers ──────────────────────────────────────────────────────────────

function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = crc32(Buffer.concat([typeBytes, data]));
  const crcBytes = Buffer.alloc(4);
  crcBytes.writeUInt32BE(crcBuf, 0);
  return Buffer.concat([len, typeBytes, data, crcBytes]);
}

async function makePNG(size) {
  // ─── Draw pixels ───────────────────────────────────────────────────────────
  // Each pixel: [R, G, B, A]
  const pixels = [];
  
  // Logo design:
  // - White background
  // - Red square: 70% of size, centered
  // - "L" shape in white inside the red square
  
  const redSquareSize = Math.round(size * 0.72);
  const redOffset = Math.round((size - redSquareSize) / 2);
  
  // Letter "L" proportions inside red square
  const lPad = Math.round(redSquareSize * 0.18);
  const strokeW = Math.round(redSquareSize * 0.18);
  
  // L vertical bar: from top pad to bottom pad, left aligned
  const lLeft = redOffset + lPad;
  const lRight = lLeft + strokeW;
  const lTop = redOffset + lPad;
  const lBottom = redOffset + redSquareSize - lPad;
  
  // L horizontal bar: bottom of vertical bar
  const lHBottom = lBottom;
  const lHTop = lHBottom - strokeW;
  const lHRight = redOffset + redSquareSize - lPad;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inRedSquare = x >= redOffset && x < redOffset + redSquareSize &&
                          y >= redOffset && y < redOffset + redSquareSize;
      
      if (!inRedSquare) {
        // White background
        pixels.push([255, 255, 255, 255]);
        continue;
      }
      
      // Inside red square — check if pixel is part of "L"
      const inVerticalBar = x >= lLeft && x < lRight && y >= lTop && y < lBottom;
      const inHorizontalBar = x >= lLeft && x < lHRight && y >= lHTop && y < lHBottom;
      
      if (inVerticalBar || inHorizontalBar) {
        // White letter
        pixels.push([255, 255, 255, 255]);
      } else {
        // Red background
        pixels.push([204, 0, 0, 255]);
      }
    }
  }

  // ─── Build raw image data with filter bytes ─────────────────────────────────
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    rawRows.push(0); // filter type None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixels[y * size + x];
      rawRows.push(r, g, b, a);
    }
  }
  const rawData = Buffer.from(rawRows);

  // Compress with zlib
  const compressed = await new Promise((resolve, reject) => {
    const z = createDeflate({ level: 9 });
    const chunks = [];
    z.on('data', d => chunks.push(d));
    z.on('end', () => resolve(Buffer.concat(chunks)));
    z.on('error', reject);
    z.write(rawData);
    z.end();
  });

  // ─── Build PNG ─────────────────────────────────────────────────────────────
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);   // width
  ihdr.writeUInt32BE(size, 4);   // height
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Split compressed data into IDAT chunks of 8192 bytes each
  const idatChunks = [];
  for (let i = 0; i < compressed.length; i += 8192) {
    idatChunks.push(chunk('IDAT', compressed.slice(i, i + 8192)));
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    ...idatChunks,
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Generate all sizes ────────────────────────────────────────────────────────
for (const size of sizes) {
  const png = await makePNG(size);
  writeFileSync(`public/icons/icon-${size}x${size}.png`, png);
  console.log(`✓ icon-${size}x${size}.png — ${png.length} bytes`);
}

// ─── Screenshots (placeholder with "Lear Track" text on red bg) ──────────────
async function makeScreenshot(w, h) {
  const pixels = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      pixels.push([17, 17, 17, 255]); // #111111 dark bg
    }
  }

  // Draw a centered red rectangle as placeholder
  const rw = Math.round(w * 0.6);
  const rh = Math.round(h * 0.08);
  const rx = Math.round((w - rw) / 2);
  const ry = Math.round(h * 0.45);

  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      if (y >= 0 && y < h && x >= 0 && x < w) {
        pixels[y * w + x] = [204, 0, 0, 255];
      }
    }
  }

  const rawRows = [];
  for (let y = 0; y < h; y++) {
    rawRows.push(0);
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = pixels[y * w + x];
      rawRows.push(r, g, b, a);
    }
  }
  const rawData = Buffer.from(rawRows);

  const compressed = await new Promise((resolve, reject) => {
    const z = createDeflate({ level: 6 });
    const chunks = [];
    z.on('data', d => chunks.push(d));
    z.on('end', () => resolve(Buffer.concat(chunks)));
    z.on('error', reject);
    z.write(rawData);
    z.end();
  });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;

  const idatChunks = [];
  for (let i = 0; i < compressed.length; i += 8192) {
    idatChunks.push(chunk('IDAT', compressed.slice(i, i + 8192)));
  }

  return Buffer.concat([signature, chunk('IHDR', ihdr), ...idatChunks, chunk('IEND', Buffer.alloc(0))]);
}

const wide = await makeScreenshot(1280, 720);
writeFileSync('public/icons/screenshot-wide.png', wide);
console.log(`✓ screenshot-wide.png — ${wide.length} bytes`);

const narrow = await makeScreenshot(390, 844);
writeFileSync('public/icons/screenshot-narrow.png', narrow);
console.log(`✓ screenshot-narrow.png — ${narrow.length} bytes`);

console.log('\nDone! All icons generated.');
