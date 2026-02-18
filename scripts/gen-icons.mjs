import fs from 'fs';
import path from 'path';

const dir = 'D:/https-tracking-frontend/public/icons';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const r = size * 0.2;
  const ri = size * 0.15;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#2A0000"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <rect x="${size*0.06}" y="${size*0.06}" width="${size*0.88}" height="${size*0.88}" rx="${ri}" fill="none" stroke="#CC0000" stroke-width="${size*0.025}" stroke-opacity="0.4"/>
  <text x="${size*0.5}" y="${size*0.56}" font-family="Arial Black,Arial,sans-serif" font-size="${size*0.42}" font-weight="900" fill="#CC0000" text-anchor="middle" dominant-baseline="middle">L</text>
  <text x="${size*0.5}" y="${size*0.82}" font-family="Arial,sans-serif" font-size="${size*0.1}" font-weight="bold" fill="#888888" text-anchor="middle" letter-spacing="${size*0.02}">LEAR</text>
</svg>`;
  // Write as .svg but named .png for manifest compatibility — browsers handle SVG in manifests
  fs.writeFileSync(path.join(dir, `icon-${size}x${size}.png`), svg);
});

// Splash / screenshot placeholders
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
  <rect width="390" height="844" fill="#111111"/>
  <text x="195" y="422" font-family="Arial Black,Arial,sans-serif" font-size="80" font-weight="900" fill="#CC0000" text-anchor="middle" dominant-baseline="middle">L</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'screenshot-narrow.png'), splash);

const splashWide = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#111111"/>
  <text x="640" y="360" font-family="Arial Black,Arial,sans-serif" font-size="120" font-weight="900" fill="#CC0000" text-anchor="middle" dominant-baseline="middle">LEAR</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'screenshot-wide.png'), splashWide);

console.log('PWA icons generated successfully');
