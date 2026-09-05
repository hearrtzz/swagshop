import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  /<div className="flex items-center gap-1">\s*<span className="w-3.5 h-3.5 rounded-full border border-white\/30" style=\{\{ backgroundColor: g.colors\[0\] \}\} \/>\s*<span className="w-3.5 h-3.5 rounded-full border border-white\/30" style=\{\{ backgroundColor: g.colors\[1\] \}\} \/>\s*<\/div>/,
  `<div className="flex items-center gap-1">
                      {g.colors.length > 0 ? (
                        g.colors.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: c }} />
                        ))
                      ) : (
                        <div className="w-8 h-3.5 rounded-full border border-white/30" style={{ 
                          background: state.customGradientStops && state.customGradientStops.length > 0
                            ? \`linear-gradient(to right, \${[...state.customGradientStops].sort((a,b)=>a.pos-b.pos).map(s=>\`\${s.color} \${s.pos}%\`).join(', ')})\`
                            : 'linear-gradient(to right, #000, #fff)'
                        }} />
                      )}
                    </div>`
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
