import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace("  'noise',\n  'texture',\n  'vignette',", "  'noise',\n  'vignette',");
fs.writeFileSync('src/types.ts', content);
