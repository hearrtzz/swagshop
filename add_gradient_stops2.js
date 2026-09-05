import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const oldBlock = `            {(state.gradientMode === 'custom_duo' || state.gradientMode === 'threetone') && (
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
            )}`;

const newBlock = `            {(state.gradientMode === 'custom_duo' || state.gradientMode === 'threetone') && (
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
                <div className="flex justify-between items-center text-[#e0e0e0] font-medium mb-2 text-xs">
                  <span>Pontos do Gradiente</span>
                  <button 
                    onClick={() => {
                      const stops = state.customGradientStops || [
                        { color: state.duoShadow, pos: 0 },
                        { color: state.duoLight, pos: 100 }
                      ];
                      if (stops.length < 10) {
                        updateState('customGradientStops', [...stops, { color: '#ff0000', pos: 50 }]);
                      }
                    }}
                    className="bg-[#3c3c3c] hover:bg-[#555] px-2 py-1 rounded text-[10px]"
                  >
                    + Adicionar
                  </button>
                </div>
                
                <div className="space-y-2">
                  {(state.customGradientStops || [
                    { color: state.duoShadow, pos: 0 },
                    { color: state.duoLight, pos: 100 }
                  ]).sort((a,b) => a.pos - b.pos).map((stop, index, arr) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={e => {
                          const newStops = [...arr];
                          newStops[index] = { ...stop, color: e.target.value };
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.pos}
                        onChange={e => {
                          const newStops = [...arr];
                          newStops[index] = { ...stop, pos: parseInt(e.target.value) };
                          updateState('customGradientStops', newStops);
                        }}
                        className="flex-1 min-w-0"
                      />
                      <span className="text-[10px] font-mono text-[#888] w-8 text-right">{stop.pos}%</span>
                      {arr.length > 2 && (
                        <button
                          onClick={() => {
                            const newStops = arr.filter((_, i) => i !== index);
                            updateState('customGradientStops', newStops);
                          }}
                          className="text-red-400 hover:text-red-300 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remover"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="h-4 rounded mt-4 border border-[#3c3c3c]" style={{
                  background: \`linear-gradient(to right, \${(state.customGradientStops || [
                    { color: state.duoShadow, pos: 0 },
                    { color: state.duoLight, pos: 100 }
                  ]).sort((a,b) => a.pos - b.pos).map(s => \`\${s.color} \${s.pos}%\`).join(', ')})\`
                }} />
              </div>
            )}`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync('src/components/EffectsPanel.tsx', content);
  console.log("Successfully added custom gradient stops UI!");
} else {
  console.log("Failed to match custom gradient block.");
}
