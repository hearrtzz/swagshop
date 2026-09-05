import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  "const layerConfigs: Record<EffectLayerId, {",
  "const layerConfigs: Partial<Record<EffectLayerId, {"
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
