const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const targetStr = `          if (state.c2dJitter) {
            const jx = (Math.random() - 0.5) * 1.5;
            const jy = (Math.random() - 0.5) * 1.5;
            const jrot = (Math.random() - 0.5) * 0.35 * Math.PI / 180;
            recordCtx.translate(recordCanvas.width/2 + jx, recordCanvas.height/2 + jy);
            recordCtx.rotate(jrot);
            recordCtx.translate(-recordCanvas.width/2, -recordCanvas.height/2);
            recordCtx.filter = 'url(#cartoon-boil)';
          }`;

const newStr = `          if (state.c2dJitter) {
            const jx = state.c2dCurrentJx || 0;
            const jy = state.c2dCurrentJy || 0;
            const jrot = (state.c2dCurrentJrot || 0) * Math.PI / 180;
            recordCtx.translate(recordCanvas.width/2 + jx, recordCanvas.height/2 + jy);
            recordCtx.rotate(jrot);
            recordCtx.translate(-recordCanvas.width/2, -recordCanvas.height/2);
            recordCtx.filter = 'url(#cartoon-boil)';
          }`;

if (html.includes(targetStr)) {
  html = html.replace(targetStr, newStr);
  fs.writeFileSync('public/3d-studio.html', html);
  console.log("Video proxy jitter sync applied");
} else {
  console.log("Video proxy jitter target not found");
}
