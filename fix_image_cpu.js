import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

// replace applyBaseLayer threshold
content = content.replace(
  /if \(thresholdVal > 0\) \{\s+lum = 0\.299 \* r \+ 0\.587 \* g \+ 0\.114 \* b;\s+const bin = lum >= thresholdVal \? 255 : 0;\s+r = bin; g = bin; b = bin;\s+\}/,
  ""
);

// add applyThresholdLayer
const newFunc = `
export function applyThresholdLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.threshold === 0) return;
  const thresholdVal = state.threshold;
  const thresholdNoise = (state.thresholdNoise || 0) / 100.0;
  
  const imgData = pipeline.getPixels();
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    
    if (thresholdNoise > 0) {
       // Simple pseudo-random noise based on pixel index
       const noise = (Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
       lum += (noise - 0.5) * thresholdNoise * 255.0;
    }
    
    const bin = lum >= thresholdVal ? 255 : 0;
    d[i] = bin;
    d[i + 1] = bin;
    d[i + 2] = bin;
  }
}
`;

content += newFunc;

fs.writeFileSync('src/utils/imageProcessing.ts', content);
