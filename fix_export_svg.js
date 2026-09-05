import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add Import
content = content.replace(
  "import { NewCanvasModal } from './components/NewCanvasModal';",
  "import { NewCanvasModal } from './components/NewCanvasModal';\nimport { ExportModal } from './components/ExportModal';"
);

// Add state for export modal
const stateRegex = /const \[isEffectsPanelOpen, setIsEffectsPanelOpen\] = useState<boolean>\(false\);/;
content = content.replace(stateRegex, "const [isEffectsPanelOpen, setIsEffectsPanelOpen] = useState<boolean>(false);\n  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);");


// Replace handleOpenExportModal
const exportFuncRegex = /const handleOpenExportModal = \(\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\n    \}, 'image\/png'\);\n  \};/;

const newExportFunc = `const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const executeExport = (format: 'png' | 'jpeg' | 'webp' | 'svg', quality: number) => {
    const canvas = getProcessedCanvas(1, false);
    if (!canvas) return;
    
    const exportName = \`\${canvasConfig.name.replace(/\\s+/g, '_')}.\${format}\`;
    
    if (format === 'svg') {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      let svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${canvas.width} \${canvas.height}">\\n\`;
      // Very basic threshold raster to rects SVG vectorization (only black pixels)
      for (let y = 0; y < canvas.height; y++) {
        let currentRectWidth = 0;
        let startX = 0;
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const isBlack = (data[idx + 3] > 128) && ((data[idx] + data[idx+1] + data[idx+2]) / 3 < 128);
          
          if (isBlack) {
            if (currentRectWidth === 0) startX = x;
            currentRectWidth++;
          } else {
            if (currentRectWidth > 0) {
              svg += \`<rect x="\${startX}" y="\${y}" width="\${currentRectWidth}" height="1" fill="#000" />\\n\`;
              currentRectWidth = 0;
            }
          }
        }
        if (currentRectWidth > 0) {
          svg += \`<rect x="\${startX}" y="\${y}" width="\${currentRectWidth}" height="1" fill="#000" />\\n\`;
        }
      }
      svg += '</svg>';
      
      const blob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, \`image/\${format}\`, quality);
  };`;

content = content.replace(exportFuncRegex, newExportFunc);

const jsxRegex = /\{\/\* Modal: New Canvas \/ Resize Artboard \*\/\}/;
const newJsx = `<ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={executeExport} 
        fileName={canvasConfig.name.replace(/\\s+/g, '_')} 
      />
      
      {/* Modal: New Canvas / Resize Artboard */}`;
content = content.replace(jsxRegex, newJsx);

fs.writeFileSync('src/App.tsx', content);
