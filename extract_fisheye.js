import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const glitchLayerRe = /export function applyGlitchLayer\(\s*pipeline: PipelineManager,\s*state: PhotoEffectsState,\s*targetW: number,\s*targetH: number,\s*hasTransparency: boolean\s*\) \{\s*pipeline\.sync\(\);\s*const ctx = pipeline\.ctx;\s*\/\/ Fisheye Lens Distortion[\s\S]*?(?=\/\/ Chromatic Aberration)/;

const glitchReplacement = "export function applyGlitchLayer(\n" +
"  pipeline: PipelineManager,\n" +
"  state: PhotoEffectsState,\n" +
"  targetW: number,\n" +
"  targetH: number,\n" +
"  hasTransparency: boolean\n" +
") {\n" +
"  pipeline.sync();\n" +
"  const ctx = pipeline.ctx;\n  ";
  
content = content.replace(glitchLayerRe, glitchReplacement);

const fisheyeLayer = "\n\n" +
"// Fisheye Lens Distortion Layer\n" +
"export function applyFisheyeLayer(\n" +
"  pipeline: PipelineManager,\n" +
"  state: PhotoEffectsState,\n" +
"  targetW: number,\n" +
"  targetH: number,\n" +
"  hasTransparency: boolean\n" +
") {\n" +
"  if (state.lensDistort === 0) return;\n" +
"  pipeline.sync();\n" +
"  const ctx = pipeline.ctx;\n" +
"  const distStrength = state.lensDistort / 100.0;\n" +
"  const srcImgData = ctx.getImageData(0, 0, targetW, targetH);\n" +
"  const srcData = srcImgData.data;\n" +
"  const outImgData = ctx.createImageData(targetW, targetH);\n" +
"  const outData = outImgData.data;\n" +
"  const halfW = targetW / 2;\n" +
"  const halfH = targetH / 2;\n" +
"  for (let y = 0; y < targetH; y++) {\n" +
"    const dy = (y - halfH) / halfH;\n" +
"    for (let x = 0; x < targetW; x++) {\n" +
"      const dx = (x - halfW) / halfW;\n" +
"      const r = Math.hypot(dx, dy);\n" +
"      let factor = 1.0;\n" +
"      if (distStrength > 0) {\n" +
"        factor = 1.0 + distStrength * (r * r);\n" +
"      } else {\n" +
"        factor = 1.0 / (1.0 - distStrength * (r * r));\n" +
"      }\n" +
"      const srcX = Math.round(halfW + dx * factor * halfW);\n" +
"      const srcY = Math.round(halfH + dy * factor * halfH);\n" +
"      const outIdx = (y * targetW + x) * 4;\n" +
"      if (srcX >= 0 && srcX < targetW && srcY >= 0 && srcY < targetH) {\n" +
"        const srcIdx = (srcY * targetW + srcX) * 4;\n" +
"        outData[outIdx] = srcData[srcIdx];\n" +
"        outData[outIdx + 1] = srcData[srcIdx + 1];\n" +
"        outData[outIdx + 2] = srcData[srcIdx + 2];\n" +
"        outData[outIdx + 3] = srcData[srcIdx + 3];\n" +
"      } else {\n" +
"        outData[outIdx] = 0;\n" +
"        outData[outIdx + 1] = 0;\n" +
"        outData[outIdx + 2] = 0;\n" +
"        outData[outIdx + 3] = 0;\n" +
"      }\n" +
"    }\n" +
"  }\n" +
"  ctx.putImageData(outImgData, 0, 0);\n" +
"}\n";

content += fisheyeLayer;
fs.writeFileSync('src/utils/imageProcessing.ts', content);
