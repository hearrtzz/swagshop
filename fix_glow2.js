import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const regexToFind = /export function applyGlowLayer\([\s\S]*?ctx\.restore\(\);\s*\}/;

const toReplace = `export function applyGlowLayer(
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
  const lumThreshold = state.glowThreshold !== undefined ? Math.round(state.glowThreshold * 2.55) : 40; 
  
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

  const radiusScale = (state.glowRadius !== undefined ? state.glowRadius : 25) / 25.0;
  const blurTight = Math.max(2, Math.round(Math.min(targetW, targetH) * 0.018 * radiusScale));
  const blurWide = Math.max(6, Math.round(Math.min(targetW, targetH) * 0.065 * radiusScale));

  const bloomCanvas = document.createElement('canvas');
  bloomCanvas.width = targetW;
  bloomCanvas.height = targetH;
  const bctx = bloomCanvas.getContext('2d');
  if (!bctx) return;

  bctx.filter = \`blur(\${blurWide}px)\`;
  bctx.globalAlpha = 0.8;
  bctx.drawImage(highCanvas, 0, 0);

  bctx.filter = \`blur(\${blurTight}px)\`;
  bctx.globalAlpha = 1.0;
  bctx.drawImage(highCanvas, 0, 0);

  ctx.save();
  // 'screen' works well, but 'lighter' can sometimes be better for colors on transparent backgrounds
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = Math.min(1.0, intensity * 1.5);
  ctx.drawImage(bloomCanvas, 0, 0);
  ctx.restore();
}`;

if (regexToFind.test(content)) {
  content = content.replace(regexToFind, toReplace);
  fs.writeFileSync('src/utils/imageProcessing.ts', content);
  console.log("Successfully updated applyGlowLayer!");
} else {
  console.log("Failed to match applyGlowLayer regex.");
}
