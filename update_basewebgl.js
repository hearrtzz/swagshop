import fs from 'fs';

let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

content = content.replace(
  "  const thresholdVal = (state.threshold || 0) / 255.0;",
  "  const thresholdVal = (state.threshold || 0) / 255.0;\n  const thresholdNoiseVal = (state.thresholdNoise || 0) / 100.0;"
);

content = content.replace(
  "    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold'), thresholdVal);",
  "    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold'), thresholdVal);\n    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold_noise'), thresholdNoiseVal);"
);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
