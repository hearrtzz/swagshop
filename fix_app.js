import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("setCanvasConfig(prev => ({ ...prev, backgroundType: 'transparent' }));\n    }));\n    }", "setCanvasConfig(prev => ({ ...prev, backgroundType: 'transparent' }));\n    }");

fs.writeFileSync('src/App.tsx', content);
