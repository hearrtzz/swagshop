const fs = require('fs');

let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const injectionCode = `
      // MP4 Recording
      let mediaRecorder;
      let recordedChunks = [];
      let isRecording = false;

      document.getElementById('btn-record-video').addEventListener('click', () => {
        if (!isRecording) {
          try {
            const stream = renderer.domElement.captureStream(30);
            let mimeType = 'video/mp4';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'video/webm;codecs=vp9';
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
              }
            }
            mediaRecorder = new MediaRecorder(stream, { mimeType });
            
            recordedChunks = [];
            mediaRecorder.ondataavailable = e => {
              if (e.data.size > 0) {
                recordedChunks.push(e.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const blob = new Blob(recordedChunks, { type: mimeType });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
              link.download = \`animacao_3d.\${ext}\`;
              link.click();
              URL.revokeObjectURL(url);
            };
            
            mediaRecorder.start();
            isRecording = true;
            document.getElementById('btn-record-video').innerHTML = '⏹ Parar Gravação';
            document.getElementById('btn-record-video').style.background = '#e63946';
            document.getElementById('btn-record-video').style.borderColor = '#e63946';
          } catch (e) {
            console.error(e);
            alert('Gravação de tela não suportada no seu navegador.');
          }
        } else {
          mediaRecorder.stop();
          isRecording = false;
          document.getElementById('btn-record-video').innerHTML = '🔴 Gravar Tela (MP4/WEBM)';
          document.getElementById('btn-record-video').style.background = '';
          document.getElementById('btn-record-video').style.borderColor = '';
        }
      });

      // GIF Export
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

        try {
          const workerRes = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
          const workerText = await workerRes.text();
          const workerBlob = new Blob([workerText], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(workerBlob);

          const gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: workerUrl,
            transparent: 0x000000
          });

          // temporarily make background transparent
          const prevBg = scene.background;
          scene.background = null;

          const totalFrames = Math.max(10, Math.floor((Math.PI * 2) / (state.rotSpeed || 0.012)));
          const fps = 30;
          const stepTime = 1000 / fps;

          const prevAuto = state.rotate;
          state.rotate = false;
          
          const width = renderer.domElement.width;
          const height = renderer.domElement.height;
          
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = width;
          tmpCanvas.height = height;
          const tmpCtx = tmpCanvas.getContext('2d');

          let currentRotation = modelGroup.rotation.y;
          
          for (let i = 0; i < totalFrames; i++) {
            modelGroup.rotation.y = currentRotation + (i * (state.rotSpeed || 0.012));
            renderer.render(scene, camera);
            
            tmpCtx.clearRect(0, 0, width, height);
            tmpCtx.drawImage(renderer.domElement, 0, 0);
            
            gif.addFrame(tmpCtx, { delay: stepTime, copy: true });
          }

          modelGroup.rotation.y = currentRotation;
          state.rotate = prevAuto;
          scene.background = prevBg;

          gif.on('finished', function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'animacao_loop.gif';
            link.click();
            URL.revokeObjectURL(url);
            
            btn.innerHTML = originalText;
            btn.disabled = false;
          });

          gif.render();

        } catch (e) {
          console.error(e);
          alert('Erro ao gerar GIF.');
          btn.innerHTML = originalText;
          btn.disabled = false;
          scene.background = prevBg;
        }
      });
`;

html = html.replace('const clock = new THREE.Clock();', injectionCode + '\n    const clock = new THREE.Clock();');
fs.writeFileSync('public/3d-studio.html', html);
