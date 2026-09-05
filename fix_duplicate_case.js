import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

content = content.replace(
  /case 'threshold': applyThresholdLayer\(cpuPipeline, state, targetW, targetH\); break;\s*case 'threshold': applyThresholdLayer\(cpuPipeline, state, targetW, targetH\); break;/,
  "case 'threshold': applyThresholdLayer(cpuPipeline, state, targetW, targetH); break;"
);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
