const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const oldStr = `          const width = Math.round(renderer.domElement.width);
          const height = Math.round(renderer.domElement.height);
          const gif = new GIF({
            workers: 2,
            quality: 10,
            width: width,
            height: height,
            workerScript: workerUrl,
            transparent: 0x000000
          });

          // temporarily make background transparent
          scene.background = null;

          const totalFrames = Math.max(10, Math.floor((Math.PI * 2) / (state.rotSpeed || 0.012)));
          const fps = 30;
          const stepTime = 1000 / fps;

          const prevAuto = state.rotate;
          state.rotate = false;
          
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

          gif.render();`;

const newStr = `          const maxGifDim = 600;
          let gifW = renderer.domElement.width;
          let gifH = renderer.domElement.height;
          
          if (gifW > maxGifDim || gifH > maxGifDim) {
             const ratio = Math.min(maxGifDim / gifW, maxGifDim / gifH);
             gifW = Math.round(gifW * ratio);
             gifH = Math.round(gifH * ratio);
          } else {
             gifW = Math.round(gifW);
             gifH = Math.round(gifH);
          }

          const gif = new GIF({
            workers: 4,
            quality: 10,
            width: gifW,
            height: gifH,
            workerScript: workerUrl,
            transparent: 0x000000
          });

          gif.on('progress', p => {
            btn.innerHTML = '⏳ Renderizando: ' + Math.round(p * 100) + '%';
          });

          // temporarily make background transparent
          scene.background = null;

          const totalFrames = 60; // Fixed frames for smooth and fast generation
          const rotationStep = (Math.PI * 2) / totalFrames;
          const fps = 30;
          const stepTime = 1000 / fps;

          const prevAuto = state.rotate;
          state.rotate = false;
          
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = gifW;
          tmpCanvas.height = gifH;
          const tmpCtx = tmpCanvas.getContext('2d');

          let currentRotation = modelGroup.rotation.y;
          
          for (let i = 0; i < totalFrames; i++) {
            modelGroup.rotation.y = currentRotation + (i * rotationStep);
            renderer.render(scene, camera);
            
            tmpCtx.clearRect(0, 0, gifW, gifH);
            tmpCtx.drawImage(renderer.domElement, 0, 0, gifW, gifH);
            
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

          gif.render();`;

html = html.replace(oldStr, newStr);
fs.writeFileSync('public/3d-studio.html', html);
