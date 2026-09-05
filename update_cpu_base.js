import fs from 'fs';

let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

content = content.replace(
  "  const thresholdVal = state.threshold;",
  "  const thresholdVal = state.threshold;\n  const thresholdNoiseVal = (state.thresholdNoise || 0) / 100.0;"
);

content = content.replace(
  `      if (thresholdVal > 0) {
        lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const bin = lum >= thresholdVal ? 255 : 0;
        r = bin; g = bin; b = bin;
      }`,
  `      if (thresholdVal > 0) {
        lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (thresholdNoiseVal > 0) {
          // pseudo-random noise for this pixel
          const noise = Math.random() - 0.5; // -0.5 to 0.5
          lum += noise * thresholdNoiseVal * 255;
        }
        const bin = lum >= thresholdVal ? 255 : 0;
        r = bin; g = bin; b = bin;
      }`
);

fs.writeFileSync('src/utils/imageProcessing.ts', content);
