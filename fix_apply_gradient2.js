import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const oldFunc = `export function applyGradientLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.gradientMode === 'none') return;
  const gradientLUT = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight);
  if (!gradientLUT) return;

  const imgData = pipeline.getPixels();
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const lum = Math.max(0, Math.min(255, Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])));
    d[i] = gradientLUT[lum * 3];
    d[i + 1] = gradientLUT[lum * 3 + 1];
    d[i + 2] = gradientLUT[lum * 3 + 2];
  }
}`;

const newFunc = `export function applyGradientLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.gradientMode === 'none') return;
  const gradientLUT = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight, state.duoMidtone, state.customGradientStops);
  if (!gradientLUT) return;

  const imgData = pipeline.getPixels();
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const lum = Math.max(0, Math.min(255, Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])));
    d[i] = gradientLUT[lum * 3];
    d[i + 1] = gradientLUT[lum * 3 + 1];
    d[i + 2] = gradientLUT[lum * 3 + 2];
  }
}`;

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc);
  fs.writeFileSync('src/utils/imageProcessing.ts', content);
  console.log("Successfully updated applyGradientLayer!");
} else {
  console.log("Failed to match applyGradientLayer.");
}
