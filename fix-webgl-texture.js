import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

content = content.replace("case 'texture': applyTextureLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;", "");
content = content.replace("case 'texture': applyTextureLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;", "");

fs.writeFileSync('src/utils/webglProcessing.ts', content);
