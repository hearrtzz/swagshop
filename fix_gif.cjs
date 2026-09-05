const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const targetStr = `            tmpCtx.clearRect(0, 0, gifW, gifH);
            tmpCtx.drawImage(sourceCanvas, 0, 0, gifW, gifH);`;

const newStr = `            tmpCtx.clearRect(0, 0, gifW, gifH);
            tmpCtx.save();
            
            if (state.mode === '2d' && state.c2dJitter) {
                const jx = (Math.random() - 0.5) * 1.5;
                const jy = (Math.random() - 0.5) * 1.5;
                const jrot = (Math.random() - 0.5) * 0.35 * Math.PI / 180;
                
                tmpCtx.translate(gifW/2 + jx, gifH/2 + jy);
                tmpCtx.rotate(jrot);
                tmpCtx.translate(-gifW/2, -gifH/2);
                
                // SVG filter for boil effect
                tmpCtx.filter = 'url(#cartoon-boil)';
            }
            
            tmpCtx.drawImage(sourceCanvas, 0, 0, gifW, gifH);
            tmpCtx.restore();`;

if (html.includes(targetStr)) {
  html = html.replace(targetStr, newStr);
  fs.writeFileSync('public/3d-studio.html', html);
  console.log("Applied GIF jitter + filter to GIF export");
} else {
  console.log("Could not find targetStr");
}
