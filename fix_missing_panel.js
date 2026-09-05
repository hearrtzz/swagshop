import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const regexToFind = /\{\(state\.gradientMode === 'custom_duo' \|\| state\.gradientMode === 'threetone'\) && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/;

const toInsert = `            {state.gradientMode === 'custom_stops' && (
              <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#e0e0e0] font-medium text-[11px]">Editor de Gradiente (Stops)</span>
                  <button 
                    onClick={() => {
                      const current = state.customGradientStops || [{color: '#000000', pos: 0}, {color: '#ffffff', pos: 100}];
                      updateState('customGradientStops', [...current, {color: '#888888', pos: 50}]);
                    }}
                    className="px-2 py-1 bg-[#333] hover:bg-[#444] rounded text-[10px] text-white transition border border-[#555]"
                  >
                    + Novo Stop
                  </button>
                </div>
                
                <div 
                  className="w-full h-8 rounded border border-[#555] relative overflow-hidden"
                  style={{
                    background: state.customGradientStops && state.customGradientStops.length > 0
                      ? \`linear-gradient(to right, \${[...state.customGradientStops].sort((a,b) => a.pos - b.pos).map(s => \`\${s.color} \${s.pos}%\`).join(', ')})\`
                      : 'linear-gradient(to right, #000, #fff)'
                  }}
                />
                
                <div className="space-y-2 mt-2">
                  {(state.customGradientStops || [{color: '#000', pos: 0}, {color: '#fff', pos: 100}]).map((stop, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#252525] p-2 rounded border border-[#3c3c3c]">
                      <input 
                        type="color" 
                        value={stop.color} 
                        onChange={e => {
                          const newStops = [...(state.customGradientStops || [{color: '#000', pos: 0}, {color: '#fff', pos: 100}])];
                          newStops[i] = { ...newStops[i], color: e.target.value };
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input 
                        type="range" min="0" max="100" value={stop.pos}
                        onChange={e => {
                          const newStops = [...(state.customGradientStops || [{color: '#000', pos: 0}, {color: '#fff', pos: 100}])];
                          newStops[i] = { ...newStops[i], pos: parseInt(e.target.value) };
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-full accent-[#007aff]"
                      />
                      <span className="font-mono text-[#007aff] text-[10px] w-8 text-right">{stop.pos}%</span>
                      <button 
                        onClick={() => {
                          const newStops = [...(state.customGradientStops || [{color: '#000', pos: 0}, {color: '#fff', pos: 100}])];
                          if (newStops.length > 2) {
                            newStops.splice(i, 1);
                            updateState('customGradientStops', newStops);
                          } else {
                            alert('Um gradiente precisa de no mínimo 2 cores.');
                          }
                        }}
                        className="w-6 h-6 flex items-center justify-center text-[#ff4444] hover:bg-[#ff4444]/20 rounded transition"
                        title="Remover cor"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}`;

content = content.replace(regexToFind, match => match + '\n\n' + toInsert);
fs.writeFileSync('src/components/EffectsPanel.tsx', content);
