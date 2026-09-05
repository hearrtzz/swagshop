import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const regexToReplace = /\{\(state\.gradientMode === 'custom_duo' \|\| state\.gradientMode === 'threetone'\) && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/;

const toAdd = `{(state.gradientMode === 'custom_duo' || state.gradientMode === 'threetone') && (
              <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium text-xs">Cor das Sombras</span>
                  <input
                    type="color"
                    value={state.duoShadow}
                    onChange={e => updateState('duoShadow', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                {state.gradientMode === 'threetone' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#e0e0e0] font-medium text-xs">Cor dos Meios-tons</span>
                    <input
                      type="color"
                      value={state.duoMidtone || '#5e43a6'}
                      onChange={e => updateState('duoMidtone', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium text-xs">Cor das Luzes</span>
                  <input
                    type="color"
                    value={state.duoLight}
                    onChange={e => updateState('duoLight', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            )}

            {state.gradientMode === 'custom_stops' && (
              <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] space-y-3">
                <div className="text-[#e0e0e0] text-xs font-medium">Marcadores do Gradiente</div>
                <div className="relative h-6 rounded-md overflow-hidden bg-white/10" 
                  style={{
                    background: state.customGradientStops && state.customGradientStops.length > 0
                      ? \`linear-gradient(to right, \${[...state.customGradientStops].sort((a,b)=>a.pos-b.pos).map(s=>\`\${s.color} \${s.pos}%\`).join(', ')})\`
                      : 'linear-gradient(to right, #000, #fff)'
                  }}
                >
                </div>
                <div className="space-y-2 mt-2">
                  {(state.customGradientStops || [
                    { color: '#000000', pos: 0 },
                    { color: '#ffffff', pos: 100 }
                  ]).map((stop, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={e => {
                          const newStops = [...(state.customGradientStops || [])];
                          newStops[i].color = e.target.value;
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input
                        type="range"
                        min="0" max="100"
                        value={stop.pos}
                        onChange={e => {
                          const newStops = [...(state.customGradientStops || [])];
                          newStops[i].pos = parseInt(e.target.value);
                          updateState('customGradientStops', newStops);
                        }}
                        className="flex-1"
                      />
                      <span className="text-[10px] text-[#888] w-8 text-right font-mono">{Math.round(stop.pos)}%</span>
                      {((state.customGradientStops || []).length > 2) && (
                        <button
                          onClick={() => {
                            const newStops = [...(state.customGradientStops || [])];
                            newStops.splice(i, 1);
                            updateState('customGradientStops', newStops);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444]/20 rounded transition-colors shrink-0"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {(!state.customGradientStops || state.customGradientStops.length < 5) && (
                    <button
                      onClick={() => {
                        const newStops = [...(state.customGradientStops || [
                          { color: '#000000', pos: 0 },
                          { color: '#ffffff', pos: 100 }
                        ])];
                        // Insert in middle
                        newStops.push({ color: '#888888', pos: 50 });
                        newStops.sort((a,b) => a.pos - b.pos);
                        updateState('customGradientStops', newStops);
                      }}
                      className="w-full py-1.5 rounded bg-[#333] hover:bg-[#444] text-[#ccc] text-[10px] transition-colors mt-2 uppercase tracking-wider font-bold"
                    >
                      + Adicionar Cor
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}`;

content = content.replace(regexToReplace, toAdd);
fs.writeFileSync('src/components/EffectsPanel.tsx', content);
