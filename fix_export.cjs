const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

// 1. Add Cor do Fundo below chrome-preset and above Cor Base
const oldColorBase = `        <div class="control-group row">
          <label for="color">Cor Base</label>
          <input type="color" id="color" value="#ffffff" />
        </div>`;

const newColorBase = `        <div class="control-group row">
          <label for="bg-color">Cor do Fundo</label>
          <input type="color" id="bg-color" value="#0b0c0e" />
        </div>
        <div class="control-group row">
          <label for="color">Cor Base</label>
          <input type="color" id="color" value="#ffffff" />
        </div>`;

html = html.replace(oldColorBase, newColorBase);

// 2. Add state.sceneBg
const oldState = `    const state = {
      mode: '3d', // '3d', '2d' ou 'photo'`;

const newState = `    const state = {
      mode: '3d', // '3d', '2d' ou 'photo'
      sceneBg: '#0b0c0e',`;

html = html.replace(oldState, newState);

// 3. Add event listener for bg-color
const oldColorListener = `      document.getElementById('color').addEventListener('input', e => {`;

const newColorListener = `      document.getElementById('bg-color').addEventListener('input', e => {
        state.sceneBg = e.target.value;
        if (scene) {
           scene.background = new THREE.Color(state.sceneBg);
        }
      });

      document.getElementById('color').addEventListener('input', e => {`;

html = html.replace(oldColorListener, newColorListener);

// 4. Update the global export logic
const oldExport3d = `        } else if (state.mode === '3d') {
          // Temporarily set a higher resolution for the export if desired, or just export current view
          // Doing current view is easiest:
          renderer.render(scene, camera);
          
          if (state.filter !== 'none') {
             renderer.setRenderTarget(renderTarget);
             renderer.clear();
             renderer.render(scene, camera);
             
             renderer.setRenderTarget(null);
             postMaterial.uniforms.tDiffuse.value = renderTarget.texture;
             renderer.render(postScene, postCamera);
          }
          
          const link = document.createElement('a');
          link.download = '3d-studio-export.png';
          // Need preserveDrawingBuffer=true in WebGLRenderer for this to work perfectly,
          // but calling toDataURL right after render often works anyway.
          link.href = renderer.domElement.toDataURL('image/png');
          link.click();
        }`;

const newExport3d = `        } else if (state.mode === '3d') {
          const prevBg = scene.background;
          scene.background = null;
          
          if (state.filter === 'none') {
             renderer.setRenderTarget(null);
             renderer.clear();
             renderer.render(scene, camera);
          } else {
             renderer.setRenderTarget(renderTarget);
             renderer.clear();
             renderer.render(scene, camera);
             
             renderer.setRenderTarget(null);
             renderer.clear();
             postMaterial.uniforms.tDiffuse.value = renderTarget.texture;
             renderer.render(postScene, postCamera);
          }
          
          const link = document.createElement('a');
          link.download = '3d-studio-export.png';
          link.href = renderer.domElement.toDataURL('image/png');
          link.click();
          
          scene.background = prevBg;
          renderer.render(scene, camera);
        }`;

html = html.replace(oldExport3d, newExport3d);

fs.writeFileSync('public/3d-studio.html', html);
