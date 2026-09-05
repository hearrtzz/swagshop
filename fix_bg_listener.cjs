const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const oldListener = `      document.getElementById('bg-color').addEventListener('input', e => {
        state.sceneBg = e.target.value;
        if (scene) {
           scene.background = new THREE.Color(state.sceneBg);
        }
      });`;

const newListener = `      document.getElementById('bg-color').addEventListener('input', e => {
        state.sceneBg = e.target.value;
        document.getElementById('canvas-container').style.backgroundColor = state.sceneBg;
      });`;

html = html.replace(oldListener, newListener);

const oldGifExportBg = `          // temporarily make background transparent
          scene.background = null;`;
const newGifExportBg = `          // background is already transparent`;

html = html.replace(oldGifExportBg, newGifExportBg);

const oldGifExportBgEnd = `          modelGroup.rotation.y = currentRotation;
          state.rotate = prevAuto;
          scene.background = prevBg;`;
const newGifExportBgEnd = `          modelGroup.rotation.y = currentRotation;
          state.rotate = prevAuto;`;

html = html.replace(oldGifExportBgEnd, newGifExportBgEnd);

const oldGifExportCatch = `          btn.disabled = false;
          scene.background = prevBg;
        }
            });
      }
      });`;

const newGifExportCatch = `          btn.disabled = false;
        }
            });
      }
      });`;

html = html.replace(oldGifExportCatch, newGifExportCatch);

fs.writeFileSync('public/3d-studio.html', html);
