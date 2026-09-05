import { PhotoEffectsState, DEFAULT_PHOTO_EFFECTS, EffectLayerId, DEFAULT_LAYER_ORDER } from '../types';

export function getRandomEffects(): PhotoEffectsState {
  const presets: PhotoEffectsState['preset'][] = [
    'none', 'digicam', 'y2k', 'disposable', 'cinematic_teal', 'polaroid_vintage', 'monochrome_noir'
  ];
  const leaks: PhotoEffectsState['lightLeak'][] = ['none', 'sunburst', 'prism', 'golden', 'neon'];
  const gradients: PhotoEffectsState['gradientMode'][] = [
    'none', 'none', 'custom_duo', 'threetone'
  ];
  const colors: PhotoEffectsState['timestampColor'][] = ['#ffa200', '#22c55e', '#ef4444', '#38bdf8'];
  const blockSizes = [8, 12, 16, 20, 28, 36];

  // Randomize layer hierarchy with probability
  const shuffledLayers: EffectLayerId[] = [...DEFAULT_LAYER_ORDER];
  if (Math.random() > 0.4) {
    // Swap 2 to 4 pairs of layers for creative glitch rendering orders
    for (let i = 1; i < shuffledLayers.length - 1; i++) {
      if (Math.random() > 0.5) {
        const j = Math.max(1, Math.min(shuffledLayers.length - 1, i + (Math.random() > 0.5 ? 1 : -1)));
        const temp = shuffledLayers[i];
        shuffledLayers[i] = shuffledLayers[j];
        shuffledLayers[j] = temp;
      }
    }
  }

  const hasDatamosh = Math.random() > 0.25; // 75% chance of datamosh on randomize

  return {
    ...DEFAULT_PHOTO_EFFECTS,
    preset: presets[Math.floor(Math.random() * presets.length)],
    brightness: Math.floor((Math.random() - 0.5) * 40),
    contrast: Math.floor(Math.random() * 45 - 5),
    saturation: Math.floor((Math.random() - 0.5) * 60),
    exposure: Math.floor((Math.random() - 0.5) * 30),
    warmth: Math.floor((Math.random() - 0.5) * 40),
    tint: Math.floor((Math.random() - 0.5) * 30),
    sharpness: Math.random() > 0.4 ? Math.floor(Math.random() * 50 + 10) : 0,

    glow: Math.random() > 0.4 ? Math.floor(Math.random() * 55 + 15) : 0,
    noise: Math.random() > 0.3 ? Math.floor(Math.random() * 40 + 10) : 0,
    chroma: Math.random() > 0.3 ? Math.floor(Math.random() * 7 + 1) : 0,
    scanlines: Math.random() > 0.6 ? Math.floor(Math.random() * 45 + 15) : 0,
    crtBloom: Math.random() > 0.7 ? Math.floor(Math.random() * 35 + 10) : 0,

    // Datamosh / Pixelmosh
    datamosh: hasDatamosh ? Math.floor(Math.random() * 65 + 25) : 0,
    datamoshBlockSize: blockSizes[Math.floor(Math.random() * blockSizes.length)],
    datamoshSlices: Math.floor(Math.random() * 60 + 15),
    datamoshMelt: Math.floor(Math.random() * 45 + 10),
    datamoshSeed: Math.floor(Math.random() * 999999) + 1,

    vignette: Math.random() > 0.4 ? Math.floor(Math.random() * 45 + 15) : 0,
    dustScratches: Math.random() > 0.5 ? Math.floor(Math.random() * 45 + 10) : 0,
    lightLeak: leaks[Math.floor(Math.random() * leaks.length)],
    lightLeakIntensity: Math.floor(Math.random() * 50 + 30),

    gradientMode: gradients[Math.floor(Math.random() * gradients.length)],

    curveShadows: Math.floor((Math.random() - 0.5) * 30),
    curveHighlights: Math.floor((Math.random() - 0.5) * 30),
    curveContrast: Math.floor(Math.random() * 35),

    timestamp: Math.random() > 0.6,
    dateText: "'03 09 26",
    timestampColor: colors[Math.floor(Math.random() * colors.length)],

    layerOrder: shuffledLayers,
  };
}
