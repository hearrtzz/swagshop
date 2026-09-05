const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

// Undo the ?.style and ?.classList replacements
html = html.replace(/\?\.style\./g, '.style.');
html = html.replace(/\?\.classList\./g, '.classList.');

fs.writeFileSync('public/3d-studio.html', html);
