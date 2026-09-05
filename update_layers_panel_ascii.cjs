const fs = require('fs');
let code = fs.readFileSync('src/components/LayersPanel.tsx', 'utf8');

// Add to active states
code = code.replace(
  "const isAsciiActive = state.ascii > 0;",
  "const isAsciiActive = state.ascii > 0;\n  const isAsciiTextActive = state.asciiText > 0;"
);

// Add layer detail
const asciiLayerRegex = /(ascii:\s*\{\s*label:\s*'Arte ASCII',[\s\S]*?onGo:\s*\(\)\s*=>\s*\{\s*if\s*\(onNavigate\)\s*onNavigate\('fx'\);\s*\},\s*\},)/;
const asciiTextLayer = `
            asciiText: {
              label: 'Texto em Imagem',
              sublabel: 'Imagem composta por palavras contínuas',
              icon: Terminal,
              iconColor: 'text-[#34c759]',
              isActive: isAsciiTextActive,
              valueText: isAsciiTextActive ? \`\${state.asciiText}%\` : 'Inativo',
              onToggle: () => updateState('asciiText', 0),
              onGo: () => { if (onNavigate) onNavigate('fx'); },
            },`;

code = code.replace(asciiLayerRegex, `$1${asciiTextLayer}`);

fs.writeFileSync('src/components/LayersPanel.tsx', code);
console.log('Updated LayersPanel.tsx');
