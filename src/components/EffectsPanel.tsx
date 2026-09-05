import React, { useState, useRef } from 'react';
import {
  Sliders,
  Sparkles,
  Zap,
  Palette,
  Eye,
  EyeOff,
  Film,
  RotateCcw,
  Sun,
  Camera,
  Activity,
  Maximize,
  Minimize,
  X,
  Layers,
  Check,
  ChevronRight,
  Clock,
  Circle,
  Grid,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Shuffle,
  Contrast,
  Terminal
} from 'lucide-react';
import {
  PhotoEffectsState,
  PhotoPreset,
  GradientMapMode,
  EffectLayerId,
  DEFAULT_LAYER_ORDER,
} from '../types';

interface EffectsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: PhotoEffectsState;
  onChange: React.Dispatch<React.SetStateAction<PhotoEffectsState>>;
  onReset: () => void;
  onRandomize?: () => void;
  onOpen?: () => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  isOpen,
  onClose,
  state,
  onChange,
  onReset,
  onRandomize,
  onOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'adjust' | 'glitch' | 'lenses' | 'gradient' | 'fx' | 'texture'>('presets');
  const [panelPos, setPanelPos] = useState({ x: 16, y: 48 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedLayerId, setDraggedLayerId] = useState<EffectLayerId | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({ startX: 0, startY: 0, initX: 0, initY: 0 });

  // Cache for restoring previous values when toggling layers on/off
  const cacheRef = useRef<Partial<PhotoEffectsState>>({
    vignette: 40,
    glow: 30,
    halftone: 35,
    noise: 25,
    chroma: 3,
    scanlines: 30,
    dustScratches: 30,
    lightLeak: 30,
    curveContrast: 20,
    gradientMode: 'synthwave',
  });

  if (!isOpen) return null;

  const updateState = <K extends keyof PhotoEffectsState>(key: K, value: PhotoEffectsState[K]) => {
    onChange(prev => ({ ...prev, [key]: value }));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.panel-interactive')) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: panelPos.x,
      initY: panelPos.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPanelPos({
      // initX - dx because positioning uses style.right
      x: Math.max(8, Math.min(window.innerWidth - 380, dragRef.current.initX - dx)),
      y: Math.max(40, Math.min(window.innerHeight - 100, dragRef.current.initY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  const dockToRight = () => {
    setPanelPos({ x: 16, y: 48 });
  };

  const applyPreset = (preset: PhotoPreset) => {
    if (preset === 'none') {
      onReset();
      return;
    }

    if (preset === 'digicam') {
      onChange(prev => ({
        ...prev,
        preset: 'digicam',
        brightness: 8, contrast: 22, saturation: -8, exposure: 12,
        curveShadows: -14, curveMidtones: 8, curveHighlights: 35, curveContrast: 25,
        noise: 26, jpeg: 3, pixel: 1, vignette: 30, chroma: 2, timestamp: true, dateText: "'03 09 26", glow: 15,
        gradientMode: 'none', threshold: 0
      }));
    } else if (preset === 'insta2012') {
      onChange(prev => ({
        ...prev,
        preset: 'insta2012',
        brightness: -4, contrast: 28, saturation: 24, exposure: 0,
        curveShadows: 38, curveMidtones: 12, curveHighlights: 18, curveContrast: 30,
        noise: 32, jpeg: 0, pixel: 1, vignette: 55, chroma: 1, timestamp: false, glow: 25,
        gradientMode: 'none', threshold: 0
      }));
    } else if (preset === 'disposable') {
      onChange(prev => ({
        ...prev,
        preset: 'disposable',
        brightness: 6, contrast: 18, saturation: 16, exposure: 8,
        curveShadows: 20, curveMidtones: 6, curveHighlights: 24, curveContrast: 18,
        noise: 48, jpeg: 0, pixel: 1, vignette: 42, chroma: 1, timestamp: true, dateText: "'05 12 14", glow: 18,
        gradientMode: 'none', threshold: 0
      }));
    } else if (preset === 'y2k') {
      onChange(prev => ({
        ...prev,
        preset: 'y2k',
        brightness: 12, contrast: 34, saturation: 38, exposure: 14,
        curveShadows: -10, curveMidtones: 14, curveHighlights: 40, curveContrast: 32,
        noise: 28, jpeg: 4, pixel: 2, vignette: 25, chroma: 4, timestamp: true, dateText: "'03 09 26", glow: 35,
        gradientMode: 'none', threshold: 0
      }));
    } else if (preset === 'cinematic_teal') {
      onChange(prev => ({
        ...prev,
        preset: 'cinematic_teal',
        brightness: 2, contrast: 32, saturation: 15, exposure: 6,
        curveShadows: 15, curveMidtones: 5, curveHighlights: 20, curveContrast: 28,
        vignette: 45, glow: 20, noise: 18, timestamp: false,
        gradientMode: 'none', threshold: 0
      }));
    } else if (preset === 'polaroid_vintage') {
      onChange(prev => ({
        ...prev,
        preset: 'polaroid_vintage',
        brightness: 10, contrast: 14, saturation: 8, exposure: 4,
        curveShadows: 30, curveMidtones: 8, curveHighlights: 15, curveContrast: 12,
        vignette: 35, noise: 36, dustScratches: 35, glow: 15, timestamp: false,
        gradientMode: 'none', threshold: 0
      }));
    } else if (preset === 'monochrome_noir') {
      onChange(prev => ({
        ...prev,
        preset: 'monochrome_noir',
        saturation: -100, contrast: 42, brightness: -6, exposure: 4,
        curveShadows: -20, curveMidtones: 0, curveHighlights: 40, curveContrast: 45,
        vignette: 60, noise: 40, dustScratches: 25, glow: 10, timestamp: false,
        gradientMode: 'none', threshold: 0
      }));
    } else if (preset === 'lofi_jpeg') {
      onChange(prev => ({
        ...prev,
        preset: 'lofi_jpeg',
        brightness: 0, contrast: 15, saturation: -10, exposure: 0,
        noise: 18, jpeg: 8, pixel: 3, vignette: 15, chroma: 3, timestamp: false, glow: 0,
        gradientMode: 'none', threshold: 0
      }));
    }
  };

  const TABS = [
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
          
          <div className="hidden">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded text-center transition-all ${
            activeTab === 'presets' ? 'bg-[#007aff] text-white font-medium shadow-xs' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }`}
          title="Presets Vintage & Época"
        >
          Presets
        </button>
        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded text-center transition-all ${
            activeTab === 'adjust' ? 'bg-[#007aff] text-white font-medium shadow-xs' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }`}
          title="Ajustes de Luz & Curvas"
        >
          Ajustes
        </button>
        <button
          onClick={() => setActiveTab('glitch')}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded text-center transition-all ${
            activeTab === 'glitch' ? 'bg-[#007aff] text-white font-medium shadow-xs' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }`}
          title="CRT Scanlines & Glitch"
        >
          Glitch
        </button>
        <button
          onClick={() => setActiveTab('lenses')}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded text-center transition-all ${
            activeTab === 'lenses' ? 'bg-[#007aff] text-white font-medium shadow-xs' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }`}
          title="Lentes, Fisheye & Bokeh"
        >
          Lentes
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded text-center transition-all ${
            activeTab === 'gradient' ? 'bg-[#007aff] text-white font-medium shadow-xs' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }`}
          title="Gradientes & Duotones"
        >
          Cores
        </button>
        <button
          onClick={() => setActiveTab('fx')}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded text-center transition-all ${
            activeTab === 'fx' ? 'bg-[#007aff] text-white font-medium shadow-xs' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }`}
          title="Glow, Halftone & Limiar"
        >
          FX
        </button>
        <button
          onClick={() => setActiveTab('texture')}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded text-center transition-all ${
            activeTab === 'texture' ? 'bg-[#007aff] text-white font-medium shadow-xs' : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
          }`}
          title="Texturas & Luz Vazada"
        >
          Texturas
        </button>
      </div> {/* End hidden tabs */}

      {/* Content Body */}
      <div className="p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-160px)]">
        {/* ================= TAB: PRESETS ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Estilos & Presets de Época
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'digicam', name: '📷 Digicam 2000s', desc: 'CCD Flash & tons frios' },
                { id: 'disposable', name: '🎞️ Descartável 35mm', desc: 'Saturação & granulado' },
                { id: 'y2k', name: '🌐 Cyber Y2K', desc: 'Ciano, saturação & pixel' },
                { id: 'insta2012', name: '📱 Instagram 2012', desc: 'Toaster / Hipster warm' },
                { id: 'cinematic_teal', name: '🎬 Teal & Orange', desc: 'Cinematográfico moderno' },
                { id: 'polaroid_vintage', name: '📸 Polaroid Vintage', desc: 'Cores lavadas & riscos' },
                { id: 'monochrome_noir', name: '🖤 Noir Monocromático', desc: 'Alto contraste P&B' },
                { id: 'lofi_jpeg', name: '💾 Lofi JPEG Orkut', desc: 'Artefatos 8x8 & MMS' },
              ].map((p) => {
                const isActive = state.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id as PhotoPreset)}
                    className={`p-2.5 rounded-lg text-left border transition-all ${
                      isActive
                        ? 'bg-[#007aff] border-[#007aff] text-white shadow-md'
                        : 'bg-[#1e1e1e] border-[#ffffff11] text-[#b0b0b0] hover:bg-[#3d3d3d] hover:text-white'
                    }`}
                  >
                    <div className="font-medium text-[11px] leading-tight text-white">{p.name}</div>
                    <div className={`text-[10px] mt-0.5 leading-snug ${isActive ? 'text-blue-100' : 'text-[#888]'}`}>{p.desc}</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => applyPreset('none')}
              className="w-full py-2 rounded-lg bg-[#1e1e1e] hover:bg-[#3d3d3d] border border-[#3c3c3c] text-[#888] hover:text-white transition-colors text-center text-xs font-medium"
            >
              Resetar para Cores Naturais
            </button>
          </div>
        )}

        {/* ================= TAB: AJUSTES & CURVAS ================= */}
        {activeTab === 'adjust' && (
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">Ajustes Básicos</div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Brilho</span>
                <span className="font-mono text-[#007aff]">{state.brightness}</span>
              </div>
              <input
                type="range" min="-100" max="100" value={state.brightness}
                onChange={e => updateState('brightness', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Contraste</span>
                <span className="font-mono text-[#007aff]">{state.contrast}</span>
              </div>
              <input
                type="range" min="-100" max="100" value={state.contrast}
                onChange={e => updateState('contrast', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Saturação</span>
                <span className="font-mono text-[#007aff]">{state.saturation}</span>
              </div>
              <input
                type="range" min="-100" max="100" value={state.saturation}
                onChange={e => updateState('saturation', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Exposure */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Exposição</span>
                <span className="font-mono text-[#007aff]">{state.exposure}</span>
              </div>
              <input
                type="range" min="-100" max="100" value={state.exposure}
                onChange={e => updateState('exposure', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Warmth & Tint */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Temperatura</span>
                  <span className="font-mono text-amber-400">{state.warmth}</span>
                </div>
                <input
                  type="range" min="-100" max="100" value={state.warmth}
                  onChange={e => updateState('warmth', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Matiz / Tint</span>
                  <span className="font-mono text-pink-400">{state.tint}</span>
                </div>
                <input
                  type="range" min="-100" max="100" value={state.tint}
                  onChange={e => updateState('tint', parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>

            {/* Sharpness */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Nitidez (High-Pass Unsharp Mask)</span>
                <span className="font-mono text-[#007aff]">{state.sharpness}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.sharpness}
                onChange={e => updateState('sharpness', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="pt-2 border-t border-[#3c3c3c]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#888] mb-3">
                Curvas de Tom (Tone Curves)
              </div>

              {/* Shadows Matte Lift */}
              <div className="mb-2.5">
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Sombras / Preto Fosco (Matte Lift)</span>
                  <span className="font-mono text-[#007aff]">{state.curveShadows}</span>
                </div>
                <input
                  type="range" min="-60" max="80" value={state.curveShadows}
                  onChange={e => updateState('curveShadows', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Midtones */}
              <div className="mb-2.5">
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Tons Médios</span>
                  <span className="font-mono text-[#007aff]">{state.curveMidtones}</span>
                </div>
                <input
                  type="range" min="-80" max="80" value={state.curveMidtones}
                  onChange={e => updateState('curveMidtones', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Highlights */}
              <div className="mb-2.5">
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Altas Luzes (Estouro de Flash)</span>
                  <span className="font-mono text-[#007aff]">{state.curveHighlights}</span>
                </div>
                <input
                  type="range" min="-80" max="80" value={state.curveHighlights}
                  onChange={e => updateState('curveHighlights', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* S-Curve */}
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Curva em S (Punch de Contraste)</span>
                  <span className="font-mono text-[#007aff]">{state.curveContrast}</span>
                </div>
                <input
                  type="range" min="-50" max="80" value={state.curveContrast}
                  onChange={e => updateState('curveContrast', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: GLITCH & CRT ================= */}
        {activeTab === 'glitch' && (
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Efeitos de TV CRT & Glitch Retro
            </div>

            {/* CRT Scanlines */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Linhas de Varredura (CRT Scanlines)</span>
                <span className="font-mono text-[#007aff]">{state.scanlines}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.scanlines}
                onChange={e => updateState('scanlines', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* CRT Phosphor Bloom */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Brilho Verde de Fósforo (CRT Phosphor)</span>
                <span className="font-mono text-emerald-400">{state.crtBloom}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.crtBloom}
                onChange={e => updateState('crtBloom', parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Chromatic Aberration */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Separação RGB / Aberração Cromática</span>
                <span className="font-mono text-pink-400">{state.chroma}px</span>
              </div>
              <input
                type="range" min="0" max="20" step="1" value={state.chroma}
                onChange={e => updateState('chroma', parseInt(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>

            {/* JPEG Compression */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Artefatos de Compressão JPEG 8x8 (MMS / Y2K)</span>
                <span className="font-mono text-amber-400">{state.jpeg === 0 ? 'Desligado' : `${state.jpeg}/10`}</span>
              </div>
              <input
                type="range" min="0" max="10" step="1" value={state.jpeg}
                onChange={e => updateState('jpeg', parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Pixel Art Resampling */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Pixel Art / Resolução Celular</span>
                <span className="font-mono text-[#007aff]">{state.pixel}x</span>
              </div>
              <input
                type="range" min="1" max="16" step="1" value={state.pixel}
                onChange={e => updateState('pixel', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Pixelmosh / Datamosh Video Glitch */}
            <div className="pt-3 border-t border-[#3c3c3c]/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                  Pixelmosh & Datamosh (Vídeo Glitch)
                </span>
                <button
                  onClick={() => updateState('datamoshSeed', Math.floor(Math.random() * 9999) + 1)}
                  className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-[10px] text-[#ddd] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Novo Padrão de Datamosh"
                >
                  <Shuffle className="w-3 h-3 text-red-400" />
                  <span>Novo Padrão</span>
                </button>
              </div>

              {/* Datamosh Intensity */}
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Intensidade Datamosh</span>
                  <span className="font-mono text-red-400">{state.datamosh}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={state.datamosh}
                  onChange={e => updateState('datamosh', parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Block Size */}
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Tamanho do Macrobloco</span>
                  <span className="font-mono text-[#007aff]">{state.datamoshBlockSize || 16}px</span>
                </div>
                <input
                  type="range" min="6" max="64" step="2" value={state.datamoshBlockSize || 16}
                  onChange={e => updateState('datamoshBlockSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Slices Tearing */}
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Rasgos de Fita & Slices</span>
                  <span className="font-mono text-amber-400">{state.datamoshSlices ?? 35}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={state.datamoshSlices ?? 35}
                  onChange={e => updateState('datamoshSlices', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Melt / Pixel Drift */}
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Pixel Melt / Derretimento</span>
                  <span className="font-mono text-emerald-400">{state.datamoshMelt ?? 25}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={state.datamoshMelt ?? 25}
                  onChange={e => updateState('datamoshMelt', parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: LENSES & FOCUS ================= */}
        {activeTab === 'lenses' && (
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Lentes & Distorções Ópticas
            </div>

            {/* Fisheye / Barrel Distortion */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Distorção Olho de Peixe (Fisheye Barrel)</span>
                <span className="font-mono text-[#007aff]">{state.lensDistort}</span>
              </div>
              <input
                type="range" min="-50" max="50" value={state.lensDistort}
                onChange={e => updateState('lensDistort', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-[#666] mt-0.5">
                <span>Almofada (-50)</span>
                <span>Neutro (0)</span>
                <span>Olho de Peixe (+50)</span>
              </div>
            </div>

            {/* Tilt-Shift Blur */}
            <div className="pt-2 border-t border-[#3c3c3c]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2">
                Tilt-Shift & Desfoque de Profundidade
              </div>

              <div className="mb-2.5">
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Intensidade do Desfoque Bokeh</span>
                  <span className="font-mono text-[#007aff]">{state.tiltShift}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={state.tiltShift}
                  onChange={e => updateState('tiltShift', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {state.tiltShift > 0 && (
                <div>
                  <div className="flex justify-between text-[#e0e0e0] mb-1">
                    <span>Posição do Foco Vertical</span>
                    <span className="font-mono text-[#007aff]">{state.tiltShiftFocus}%</span>
                  </div>
                  <input
                    type="range" min="10" max="90" value={state.tiltShiftFocus}
                    onChange={e => updateState('tiltShiftFocus', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Vignette */}
            <div className="pt-2 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Vinheta Escura de Borda</span>
                <span className="font-mono text-[#007aff]">{state.vignette}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.vignette}
                onChange={e => updateState('vignette', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* ================= TAB: GRADIENTES & DUOTONE ================= */}
        {activeTab === 'gradient' && (
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Mapas de Gradiente & Duotone (Photoshop)
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'none', name: 'Nenhum', colors: ['#444', '#aaa'] },
                { id: 'custom_duo', name: 'Duotone', colors: [state.duoShadow, state.duoLight] },
                { id: 'threetone', name: 'Tritone', colors: [state.duoShadow, state.duoMidtone || '#5e43a6', state.duoLight] },
                { id: 'custom_stops', name: 'Gradiente Personalizado', colors: [] },
              ].map((g) => {
                const isSelected = state.gradientMode === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => updateState('gradientMode', g.id as GradientMapMode)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? 'bg-[#007aff] border-[#007aff] text-white shadow-sm'
                        : 'bg-[#1e1e1e] border-[#ffffff11] text-[#b0b0b0] hover:bg-[#3d3d3d] hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-medium">{g.name}</span>
                    <div className="flex items-center gap-1">
                      {g.colors.length > 0 ? (
                        g.colors.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: c }} />
                        ))
                      ) : (
                        <div className="w-8 h-3.5 rounded-full border border-white/30" style={{ 
                          background: state.customGradientStops && state.customGradientStops.length > 0
                            ? `linear-gradient(to right, ${[...state.customGradientStops].sort((a,b)=>a.pos-b.pos).map(s=>`${s.color} ${s.pos}%`).join(', ')})`
                            : 'linear-gradient(to right, #000, #fff)'
                        }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {(state.gradientMode === 'custom_duo' || state.gradientMode === 'threetone') && (
              <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium">Cor das Sombras</span>
                  <input
                    type="color"
                    value={state.duoShadow}
                    onChange={e => updateState('duoShadow', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                {state.gradientMode === 'threetone' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#e0e0e0] font-medium">Cor dos Meios-tons</span>
                    <input
                      type="color"
                      value={state.duoMidtone || '#5e43a6'}
                      onChange={e => updateState('duoMidtone', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#e0e0e0] font-medium">Cor das Luzes</span>
                  <input
                    type="color"
                    value={state.duoLight}
                    onChange={e => updateState('duoLight', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            )}

            {state.gradientMode === 'custom_stops' && (
              <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] space-y-3">
                <div className="flex justify-between items-center text-[#e0e0e0] font-medium mb-2 text-xs">
                  <span>Pontos do Gradiente</span>
                  <button 
                    onClick={() => {
                      const stops = state.customGradientStops || [
                        { color: state.duoShadow, pos: 0 },
                        { color: state.duoLight, pos: 100 }
                      ];
                      if (stops.length < 10) {
                        updateState('customGradientStops', [...stops, { color: '#ff0000', pos: 50 }]);
                      }
                    }}
                    className="bg-[#3c3c3c] hover:bg-[#555] px-2 py-1 rounded text-[10px]"
                  >
                    + Adicionar
                  </button>
                </div>
                
                <div className="space-y-2">
                  {(state.customGradientStops || [
                    { color: state.duoShadow, pos: 0 },
                    { color: state.duoLight, pos: 100 }
                  ]).map((stop, index, arr) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={e => {
                          const newStops = [...arr];
                          newStops[index] = { ...stop, color: e.target.value };
                          updateState('customGradientStops', newStops);
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.pos}
                        onChange={e => {
                          const newStops = [...arr];
                          newStops[index] = { ...stop, pos: parseInt(e.target.value) };
                          updateState('customGradientStops', newStops);
                        }}
                        className="flex-1 min-w-0"
                      />
                      <span className="text-[10px] font-mono text-[#888] w-8 text-right">{stop.pos}%</span>
                      {arr.length > 2 && (
                        <button
                          onClick={() => {
                            const newStops = arr.filter((_, i) => i !== index);
                            updateState('customGradientStops', newStops);
                          }}
                          className="text-red-400 hover:text-red-300 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remover"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="h-4 rounded mt-4 border border-[#3c3c3c]" style={{
                  background: `linear-gradient(to right, ${[...(state.customGradientStops || [
                    { color: state.duoShadow, pos: 0 },
                    { color: state.duoLight, pos: 100 }
                  ])].sort((a,b) => a.pos - b.pos).map(s => `${s.color} ${s.pos}%`).join(', ')})`
                }} />
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: FX (GLOW, HALFTONE, LIMIAR) ================= */}
        {activeTab === 'fx' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Efeitos de Estilização Gráfica
            </div>

            {/* Glow / Bloom */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[#e0e0e0] mb-1">
                  <span>Glow Sonhador / Bloom Suave</span>
                  <span className="font-mono text-[#007aff]">{state.glow}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={state.glow}
                  onChange={e => updateState('glow', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              {state.glow > 0 && (
                <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-[#3c3c3c]">
                  <div>
                    <div className="text-[#888] text-[10px] mb-1">Raio (Espalhamento)</div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => updateState('glowRadius', 10)}
                        className={`flex-1 py-1 rounded text-[10px] ${state.glowRadius <= 15 ? 'bg-[#333] text-white' : 'text-[#888] hover:bg-[#2a2a2a]'}`}
                      >Hard</button>
                      <button 
                        onClick={() => updateState('glowRadius', 25)}
                        className={`flex-1 py-1 rounded text-[10px] ${state.glowRadius > 15 && state.glowRadius <= 30 ? 'bg-[#333] text-white' : 'text-[#888] hover:bg-[#2a2a2a]'}`}
                      >Medium</button>
                      <button 
                        onClick={() => updateState('glowRadius', 60)}
                        className={`flex-1 py-1 rounded text-[10px] ${state.glowRadius > 30 ? 'bg-[#333] text-white' : 'text-[#888] hover:bg-[#2a2a2a]'}`}
                      >Soft</button>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888] text-[10px] mb-1">Limiar (Threshold)</div>
                    <input
                      type="range" min="0" max="100" value={state.glowThreshold}
                      onChange={e => updateState('glowThreshold', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Photoshop Threshold */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Limiar P&B (Photoshop Threshold)</span>
                <span className="font-mono text-[#007aff]">{state.threshold === 0 ? 'Desligado' : state.threshold}</span>
              </div>
              <input
                type="range" min="0" max="255" value={state.threshold}
                onChange={e => updateState('threshold', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-[#888] mt-1">Converte a imagem em preto e branco absoluto com recorte de luminância.</p>
              
              {state.threshold > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-[#3c3c3c]">
                  <div className="flex justify-between text-[#e0e0e0] mb-1">
                    <span className="text-[11px]">Ruído Dithertone (Suavização)</span>
                    <span className="font-mono text-[#007aff] text-[11px]">{state.thresholdNoise}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={state.thresholdNoise}
                    onChange={e => updateState('thresholdNoise', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Sabattier Solarization */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Solarização Sabattier (Inversão de Prata)</span>
                <span className="font-mono text-[#007aff]">{state.solarize}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.solarize}
                onChange={e => updateState('solarize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

                        {/* Halftone */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Halftone Reticulado (Pop-Art)</span>
                <span className="font-mono text-[#007aff]">{state.halftone === 0 ? 'Desligado' : `${state.halftone}px`}</span>
              </div>
              <input
                type="range" min="0" max="24" step="1" value={state.halftone}
                onChange={e => updateState('halftone', parseInt(e.target.value))}
                className="w-full"
              />

              {state.halftone > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateState('halftoneMode', 'bw')}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      state.halftoneMode === 'bw'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }`}
                  >
                    P&B
                  </button>
                  <button
                    onClick={() => updateState('halftoneMode', 'color')}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      state.halftoneMode === 'color'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }`}
                  >
                    Colorido
                  </button>
                  <button
                    onClick={() => updateState('halftoneMode', 'overlay')}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      state.halftoneMode === 'overlay'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                </div>
              )}
            </div>

            {/* Cyber Trace / HUD */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Cyber Trace (Nós e Conexões)</span>
                <span className="font-mono text-[#007aff]">{state.cyberTrace}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.cyberTrace}
                onChange={e => updateState('cyberTrace', parseInt(e.target.value))}
                className="w-full"
              />

              {state.cyberTrace > 0 && (
                <div className="mt-2 space-y-2 p-2 bg-[#1e1e1e] rounded-lg border border-[#3c3c3c]">
                  {/* Density */}
                  <div>
                    <div className="flex justify-between text-[#e0e0e0] text-[10px] mb-1">
                      <span>Densidade da Rede</span>
                      <span className="font-mono text-[#007aff]">{state.cyberTraceDensity}</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={state.cyberTraceDensity}
                      onChange={e => updateState('cyberTraceDensity', parseInt(e.target.value))}
                      className="w-full h-1"
                    />
                  </div>
                  
                  {/* Threshold */}
                  <div>
                    <div className="flex justify-between text-[#e0e0e0] text-[10px] mb-1">
                      <span>Threshold (Limiar de Escuridão)</span>
                      <span className="font-mono text-[#007aff]">{state.cyberTraceThreshold}</span>
                    </div>
                    <input
                      type="range" min="0" max="255" value={state.cyberTraceThreshold}
                      onChange={e => updateState('cyberTraceThreshold', parseInt(e.target.value))}
                      className="w-full h-1"
                    />
                  </div>

                  {/* Tamanho dos Quadrados */}
                  <div>
                    <div className="flex justify-between text-[#e0e0e0] text-[10px] mb-1">
                      <span>Tamanho dos Quadrados</span>
                      <span className="font-mono text-[#007aff]">{state.cyberTraceBoxSize ?? 40}%</span>
                    </div>
                    <input
                      type="range" min="10" max="150" value={state.cyberTraceBoxSize ?? 40}
                      onChange={e => updateState('cyberTraceBoxSize', parseInt(e.target.value))}
                      className="w-full h-1"
                    />
                  </div>

                  {/* Mode */}
                  <div className="flex gap-1">
                    {['straight', 'orthogonal', 'curve'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => updateState('cyberTraceMode', mode as any)}
                        className={`flex-1 py-1 rounded border text-[9px] font-medium transition-all ${
                          state.cyberTraceMode === mode
                            ? 'bg-[#007aff] border-[#007aff] text-white'
                            : 'bg-[#1a1a1a] border-[#3c3c3c] text-[#888] hover:text-white'
                        }`}
                      >
                        {mode === 'straight' ? 'Reto' : mode === 'orthogonal' ? 'Zigzag' : 'Curvo'}
                      </button>
                    ))}
                  </div>
                  
                  {/* Color Selector */}
                  <div className="flex gap-1 justify-between pt-1">
                     {['#22c55e', '#ef4444', '#38bdf8', '#ffa200', '#ffffff', '#a855f7'].map(color => (
                        <button
                          key={color}
                          onClick={() => updateState('cyberTraceColor', color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${state.cyberTraceColor === color ? 'scale-110 border-white' : 'border-transparent hover:scale-110'}`}
                          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}66` }}
                          title={color}
                        />
                     ))}
                  </div>
                </div>
              )}
            </div>
{/* ASCII */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Arte ASCII (Terminal Retro)</span>
                <span className="font-mono text-[#007aff]">{state.ascii === 0 ? 'Desligado' : `${state.ascii}%`}</span>
              </div>
              <input
                type="range" min="0" max="100" step="1" value={state.ascii}
                onChange={e => updateState('ascii', parseInt(e.target.value))}
                className="w-full"
              />

              {state.ascii > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateState('asciiMode', 'bw')}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      state.asciiMode === 'bw'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }`}
                  >
                    P&B
                  </button>
                  <button
                    onClick={() => updateState('asciiMode', 'green')}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      state.asciiMode === 'green'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }`}
                  >
                    Matrix
                  </button>
                  <button
                    onClick={() => updateState('asciiMode', 'color')}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      state.asciiMode === 'color'
                        ? 'bg-[#007aff] border-[#007aff] text-white'
                        : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                </div>
              )}
            </div>

            {/* ASCII TEXT */}
            <div className="pt-3 border-t border-[#3c3c3c]">
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Texto de Imagem ASCII</span>
                <span className="font-mono text-[#007aff]">{state.asciiText === 0 ? 'Desligado' : `${state.asciiText}%`}</span>
              </div>
              <input
                type="range" min="0" max="100" step="1" value={state.asciiText}
                onChange={e => updateState('asciiText', parseInt(e.target.value))}
                className="w-full"
              />

              {state.asciiText > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateState('asciiTextRandom', false)}
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                        !state.asciiTextRandom
                          ? 'bg-[#007aff] border-[#007aff] text-white'
                          : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                      }`}
                    >
                      Texto Fixo
                    </button>
                    <button
                      onClick={() => updateState('asciiTextRandom', true)}
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                        state.asciiTextRandom
                          ? 'bg-[#007aff] border-[#007aff] text-white'
                          : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#888] hover:text-white'
                      }`}
                    >
                      Caos Aleatório
                    </button>
                  </div>
                  {!state.asciiTextRandom && (
                    <input
                      type="text"
                      value={state.asciiTextString || 'Hello World. '}
                      onChange={e => updateState('asciiTextString', e.target.value)}
                      placeholder="Texto para renderizar a imagem..."
                      className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1.5 text-xs text-[#e0e0e0] focus:border-[#007aff] focus:outline-none"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: TEXTURAS VINTAGE ================= */}
        {activeTab === 'texture' && (
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              Texturas Analógicas & Imperfeições
            </div>

            {/* Film Grain */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Granulado Analógico (Film Grain)</span>
                <span className="font-mono text-[#007aff]">{state.noise}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.noise}
                onChange={e => updateState('noise', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Light Leaks */}
            <div>
              <div className="text-[#e0e0e0] font-medium mb-1.5">Vazamento de Luz (Light Leak)</div>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { id: 'none', label: 'Nenhum' },
                  { id: 'sunburst', label: '☀️ Sunburst' },
                  { id: 'prism', label: '🌈 Prisma' },
                  { id: 'golden', label: '🌅 Dourado' },
                  { id: 'neon', label: '⚡ Neon' },
                ].map((leak) => (
                  <button
                    key={leak.id}
                    onClick={() => updateState('lightLeak', leak.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
                      state.lightLeak === leak.id
                        ? 'bg-[#007aff] border-[#007aff] text-white shadow-sm'
                        : 'bg-[#1e1e1e] border-[#ffffff11] text-[#888] hover:bg-[#3d3d3d] hover:text-white'
                    }`}
                  >
                    {leak.label}
                  </button>
                ))}
              </div>

              {state.lightLeak !== 'none' && (
                <div>
                  <div className="flex justify-between text-[#e0e0e0] mb-1 text-[11px]">
                    <span>Intensidade do Queimado</span>
                    <span className="font-mono text-[#007aff]">{state.lightLeakIntensity}%</span>
                  </div>
                  <input
                    type="range" min="10" max="100" value={state.lightLeakIntensity}
                    onChange={e => updateState('lightLeakIntensity', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Dust & Scratches */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Poeira & Riscos de Película (Film Dust)</span>
                <span className="font-mono text-[#007aff]">{state.dustScratches}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={state.dustScratches}
                onChange={e => updateState('dustScratches', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* JPEG Compression Artifacts */}
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1">
                <span>Compressão JPEG (Datamosh & Ringing)</span>
                <span className="font-mono text-[#007aff]">{state.jpeg}/10</span>
              </div>
              <input
                type="range" min="0" max="10" step="1" value={state.jpeg}
                onChange={e => updateState('jpeg', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Timestamp LED */}
            <div className="pt-2 border-t border-[#3c3c3c]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#e0e0e0] font-medium">Carimbo de Data LED Câmera</span>
                <input
                  type="checkbox"
                  checked={state.timestamp}
                  onChange={e => updateState('timestamp', e.target.checked)}
                  className="w-4 h-4 accent-[#007aff] rounded cursor-pointer"
                />
              </div>

              {state.timestamp && (
                <div className="space-y-2 p-2.5 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c]">
                  <div>
                    <label className="text-[11px] text-[#888] block mb-1">Texto da Data:</label>
                    <select
                      value={state.dateText}
                      onChange={e => updateState('dateText', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#2d2d2d] border border-[#3c3c3c] text-white text-xs font-mono"
                    >
                      <option value="'03 09 26">'03 09 26 (Sony Cybershot 2003)</option>
                      <option value="'05 12 14">'05 12 14 (Descartável Anos 2000s)</option>
                      <option value="'12 04 20">'12 04 20 (Época Tumblr 2012)</option>
                      <option value="DATE_NOW">Data Atual do Dispositivo</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#888]">Cor do Dígito:</span>
                    <div className="flex gap-1.5">
                      {[
                        { color: '#ffa200', label: 'Laranja' },
                        { color: '#22c55e', label: 'Verde' },
                        { color: '#ef4444', label: 'Vermelho' },
                        { color: '#38bdf8', label: 'Ciano' },
                      ].map(c => (
                        <button
                          key={c.color}
                          onClick={() => updateState('timestampColor', c.color as any)}
                          className={`w-5 h-5 rounded-full border ${state.timestampColor === c.color ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-60'}`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-[#007aff] text-white shadow-md' 
                  : 'text-[#888] hover:text-white hover:bg-[#3d3d3d]/50'
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
