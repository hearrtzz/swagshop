import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const executeExport = \(format: 'png' \| 'jpeg' \| 'webp' \| 'svg', quality: number\) => \{/,
  `const executeExport = (format: 'png' | 'jpeg' | 'webp' | 'svg', quality: number, customName: string) => {`
);

content = content.replace(
  /const exportName = \`\$\{canvasConfig\.name\.replace\(\/\\s\+\/g, '_'\)\}\.\$\{format\}\`;/,
  `const exportName = \`\$\{customName.replace(/\\s+/g, '_')\}.\$\{format\}\`;`
);

fs.writeFileSync('src/App.tsx', content);
