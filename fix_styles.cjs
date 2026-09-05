const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

// Replace standard variables.style with variables?.style
html = html.replace(/(\w+)\.style\./g, '$1?.style.');
// Replace document.getElementById(...).style with document.getElementById(...)?.style
html = html.replace(/\)\.style\./g, ')\?.style.');

fs.writeFileSync('public/3d-studio.html', html);
