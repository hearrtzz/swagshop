import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

const regex = /for \(let i = 0; i < 256; i\+\+\) \{[\s\S]*?lut\[i \* 3 \+ 2\] = c\[2\];\s*\}/;
const newCode = `for (let i = 0; i < 256; i++) {
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
  }`;

content = content.replace(regex, newCode);
fs.writeFileSync('src/utils/imageProcessing.ts', content);
