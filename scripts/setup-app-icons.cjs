const fs = require('fs');
const path = require('path');

// Delete corrupted favicon.ico from src/app
const faviconPath = 'D:/https-tracking-frontend/src/app/favicon.ico';
if (fs.existsSync(faviconPath)) {
  fs.unlinkSync(faviconPath);
  console.log('Deleted corrupted favicon.ico');
}

// Copy valid PNG as icon.png (Next.js App Router uses this automatically)
const src = fs.readFileSync('D:/https-tracking-frontend/public/icons/icon-192x192.png');
fs.writeFileSync('D:/https-tracking-frontend/src/app/icon.png', src);
console.log('Created src/app/icon.png:', src.length, 'bytes');

// Also copy as apple-icon.png for iOS
const src2 = fs.readFileSync('D:/https-tracking-frontend/public/icons/icon-152x152.png');
fs.writeFileSync('D:/https-tracking-frontend/src/app/apple-icon.png', src2);
console.log('Created src/app/apple-icon.png:', src2.length, 'bytes');
