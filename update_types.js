import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  "  threshold: number; // 0 (off) to 255",
  "  threshold: number; // 0 (off) to 255\n  thresholdNoise: number; // 0 to 100"
);
content = content.replace(
  "  threshold: 0,",
  "  threshold: 0,\n  thresholdNoise: 0,"
);
fs.writeFileSync('src/types.ts', content);
