const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

// Update CSS
const oldTrafficCSS = `    .traffic-btn {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }`;

const newTrafficCSS = `    .traffic-btn {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.15);
      cursor: pointer;
    }

    #ui-panel.minimized .mac-segmented,
    #ui-panel.minimized .mac-content {
      display: none !important;
    }`;

html = html.replace(oldTrafficCSS, newTrafficCSS);

// Add event listener in JS for the minimize button
// We can insert it inside `function setupEvents() {`
const oldSetupEvents = `    function setupEvents() {
      const dropzone = document.getElementById('dropzone');`;

const newSetupEvents = `    function setupEvents() {
      // Minimize Panel
      const minBtn = document.querySelector('.traffic-btn.minimize');
      if (minBtn) {
        minBtn.addEventListener('click', () => {
          document.getElementById('ui-panel').classList.toggle('minimized');
        });
      }
      
      const dropzone = document.getElementById('dropzone');`;

html = html.replace(oldSetupEvents, newSetupEvents);

fs.writeFileSync('public/3d-studio.html', html);
