/**
 * Crée un favicon.ico à partir du PNG 96x96 existant
 * Un ICO est un conteneur de BMPs ou PNGs
 * Format ICO avec PNG embedded (supporté depuis Vista+)
 */
const fs = require('fs');
const path = require('path');

function makeIco(pngBuffers) {
  // ICO header: 6 bytes
  // ICONDIR: Reserved(2) + Type(2) + Count(2)
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // Reserved
  header.writeUInt16LE(1, 2);     // Type: 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  // Each entry: 16 bytes
  // ICONDIRENTRY: Width(1) + Height(1) + ColorCount(1) + Reserved(1) + Planes(2) + BitCount(2) + BytesInRes(4) + ImageOffset(4)
  const entrySize = 16;
  const dataOffset = 6 + count * entrySize;

  const entries = [];
  let offset = dataOffset;
  for (const png of pngBuffers) {
    // Read size from PNG IHDR
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);   // Width (0 = 256)
    entry.writeUInt8(height >= 256 ? 0 : height, 1); // Height (0 = 256)
    entry.writeUInt8(0, 2);                           // ColorCount
    entry.writeUInt8(0, 3);                           // Reserved
    entry.writeUInt16LE(1, 4);                        // Planes
    entry.writeUInt16LE(32, 6);                       // BitCount
    entry.writeUInt32LE(png.length, 8);               // BytesInRes
    entry.writeUInt32LE(offset, 12);                  // ImageOffset
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

// Use 16x16, 32x32, 48x48, 96x96 — we have 96 and 72
// Let's use 96x96 and 72x72 as they are closest
const png96 = fs.readFileSync('public/icons/icon-96x96.png');
const png192 = fs.readFileSync('public/icons/icon-192x192.png');

const ico = makeIco([png96, png192]);
fs.writeFileSync('public/favicon.ico', ico);
console.log('favicon.ico created:', ico.length, 'bytes');
