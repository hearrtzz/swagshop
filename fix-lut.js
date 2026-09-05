import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

content = content.replace(
  "case 'custom_duo':\n      stops = [\n        { p: 0.0, c: parseHex(customShadow) },\n        { p: 1.0, c: parseHex(customLight) }\n      ];\n      break;",
  `case 'custom_duo':
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
      break;`
);

fs.writeFileSync('src/utils/imageProcessing.ts', content);
