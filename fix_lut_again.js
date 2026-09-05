import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const regexToFind = /export function buildGradientMapLUT\(mode: GradientMapMode, customShadow: string, customLight: string\): Uint8Array \| null \{[\s\S]*?return lut;\n\}/;

const toReplace = `export function buildGradientMapLUT(mode: GradientMapMode, customShadow: string, customLight: string, customMidtone: string = '#5e43a6', customStops?: {color: string; pos: number}[]): Uint8Array | null {
  if (mode === 'none') return null;
  const lut = new Uint8Array(256 * 3);

  function parseHex(h: string): [number, number, number] {
    const clean = h.replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16) || 0,
      parseInt(clean.substring(2, 4), 16) || 0,
      parseInt(clean.substring(4, 6), 16) || 0
    ];
  }

  interface Stop {
    p: number;
    c: [number, number, number];
  }

  let stops: Stop[] = [];

  switch (mode) {
    case 'threetone':
      stops = [
        { p: 0.0, c: parseHex(customShadow) },
        { p: 0.5, c: parseHex(customMidtone) },
        { p: 1.0, c: parseHex(customLight) }
      ];
      break;
    
    case 'custom_duo':
      stops = [
        { p: 0.0, c: parseHex(customShadow) },
        { p: 1.0, c: parseHex(customLight) }
      ];
      break;
    case 'custom_stops':
      if (customStops && customStops.length >= 2) {
        // Ensure sorted by pos
        const sorted = [...customStops].sort((a, b) => a.pos - b.pos);
        stops = sorted.map(s => ({ p: s.pos / 100.0, c: parseHex(s.color) }));
      } else {
        stops = [
          { p: 0.0, c: parseHex(customShadow) },
          { p: 1.0, c: parseHex(customLight) }
        ];
      }
      break;
    default:
      // Fallback
      stops = [
        { p: 0.0, c: parseHex(customShadow) },
        { p: 1.0, c: parseHex(customLight) }
      ];
      break;
  }

  for (let i = 0; i < 256; i++) {
    const t = i / 255.0;
    let c = stops[0].c;
    
    if (t <= stops[0].p) {
      c = stops[0].c;
    } else if (t >= stops[stops.length - 1].p) {
      c = stops[stops.length - 1].c;
    } else {
      for (let s = 0; s < stops.length - 1; s++) {
        if (t >= stops[s].p && t <= stops[s + 1].p) {
          const range = stops[s + 1].p - stops[s].p;
          const factor = range === 0 ? 0 : (t - stops[s].p) / range;
          c = [
            Math.round(stops[s].c[0] + factor * (stops[s + 1].c[0] - stops[s].c[0])),
            Math.round(stops[s].c[1] + factor * (stops[s + 1].c[1] - stops[s].c[1])),
            Math.round(stops[s].c[2] + factor * (stops[s + 1].c[2] - stops[s].c[2]))
          ];
          break;
        }
      }
    }
    lut[i * 3] = c[0];
    lut[i * 3 + 1] = c[1];
    lut[i * 3 + 2] = c[2];
  }
  return lut;
}`;

content = content.replace(regexToFind, toReplace);
fs.writeFileSync('src/utils/imageProcessing.ts', content);
