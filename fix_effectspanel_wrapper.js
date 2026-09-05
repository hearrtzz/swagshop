import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

// Add onOpen to props
content = content.replace(
  "  onRandomize?: () => void;\n}",
  "  onRandomize?: () => void;\n  onOpen?: () => void;\n}"
);

content = content.replace(
  "  onRandomize,\n}) => {",
  "  onRandomize,\n  onOpen,\n}) => {"
);

// Replace the outer div
const oldOuterDiv = `  return (
    <div
      id="mac-effects-panel"
      style={{ right: \`\${panelPos.x}px\`, top: \`\${panelPos.y}px\` }}
      className="absolute z-40 w-[360px] bg-[#252525] border border-[#3c3c3c] rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs select-none max-h-[calc(100vh-80px)] text-[#e0e0e0]"
    >
      {/* Titlebar - Draggable */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="h-10 px-4 flex items-center justify-between bg-[#2d2d2d] border-b border-[#3c3c3c] cursor-grab active:cursor-grabbing text-[#e0e0e0] font-medium shrink-0"
      >
        <div className="flex items-center gap-2 panel-interactive">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:opacity-80 transition-opacity"
            title="Fechar Painel"
          />
          <button
            onClick={onReset}
            className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] hover:opacity-80 transition-opacity"
            title="Resetar Ajustes"
          />
          <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aac2b] opacity-60" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#888]">Appearance & Effects</span>
        <div className="flex items-center gap-2 panel-interactive">
          {onRandomize && (
            <button
              onClick={onRandomize}
              className="text-[10px] text-amber-400 font-bold cursor-pointer hover:text-amber-300 flex items-center gap-1 transition-colors"
              title="Randomizar Efeitos Criativos"
            >
              <Sparkles className="w-3 h-3" />
              <span>RANDOM</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="text-[10px] text-[#007aff] font-bold cursor-pointer hover:underline transition-colors"
            title="Resetar Todos os Efeitos"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Segmented Tab Bar */}
      <div className="flex p-1 gap-1 bg-[#1e1e1e] border-b border-[#3c3c3c] overflow-x-auto text-[11px]">`;

const newOuterDiv = `  const TABS = [
    { id: 'layers', icon: Layers, label: 'Camadas' },
    { id: 'presets', icon: Film, label: 'Presets' },
    { id: 'adjust', icon: Sun, label: 'Ajustes' },
    { id: 'texture', icon: Grid, label: 'Texturas' },
    { id: 'lenses', icon: Camera, label: 'Lentes' },
    { id: 'glitch', icon: Zap, label: 'Glitch' },
    { id: 'fx', icon: Sparkles, label: 'FX' },
    { id: 'gradient', icon: Palette, label: 'Cores' }
  ] as const;

  return (
    <div className="flex h-full text-[#e0e0e0] text-xs select-none">
      {/* EXPANDED PANEL CONTENT */}
      {isOpen && (
        <div className="w-[320px] flex flex-col bg-[#252525] border-r border-[#3c3c3c] overflow-hidden">
          {/* Header */}
          <div className="h-12 px-4 flex items-center justify-between bg-[#2d2d2d] border-b border-[#3c3c3c] shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#888]">
              {TABS.find(t => t.id === activeTab)?.label || 'Efeitos'}
            </span>
            <div className="flex items-center gap-2">
              {onRandomize && (
                <button
                  onClick={onRandomize}
                  className="text-[#888] hover:text-amber-400 transition-colors"
                  title="Randomizar"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onReset}
                className="text-[#888] hover:text-[#007aff] transition-colors"
                title="Resetar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="text-[#888] hover:text-[#ff5f57] transition-colors ml-1"
                title="Fechar Painel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="hidden">`; // We hide the old horizontal tabs, keep them in DOM so we don't have to remove lines 242-317 yet.

content = content.replace(oldOuterDiv, newOuterDiv);

// Now fix the end of the hidden tabs div
content = content.replace(
  "        </button>\n      </div>\n\n      {/* Content Body */}",
  "        </button>\n      </div>\n      </div> {/* End hidden tabs */}\n\n      {/* Content Body */}"
);

// Close the flex panels
content = content.replace(
  "      </div>\n    </div>\n  );\n};",
  `      </div>
        </div>
      )}

      {/* ICON SIDEBAR (ALWAYS VISIBLE) */}
      <div className="w-14 shrink-0 bg-[#1e1e1e] flex flex-col items-center py-4 space-y-4 overflow-y-auto hide-scrollbar z-10 border-l border-[#3c3c3c]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = isOpen && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (!isOpen && onOpen) onOpen();
              }}
              className={\`w-10 h-10 rounded-xl flex items-center justify-center transition-all \${
                isActive 
                  ? 'bg-[#007aff] text-white shadow-md' 
                  : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
              }\`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};`
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
