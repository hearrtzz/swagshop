import fs from 'fs';

// Fix webglProcessing.ts
let webgl = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');
webgl = webgl.replace(
  "const lut = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight, state.duoMidtone);",
  "const lut = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight, state.duoMidtone, state.customGradientStops);"
);
fs.writeFileSync('src/utils/webglProcessing.ts', webgl);

// Fix imageProcessing.ts (for the 2D canvas fallback)
let imgProc = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');
imgProc = imgProc.replace(
  "const gradientLUT = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight, state.duoMidtone);",
  "const gradientLUT = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight, state.duoMidtone, state.customGradientStops);"
);
fs.writeFileSync('src/utils/imageProcessing.ts', imgProc);
