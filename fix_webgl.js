import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

// import thresholdShader
content = content.replace(
  /import \{ baseColorShader, lutColorShader, gradientMapShader, noiseShader, halftoneShader, vignetteShader, glitchShader, datamoshShader \} from '.\/webgl\/shaders';/,
  "import { baseColorShader, lutColorShader, gradientMapShader, noiseShader, halftoneShader, vignetteShader, glitchShader, datamoshShader, thresholdShader } from './webgl/shaders';"
);

// import applyThresholdLayer
content = content.replace(
  /import \{ applyBaseLayer, applyCurvesLayer, applyGradientLayer/,
  "import { applyBaseLayer, applyThresholdLayer, applyCurvesLayer, applyGradientLayer"
);

// add to switch (CPU)
content = content.replace(
  /case 'base': applyBaseLayer\(cpuPipeline, state, targetW, targetH\); break;/,
  "case 'base': applyBaseLayer(cpuPipeline, state, targetW, targetH); break;\n        case 'threshold': applyThresholdLayer(cpuPipeline, state, targetW, targetH); break;"
);

// add to switch (CPU fallback)
content = content.replace(
  /case 'base': applyBaseLayer\(cpuPipeline, state, targetW, targetH\); break;/g,
  "case 'base': applyBaseLayer(cpuPipeline, state, targetW, targetH); break;\n            case 'threshold': applyThresholdLayer(cpuPipeline, state, targetW, targetH); break;"
);

// add to switch (WebGL)
content = content.replace(
  /case 'base': applyBaseLayerWebGL\(pipeline, state\); break;/,
  "case 'base': applyBaseLayerWebGL(pipeline, state); break;\n      case 'threshold': applyThresholdLayerWebGL(pipeline, state); break;"
);

// patch applyBaseLayerWebGL
content = content.replace(
  /const thresholdVal = \(state\.threshold \|\| 0\) \/ 255\.0;/,
  "const thresholdVal = 0.0;"
);
content = content.replace(
  /const thresholdNoiseVal = \(state\.thresholdNoise \|\| 0\) \/ 100\.0;/,
  "const thresholdNoiseVal = 0.0;"
);
// wait, the above replaces all occurrences of `thresholdVal` definition in applyBaseLayerWebGL.

// add applyThresholdLayerWebGL
const newFunc = `
function applyThresholdLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.threshold === 0) return;
  
  const thresholdVal = (state.threshold || 0) / 255.0;
  const thresholdNoiseVal = (state.thresholdNoise || 0) / 100.0;
  
  pipeline.applyPass(thresholdShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold'), thresholdVal);
    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold_noise'), thresholdNoiseVal);
  });
}
`;
content += newFunc;

fs.writeFileSync('src/utils/webglProcessing.ts', content);
