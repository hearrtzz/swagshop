import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  "const isTextureActive = state.dustScratches > 0 || state.lightLeak > 0;",
  "const isTextureActive = state.dustScratches > 0 || state.lightLeak !== 'none';"
);

content = content.replace(
  "if (state.dustScratches > 0 || state.lightLeak > 0) {",
  "if (state.dustScratches > 0 || state.lightLeak !== 'none') {"
);

content = content.replace(
  "if (state.lightLeak > 0) cacheRef.current.lightLeak = state.lightLeak;",
  "if (state.lightLeak !== 'none') cacheRef.current.lightLeak = state.lightLeak;"
);

content = content.replace(
  "onChange(prev => ({ ...prev, dustScratches: 0, lightLeak: 0 }));",
  "onChange(prev => ({ ...prev, dustScratches: 0, lightLeak: 'none' }));"
);

content = content.replace(
  "lightLeak: cacheRef.current.lightLeak || 25,",
  "lightLeak: cacheRef.current.lightLeak || 'golden',"
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
