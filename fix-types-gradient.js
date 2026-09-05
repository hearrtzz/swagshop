import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  "  | 'custom_duo';",
  "  | 'custom_duo'\n  | 'custom_stops';"
);

content = content.replace(
  "export interface PhotoEffectsState {",
  "export interface GradientStop {\n  color: string; // hex\n  pos: number; // 0 to 100\n}\n\nexport interface PhotoEffectsState {"
);

content = content.replace(
  "  duoLight: string;",
  "  duoLight: string;\n  customGradientStops?: GradientStop[];"
);

content = content.replace(
  "  duoLight: '#ff7700',",
  "  duoLight: '#ff7700',\n  customGradientStops: [\n    { color: '#000000', pos: 0 },\n    { color: '#ffffff', pos: 100 }\n  ],"
);

fs.writeFileSync('src/types.ts', content);
