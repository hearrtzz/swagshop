import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

// Add isThresholdActive
content = content.replace(
  /const isGlowActive = state\.glow > 0;/,
  "const isGlowActive = state.glow > 0;\n          const isThresholdActive = state.threshold > 0;"
);

// Add to activeCount
content = content.replace(
  /isGlowActive,/,
  "isGlowActive,\n            isThresholdActive,"
);

// Add toggleThreshold
content = content.replace(
  /const toggleGlow = \(\) => \{[\s\S]*?\};/,
  `const toggleGlow = () => {
            if (state.glow > 0) {
              cacheRef.current.glow = state.glow;
              updateState('glow', 0);
            } else {
              updateState('glow', cacheRef.current.glow || 35);
            }
          };

          const toggleThreshold = () => {
            if (state.threshold > 0) {
              cacheRef.current.threshold = state.threshold;
              updateState('threshold', 0);
            } else {
              updateState('threshold', cacheRef.current.threshold || 128);
            }
          };`
);

// Add to layerDetails dictionary
content = content.replace(
  /glow: \{/,
  `threshold: {
              label: 'Limiar (Threshold)',
              sublabel: 'Ponto de corte P&B extremo',
              icon: Contrast,
              iconColor: 'text-[#64d2ff]',
              isActive: isThresholdActive,
              valueText: isThresholdActive ? \`Nível: \${state.threshold}\` : 'Inativo',
              onToggle: toggleThreshold,
              onGo: () => setActiveTab('graphic'),
            },
            glow: {`
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
