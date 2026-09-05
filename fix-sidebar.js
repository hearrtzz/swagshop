import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

const replacement = `{/* Sidebar with icons for tabs */}
      <div className="w-[72px] shrink-0 bg-[#252525] border-r border-[#3c3c3c] flex flex-col items-center py-4 gap-2 overflow-y-auto">
        <button
          onClick={() => setActiveTab('layers')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'layers' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Camadas"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[9px] font-medium">Camadas</span>
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'presets' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Presets"
        >
          <Film className="w-5 h-5" />
          <span className="text-[9px] font-medium">Presets</span>
        </button>
        <button
          onClick={() => setActiveTab('adjust')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'adjust' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Cores & Ajustes"
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[9px] font-medium">Cores</span>
        </button>
        <button
          onClick={() => setActiveTab('texture')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'texture' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Texturas"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[9px] font-medium">Texturas</span>
        </button>
        <button
          onClick={() => setActiveTab('glitch')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'glitch' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Glitch"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-medium">Glitch</span>
        </button>
        <button
          onClick={() => setActiveTab('lenses')}
          className={\`w-14 h-14 rounded-xl transition-all flex flex-col items-center justify-center gap-1 \${
            activeTab === 'lenses' ? 'bg-[#007aff] text-white shadow-md' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }\`}
          title="Lentes"
        >
          <Camera className="w-5 h-5" />
          <span className="text-[9px] font-medium">Lentes</span>
        </button>
        <button
          onClick={() => setActiveTab('fx')}`;

const regexTarget = /\{\/\* Sidebar with icons for tabs \*\/\}[\s\S]*?<button\s+onClick=\{\(\) => setActiveTab\('fx'\)\}/;

content = content.replace(regexTarget, replacement);
fs.writeFileSync('src/components/EffectsPanel.tsx', content);
console.log('Fixed sidebar');
