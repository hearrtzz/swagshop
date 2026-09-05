import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

content = content.replace(
  "if (state.dustScratches > 0 || state.lightLeak > 0) {",
  "if (state.dustScratches > 0 || state.lightLeak !== 'none') {"
);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
