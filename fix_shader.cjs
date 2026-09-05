const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const oldMain = `        void main() {
          if (uFilter == 1) gl_FragColor = renderHalftone();
          else if (uFilter == 2) gl_FragColor = renderAscii();
          else if (uFilter == 3) gl_FragColor = renderChromatic();
          else if (uFilter == 4) gl_FragColor = renderPixel();
          else if (uFilter == 5) gl_FragColor = renderCelShading();
          else gl_FragColor = texture2D(tDiffuse, vUv);
        }`;

const newMain = `        void main() {
          vec4 orig = texture2D(tDiffuse, vUv);
          vec4 effectColor;
          if (uFilter == 1) effectColor = renderHalftone();
          else if (uFilter == 2) effectColor = renderAscii();
          else if (uFilter == 3) effectColor = renderChromatic();
          else if (uFilter == 4) effectColor = renderPixel();
          else if (uFilter == 5) effectColor = renderCelShading();
          else effectColor = orig;
          
          gl_FragColor = vec4(effectColor.rgb, orig.a);
        }`;

html = html.replace(oldMain, newMain);

// Also we need to make sure scene.background is always null so alpha works
// Let's replace scene.background = new THREE.Color(state.sceneBg); with setting CSS background instead.

html = html.replace(/scene\.background = new THREE\.Color\(state\.sceneBg\);/g, 'scene.background = null; document.getElementById("canvas-container").style.backgroundColor = state.sceneBg;');

// Remove the temp background clears in the export since we want it to be always null
const oldExportFix = `        } else if (state.mode === '3d') {
          const prevBg = scene.background;
          scene.background = null;
          
          if (state.filter === 'none') {`;

const newExportFix = `        } else if (state.mode === '3d') {
          if (state.filter === 'none') {`;

html = html.replace(oldExportFix, newExportFix);

const oldExportEnd = `          link.click();
          
          scene.background = prevBg;
          renderer.render(scene, camera);
        }`;

const newExportEnd = `          link.click();
        }`;

html = html.replace(oldExportEnd, newExportEnd);

fs.writeFileSync('public/3d-studio.html', html);
