import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const oldFunc = `export function applyHalftoneLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean
) {
  if (state.halftone <= 0) return;
  const ctx = pipeline.ctx;
  const step = Math.max(3, state.halftone);

  const sampleW = Math.ceil(targetW / step);
  const sampleH = Math.ceil(targetH / step);

  const temp = document.createElement('canvas');
  temp.width = sampleW;
  temp.height = sampleH;
  const tctx = temp.getContext('2d');
  if (!tctx) return;

  // Draw image scaled down to average the pixels perfectly for each block
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'medium';
  tctx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);
  
  const halfImgData = tctx.getImageData(0, 0, sampleW, sampleH).data;

  ctx.clearRect(0, 0, targetW, targetH);
  if (!hasTransparency) {
    ctx.fillStyle = state.halftoneMode === 'bw' ? '#ffffff' : '#090a0d';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const idx = (y * sampleW + x) * 4;
      if (halfImgData[idx + 3] < 10) continue;

      const r = halfImgData[idx];
      const g = halfImgData[idx + 1];
      const b = halfImgData[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

      const radius = (step * 0.5) * Math.sqrt(Math.max(0.0, 1.0 - lum)) * 1.35;
      if (radius > 0.4) {
        ctx.fillStyle = state.halftoneMode === 'bw' ? '#111116' : \`rgb(\${r},\${g},\${b})\`;
        ctx.beginPath();
        ctx.arc(x * step + step * 0.5, y * step + step * 0.5, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}`;

const newFunc = `export function applyHalftoneLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean
) {
  if (state.halftone <= 0) return;
  
  pipeline.sync();
  
  const ctx = pipeline.ctx;
  const step = Math.max(3, state.halftone);

  const sampleW = Math.ceil(targetW / step);
  const sampleH = Math.ceil(targetH / step);

  const temp = document.createElement('canvas');
  temp.width = sampleW;
  temp.height = sampleH;
  const tctx = temp.getContext('2d');
  if (!tctx) return;

  // Draw image scaled down to average the pixels perfectly for each block
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'medium';
  tctx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);
  
  const halfImgData = tctx.getImageData(0, 0, sampleW, sampleH).data;

  if (state.halftoneMode !== 'overlay') {
    ctx.clearRect(0, 0, targetW, targetH);
    if (!hasTransparency) {
      ctx.fillStyle = state.halftoneMode === 'bw' ? '#ffffff' : '#090a0d';
      ctx.fillRect(0, 0, targetW, targetH);
    }
  } else {
    // If overlay, we might want to just draw black dots over the original image
    ctx.fillStyle = '#111116'; 
  }

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const idx = (y * sampleW + x) * 4;
      if (halfImgData[idx + 3] < 10) continue;

      const r = halfImgData[idx];
      const g = halfImgData[idx + 1];
      const b = halfImgData[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

      const radius = (step * 0.5) * Math.sqrt(Math.max(0.0, 1.0 - lum)) * 1.35;
      if (radius > 0.4) {
        if (state.halftoneMode !== 'overlay') {
           ctx.fillStyle = state.halftoneMode === 'bw' ? '#111116' : \`rgb(\${r},\${g},\${b})\`;
        } else {
           ctx.fillStyle = '#0b0c10';
        }
        ctx.beginPath();
        ctx.arc(x * step + step * 0.5, y * step + step * 0.5, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}`;

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc);
  fs.writeFileSync('src/utils/imageProcessing.ts', content);
  console.log("Successfully updated applyHalftoneLayer!");
} else {
  console.log("Failed to match applyHalftoneLayer.");
}
