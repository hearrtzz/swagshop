const fs = require('fs');
let code = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

code = code.replace(
  "applyAsciiLayer, applyNoiseLayer,",
  "applyAsciiLayer, applyAsciiTextLayer, applyNoiseLayer,"
);

code = code.replace(
  "case 'ascii': applyAsciiLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;",
  "case 'ascii': applyAsciiLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;\n        case 'asciiText': applyAsciiTextLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;"
);

code = code.replace(
  "case 'ascii': applyAsciiLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;",
  "case 'ascii': applyAsciiLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;\n            case 'asciiText': applyAsciiTextLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;"
);

fs.writeFileSync('src/utils/webglProcessing.ts', code);
console.log('Updated webglProcessing.ts');
