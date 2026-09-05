const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

// The regex might not easily distinguish assignments vs accesses, but ? doesn't hurt assignments?
// Wait! `document.getElementById('foo')?.innerHTML = 'x'` is a SyntaxError in JS!
// You cannot assign to an optional chain!
// Example: `a?.b = c` -> SyntaxError: Invalid left-hand side in assignment
