const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const mp4Comment = `      // MP4 Recording`;

const modelLogic = `
      // 3D Model Export Modal Logic
      const btnExportModel = document.getElementById('btn-export-3d-model');
      const modelModal = document.getElementById('model-modal');
      const modelCancel = document.getElementById('model-cancel');
      const modelConfirm = document.getElementById('model-confirm');
      const modelFilename = document.getElementById('model-filename');
      const modelFormat = document.getElementById('model-format');

      if (btnExportModel) {
        btnExportModel.addEventListener('click', () => {
          if (!modelGroup || modelGroup.children.length === 0) {
            alert('Não há nenhum modelo 3D carregado para exportar.');
            return;
          }
          modelModal.style.display = 'flex';
        });
      }

      if (modelCancel) {
        modelCancel.addEventListener('click', () => {
          modelModal.style.display = 'none';
        });
      }

      if (modelConfirm) {
        modelConfirm.addEventListener('click', () => {
          modelModal.style.display = 'none';
          const format = modelFormat.value;
          let filename = modelFilename.value.trim() || 'modelo_3d';

          if (format === 'gltf' || format === 'glb') {
            const exporter = new THREE.GLTFExporter();
            exporter.parse(modelGroup, (result) => {
              if (result instanceof ArrayBuffer) {
                // GLB
                saveArrayBuffer(result, filename + '.glb');
              } else {
                // GLTF
                const output = JSON.stringify(result, null, 2);
                saveString(output, filename + '.gltf');
              }
            }, { binary: format === 'glb' });
          } else if (format === 'obj') {
            const exporter = new THREE.OBJExporter();
            const result = exporter.parse(modelGroup);
            saveString(result, filename + '.obj');
          }
        });
      }

      function saveString(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        saveBlob(blob, filename);
      }

      function saveArrayBuffer(buffer, filename) {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveBlob(blob, filename);
      }

      function saveBlob(blob, filename) {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // MP4 Recording`;

html = html.replace(mp4Comment, modelLogic);

fs.writeFileSync('public/3d-studio.html', html);
