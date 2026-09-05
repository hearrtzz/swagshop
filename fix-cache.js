import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

// Global cache object
const globalCacheInject = `
const globalEffectCache: Partial<PhotoEffectsState> = {
  vignette: 40,
  glow: 30,
  halftone: 35,
  noise: 25,
  chroma: 3,
  scanlines: 30,
  dustScratches: 30,
  lightLeak: 30,
  curveContrast: 20,
  gradientMode: 'synthwave',
  datamosh: 45,
  ascii: 50,
  shapes: 50,
  airbrush: 50,
};

export const EffectsPanel: React.FC`;

content = content.replace("export const EffectsPanel: React.FC", globalCacheInject);

content = content.replace(
`  // Cache for restoring previous values when toggling layers on/off
  const cacheRef = useRef<Partial<PhotoEffectsState>>({
    vignette: 40,
    glow: 30,
    halftone: 35,
    noise: 25,
    chroma: 3,
    scanlines: 30,
    dustScratches: 30,
    lightLeak: 30,
    curveContrast: 20,
    gradientMode: 'synthwave',
    datamosh: 45,
    ascii: 50,
    shapes: 50,
    airbrush: 50,
  });`,
  `  const cacheRef = useRef<Partial<PhotoEffectsState>>(globalEffectCache);`
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
