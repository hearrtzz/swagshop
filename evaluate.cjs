const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/3d-studio.html', 'utf8');

// To find the exact line causing the error, let's run the JS inside JSDOM and catch the error.
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("jsdomError", (error) => {
  console.error(error.stack, error.detail);
});

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole });
