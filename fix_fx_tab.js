import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const regexToFind = /\{\/\* ================= TAB: FX \(GLOW, HALFTONE, LIMIAR\) ================= \*\/\}\s*\{activeTab === 'fx' && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/;

const toReplace = `{/* ================= TAB: FX (GLOW, HALFTONE, LIMIAR) ================= */}
        {activeTab === 'fx' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Efeitos de Estilização Gráfica
            </div>

            {/* Glow / Bloom */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Glow Sonhador / Bloom Suave</span>
                  <span className="font-mono text-[#007aff]">{state.glow}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={state.glow}
                  onChange={e => updateState('glow', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              {state.glow > 0 && (
                <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-[#3c3c3c]">
                  <div>
                    <div className="text-[#888] text-[10px] mb-1">Raio (Espalhamento)</div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => updateState('glowRadius', 10)}
                        className={\`flex-1 py-1 rounded text-[10px] \${state.glowRadius <= 15 ? 'bg-[#333] text-white' : 'text-[#888] hover:bg-[#2a2a2a]'}\`}
                      >Hard</button>
                      <button 
                        onClick={() => updateState('glowRadius', 25)}
                        className={\`flex-1 py-1 rounded text-[10px] \${state.glowRadius > 15 && state.glowRadius <= 30 ? 'bg-[#333] text-white' : 'text-[#888] hover:bg-[#2a2a2a]'}\`}
                      >Medium</button>
                      <button 
                        onClick={() => updateState('glowRadius', 60)}
                        className={\`flex-1 py-1 rounded text-[10px] \${state.glowRadius > 30 ? 'bg-[#333] text-white' : 'text-[#888] hover:bg-[#2a2a2a]'}\`}
                      >Soft</button>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888] text-[10px] mb-1">Limiar (Threshold)</div>
                    <input
                      type="range" min="0" max="100" value={state.glowThreshold}
                      onChange={e => updateState('glowThreshold', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Photoshop Threshold */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Limiar P&B (Photoshop Threshold)</span>
                <span className="font-mono text-[#007aff]">{state.threshold === 0 ? 'Desligado' : state.threshold}</span>
              </div>
              <input
                type="range" min="0" max="255" value={state.threshold}
                onChange={e => updateState('threshold', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-[#888] mt-1">Converte a imagem em preto e branco absoluto com recorte de luminância.</p>
              
              {state.threshold > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-[#3c3c3c]">
                  <div className="flex justify-between text-[#e0e0e0] mb-1">
                    <span className="text-[11px]">Ruído Dithertone (Suavização)</span>
                    <span className="font-mono text-[#007aff] text-[11px]">{state.thresholdNoise}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={state.thresholdNoise}
                    onChange={e => updateState('thresholdNoise', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Sabattier Solarization */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Solarização Sabattier (Inversão de Prata)</span>
                <span className="font-mono text-[#007aff]">{state.solarize}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.solarize}
                onChange={e => updateState('solarize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Halftone */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Halftone Reticulado (Pop-Art)</span>
                <span className="font-mono text-[#007aff]">{state.halftone === 0 ? 'Desligado' : \`\${state.halftone}px\`}</span>
              </div>
              <input
                type="range" min="0" max="24" step="1" value={state.halftone}
                onChange={e => updateState('halftone', parseInt(e.target.value))}
                className="w-full"
              />

              {state.halftone > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateState('halftoneMode', 'bw')}
                    className={\`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all \${
                      state.halftoneMode === 'bw'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }\`}
                  >
                    P&B
                  </button>
                  <button
                    onClick={() => updateState('halftoneMode', 'color')}
                    className={\`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all \${
                      state.halftoneMode === 'color'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }\`}
                  >
                    Colorido
                  </button>
                  <button
                    onClick={() => updateState('halftoneMode', 'overlay')}
                    className={\`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all \${
                      state.halftoneMode === 'overlay'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }\`}
                  >
                    Original
                  </button>
                </div>
              )}
            </div>

            {/* ASCII */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Arte ASCII (Terminal Retro)</span>
                <span className="font-mono text-[#007aff]">{state.ascii === 0 ? 'Desligado' : \`\${state.ascii}%\`}</span>
              </div>
              <input
                type="range" min="0" max="100" step="1" value={state.ascii}
                onChange={e => updateState('ascii', parseInt(e.target.value))}
                className="w-full"
              />

              {state.ascii > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateState('asciiMode', 'bw')}
                    className={\`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all \${
                      state.asciiMode === 'bw'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }\`}
                  >
                    P&B
                  </button>
                  <button
                    onClick={() => updateState('asciiMode', 'green')}
                    className={\`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all \${
                      state.asciiMode === 'green'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }\`}
                  >
                    Matrix
                  </button>
                  <button
                    onClick={() => updateState('asciiMode', 'color')}
                    className={\`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all \${
                      state.asciiMode === 'color'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }\`}
                  >
                    Original
                  </button>
                </div>
              )}
            </div>

          </div>
        )}`;

content = content.replace(regexToFind, toReplace);
fs.writeFileSync('src/components/EffectsPanel.tsx', content);
