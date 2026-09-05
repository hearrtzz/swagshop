import React, { useState } from 'react';
import { Download, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'jpeg' | 'webp' | 'svg', quality: number, customName: string) => void;
  fileName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, fileName }) => {
  const [customFileName, setCustomFileName] = useState(fileName);
  
  // Update local state when fileName prop changes
  React.useEffect(() => {
    setCustomFileName(fileName);
  }, [fileName]);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg'>('png');
  const [quality, setQuality] = useState(90);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#252525] border border-[#3c3c3c] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-[#e0e0e0]">
        <div className="h-12 px-4 flex items-center justify-between bg-[#2d2d2d] border-b border-[#3c3c3c]">
          <h3 className="font-medium">Exportar Imagem</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#3c3c3c] rounded-md transition-colors text-[#888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#888] uppercase tracking-wider mb-2">Formato</label>
            <div className="grid grid-cols-4 gap-2">
              {(['png', 'jpeg', 'webp', 'svg'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 rounded-lg border text-sm font-medium uppercase transition-all ${
                    format === f
                      ? 'bg-[#007aff] border-[#007aff] text-white'
                      : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white hover:border-[#555]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {format === 'svg' && (
              <p className="text-xs text-amber-400 mt-2">
                Aviso: A exportação SVG criará um vetor preto e branco a partir do brilho da imagem (útil para logos, silk ou recortes).
              </p>
            )}
          </div>

          {(format === 'jpeg' || format === 'webp') && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium text-[#888] uppercase tracking-wider">Qualidade</label>
                <span className="text-sm font-mono text-[#007aff]">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full accent-[#007aff]"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-[#888] uppercase tracking-wider mb-2">Nome do Arquivo</label>
            <div className="flex items-center bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-3 py-2 focus-within:border-[#007aff] transition-colors">
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="w-full bg-transparent text-white outline-none truncate"
                placeholder="Nome do arquivo"
              />
              <span className="shrink-0 text-[#888] ml-1">.{format}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#2d2d2d] border-t border-[#3c3c3c] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#e0e0e0] hover:bg-[#3c3c3c] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onExport(format, quality / 100, customFileName || 'imagem_exportada');
              onClose();
            }}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#007aff] hover:bg-[#0066d6] text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};
