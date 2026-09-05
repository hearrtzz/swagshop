const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

// Replace traffic lights and title
const oldTitlebar = `    <div class="mac-titlebar" id="mac-titlebar">
      <div class="mac-traffic-lights">
        <span class="traffic-btn close"></span>
        <span class="traffic-btn minimize"></span>
        <span class="traffic-btn maximize"></span>
      </div>
      <span class="mac-title">Logo Studio</span>
    </div>`;

const newTitlebar = `    <div class="mac-titlebar" id="mac-titlebar">
      <button class="hide-btn" style="background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 6px; font-size: 0.7rem; padding: 4px 10px; cursor: pointer; font-weight: 500; transition: background 0.2s;">Hidden</button>
      <span class="mac-title" style="margin-right: 0; flex: 1; text-align: right;">SWAGSHOP3D</span>
    </div>`;

html = html.replace(oldTitlebar, newTitlebar);

// Also add a restore button right before ui-panel
const restoreBtnHtml = `
  <button id="restore-btn" style="display: none; position: absolute; top: 32px; right: 32px; z-index: 100; background: rgba(24, 24, 27, 0.65); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 12px 16px; color: #fff; cursor: pointer; box-shadow: 0 8px 32px rgba(0,0,0,0.4); align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; transition: background 0.2s;">
    🛠️ SWAGSHOP3D
  </button>
  <div id="ui-panel">`;

html = html.replace(/<div id="ui-panel">/, restoreBtnHtml);

// Remove the old minimize script and add the new one
const oldMinimizeScript = `      // Minimize Panel
      const minBtn = document.querySelector('.traffic-btn.minimize');
      if (minBtn) {
        minBtn.addEventListener('click', () => {
          document.getElementById('ui-panel').classList.toggle('minimized');
        });
      }`;

const newMinimizeScript = `      // Minimize Panel (Hidden)
      const minBtn = document.querySelector('.hide-btn');
      const restoreBtn = document.getElementById('restore-btn');
      const panel = document.getElementById('ui-panel');
      if (minBtn && restoreBtn && panel) {
        minBtn.addEventListener('click', () => {
          panel.style.display = 'none';
          restoreBtn.style.display = 'flex';
        });
        restoreBtn.addEventListener('click', () => {
          panel.style.display = 'flex';
          restoreBtn.style.display = 'none';
        });
      }`;

html = html.replace(oldMinimizeScript, newMinimizeScript);

// Remove the CSS for traffic lights since they are no longer used
// It's not strictly necessary to delete the CSS, but it keeps things clean.
// Or just let it be.

// We need to fix the titlebar drag logic so it doesn't drag when clicking 'Hidden'
// Currently: if (e.target.closest('.mac-traffic-lights')) return;
const oldDragCheck = `if (e.target.closest('.mac-traffic-lights')) return;`;
const newDragCheck = `if (e.target.closest('.hide-btn')) return;`;
html = html.replace(oldDragCheck, newDragCheck);

fs.writeFileSync('public/3d-studio.html', html);
