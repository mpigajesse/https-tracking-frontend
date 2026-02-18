const fs = require('fs');
const buf = fs.readFileSync('public/icons/icon-512x512.png');
const sig = buf.slice(0, 8).toString('hex');
console.log('PNG signature:', sig);
console.log('Valid PNG:', sig === '89504e470d0a1a0a');
console.log('Size:', buf.length, 'bytes');
