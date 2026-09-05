import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  /\| 'noise'/,
  "| 'noise'\n  | 'fisheye'"
);

content = content.replace(
  /'noise',\n  'vignette',/,
  "'noise',\n  'fisheye',\n  'vignette',"
);

fs.writeFileSync('src/types.ts', content);
