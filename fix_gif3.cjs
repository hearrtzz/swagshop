const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

// Replace the quality slider with a select dropdown
const oldQualityHtml = `      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Qualidade do GIF (1 a 20, menor é melhor)</label>
        <input type="range" id="gif-quality" min="1" max="20" value="10" style="width: 100%;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.4);">
          <span>Máxima</span>
          <span><span id="gif-quality-val">10</span></span>
          <span>Rápida</span>
        </div>
      </div>`;

const newQualityHtml = `      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">Resolução do GIF</label>
        <select id="gif-quality" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 12px; border-radius: 6px; box-sizing: border-box;">
          <option value="high">Resolução Alta (Mais nítido, arquivo maior)</option>
          <option value="medium" selected>Resolução Média (Equilíbrio ideal)</option>
          <option value="low">Resolução Baixa (Mais rápido, arquivo leve)</option>
        </select>
      </div>`;

html = html.replace(oldQualityHtml, newQualityHtml);

// Remove the input event listener for the slider
const oldListener = `        const qualityEl = document.getElementById('gif-quality');
        if (qualityEl) {
            qualityEl.addEventListener('input', (e) => {
              document.getElementById('gif-quality-val').innerText = e.target.value;
            });
        }`;

html = html.replace(oldListener, '');


// Fix the JS for reading quality and applying effects
// First, replace how `quality` is read:
const oldQualityRead = `const quality = parseInt(document.getElementById('gif-quality').value, 10);`;
const newQualityRead = `const qualitySetting = document.getElementById('gif-quality').value;
        let quality = 10;
        let maxDim = 600;
        if (qualitySetting === 'high') {
           quality = 5;
           maxDim = 800;
        } else if (qualitySetting === 'medium') {
           quality = 10;
           maxDim = 500;
        } else if (qualitySetting === 'low') {
           quality = 15;
           maxDim = 320;
        }`;

html = html.replace(oldQualityRead, newQualityRead);

// Then, replace the maxGifDim definition with maxDim
const oldMaxDim = `const maxGifDim = 600;`;
const newMaxDim = `const maxGifDim = maxDim;`;
html = html.replace(oldMaxDim, newMaxDim);

// Replace the render loop to include filters (effects)
const oldRenderLoop = `          for (let i = 0; i < totalFrames; i++) {
            modelGroup.rotation.y = currentRotation + (i * rotationStep);
            renderer.render(scene, camera);
            
            tmpCtx.clearRect(0, 0, gifW, gifH);
            tmpCtx.drawImage(renderer.domElement, 0, 0, gifW, gifH);
            
            gif.addFrame(tmpCtx, { delay: stepTime, copy: true });
          }`;

const newRenderLoop = `          for (let i = 0; i < totalFrames; i++) {
            modelGroup.rotation.y = currentRotation + (i * rotationStep);
            
            if (state.filter === 'none') {
                renderer.setRenderTarget(null);
                renderer.render(scene, camera);
            } else {
                renderer.setRenderTarget(renderTarget);
                renderer.clear();
                renderer.render(scene, camera);
        
                renderer.setRenderTarget(null);
                postMaterial.uniforms.tDiffuse.value = renderTarget.texture;
                renderer.render(postScene, postCamera);
            }
            
            tmpCtx.clearRect(0, 0, gifW, gifH);
            tmpCtx.drawImage(renderer.domElement, 0, 0, gifW, gifH);
            
            gif.addFrame(tmpCtx, { delay: stepTime, copy: true });
          }`;

html = html.replace(oldRenderLoop, newRenderLoop);

// The user also said "faça com que o exportar gif pegue tambem as configurações e todos os efeitos que vao ser aplicados".
// Should we remove the state.mode !== '3d' check and capture the current canvas depending on mode?
// If they are in 2D mode or Photo mode, exporting a loop GIF doesn't make much sense since they don't spin in a simple rotation loop, except Photo mode which is static. But they might mean the 3D post-processing effects, which is handled above. 
// Let's remove the restriction just in case and let it render the 3D scene anyway. Or maybe they just wanted the 3D filters.

fs.writeFileSync('public/3d-studio.html', html);
