const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const modalHtml = `
  <!-- GIF Export Modal -->
  <div id="gif-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
    <div style="background: #1e1e24; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; width: 360px; color: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
      <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">Exportar GIF</h3>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Nome do Arquivo</label>
        <input type="text" id="gif-filename" value="animacao_loop" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 12px; border-radius: 6px; box-sizing: border-box;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">FPS (Quadros por segundo)</label>
        <select id="gif-fps" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 12px; border-radius: 6px; box-sizing: border-box;">
          <option value="15">15 FPS (Leve)</option>
          <option value="30" selected>30 FPS (Fluido)</option>
          <option value="60">60 FPS (Ultra Fluido - Demorado)</option>
        </select>
      </div>

      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Qualidade do GIF (1 a 20, menor é melhor)</label>
        <input type="range" id="gif-quality" min="1" max="20" value="10" style="width: 100%;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.4);">
          <span>Máxima</span>
          <span><span id="gif-quality-val">10</span></span>
          <span>Rápida</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="gif-cancel" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Cancelar</button>
        <button id="gif-confirm" style="background: #a855f7; border: 1px solid #a855f7; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Exportar</button>
      </div>
    </div>
  </div>
`;

html = html.replace('</body>', modalHtml + '\n</body>');

const oldJs = `      // GIF Export
      document.getElementById('btn-export-gif').addEventListener('click', async () => {
        if (!cachedImage) return;
        if (state.mode !== '3d') {
            alert('A exportação de GIF funciona apenas no modo 3D.');
            return;
        }

        const btn = document.getElementById('btn-export-gif');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Gerando GIF (Aguarde)...';
        btn.disabled = true;

        let prevBg = scene.background;

        try {`;

const newJs = `      // GIF Export
      document.getElementById('gif-quality').addEventListener('input', (e) => {
        document.getElementById('gif-quality-val').innerText = e.target.value;
      });

      document.getElementById('gif-cancel').addEventListener('click', () => {
        document.getElementById('gif-modal').style.display = 'none';
      });

      document.getElementById('btn-export-gif').addEventListener('click', () => {
        if (!cachedImage) return;
        if (state.mode !== '3d') {
            alert('A exportação de GIF funciona apenas no modo 3D.');
            return;
        }
        document.getElementById('gif-modal').style.display = 'flex';
      });

      document.getElementById('gif-confirm').addEventListener('click', async () => {
        document.getElementById('gif-modal').style.display = 'none';
        
        const filename = document.getElementById('gif-filename').value || 'animacao_loop';
        const fps = parseInt(document.getElementById('gif-fps').value, 10);
        const quality = parseInt(document.getElementById('gif-quality').value, 10);

        const btn = document.getElementById('btn-export-gif');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Gerando GIF (Aguarde)...';
        btn.disabled = true;

        let prevBg = scene.background;

        try {`;

html = html.replace(oldJs, newJs);

// Find the parts where hardcoded fps and quality and filename are used and replace them.

html = html.replace(/quality: 10,/, 'quality: quality,');
html = html.replace(/const fps = 30;/, '');
// Notice: there's \`const fps = 30;\` below \`const rotationStep\`. We need to be careful.

const oldValuesStr = `          const totalFrames = 60; // Fixed frames for smooth and fast generation
          const rotationStep = (Math.PI * 2) / totalFrames;
          const fps = 30;
          const stepTime = 1000 / fps;`;

const newValuesStr = `          const totalFrames = (fps === 15) ? 30 : ((fps === 60) ? 120 : 60); // dynamic frames based on fps for 2-second loop
          const rotationStep = (Math.PI * 2) / totalFrames;
          const stepTime = 1000 / fps;`;

html = html.replace(oldValuesStr, newValuesStr);

html = html.replace(/link.download = 'animacao_loop.gif';/, "link.download = filename + '.gif';");

fs.writeFileSync('public/3d-studio.html', html);
