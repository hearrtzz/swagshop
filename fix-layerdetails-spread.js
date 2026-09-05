import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  "...layerDetails[id],",
  "...(layerDetails[id] || { label: id, sublabel: '', icon: Layers, iconColor: 'text-white', isActive: false, valueText: '', onToggle: () => {}, onGo: () => {} }),"
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
