const fs = require('fs');
const content = fs.readFileSync('public/3d-studio.html', 'utf8');
// Let's just find all elements that have addEventListener
const matches = content.match(/document\.getElementById\('([^']+)'\)\.addEventListener/g);
console.log(matches);
