import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

content = content.replace(
  /import \{ baseColorShader, lutColorShader, gradientMapShader, noiseShader, halftoneShader, vignetteShader, glitchShader, datamoshShader, thresholdShader \} from '.\/webgl\/shaders';/,
  "import { baseColorShader, lutColorShader, gradientMapShader, noiseShader, halftoneShader, vignetteShader, glitchShader, datamoshShader, thresholdShader, fisheyeShader } from './webgl/shaders';"
);

// fix the previous fallback
content = content.replace(
  /case 'fisheye':\n        pipeline\.finalize\(\);\n        applyFisheyeLayer\(new PipelineManager\(pipeline\.canvas\.getContext\('2d'\)!, targetW, targetH\), state, targetW, targetH, hasTransparency\);\n        break;/,
  "case 'fisheye': applyFisheyeLayerWebGL(pipeline, state); break;"
);

const newFunc = `
function applyFisheyeLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.lensDistort === 0) return;
  const distStrength = state.lensDistort / 100.0;
  pipeline.applyPass(fisheyeShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_distStrength'), distStrength);
  });
}
`;
content += newFunc;

fs.writeFileSync('src/utils/webglProcessing.ts', content);
