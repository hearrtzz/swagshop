import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FolderOpen,
  FilePlus,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Sparkles,
  Layers,
  Copy,
  Check,
  Eye,
  Info,
  Box,
  X
} from 'lucide-react';
import { StudioMode, CanvasConfig, PhotoEffectsState } from '../types';

interface MacMenuBarProps {
  mode: StudioMode;
  setMode: (mode: StudioMode) => void;
  canvasConfig: CanvasConfig;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  resetZoom: () => void;
  onOpenNewCanvasModal: () => void;
  onOpenExportModal: () => void;
  onUploadClick: () => void;
  onCloseImage: () => void;
  onResetEffects: () => void;
  onRotateImage: (deg: number) => void;
  onFlipImage: (axis: 'h' | 'v') => void;
  onFitImage: (mode: 'fit' | 'fill' | 'center') => void;
  onCopyCanvas: () => void;
  onLoadDemo: () => void;
  onRandomize: () => void;
  effectsState: PhotoEffectsState;
  setEffectsState: React.Dispatch<React.SetStateAction<PhotoEffectsState>>;
  isEffectsPanelOpen: boolean;
  setIsEffectsPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const MacMenuBar: React.FC<MacMenuBarProps> = ({
  mode,
  setMode,
  canvasConfig,
  zoom,
  setZoom,
  resetZoom,
  onOpenNewCanvasModal,
  onOpenExportModal,
  onUploadClick,
  onCloseImage,
  onResetEffects,
  onRotateImage,
  onFlipImage,
  onFitImage,
  onCopyCanvas,
  onLoadDemo,
  onRandomize,
  setEffectsState,
  isEffectsPanelOpen,
  setIsEffectsPanelOpen,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const handleCopyClick = () => {
    onCopyCanvas();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    setActiveMenu(null);
  };

  return (
    <header
      ref={menuBarRef}
      id="mac-menu-bar"
      className="relative z-50 flex items-center justify-between h-10 px-4 bg-[#2d2d2d] border-b border-[#3c3c3c] text-[13px] font-medium text-[#b0b0b0] select-none shrink-0"
    >
      {/* Left Menu Items */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Swagshop Brand */}
        <div className="flex items-center gap-2 cursor-default text-white shrink-0">
          <Layers size={15} />
          <span className="font-semibold tracking-wide">swagshop</span>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex items-center gap-2 md:gap-4 text-[13px] text-[#b0b0b0] shrink-0">
          {/* Arquivo (File) Menu */}
          <div className="relative">
            <button
              id="menu-file-btn"
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2 py-1 rounded transition-colors ${activeMenu === 'file' ? 'bg-[#3d3d3d] text-white' : 'hover:text-white hover:bg-[#3d3d3d]'}`}
            >
              Arquivo
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-8 w-56 py-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg shadow-2xl z-50 overflow-hidden text-[12px]">
                <button
                  onClick={() => { onUploadClick(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between text-[#e0e0e0]"
                >
                  <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Abrir Imagem...</span>
                  <span className="text-[10px] text-[#888]">⌘O</span>
                </button>
                <button
                  onClick={() => { onCloseImage(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-500 hover:text-white flex items-center justify-between text-red-400 font-medium"
                >
                  <span className="flex items-center gap-2"><X className="w-3.5 h-3.5" /> Fechar Imagem...</span>
                </button>
                <div className="my-1 border-t border-[#3c3c3c]" />
                <button
                  onClick={() => { onOpenExportModal(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between font-medium text-[#007aff]"
                >
                  <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Exportar</span>
                  <span className="text-[10px] text-[#888]">⌘E</span>
                </button>
                <button
                  onClick={handleCopyClick}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between text-[#e0e0e0]"
                >
                  <span className="flex items-center gap-2"><Copy className="w-3.5 h-3.5" /> Copiar para Área de Transf.</span>
                  <span className="text-[10px] text-[#888]">⌘C</span>
                </button>
              </div>
            )}
          </div>

          {/* Editar (Edit) Menu */}
          <div className="relative">
            <button
              id="menu-edit-btn"
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={`px-2 py-1 rounded transition-colors ${activeMenu === 'edit' ? 'bg-[#3d3d3d] text-white' : 'hover:text-white hover:bg-[#3d3d3d]'}`}
            >
              Editar
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 top-8 w-56 py-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg shadow-2xl z-50 overflow-hidden text-[12px]">
                <button
                  onClick={() => { onResetEffects(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between text-[#e0e0e0]"
                >
                  <span className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Resetar Efeitos</span>
                  <span className="text-[10px] text-[#888]">⌥⌘R</span>
                </button>
                <div className="my-1 border-t border-[#3c3c3c]" />
                <button
                  onClick={() => { onFitImage('fit'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[#e0e0e0]"
                >
                  Ajustar ao Canvas (Conter)
                </button>
                <button
                  onClick={() => { onFitImage('fill'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[#e0e0e0]"
                >
                  Preencher Canvas (Cortar)
                </button>
                <button
                  onClick={() => { onFitImage('center'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[#e0e0e0]"
                >
                  Centralizar Imagem (100%)
                </button>
              </div>
            )}
          </div>

          {/* Imagem (Image) Menu */}
          <div className="relative">
            <button
              id="menu-image-btn"
              onClick={() => setActiveMenu(activeMenu === 'image' ? null : 'image')}
              className={`px-2 py-1 rounded transition-colors ${activeMenu === 'image' ? 'bg-[#3d3d3d] text-white' : 'hover:text-white hover:bg-[#3d3d3d]'}`}
            >
              Imagem
            </button>
            {activeMenu === 'image' && (
              <div className="absolute left-0 top-8 w-60 py-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg shadow-2xl z-50 overflow-hidden text-[12px]">
                <button
                  onClick={() => { onRotateImage(90); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-[#e0e0e0]"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Girar 90° no Sentido Horário
                </button>
                <button
                  onClick={() => { onRotateImage(-90); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-[#e0e0e0]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Girar 90° Anti-horário
                </button>
                <button
                  onClick={() => { onFlipImage('h'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-[#e0e0e0]"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" /> Espelhar Horizontalmente
                </button>
                <button
                  onClick={() => { onFlipImage('v'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-[#e0e0e0]"
                >
                  <FlipVertical className="w-3.5 h-3.5" /> Espelhar Verticalmente
                </button>
                <div className="my-1 border-t border-[#3c3c3c]" />
                <button
                  onClick={() => {
                    setEffectsState(prev => ({ ...prev, invert: !prev.invert }));
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between text-[#e0e0e0]"
                >
                  <span>Inverter Negativo</span>
                  <span className="text-[10px] text-[#888]">⌘I</span>
                </button>
                <button
                  onClick={() => {
                    setEffectsState(prev => ({ ...prev, contrast: 25, brightness: 5 }));
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[#e0e0e0]"
                >
                  Auto-Contraste & Níveis
                </button>
                <button
                  onClick={() => {
                    setEffectsState(prev => ({ ...prev, saturation: -100 }));
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[#e0e0e0]"
                >
                  Dessaturar (Preto & Branco)
                </button>
              </div>
            )}
          </div>


          {/* Visualizar (View) Menu */}
          <div className="relative">
            <button
              id="menu-view-btn"
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className={`px-2 py-1 rounded transition-colors ${activeMenu === 'view' ? 'bg-[#3d3d3d] text-white' : 'hover:text-white hover:bg-[#3d3d3d]'}`}
            >
              Visualizar
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 top-8 w-56 py-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg shadow-2xl z-50 overflow-hidden text-[12px]">
                <button
                  onClick={() => { setZoom(z => Math.min(3, z + 0.15)); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between text-[#e0e0e0]"
                >
                  <span className="flex items-center gap-2"><ZoomIn className="w-3.5 h-3.5" /> Mais Zoom</span>
                  <span className="text-[10px] text-[#888]">⌘+</span>
                </button>
                <button
                  onClick={() => { setZoom(z => Math.max(0.15, z - 0.15)); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between text-[#e0e0e0]"
                >
                  <span className="flex items-center gap-2"><ZoomOut className="w-3.5 h-3.5" /> Menos Zoom</span>
                  <span className="text-[10px] text-[#888]">⌘-</span>
                </button>
                <button
                  onClick={() => { resetZoom(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center justify-between text-[#e0e0e0]"
                >
                  <span className="flex items-center gap-2"><Maximize2 className="w-3.5 h-3.5" /> Ajustar à Tela</span>
                  <span className="text-[10px] text-[#888]">⌘0</span>
                </button>
                <div className="my-1 border-t border-[#3c3c3c]" />
                <button
                  onClick={() => { setIsEffectsPanelOpen(prev => !prev); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-[#e0e0e0]"
                >
                  <Sliders className="w-3.5 h-3.5" /> {isEffectsPanelOpen ? 'Ocultar Painel de Efeitos' : 'Mostrar Painel de Efeitos'}
                </button>
              </div>
            )}
          </div>

          {/* Janela (Window) Menu */}
          <div className="relative">
            <button
              id="menu-window-btn"
              onClick={() => setActiveMenu(activeMenu === 'window' ? null : 'window')}
              className={`px-2 py-1 rounded transition-colors ${activeMenu === 'window' ? 'bg-[#3d3d3d] text-white' : 'hover:text-white hover:bg-[#3d3d3d]'}`}
            >
              Janela
            </button>
            {activeMenu === 'window' && (
              <div className="absolute left-0 top-8 w-56 py-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg shadow-2xl z-50 overflow-hidden text-[12px]">
                <button
                  onClick={() => { setIsEffectsPanelOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-[#e0e0e0]"
                >
                  <Eye className="w-3.5 h-3.5" /> Abrir Painel de Efeitos
                </button>
                <button
                  onClick={() => { onRandomize(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-amber-400 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Randomizar Efeitos
                </button>
                <div className="my-1 border-t border-[#3c3c3c]" />
                <button
                  onClick={() => { resetZoom(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#007aff] hover:text-white flex items-center gap-2 text-[#e0e0e0]"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Resetar Zoom (100%)
                </button>
              </div>
            )}
          </div>

          {/* Export Group */}
          <div className="relative group">
            <button
              onClick={onOpenExportModal}
              className="text-[#007aff] cursor-pointer font-bold hover:text-[#38bdf8] px-2 py-1 rounded transition-colors"
            >
              Exportar
            </button>
            <div className="hidden group-hover:block absolute top-7 left-0 w-48 bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg shadow-2xl py-1 z-50 overflow-hidden">
              <div
                onClick={onOpenExportModal}
                className="px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[12px] text-[#e0e0e0] cursor-pointer"
              >
                Exportar como PNG...
              </div>
              <div
                onClick={onOpenExportModal}
                className="px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[12px] text-[#e0e0e0] cursor-pointer"
              >
                Exportar como JPG...
              </div>
              <div
                onClick={onOpenExportModal}
                className="px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[12px] text-[#e0e0e0] cursor-pointer"
              >
                Exportar como WEBP...
              </div>
              <div className="h-[1px] bg-[#3c3c3c] my-1" />
              <div
                onClick={handleCopyClick}
                className="px-3 py-1.5 hover:bg-[#007aff] hover:text-white text-[12px] text-[#888] cursor-pointer"
              >
                Copiar para Área de Transf.
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Right Menu Info & High-Density Stats */}
      <div className="flex items-center gap-3">
        {copiedNotification && (
          <span className="flex items-center gap-1 text-[11px] text-[#28c940] bg-[#252525] border border-[#28c940]/40 px-2 py-0.5 rounded">
            <Check className="w-3 h-3" /> Imagem copiada!
          </span>
        )}

        {/* View Percentage */}
        <span className="text-[#007aff] font-medium text-[12px]">{Math.round(zoom * 100)}% View</span>

        {/* 3D/CARTOON Button */}
        <button
          onClick={() => { window.location.href = './3d-studio.html'; }}
          title="Entrar no Estúdio 3D e Cartoon"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 border border-fuchsia-500 text-white rounded text-[12px] font-bold shadow-lg shadow-fuchsia-500/20 transition-all cursor-pointer"
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D/CARTOON</span>
        </button>

        {/* Randomize Button */}
        <button
          onClick={onRandomize}
          title="Randomizar efeitos aplicados à imagem"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#252525] hover:bg-[#333] border border-amber-500/40 hover:border-amber-400 text-amber-400 hover:text-amber-300 rounded text-[12px] font-semibold transition-all shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Randomizar</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onCloseImage}
          title="Fechar imagem atual"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 hover:border-red-500 text-red-500 rounded text-[12px] font-semibold transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Fechar</span>
        </button>
      </div>
    </header>
  );
};
