import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  /, Contrast\} from 'lucide-react';/,
  " Contrast} from 'lucide-react';"
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
