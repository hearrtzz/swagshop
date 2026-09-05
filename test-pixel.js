import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');
content = content.replace(
  "  pipeline.loadSource(source);",
  `  let effectiveSource: HTMLImageElement | HTMLCanvasElement = source;
  if (state.pixel > 1) {
    const pw = Math.max(1, Math.floor(targetW / state.pixel));
    const ph = Math.max(1, Math.floor(targetH / state.pixel));
    const pcan = document.createElement('canvas');
    pcan.width = pw;
    pcan.height = ph;
    const pctx = pcan.getContext('2d');
    if (pctx) {
      pctx.drawImage(source, 0, 0, pw, ph);
      const scaledCan = document.createElement('canvas');
      scaledCan.width = targetW;
      scaledCan.height = targetH;
      const sctx = scaledCan.getContext('2d');
      if (sctx) {
        sctx.imageSmoothingEnabled = false;
        sctx.drawImage(pcan, 0, 0, targetW, targetH);
        effectiveSource = scaledCan;
      }
    }
  }
  pipeline.loadSource(effectiveSource);`
);
fs.writeFileSync('src/utils/webglProcessing.ts', content);
