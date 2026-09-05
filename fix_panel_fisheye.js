import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

// import icon: maybe Focus or Aperture? Let's use Camera for now. We have Aperture? Let's check imports.
// It imports Camera, Activity, Maximize, Minimize, Crosshair...

// Add isFisheyeActive
content = content.replace(
  /const isNoiseActive = state\.noise > 0;/,
  "const isNoiseActive = state.noise > 0;\n          const isFisheyeActive = state.lensDistort !== 0;"
);

// Add to activeCount
content = content.replace(
  /isNoiseActive,/,
  "isNoiseActive,\n            isFisheyeActive,"
);

// Add toggleFisheye
content = content.replace(
  /const toggleNoise = \(\) => \{[\s\S]*?\};/,
  `const toggleNoise = () => {
            if (state.noise > 0) {
              cacheRef.current.noise = state.noise;
              updateState('noise', 0);
            } else {
              updateState('noise', cacheRef.current.noise || 30);
            }
          };

          const toggleFisheye = () => {
            if (state.lensDistort !== 0) {
              cacheRef.current.lensDistort = state.lensDistort;
              updateState('lensDistort', 0);
            } else {
              updateState('lensDistort', cacheRef.current.lensDistort || 30);
            }
          };`
);

// Add to layerDetails dictionary
content = content.replace(
  /noise: \{/,
  `fisheye: {
              label: 'Lente Fisheye',
              sublabel: 'Distorção óptica (Olho de Peixe)',
              icon: Camera,
              iconColor: 'text-[#ff3b30]',
              isActive: isFisheyeActive,
              valueText: isFisheyeActive ? \`Distorção: \${state.lensDistort}\` : 'Inativo',
              onToggle: toggleFisheye,
              onGo: () => setActiveTab('fx'),
            },
            noise: {`
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
