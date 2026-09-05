import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  /import \{([\s\S]*?)\} from 'lucide-react';/,
  "import {$1, Contrast} from 'lucide-react';"
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
