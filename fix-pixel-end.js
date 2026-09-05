import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

// First, remove the early pixelation from loadSource:
content = content.replace(
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
  pipeline.loadSource(effectiveSource);`,
  `  pipeline.loadSource(source);`
);

// Then, add pixelation at the very end of renderProcessedImageWebGL
const endFunc = `  } else if (cpuPipeline) {
    cpuPipeline.sync();
  }
}`;

const newEndFunc = `  } else if (cpuPipeline) {
    cpuPipeline.sync();
  }

  // Global Pixelation (apply last so it affects all layers including noise/glitch)
  if (state.pixel > 1) {
    const pw = Math.max(1, Math.floor(targetW / state.pixel));
    const ph = Math.max(1, Math.floor(targetH / state.pixel));
    
    // Read from the current targetCanvas
    const pcan = document.createElement('canvas');
    pcan.width = pw;
    pcan.height = ph;
    const pctx = pcan.getContext('2d');
    if (pctx) {
      // Draw scaled down
      pctx.imageSmoothingEnabled = true;
      pctx.drawImage(targetCanvas, 0, 0, pw, ph);
      
      // Draw scaled up
      const ctx = targetCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pcan, 0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true; // restore
      }
    }
  }
}`;

content = content.replace(endFunc, newEndFunc);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
