import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

// import applyFisheyeLayer
content = content.replace(
  /applyVignetteLayer, applyGlitchLayer/,
  "applyVignetteLayer, applyFisheyeLayer, applyGlitchLayer"
);

// add to switch (CPU)
content = content.replace(
  /case 'glitch': applyGlitchLayer\(cpuPipeline, state, targetW, targetH, hasTransparency\); break;/,
  "case 'fisheye': applyFisheyeLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;\n        case 'glitch': applyGlitchLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;"
);

// add to switch (CPU fallback)
content = content.replace(
  /case 'glitch': applyGlitchLayer\(cpuPipeline, state, targetW, targetH, hasTransparency\); break;/g,
  "case 'fisheye': applyFisheyeLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;\n            case 'glitch': applyGlitchLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;"
);

// add to switch (WebGL fallback to CPU if needed, wait does WebGL have fisheye shader? No, fallback to CPU)
content = content.replace(
  /case 'glitch': applyGlitchLayerWebGL\(pipeline, state\); break;/,
  "case 'fisheye':\n        pipeline.finalize();\n        applyFisheyeLayer(new PipelineManager(pipeline.canvas.getContext('2d')!, targetW, targetH), state, targetW, targetH, hasTransparency);\n        break;\n      case 'glitch': applyGlitchLayerWebGL(pipeline, state); break;"
);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
