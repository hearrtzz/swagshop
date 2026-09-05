const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const globalActions = `  <div id="global-actions">
    <button id="btn-return" onclick="window.location.href='./index.html'">← Retornar</button>
    <button id="btn-global-export">⬇ Exportar Imagem</button>
    <button id="btn-export-gif">🪄 Exportar GIF Loop (Transparente)</button>
    <button id="btn-record-video">🔴 Gravar Tela (MP4/WEBM)</button>
  </div>`;

const newGlobalActions = `  <div id="global-actions">
    <button id="btn-return" onclick="window.location.href='./index.html'">← Retornar</button>
    <button id="btn-global-export">⬇ Exportar Imagem</button>
    <button id="btn-export-gif">🪄 Exportar GIF Loop</button>
    <button id="btn-export-3d-model">🧊 Exportar 3D</button>
    <button id="btn-record-video">🔴 Gravar MP4</button>
  </div>`;

html = html.replace(globalActions, newGlobalActions);

const newModal = `
  <!-- Model Export Modal -->
  <div id="model-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
    <div style="background: #1e1e24; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; width: 360px; color: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
      <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">Exportar Modelo 3D</h3>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Nome do Arquivo</label>
        <input type="text" id="model-filename" value="modelo_3d" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 12px; border-radius: 6px; box-sizing: border-box;">
      </div>

      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Formato do Arquivo</label>
        <select id="model-format" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 12px; border-radius: 6px; box-sizing: border-box;">
          <option value="gltf">GLTF (Formato Web Padrão - JSON)</option>
          <option value="glb" selected>GLB (Binário - Arquivo Único)</option>
          <option value="obj">OBJ (Formato Clássico Universal)</option>
        </select>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="model-cancel" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Cancelar</button>
        <button id="model-confirm" style="background: #3b82f6; border: 1px solid #3b82f6; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Baixar Modelo</button>
      </div>
    </div>
  </div>
`;

html = html.replace('</body>', newModal + '\n</body>');

fs.writeFileSync('public/3d-studio.html', html);
