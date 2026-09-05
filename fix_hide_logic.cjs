const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const oldSetup = `    function setupEvents() {
      window.addEventListener('resize', () => {`;

const newSetup = `    function setupEvents() {
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
      }

      window.addEventListener('resize', () => {`;

html = html.replace(oldSetup, newSetup);

fs.writeFileSync('public/3d-studio.html', html);
