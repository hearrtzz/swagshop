import fs from 'fs';
let content = fs.readFileSync('src/utils/imageProcessing.ts', 'utf8');

content = content.replace(
  "export function buildGradientMapLUT(mode: GradientMapMode, customShadow: string, customLight: string, customMidtone: string = '#5e43a6'): Uint8Array | null {",
  "export function buildGradientMapLUT(mode: GradientMapMode, customShadow: string, customLight: string, customMidtone: string = '#5e43a6', customStops?: {color: string; pos: number}[]): Uint8Array | null {"
);

fs.writeFileSync('src/utils/imageProcessing.ts', content);
