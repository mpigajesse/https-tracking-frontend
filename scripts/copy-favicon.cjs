const fs = require('fs');
// Copy valid PNG as favicon (Next.js accepts PNG as favicon)
const src = fs.readFileSync('D:/https-tracking-frontend/public/icons/icon-96x96.png');
fs.writeFileSync('D:/https-tracking-frontend/src/app/favicon.ico', src);
console.log('OK:', src.length, 'bytes, PNG sig:', src.slice(0,4).toString('hex'));
