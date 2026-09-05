import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

// 1. Rename Hierarquia de Camadas to CAMADAS
content = content.replace("Hierarquia de Camadas ({visualLayers.length})", "CAMADAS ({visualLayers.length})");
content = content.replace("{activeTab === 'layers' && 'Hierarquia de Camadas'}", "{activeTab === 'layers' && 'CAMADAS'}");

// Remove explanation text
const expl = 
`<p className="text-[11px] text-[#999] leading-relaxed">
                  A ordem das camadas altera diretamente o resultado final da imagem. Use as setas <span className="text-white font-mono">▲ ▼</span> para reposicionar as camadas ou clique em <b>Randomizar</b>.
                </p>`;
content = content.replace(expl, "");

// 2. Change 'adjust' tab name to 'Cores & Ajustes'
content = content.replace("{activeTab === 'adjust' && 'Ajustes Básicos'}", "{activeTab === 'adjust' && 'Cores & Ajustes'}");
// The sidebar button for adjust is:
// <span className="text-[9px] font-medium">Ajustes</span>
content = content.replace('<span className="text-[9px] font-medium">Ajustes</span>', '<span className="text-[9px] font-medium">Cores</span>');

// 3. Remove 'gradient' sidebar button
const gradBtnRegex = /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('gradient'\)\}[\s\S]*?<\/button>/;
content = content.replace(gradBtnRegex, "");

// 4. Move gradient content into adjust tab
const gradTabStart = `{/* ================= TAB: GRADIENTES & DUOTONE ================= */}`;
const gradTabEnd = `        {/* ================= TAB: FX & EFEITOS ARTÍSTICOS ================= */}`;

const gradContent = content.substring(content.indexOf(gradTabStart), content.indexOf(gradTabEnd));
// We need to inject gradContent into the end of activeTab === 'adjust'
const adjustTabEnd = `            {/* S-Curve */}
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Curva em S (Punch de Contraste)</span>
                  <span className="font-mono text-[#007aff]">{state.curveContrast}</span>
                </div>
                <input
                  type="range" min="-80" max="80" value={state.curveContrast}
                  onChange={e => updateState('curveContrast', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}`;

if (content.includes(adjustTabEnd) && gradContent.length > 0) {
  content = content.replace(adjustTabEnd, adjustTabEnd.replace("          </div>\n        )}", "") + 
    "\n\n            " + gradContent.replace("{activeTab === 'gradient' && (", "(true && (") + "          </div>\n        )}");
  content = content.replace(gradContent, "");
}

// 5. When toggling a layer off and on, preserve its setting from cache.
// Right now, when a layer is toggled off, it resets to 0. When toggled on, it reads from cacheRef.
// BUT cacheRef is lost if EffectsPanel remounts!
// Wait, EffectsPanel DOES remount when closed. The user said: "quando eu desabilitar e habilitar algo na hierarquia de camadas, faça com que o preset anterior fique habilitado quando eu retornar a visbilidade e nao reinicie"
// The issue is that the cacheRef is local to EffectsPanel. I can fix this by saving cacheRef state to PhotoEffectsState, OR by storing it in a global variable outside the component.
// Let's create a global cache outside the EffectsPanel component in the same file.

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
