import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const oldListRegex = /\{\[\s*\{\s*id:\s*'none'.*?\],\s*name:\s*'Nenhum \(Cores Naturais\)',\s*colors:\s*\['#444',\s*'#aaa'\]\s*\},\s*\{\s*id:\s*'xbox_orange'[\s\S]*?\{\s*id:\s*'custom_duo'.*?\]\s*\},\s*\]\.map\(\(g\) => \{/g;

content = content.replace(/\{\[\s*\{\s*id:\s*'none',[\s\S]*?\{\s*id:\s*'custom_duo',.*?\},\s*\]\.map\(\(g\)/,
`{[
                { id: 'none', name: 'Nenhum', colors: ['#444', '#aaa'] },
                { id: 'custom_duo', name: 'Duotone', colors: [state.duoShadow, state.duoLight] },
                { id: 'threetone', name: 'Tritone', colors: [state.duoShadow, state.duoMidtone || '#5e43a6', state.duoLight] },
                { id: 'custom_stops', name: 'Gradiente Personalizado', colors: [] },
              ].map((g)`);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
