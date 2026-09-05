import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const oldFunc = `export function applyGlowLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.glow <= 0) return;
  const ctx = pipeline.ctx;
  const intensity = state.glow / 100.0;

  const highCanvas = document.createElement('canvas');
  highCanvas.width = targetW;
  highCanvas.height = targetH;
  const hctx = highCanvas.getContext('2d');
  if (!hctx) return;

  hctx.drawImage(ctx.canvas, 0, 0);
  const hData = hctx.getImageData(0, 0, targetW, targetH);
  const hd = hData.data;

  // Lowered luminance threshold so colors bloom better
  const lumThreshold = 40; 
  
  for (let i = 0; i < hd.length; i += 4) {
    const a = hd[i + 3];
    if (a === 0) continue;
    
    // Calculate relative luminance
    const lum = 0.299 * hd[i] + 0.587 * hd[i + 1] + 0.114 * hd[i + 2];
    
    if (lum < lumThreshold) {
      hd[i + 3] = 0; // Don't bloom very dark areas
    } else {
      const factor = Math.min(1.0, (lum - lumThreshold) / (255 - lumThreshold));
      hd[i] = Math.min(255, hd[i] * 1.2);
      hd[i + 1] = Math.min(255, hd[i + 1] * 1.2);
      hd[i + 2] = Math.min(255, hd[i + 2] * 1.2);
      hd[i + 3] = Math.round(a * factor);
    }
  }

  hctx.putImageData(hData, 0, 0);

  // Apply heavy blur
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = targetW;
  blurCanvas.height = targetH;
  const bctx = blurCanvas.getContext('2d');
  if (bctx) {
    bctx.filter = \`blur(25px)\`;
    bctx.drawImage(highCanvas, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = intensity;
    ctx.drawImage(blurCanvas, 0, 0);
    ctx.restore();
  }
}`;

const newFunc = `export function applyGlowLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.glow <= 0) return;
  const ctx = pipeline.ctx;
  const intensity = state.glow / 100.0;

  const highCanvas = document.createElement('canvas');
  highCanvas.width = targetW;
  highCanvas.height = targetH;
  const hctx = highCanvas.getContext('2d');
  if (!hctx) return;

  hctx.drawImage(ctx.canvas, 0, 0);
  const hData = hctx.getImageData(0, 0, targetW, targetH);
  const hd = hData.data;

  // Use state glowThreshold or default 40
  const lumThreshold = (state.glowThreshold !== undefined ? state.glowThreshold : 15) * 2.55; 
  
  for (let i = 0; i < hd.length; i += 4) {
    const a = hd[i + 3];
    if (a === 0) continue;
    
    // Calculate relative luminance
    const lum = 0.299 * hd[i] + 0.587 * hd[i + 1] + 0.114 * hd[i + 2];
    
    if (lum < lumThreshold) {
      hd[i + 3] = 0; // Don't bloom very dark areas
    } else {
      const factor = lumThreshold < 255 ? Math.min(1.0, (lum - lumThreshold) / (255 - lumThreshold)) : 1.0;
      hd[i] = Math.min(255, hd[i] * 1.2);
      hd[i + 1] = Math.min(255, hd[i + 1] * 1.2);
      hd[i + 2] = Math.min(255, hd[i + 2] * 1.2);
      hd[i + 3] = Math.round(a * factor);
    }
  }

  hctx.putImageData(hData, 0, 0);

  // Apply heavy blur
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = targetW;
  blurCanvas.height = targetH;
  const bctx = blurCanvas.getContext('2d');
  if (bctx) {
    const radius = state.glowRadius || 25;
    bctx.filter = \`blur(\${radius}px)\`;
    bctx.drawImage(highCanvas, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = intensity;
    ctx.drawImage(blurCanvas, 0, 0);
    ctx.restore();
  }
}`;

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc);
  fs.writeFileSync('src/utils/imageProcessing.ts', content);
  console.log("Successfully updated applyGlowLayer!");
} else {
  console.log("Failed to match applyGlowLayer.");
}
