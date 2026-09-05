const fs = require('fs');
let code = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

// The block is currently placed after the first </div> that closes the tab content.
// We need to move it inside the </div>.

const badBlock = `          </div>
            {/* ASCII TEXT */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Texto de Imagem ASCII</span>
                <span className="font-mono text-[#007aff]">{state.asciiText === 0 ? 'Desligado' : \`\${state.asciiText}%\`}</span>
              </div>
              <input
                type="range" min="0" max="100" step="1" value={state.asciiText}
                onChange={e => updateState('asciiText', parseInt(e.target.value))}
                className="w-full"
              />

              {state.asciiText > 0 && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={state.asciiTextString || 'Hello World. '}
                    onChange={e => updateState('asciiTextString', e.target.value)}
                    placeholder="Texto para renderizar a imagem..."
                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1.5 text-xs text-[#e0e0e0] focus:border-[#007aff] focus:outline-none"
                  />
                </div>
              )}
            </div>

        )}`;

const goodBlock = `            {/* ASCII TEXT */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Texto de Imagem ASCII</span>
                <span className="font-mono text-[#007aff]">{state.asciiText === 0 ? 'Desligado' : \`\${state.asciiText}%\`}</span>
              </div>
              <input
                type="range" min="0" max="100" step="1" value={state.asciiText}
                onChange={e => updateState('asciiText', parseInt(e.target.value))}
                className="w-full"
              />

              {state.asciiText > 0 && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={state.asciiTextString || 'Hello World. '}
                    onChange={e => updateState('asciiTextString', e.target.value)}
                    placeholder="Texto para renderizar a imagem..."
                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1.5 text-xs text-[#e0e0e0] focus:border-[#007aff] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}`;

code = code.replace(badBlock, goodBlock);

fs.writeFileSync('src/components/EffectsPanel.tsx', code);
console.log('Fixed EffectsPanel syntax');
