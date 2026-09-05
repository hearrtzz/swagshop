import React, { useState } from 'react';
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
, ChevronUp , ChevronDown } from 'lucide-react';
import { PhotoEffectsState, EffectLayerId, DEFAULT_LAYER_ORDER } from '../types';

interface LayersPanelProps {
  state: PhotoEffectsState;
  onChange: (state: PhotoEffectsState | ((prev: PhotoEffectsState) => PhotoEffectsState)) => void;
  isOpen: boolean;
  onNavigate?: (tab: string) => void;
  onReset?: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ state, onChange, isOpen, onNavigate, onReset }) => {
  const [draggedLayerId, setDraggedLayerId] = useState<EffectLayerId | null>(null);
  
  const updateState = <K extends keyof PhotoEffectsState>(key: K, value: PhotoEffectsState[K]) => {
    onChange(prev => ({ ...prev, [key]: value }));
  };

  
  const isTimestampActive = Boolean(state.timestamp);
  const isVignetteActive = state.vignette > 0;
  const isTextureActive = state.dustScratches > 0 || state.lightLeak !== 'none';
  const isNoiseActive = state.noise > 0;
  const isFisheyeActive = state.lensDistort !== 0;
  const isGlitchActive = state.chroma > 0 || state.scanlines > 0;
  const isDatamoshActive = state.datamosh > 0;
  const isHalftoneActive = state.halftone > 0;
  const isGlowActive = state.glow > 0;
  const isThresholdActive = state.threshold > 0;
  const isGradientActive = state.gradientMode !== 'none';
  const isCurvesActive = state.curveContrast !== 0 || state.curveShadows !== 0 || state.curveHighlights !== 0 || state.curveMidtones !== 0;
  const isAsciiActive = state.ascii > 0;
  const isAsciiTextActive = state.asciiText > 0;
  const isJpegActive = state.jpeg > 0;

  const hiddenLayers = state.hiddenLayers || [];
  const currentOrder: EffectLayerId[] = (state.layerOrder && state.layerOrder.length > 0)
    ? state.layerOrder
    : DEFAULT_LAYER_ORDER;

  const toggleLayerVisibility = (id: EffectLayerId) => {
    if (hiddenLayers.includes(id)) {
      updateState('hiddenLayers', hiddenLayers.filter(l => l !== id));
    } else {
      updateState('hiddenLayers', [...hiddenLayers, id]);
    }
  };

  const layerDetails: Partial<Record<EffectLayerId, {
            label: string;
            sublabel: string;
            icon: React.ComponentType<{ className?: string }>;
            iconColor: string;
            isActive: boolean;
            valueText: string;
            onToggle: () => void;
            onGo: () => void;
          }>> = {
            timestamp: {
              label: 'Timestamp LED',
              sublabel: 'Carimbo de data/hora estilo Digicam Y2K',
              icon: Clock,
              iconColor: 'text-[#ff9500]',
              isActive: isTimestampActive,
              valueText: state.timestamp ? (state.dateText === 'DATE_NOW' ? 'Hoje' : state.dateText) : 'Inativo',
              onToggle: () => updateState('timestamp', false),
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            vignette: {
              label: 'Vinheta Analógica',
              sublabel: 'Escurecimento radial nas bordas do quadro',
              icon: Circle,
              iconColor: 'text-[#af52de]',
              isActive: isVignetteActive,
              valueText: isVignetteActive ? `${state.vignette}%` : 'Inativo',
              onToggle: () => updateState('vignette', 0),
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            texture: {
              label: 'Poeira, Riscos & Vazamento',
              sublabel: 'Partículas de filme analógico e flare óptico',
              icon: Film,
              iconColor: 'text-[#ffcc00]',
              isActive: isTextureActive,
              valueText: isTextureActive ? `Poeira: ${state.dustScratches}% | Luz: ${state.lightLeak}%` : 'Inativo',
              onToggle: () => { updateState('dustScratches', 0); updateState('lightLeak', 'none'); },
              onGo: () => { if (onNavigate) onNavigate('texture'); },
            },
            fisheye: {
              label: 'Lente Fisheye',
              sublabel: 'Distorção óptica (Olho de Peixe)',
              icon: Camera,
              iconColor: 'text-[#ff3b30]',
              isActive: isFisheyeActive,
              valueText: isFisheyeActive ? `Distorção: ${state.lensDistort}` : 'Inativo',
              onToggle: () => updateState('lensDistort', 0),
              onGo: () => { if (onNavigate) onNavigate('fx'); },
            },
            noise: {
              label: 'Granulado de Filme / Grão',
              sublabel: 'Ruído de emulsão química 35mm / 8mm',
              icon: Activity,
              iconColor: 'text-[#34c759]',
              isActive: isNoiseActive,
              valueText: isNoiseActive ? `${state.noise}%` : 'Inativo',
              onToggle: () => updateState('noise', 0),
              onGo: () => { if (onNavigate) onNavigate('texture'); },
            },
            glitch: {
              label: 'Aberração & Scanlines CRT',
              sublabel: 'Separação RGB e linhas de varredura VHS',
              icon: Zap,
              iconColor: 'text-[#5856d6]',
              isActive: isGlitchActive,
              valueText: isGlitchActive ? `Chroma: ${state.chroma}px | Scan: ${state.scanlines}%` : 'Inativo',
              onToggle: () => { updateState('chroma', 0); updateState('scanlines', 0); },
              onGo: () => { if (onNavigate) onNavigate('glitch'); },
            },
            datamosh: {
              label: 'Pixelmosh / Datamosh',
              sublabel: 'Distorção de macroblocos e pixel melt digital',
              icon: Sparkles,
              iconColor: 'text-red-400',
              isActive: isDatamoshActive,
              valueText: isDatamoshActive ? `Mosh: ${state.datamosh}% | Bloco: ${state.datamoshBlockSize}px` : 'Inativo',
              onToggle: () => updateState('datamosh', 0),
              onGo: () => { if (onNavigate) onNavigate('glitch'); },
            },
            halftone: {
              label: 'Halftone / Retícula',
              sublabel: 'Pontos de impressão analógica offset',
              icon: Grid,
              iconColor: 'text-[#00c7be]',
              isActive: isHalftoneActive,
              valueText: isHalftoneActive ? `${state.halftone}%` : 'Inativo',
              onToggle: () => updateState('halftone', 0),
              onGo: () => { if (onNavigate) onNavigate('fx'); },
            },
            ascii: {
              label: 'Arte ASCII',
              sublabel: 'Renderização em caracteres de texto',
              icon: Terminal,
              iconColor: 'text-[#007aff]',
              isActive: isAsciiActive,
              valueText: isAsciiActive ? `${state.ascii}%` : 'Inativo',
              onToggle: () => updateState('ascii', 0),
              onGo: () => { if (onNavigate) onNavigate('fx'); },
            },
            asciiText: {
              label: 'Texto em Imagem',
              sublabel: 'Imagem composta por palavras contínuas',
              icon: Terminal,
              iconColor: 'text-[#34c759]',
              isActive: isAsciiTextActive,
              valueText: isAsciiTextActive ? `${state.asciiText}%` : 'Inativo',
              onToggle: () => updateState('asciiText', 0),
              onGo: () => { if (onNavigate) onNavigate('fx'); },
            },
            threshold: {
              label: 'Limiar (Threshold)',
              sublabel: 'Ponto de corte P&B extremo',
              icon: Contrast,
              iconColor: 'text-[#64d2ff]',
              isActive: isThresholdActive,
              valueText: isThresholdActive ? `Nível: ${state.threshold}` : 'Inativo',
              onToggle: () => updateState('threshold', 0),
              onGo: () => { if (onNavigate) onNavigate('graphic'); },
            },
            glow: {
              label: 'Glow & Bloom Óptico',
              sublabel: 'Difusão luminosa especular com halo transparente',
              icon: Sun,
              iconColor: 'text-[#ff2d55]',
              isActive: isGlowActive,
              valueText: isGlowActive ? `${state.glow}%` : 'Inativo',
              onToggle: () => updateState('glow', 0),
              onGo: () => { if (onNavigate) onNavigate('fx'); },
            },
            gradient: {
              label: 'Mapeamento Gradiente',
              sublabel: 'Tonalização em dois tons de sombras e luzes',
              icon: Palette,
              iconColor: 'text-[#30b0c7]',
              isActive: isGradientActive,
              valueText: isGradientActive ? state.gradientMode.toUpperCase() : 'Inativo',
              onToggle: () => updateState('gradientMode', 'none'),
              onGo: () => { if (onNavigate) onNavigate('gradient'); },
            },
            curves: {
              label: 'Curvas Tonais & S-Curve',
              sublabel: 'Correção de faixa dinâmica e pretos foscos',
              icon: Sliders,
              iconColor: 'text-[#32ade6]',
              isActive: isCurvesActive,
              valueText: isCurvesActive ? `Contraste: ${state.curveContrast}` : 'Inativo',
              onToggle: () => { updateState('curveContrast', 0); updateState('curveShadows', 0); updateState('curveHighlights', 0); updateState('curveMidtones', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            lens: {
              label: 'Filtros & Lentes',
              sublabel: 'Presets, solarização e nitidez',
              icon: Eye,
              iconColor: 'text-[#007aff]',
              isActive: state.preset !== 'none' || state.solarize > 0 || state.invert || state.sharpness > 0,
              valueText: state.preset !== 'none' ? state.preset : (state.solarize > 0 ? 'Solarize' : 'Ativo'),
              onToggle: () => { updateState('preset', 'none'); updateState('solarize', 0); updateState('invert', false); updateState('sharpness', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            exposure: {
              label: 'Exposição',
              sublabel: 'Ajuste de ganho de luz',
              icon: Sun,
              iconColor: 'text-[#ffcc00]',
              isActive: state.exposure !== 0,
              valueText: `${state.exposure}`,
              onToggle: () => { updateState('exposure', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            brightness: {
              label: 'Brilho',
              sublabel: 'Luminância geral',
              icon: Sun,
              iconColor: 'text-[#ff9500]',
              isActive: state.brightness !== 0,
              valueText: `${state.brightness}`,
              onToggle: () => { updateState('brightness', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            contrast: {
              label: 'Contraste',
              sublabel: 'Separação de tons',
              icon: Contrast,
              iconColor: 'text-[#000000]',
              isActive: state.contrast !== 0,
              valueText: `${state.contrast}`,
              onToggle: () => { updateState('contrast', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            saturation: {
              label: 'Saturação',
              sublabel: 'Intensidade de cor',
              icon: Palette,
              iconColor: 'text-[#ff2d55]',
              isActive: state.saturation !== 0,
              valueText: `${state.saturation}`,
              onToggle: () => { updateState('saturation', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            warmth: {
              label: 'Temperatura (Warmth)',
              sublabel: 'Balanço de branco (Azul/Amarelo)',
              icon: Activity,
              iconColor: 'text-[#ff9500]',
              isActive: state.warmth !== 0,
              valueText: `${state.warmth}`,
              onToggle: () => { updateState('warmth', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            tint: {
              label: 'Tonalidade (Tint)',
              sublabel: 'Balanço de branco (Verde/Magenta)',
              icon: Activity,
              iconColor: 'text-[#ff2d55]',
              isActive: state.tint !== 0,
              valueText: `${state.tint}`,
              onToggle: () => { updateState('tint', 0); },
              onGo: () => { if (onNavigate) onNavigate('adjust'); },
            },
            jpeg: {
              label: 'Compressão JPEG',
              sublabel: 'Artefatos DCT e ringing',
              icon: Eye,
              iconColor: 'text-[#007aff]',
              isActive: state.jpeg > 0,
              valueText: `Intensidade: ${state.jpeg}`,
              onToggle: () => updateState('jpeg', 0),
              onGo: () => { if (onNavigate) onNavigate('textures'); },
            },
            cyberTrace: {
              label: 'Cyber Trace / HUD',
              sublabel: 'Rastreamento cibernético e nós conectados',
              icon: Sparkles,
              iconColor: 'text-[#22c55e]',
              isActive: state.cyberTrace > 0,
              valueText: state.cyberTrace > 0 ? `${state.cyberTrace}%` : 'Inativo',
              onToggle: () => updateState('cyberTrace', 0),
              onGo: () => { if (onNavigate) onNavigate('fx'); setTimeout(() => { document.getElementById('cyberTrace-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); },
            },
          };

  const moveLayer = (layerId: EffectLayerId, direction: 'up' | 'down') => {
    const order = [...currentOrder];
    const idx = order.indexOf(layerId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[idx];
    order[idx] = order[targetIdx];
    order[targetIdx] = temp;
    updateState('layerOrder', order);
  };

  const resetOrder = () => {
    onChange(prev => ({ ...prev, layerOrder: [...DEFAULT_LAYER_ORDER] }));
  };

  const visualLayers = currentOrder
    .map((id, executionIndex) => ({
      id,
      executionIndex,
      ...(layerDetails[id] || { label: id, sublabel: '', icon: Layers, iconColor: 'text-white', isActive: false, valueText: '', onToggle: () => {}, onGo: () => {} }),
    }))
    .filter(layer => layer.isActive)
    .reverse();

  if (!isOpen) return null;

  return (
    <div className="w-64 lg:w-80 h-full flex flex-col bg-[#1c1c1e] text-white">
      <div className="p-4 border-b border-[#3c3c3c] flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#007aff]" />
          Hierarquia de Camadas
        </h2>
      </div>

      <div className="p-4 overflow-y-auto space-y-4">
        <div className="bg-[#1c1c1e] p-3 rounded-lg border border-[#333] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Camadas ({visualLayers.length})
            </span>
          </div>
          <p className="text-[11px] text-[#999] leading-relaxed">
            A ordem altera o resultado. Use as setas <span className="text-white font-mono">▲ ▼</span> para reposicionar.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-[#2a2a2c]">
            <button
              onClick={onReset || resetOrder}
              className="w-full py-1.5 px-2.5 rounded-md bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#8e8e93] hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Remover todos os efeitos e restaurar imagem original"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resetar Imagem Original</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5" onDragOver={(e) => e.preventDefault()}>
          {visualLayers.map((layer) => {
            const IconComp = layer.icon;
            const isTopInStack = layer.executionIndex === currentOrder.length - 1;
            const isBottomInStack = layer.executionIndex === 0;
            const isHidden = hiddenLayers.includes(layer.id);

            return (
              <div
                key={layer.id}
                draggable
                onDragStart={(e) => {
                  setDraggedLayerId(layer.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedLayerId && draggedLayerId !== layer.id) {
                    const newOrder = [...currentOrder];
                    const fromIndex = newOrder.indexOf(draggedLayerId);
                    const toIndex = newOrder.indexOf(layer.id);
                    if (fromIndex !== -1 && toIndex !== -1) {
                      newOrder.splice(fromIndex, 1);
                      newOrder.splice(toIndex, 0, draggedLayerId);
                      updateState('layerOrder', newOrder);
                    }
                  }
                  setDraggedLayerId(null);
                }}
                onDragEnd={() => setDraggedLayerId(null)}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  draggedLayerId === layer.id ? 'opacity-30' : ''
                } ${
                  !isHidden
                    ? 'bg-[#252528] border-[#444] shadow-xs cursor-grab active:cursor-grabbing'
                    : 'bg-[#18181a] border-[#2a2a2c] opacity-60 cursor-grab active:cursor-grabbing'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pointer-events-none">
                  <div className="flex items-center justify-center shrink-0 text-[#555]">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    !isHidden ? 'bg-[#333]' : 'bg-[#222]'
                  } ${layer.iconColor}`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold truncate ${!isHidden ? 'text-[#eee]' : 'text-[#888]'}`}>
                        {layer.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#888] truncate">
                      {layer.valueText}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      !isHidden
                        ? 'text-[#34c759] hover:bg-[#34c759]/20'
                        : 'text-[#666] hover:bg-[#333]'
                    }`}
                    title={!isHidden ? 'Ocultar esta camada' : 'Mostrar esta camada'}
                  >
                    {!isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      if (hiddenLayers.includes(layer.id)) {
                          updateState('hiddenLayers', hiddenLayers.filter(l => l !== layer.id));
                      }
                      layer.onToggle();
                    }}
                    className="p-1.5 rounded transition-colors cursor-pointer text-[#ff453a] hover:bg-[#ff453a]/20"
                    title="Remover efeito"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex flex-col gap-0.5 ml-1 border-l border-[#333] pl-1">
                    <button
                      onClick={() => moveLayer(layer.id, 'up')}
                      disabled={isTopInStack}
                      className="p-0.5 rounded text-[#888] hover:text-white hover:bg-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveLayer(layer.id, 'down')}
                      disabled={isBottomInStack}
                      className="p-0.5 rounded text-[#888] hover:text-white hover:bg-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
