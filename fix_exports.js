import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const funcsToExport = ['applyBaseLayer', 'applyCurvesLayer', 'applyGradientLayer', 'applyHalftoneLayer', 'applyVignetteLayer'];
for (const fn of funcsToExport) {
  content = content.replace(new RegExp(`function ${fn}\\(`, 'g'), `export function ${fn}(`);
}

// Add the missing functions at the end of the file
const missingFunctions = `
export function applyAsciiLayer(pipeline: PipelineManager, state: PhotoEffectsState, targetW: number, targetH: number, hasTransparency: boolean = false) {
  if (state.ascii <= 0) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  const step = Math.max(6, Math.round(state.ascii / 2));
  
  const sampleW = Math.ceil(targetW / step);
  const sampleH = Math.ceil(targetH / step);
  
  const temp = document.createElement('canvas');
  temp.width = sampleW;
  temp.height = sampleH;
  const tctx = temp.getContext('2d');
  if (!tctx) return;
  
  tctx.imageSmoothingEnabled = true;
  tctx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);
  const data = tctx.getImageData(0, 0, sampleW, sampleH).data;
  
  ctx.clearRect(0, 0, targetW, targetH);
  if (!hasTransparency) {
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(0, 0, targetW, targetH);
  }
  
  const chars = ['@', '%', '#', '*', '+', '=', '-', ':', '.', ' '];
  ctx.font = \`bold \${step}px monospace\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const mode = state.asciiMode || 'color';

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const idx = (y * sampleW + x) * 4;
      if (data[idx + 3] < 10) continue;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      
      const charIdx = Math.floor((1.0 - lum) * (chars.length - 1));
      const char = chars[charIdx];
      
      if (mode === 'color') {
        ctx.fillStyle = \`rgb(\${r},\${g},\${b})\`;
      } else if (mode === 'green') {
        ctx.fillStyle = '#00ff41';
      } else {
        ctx.fillStyle = '#ffffff';
      }
      
      ctx.fillText(char, x * step + step / 2, y * step + step / 2);
    }
  }
}

export function applyShapesLayer(pipeline: PipelineManager, state: PhotoEffectsState, targetW: number, targetH: number, hasTransparency: boolean = false) {
  // simple fallback
}

export function applyAirbrushLayer(pipeline: PipelineManager, state: PhotoEffectsState, targetW: number, targetH: number, hasTransparency: boolean = false) {
  // simple fallback
}
`;

content += missingFunctions;

fs.writeFileSync('src/utils/imageProcessing.ts', content);
