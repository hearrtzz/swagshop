const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const oldJs = `      // GIF Export
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

      document.getElementById('gif-confirm').addEventListener('click', async () => {`;

const newJs = `      // GIF Export
      document.addEventListener('DOMContentLoaded', () => {
        const qualityEl = document.getElementById('gif-quality');
        if (qualityEl) {
            qualityEl.addEventListener('input', (e) => {
              document.getElementById('gif-quality-val').innerText = e.target.value;
            });
        }
  
        const cancelEl = document.getElementById('gif-cancel');
        if (cancelEl) {
            cancelEl.addEventListener('click', () => {
              document.getElementById('gif-modal').style.display = 'none';
            });
        }
  
        const btnExportGif = document.getElementById('btn-export-gif');
        if (btnExportGif) {
            btnExportGif.addEventListener('click', () => {
              if (!cachedImage) return;
              if (state.mode !== '3d') {
                  alert('A exportação de GIF funciona apenas no modo 3D.');
                  return;
              }
              document.getElementById('gif-modal').style.display = 'flex';
            });
        }
  
        const gifConfirm = document.getElementById('gif-confirm');
        if (gifConfirm) {
            gifConfirm.addEventListener('click', async () => {`;

// Replace first part
html = html.replace(oldJs, newJs);

// Find the end of gif-confirm event listener and close the DOMContentLoaded
const oldEndJs = `          gif.render();

        } catch (e) {
          console.error(e);
          alert('Erro ao gerar GIF.');
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      });

      syncPhotoUI();`;

const newEndJs = `          gif.render();

        } catch (e) {
          console.error(e);
          alert('Erro ao gerar GIF.');
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      });
      }
      });

      syncPhotoUI();`;

html = html.replace(oldEndJs, newEndJs);

fs.writeFileSync('public/3d-studio.html', html);
