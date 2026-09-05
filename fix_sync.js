import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const functionsToSync = [
  'applyGlowLayer',
  'applyDatamoshLayer',
  'applyGlitchLayer',
  'applyTextureLayer',
  'applyVignetteLayer',
  'applyTimestampLayer'
];

for (const fn of functionsToSync) {
  const regex = new RegExp("(export function " + fn + "\\b[\\s\\S]*?)(const ctx = pipeline\\.ctx;)");
  content = content.replace(regex, (match, p1, p2) => {
    if (p1.includes('pipeline.sync()')) return match; 
    return p1 + 'pipeline.sync();\n  ' + p2;
  });
}

fs.writeFileSync('src/utils/imageProcessing.ts', content);
