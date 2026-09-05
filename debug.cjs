const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/3d-studio.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// We need to extract the JS from the HTML and evaluate it, or just statically check
const ids = [...html.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const missingIds = [];
for (const id of new Set(ids)) {
  if (!document.getElementById(id)) {
    missingIds.push(id);
  }
}
console.log("Missing IDs in HTML:", missingIds);
