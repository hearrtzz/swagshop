const fs = require('fs');
let code = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

// Add call in CPU mode pipeline
code = code.replace(
  "case 'ascii':\n        applyAsciiLayer(pipeline, state, targetW, targetH, hasTransparency);\n        break;",
  "case 'ascii':\n        applyAsciiLayer(pipeline, state, targetW, targetH, hasTransparency);\n        break;\n      case 'asciiText':\n        applyAsciiTextLayer(pipeline, state, targetW, targetH, hasTransparency);\n        break;"
);

// Add the implementation of applyAsciiTextLayer
const asciiTextLayerFunc = `
export function applyAsciiTextLayer(pipeline: PipelineManager, state: PhotoEffectsState, targetW: number, targetH: number, hasTransparency: boolean = false) {
  if (state.asciiText <= 0) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  
  // Resolution scaling based on slider: 100% is fine details (smaller text), 1% is big text
  // slider is 0 to 100
  const sliderScale = Math.max(1, state.asciiText); // 1 to 100
  // text size ranges from roughly 8px to 48px
  const fontSize = Math.max(8, Math.round(48 - (sliderScale / 100) * 40));
  const stepX = fontSize * 0.6; // character width approx
  const stepY = fontSize;
  
  const sampleW = Math.ceil(targetW / stepX);
  const sampleH = Math.ceil(targetH / stepY);
  
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
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, targetW, targetH);
  }
  
  const textString = state.asciiTextString || 'Hello World. ';
  let charIndex = 0;
  
  ctx.font = \`bold \${fontSize}px monospace\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const idx = (y * sampleW + x) * 4;
      if (data[idx + 3] < 10) {
        charIndex = (charIndex + 1) % textString.length;
        continue;
      }
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const char = textString[charIndex];
      charIndex = (charIndex + 1) % textString.length;
      
      ctx.fillStyle = \`rgb(\${r},\${g},\${b})\`;
      ctx.fillText(char, x * stepX + stepX/2, y * stepY + stepY/2);
    }
  }
}
`;

code = code.replace(
  "export function applyAsciiLayer",
  asciiTextLayerFunc + "\nexport function applyAsciiLayer"
);

fs.writeFileSync('src/utils/imageProcessing.ts', code);
console.log('Added applyAsciiTextLayer');
