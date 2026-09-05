import fs from 'fs';
let content = fs.readFileSync('src/utils/randomEffects.ts', 'utf8');

content = content.replace(
  "    'none', 'none', 'none', 'xbox_orange', 'cyberpunk_neon', 'vaporwave', 'thermal_heat', 'depth_cyber', 'matrix_emerald'",
  "    'none', 'none', 'custom_duo', 'threetone'"
);

fs.writeFileSync('src/utils/randomEffects.ts', content);
