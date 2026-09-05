import fs from 'fs';
let content = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');

content = content.replace(
  /onExport: \(format: 'png' \| 'jpeg' \| 'webp' \| 'svg', quality: number\) => void;/,
  `onExport: (format: 'png' | 'jpeg' | 'webp' | 'svg', quality: number, customName: string) => void;`
);

content = content.replace(
  /export const ExportModal: React\.FC<ExportModalProps> = \(\{ isOpen, onClose, onExport, fileName \}\) => \{/,
  `export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, fileName }) => {
  const [customFileName, setCustomFileName] = useState(fileName);
  
  // Update local state when fileName prop changes
  React.useEffect(() => {
    setCustomFileName(fileName);
  }, [fileName]);`
);

content = content.replace(
  /<div className="flex bg-\[#1e1e1e\] border border-\[#3c3c3c\] rounded-lg px-3 py-2 opacity-60 cursor-not-allowed">\s*<span className="truncate">\{fileName\}<\/span>\s*<span className="shrink-0 text-\[#888\]">\.\{format\}<\/span>\s*<\/div>/,
  `<div className="flex items-center bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-3 py-2 focus-within:border-[#007aff] transition-colors">
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="w-full bg-transparent text-white outline-none truncate"
                placeholder="Nome do arquivo"
              />
              <span className="shrink-0 text-[#888] ml-1">.{format}</span>
            </div>`
);

content = content.replace(
  /onExport\(format, quality \/ 100\);/,
  `onExport(format, quality / 100, customFileName || 'imagem_exportada');`
);

fs.writeFileSync('src/components/ExportModal.tsx', content);
