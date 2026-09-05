import fs from 'fs';

let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const newThresholdUI = `
            {/* Photoshop Threshold */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Limiar P&B (Photoshop Threshold)</span>
                <span className="font-mono text-[#007aff]">{state.threshold === 0 ? 'Desligado' : state.threshold}</span>
              </div>
              <input
                type="range" min="0" max="255" value={state.threshold}
                onChange={e => updateState('threshold', parseInt(e.target.value))}
                className="w-full"
              />
              
              {state.threshold > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-[#333]">
                  <div className="flex justify-between text-[#e0e0e0] mb-1">
                    <span className="text-[11px]">Ruído Vintage (Dithering)</span>
                    <span className="font-mono text-[#007aff] text-[11px]">{state.thresholdNoise || 0}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={state.thresholdNoise || 0}
                    onChange={e => updateState('thresholdNoise', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-[10px] text-[#888] mt-1 leading-tight">Adiciona ruído ao limiar para um efeito de dither/jornal antigo e texturizado.</p>
                </div>
              )}
              
              {state.threshold === 0 && (
                <p className="text-[10px] text-[#888] mt-1">Converte a imagem em preto e branco absoluto com recorte de luminância.</p>
              )}
            </div>
`;

content = content.replace(
  `            {/* Photoshop Threshold */}
            <div>
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
            </div>`,
  newThresholdUI.trim()
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
