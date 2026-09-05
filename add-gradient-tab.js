import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const lensButton = `        <button
          onClick={() => setActiveTab('lenses')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'lenses' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Lentes"
        >
          <Camera className="w-5 h-5" />
          <span className="text-[9px] font-medium">Lentes</span>
        </button>`;

const gradientButton = `        <button
          onClick={() => setActiveTab('gradient')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'gradient' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Gradiente"
        >
          <Palette className="w-5 h-5" />
          <span className="text-[9px] font-medium">Gradiente</span>
        </button>`;

content = content.replace(lensButton, lensButton + "\n" + gradientButton);
fs.writeFileSync('src/components/EffectsPanel.tsx', content);
