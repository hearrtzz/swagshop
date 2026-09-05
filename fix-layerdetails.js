import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  "const layerDetails: Record<EffectLayerId, {",
  "const layerDetails: Partial<Record<EffectLayerId, {"
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
