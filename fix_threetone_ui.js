import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  "            {state.gradientMode === 'custom_duo' && (",
  "            {(state.gradientMode === 'custom_duo' || state.gradientMode === 'threetone') && ("
);

const newThreeToneBlock = `                <div className="flex items-center justify-between">
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
                </div>`;

const oldBlock = `                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium">Cor das Sombras</span>
                  <input
                    type="color"
                    value={state.duoShadow}
                    onChange={e => updateState('duoShadow', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium">Cor das Luzes</span>
                  <input
                    type="color"
                    value={state.duoLight}
                    onChange={e => updateState('duoLight', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>`;
                
content = content.replace(oldBlock, newThreeToneBlock);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
