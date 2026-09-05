const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

html = html.replace(/(\w+)\.classList\./g, '$1?.classList.');
html = html.replace(/\)\.classList\./g, ')?.classList.');

// Also any `.appendChild` or `.removeChild`?
// Let's just fix `.classList` first.

fs.writeFileSync('public/3d-studio.html', html);
