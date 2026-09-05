import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const oldGradientList = `                { id: 'matrix_emerald', name: '💻 Terminal Matrix Esmeralda', colors: ['#030a05', '#32f064'] },
                { id: 'threetone', name: '🌈 Tri-tone Customizado', colors: [state.duoShadow, state.duoMidtone, state.duoLight] },
                { id: 'custom_duo', name: '🎨 Duotone Customizado', colors: [state.duoShadow, state.duoLight] },`;

const newGradientList = `                { id: 'matrix_emerald', name: '💻 Terminal Matrix Esmeralda', colors: ['#030a05', '#32f064'] },
                { id: 'threetone', name: '🌈 Tri-tone Customizado', colors: [state.duoShadow, state.duoMidtone, state.duoLight] },
                { id: 'custom_duo', name: '🎨 Duotone Customizado', colors: [state.duoShadow, state.duoLight] },
                { id: 'custom_stops', name: '🎛️ Gradiente Multi-Stops (Avançado)', colors: [] },`;

content = content.replace(oldGradientList, newGradientList);

const customGradientUI = `
            {state.gradientMode === 'custom_stops' && (
              <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#e0e0e0] font-medium text-[11px]">Editor de Gradiente (Stops)</span>
                  <button 
                    onClick={() => {
                      const current = state.customGradientStops || [{color: '#000000', pos: 0}, {color: '#ffffff', pos: 100}];
                      updateState('customGradientStops', [...current, {color: '#888888', pos: 50}]);
                    }}
                    className="px-2 py-1 bg-[#333] hover:bg-[#444] rounded text-[10px] text-white transition"
                  >
                    + Adicionar Stop
                  </button>
                </div>
                
                <div 
                  className="w-full h-6 rounded border border-[#555] relative overflow-hidden"
                  style={{
                    background: state.customGradientStops && state.customGradientStops.length > 0
                      ? \`linear-gradient(to right, \${[...state.customGradientStops].sort((a,b) => a.pos - b.pos).map(s => \`\${s.color} \${s.pos}%\`).join(', ')})\`
                      : 'linear-gradient(to right, #000, #fff)'
                  }}
                />
                
                <div className="space-y-2 mt-2">
                  {(state.customGradientStops || []).map((stop, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={stop.color} 
                        onChange={e => {
                          const newStops = [...(state.customGradientStops || [])];
                          newStops[i] = { ...newStops[i], color: e.target.value };
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input 
                        type="range" min="0" max="100" value={stop.pos}
                        onChange={e => {
                          const newStops = [...(state.customGradientStops || [])];
                          newStops[i] = { ...newStops[i], pos: parseInt(e.target.value) };
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-full"
                      />
                      <span className="font-mono text-[#007aff] text-[10px] w-8 text-right">{stop.pos}%</span>
                      <button 
                        onClick={() => {
                          const newStops = [...(state.customGradientStops || [])];
                          newStops.splice(i, 1);
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-[#ff4444] hover:bg-[#ff4444]/20 rounded transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
`;

content = content.replace(
  "            )}",
  "            )}\n" + customGradientUI
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
