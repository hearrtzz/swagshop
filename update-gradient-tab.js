import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const regexToReplace = /\{\/\* ================= TAB: GRADIENTES & DUOTONE ================= \*\/\}[\\s\\S]*?\{\/\* ================= TAB: FX \(GLOW, HALFTONE, LIMIAR\) ================= \*\/\}/;

const newGradientTab = `        {/* ================= TAB: GRADIENTES & DUOTONE ================= */}
        {activeTab === 'gradient' && (
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Colorização Gráfica (Photoshop Gradient Map)
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'none', name: 'Nenhum (Cores Naturais)', colors: ['#444', '#aaa'] },
                { id: 'xbox_orange', name: '🎮 Xbox 360 Laranja Blades', colors: ['#090a0e', '#ff6e00'] },
                { id: 'nfs_mostwanted', name: '🏎️ NFS Most Wanted Solar Âmbar', colors: ['#161106', '#e6a117'] },
                { id: 'cyber_green', name: '🟢 Xbox Clássico Verde Neon', colors: ['#070c06', '#3ceb00'] },
                { id: 'depth_cyber', name: '🌌 Depth-Tone Ciano & Magenta', colors: ['#0a041c', '#00c3e1'] },
                { id: 'cyberpunk_neon', name: '⚡ Cyberpunk 2077 Neon', colors: ['#120526', '#00f5ff'] },
                { id: 'vaporwave', name: '🌴 Vaporwave Estética 80s', colors: ['#1a0b2e', '#ff69b4'] },
                { id: 'thermal_heat', name: '🔥 Câmera Térmica Heatmap', colors: ['#000050', '#ffff00'] },
                { id: 'infrared_aerochrome', name: '🍁 Filme Infravermelho Aerochrome', colors: ['#0c1218', '#eb1e3c'] },
                { id: 'sunset_gold', name: '🌅 Pôr do Sol Dourado', colors: ['#140819', '#f0821e'] },
                { id: 'matrix_emerald', name: '💻 Terminal Matrix Esmeralda', colors: ['#030a05', '#32f064'] },
                { id: 'custom_duo', name: '🎨 Duotone Customizado', colors: [state.duoShadow, state.duoLight] },
                { id: 'threetone', name: '🌈 Tritone Customizado', colors: [state.duoShadow, state.duoMidtone || '#5e43a6', state.duoLight] },
                { id: 'custom_stops', name: '🎛️ Gradiente Multi-Stops (Avançado)', colors: [] },
              ].map((g) => {
                const isSelected = state.gradientMode === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => updateState('gradientMode', g.id as GradientMapMode)}
                    className={\`w-full p-2 rounded-lg flex items-center justify-between border transition-all text-left \${
                      isSelected
                        ? 'bg-[#007aff] border-[#007aff] text-white shadow-sm'
                        : 'bg-[#1e1e1e] border-[#ffffff11] text-[#b0b0b0] hover:bg-[#3d3d3d] hover:text-white'
                    }\`}
                  >
                    <span className="text-xs font-medium">{g.name}</span>
                    <div className="flex items-center gap-1">
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
                    </div>
                  </button>
                );
              })}
            </div>

            {(state.gradientMode === 'custom_duo' || state.gradientMode === 'threetone') && (
              <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium">Cor das Sombras</span>
                  <input
                    type="color"
                    value={state.duoShadow}
                    onChange={e => updateState('duoShadow', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                {state.gradientMode === 'threetone' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#e0e0e0] font-medium">Cor dos Meios-tons</span>
                    <input
                      type="color"
                      value={state.duoMidtone || '#5e43a6'}
                      onChange={e => updateState('duoMidtone', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium">Cor das Luzes</span>
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
            )}
          </div>
        )}

        {/* ================= TAB: FX (GLOW, HALFTONE, LIMIAR) ================= */}`;

content = content.replace(regexToReplace, newGradientTab);
fs.writeFileSync('src/components/EffectsPanel.tsx', content);
