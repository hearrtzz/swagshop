import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const regexToReplace = /case 'xbox_orange':[\s\S]*?case 'matrix_emerald':\s*stops = \[\s*\{\s*p: 0\.0,\s*c: \[3,\s*10,\s*5\]\s*\},\s*\{\s*p: 0\.5,\s*c: \[10,\s*110,\s*40\]\s*\},\s*\{\s*p: 0\.85,\s*c: \[50,\s*240,\s*100\]\s*\},\s*\{\s*p: 1\.0,\s*c: \[220,\s*255,\s*230\]\s*\}\s*\];\s*break;/;

content = content.replace(regexToReplace, "");

fs.writeFileSync('src/utils/imageProcessing.ts', content);
