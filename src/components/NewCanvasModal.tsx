import React, { useState } from 'react';
import {
  X,
  Check,
  Square,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Camera,
  Layout,
  FileText,
  Sliders
} from 'lucide-react';
import { CANVAS_PRESETS, CanvasConfig, CanvasPresetId, BackgroundType } from '../types';

interface NewCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: CanvasConfig;
  onCreateCanvas: (config: CanvasConfig) => void;
}

export const NewCanvasModal: React.FC<NewCanvasModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onCreateCanvas,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<CanvasPresetId>(currentConfig.preset);
  const [width, setWidth] = useState<number>(currentConfig.width);
  const [height, setHeight] = useState<number>(currentConfig.height);
  const [bgType, setBgType] = useState<BackgroundType>(currentConfig.backgroundType);
  const [customBgColor, setCustomBgColor] = useState<string>(currentConfig.customBgColor || '#121316');
  const [name, setName] = useState<string>(currentConfig.name || 'Sem Título');

  if (!isOpen) return null;

  const handlePresetSelect = (presetId: CanvasPresetId) => {
    setSelectedPreset(presetId);
    const found = CANVAS_PRESETS.find(p => p.id === presetId);
    if (found && presetId !== 'custom') {
      setWidth(found.width);
      setHeight(found.height);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCanvas({
      width: Math.max(100, Math.min(6000, width)),
      height: Math.max(100, Math.min(6000, height)),
      preset: selectedPreset,
      backgroundType: bgType,
      customBgColor,
      name: name || 'Canvas Sem Título',
    });
    onClose();
  };

  const getPresetIcon = (id: CanvasPresetId) => {
    switch (id) {
      case 'square': return <Square className="w-5 h-5 text-indigo-400" />;
      case 'story': return <Smartphone className="w-5 h-5 text-pink-400" />;
      case 'widescreen': return <Monitor className="w-5 h-5 text-sky-400" />;
      case 'portrait': return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case 'classic': return <Camera className="w-5 h-5 text-emerald-400" />;
      case 'twitter_header': return <Layout className="w-5 h-5 text-blue-400" />;
      case 'a4': return <FileText className="w-5 h-5 text-amber-400" />;
      default: return <Sliders className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div
        id="modal-new-canvas"
        className="w-full max-w-2xl bg-[#252525] border border-[#3c3c3c] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#e0e0e0]"
      >
        {/* macOS Modal Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#3c3c3c] bg-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer hover:opacity-80 transition-opacity" onClick={onClose} />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] opacity-50" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aac2b] opacity-50" />
            <span className="ml-2 font-semibold text-xs text-[#e0e0e0] uppercase tracking-wider">Novo Canvas / Redimensionar Prancheta</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#888] hover:text-white hover:bg-[#3d3d3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Preset Grid */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2.5">
              Modelos & Dimensões Pré-definidas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CANVAS_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`flex flex-col p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#007aff]/15 border-[#007aff] shadow-xs'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] hover:bg-[#3d3d3d] hover:border-[#4d4d4d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {getPresetIcon(preset.id)}
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#007aff]" />}
                    </div>
                    <span className="font-semibold text-xs text-white leading-snug">{preset.name}</span>
                    <span className="text-[11px] text-[#888] font-mono mt-0.5">
                      {preset.id === 'custom' ? `${width} × ${height}` : `${preset.width} × ${preset.height}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c]">
            <div>
              <label className="block text-xs text-[#b0b0b0] font-medium mb-1.5">Largura (px)</label>
              <input
                type="number"
                min="100"
                max="6000"
                value={width}
                onChange={(e) => {
                  setWidth(parseInt(e.target.value) || 0);
                  setSelectedPreset('custom');
                }}
                className="w-full px-2.5 py-1.5 rounded bg-[#2d2d2d] border border-[#3c3c3c] text-white font-mono text-xs focus:outline-none focus:border-[#007aff] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#b0b0b0] font-medium mb-1.5">Altura (px)</label>
              <input
                type="number"
                min="100"
                max="6000"
                value={height}
                onChange={(e) => {
                  setHeight(parseInt(e.target.value) || 0);
                  setSelectedPreset('custom');
                }}
                className="w-full px-2.5 py-1.5 rounded bg-[#2d2d2d] border border-[#3c3c3c] text-white font-mono text-xs focus:outline-none focus:border-[#007aff] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#b0b0b0] font-medium mb-1.5">Proporção Aspecto</label>
              <div className="px-2.5 py-1.5 rounded bg-[#2d2d2d] border border-[#3c3c3c] text-[#888] text-xs font-mono flex items-center h-[34px]">
                {width && height ? `${(width / Math.gcd(width, height)).toFixed(0)}:${(height / Math.gcd(width, height)).toFixed(0)} (${(width / height).toFixed(2)})` : '---'}
              </div>
            </div>
          </div>

          {/* Background Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2">
              Plano de Fundo do Canvas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setBgType('transparent')}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  bgType === 'transparent'
                    ? 'bg-[#007aff]/15 border-[#007aff] text-white'
                    : 'bg-[#1e1e1e] border-[#3c3c3c] hover:bg-[#3d3d3d] text-[#b0b0b0]'
                }`}
              >
                <span className="w-5 h-5 rounded bg-checkered border border-[#3c3c3c] shrink-0" />
                <span className="text-xs font-medium">Transparente</span>
              </button>

              <button
                type="button"
                onClick={() => setBgType('dark')}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  bgType === 'dark'
                    ? 'bg-[#007aff]/15 border-[#007aff] text-white'
                    : 'bg-[#1e1e1e] border-[#3c3c3c] hover:bg-[#3d3d3d] text-[#b0b0b0]'
                }`}
              >
                <span className="w-5 h-5 rounded bg-[#121212] border border-[#3c3c3c] shrink-0" />
                <span className="text-xs font-medium">Preto Fosco</span>
              </button>

              <button
                type="button"
                onClick={() => setBgType('white')}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  bgType === 'white'
                    ? 'bg-[#007aff]/15 border-[#007aff] text-white'
                    : 'bg-[#1e1e1e] border-[#3c3c3c] hover:bg-[#3d3d3d] text-[#b0b0b0]'
                }`}
              >
                <span className="w-5 h-5 rounded bg-white border border-neutral-300 shrink-0" />
                <span className="text-xs font-medium">Branco Puro</span>
              </button>

              <div
                className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                  bgType === 'color'
                    ? 'bg-[#007aff]/15 border-[#007aff] text-white'
                    : 'bg-[#1e1e1e] border-[#3c3c3c] hover:bg-[#3d3d3d] text-[#b0b0b0]'
                }`}
              >
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => {
                    setCustomBgColor(e.target.value);
                    setBgType('color');
                  }}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setBgType('color')}
                  className="text-xs font-medium text-left flex-1"
                >
                  Personalizado
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#3c3c3c]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#3c3c3c] text-[#e0e0e0] text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#007aff] hover:bg-[#006ee6] text-white text-xs font-semibold shadow-lg shadow-[#007aff33] transition-all"
            >
              Criar / Aplicar ao Canvas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Math GCD helper for aspect ratio calculation
declare global {
  interface Math {
    gcd(a: number, b: number): number;
  }
}
Math.gcd = function (a: number, b: number): number {
  return b ? Math.gcd(b, a % b) : Math.abs(a);
};
