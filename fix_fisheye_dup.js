import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

content = content.replace(
  /case 'fisheye': applyFisheyeLayer\(cpuPipeline, state, targetW, targetH, hasTransparency\); break;\n\s*case 'fisheye': applyFisheyeLayer\(cpuPipeline, state, targetW, targetH, hasTransparency\); break;/,
  "case 'fisheye': applyFisheyeLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;"
);

content = content.replace(
  /case 'fisheye': applyFisheyeLayer\(cpuPipeline, state, targetW, targetH, hasTransparency\); break;\n\s*case 'glitch': applyGlitchLayer\(cpuPipeline, state, targetW, targetH, hasTransparency\); break;\n\s*case 'glitch': applyGlitchLayer\(cpuPipeline, state, targetW, targetH, hasTransparency\); break;/,
  "case 'fisheye': applyFisheyeLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;\n        case 'glitch': applyGlitchLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;"
);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
