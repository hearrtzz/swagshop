const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/3d-studio.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// Let's print out the exact element for chrome-slider-group
console.log("chrome-slider-group:", document.getElementById('chrome-slider-group'));
console.log("canvas-container:", document.getElementById('canvas-container'));
console.log("tab-photo:", document.getElementById('tab-photo'));
console.log("section-photo:", document.getElementById('section-photo'));
console.log("section-threshold:", document.getElementById('section-threshold'));
console.log("p-custom-duo-group:", document.getElementById('p-custom-duo-group'));
console.log("p-halftone-mode-group:", document.getElementById('p-halftone-mode-group'));
console.log("p-date-text-group:", document.getElementById('p-date-text-group'));
console.log("ui-panel:", document.getElementById('ui-panel'));

