import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  /\| 'glow'/,
  "| 'glow'\n  | 'threshold'"
);

content = content.replace(
  /'base',\n  'airbrush',/,
  "'base',\n  'threshold',\n  'airbrush',"
);

fs.writeFileSync('src/types.ts', content);
