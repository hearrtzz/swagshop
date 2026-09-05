import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  RotateCw,
  FlipHorizontal,
  Sliders,
  Sparkles,
  Download
} from 'lucide-react';
import { CanvasConfig, PhotoEffectsState, ImageTransform } from '../types';
import { renderProcessedImageWebGL } from '../utils/webglProcessing';

interface CanvasWorkspaceProps {
  canvasConfig: CanvasConfig;
  effectsState: PhotoEffectsState;
  image: HTMLImageElement | null;
  transform: ImageTransform;
  setTransform: React.Dispatch<React.SetStateAction<ImageTransform>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onUploadImage: (file: File) => void;
  onOpenNewCanvasModal: () => void;
  onOpenExportModal: () => void;
  onToggleEffectsPanel: () => void;
  isEffectsPanelOpen: boolean;
  onLoadDemo: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onChangeBackgroundType?: (bg: 'transparent' | 'dark' | 'white') => void;
  onRandomize?: () => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  canvasConfig,
  effectsState,
  image,
  transform,
  setTransform,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  onUploadImage,
  onOpenNewCanvasModal,
  onOpenExportModal,
  onToggleEffectsPanel,
  isEffectsPanelOpen,
  onLoadDemo,
  canvasRef,
  onChangeBackgroundType,
  onRandomize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const renderRequestId = useRef<number | null>(null);

  // Re-render processed canvas whenever canvas dimensions, image, transform, or effects change
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fast preview optimization for large images (e.g. 4K camera uploads)
    // We limit the internal rendering resolution to ~1.5 Megapixels during live editing
    const MAX_PREVIEW_PIXELS = 1440 * 1080; 
    const totalPixels = canvasConfig.width * canvasConfig.height;
    
    let w = canvasConfig.width;
    let h = canvasConfig.height;
    
    if (totalPixels > MAX_PREVIEW_PIXELS) {
      const scaleDown = Math.sqrt(MAX_PREVIEW_PIXELS / totalPixels);
      w = Math.round(canvasConfig.width * scaleDown);
      h = Math.round(canvasConfig.height * scaleDown);
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Canvas Background
    if (canvasConfig.backgroundType === 'dark') {
      ctx.fillStyle = '#0b0c0e';
      ctx.fillRect(0, 0, w, h);
    } else if (canvasConfig.backgroundType === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else if (canvasConfig.backgroundType === 'color') {
      ctx.fillStyle = canvasConfig.customBgColor || '#121316';
      ctx.fillRect(0, 0, w, h);
    } // If 'transparent', leave clear (alpha = 0)

    // 2. If Image is loaded, render transformed image with effects
    if (image) {
      // Create offscreen buffer for image transform
      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const offCtx = offscreen.getContext('2d');

      if (offCtx) {
        offCtx.save();
        offCtx.translate(w / 2 + transform.x * (w / canvasConfig.width), h / 2 + transform.y * (h / canvasConfig.height));
        offCtx.rotate((transform.rotation * Math.PI) / 180);
        offCtx.scale(
          transform.scale * (transform.flipH ? -1 : 1),
          transform.scale * (transform.flipV ? -1 : 1)
        );

        const iw = image.naturalWidth || image.width || w;
        const ih = image.naturalHeight || image.height || h;

        // Base fit calculation: fit inside canvas by default
        const ratio = Math.min(w / iw, h / ih);
        const drawW = iw * ratio;
        const drawH = ih * ratio;

        offCtx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
        offCtx.restore();

        // Now run effects pipeline on the transformed buffer
        const effectCanvas = document.createElement('canvas');
        const hasTransparency = canvasConfig.backgroundType === 'transparent';
        renderProcessedImageWebGL(offscreen, effectCanvas, effectsState, w, h, hasTransparency);

        // Draw processed result onto main artboard
        ctx.drawImage(effectCanvas, 0, 0);
      }
    }
  }, [canvasConfig, image, transform, effectsState, canvasRef]);

  useEffect(() => {
    if (renderRequestId.current) {
      clearTimeout(renderRequestId.current);
    }
    renderRequestId.current = window.setTimeout(() => {
      renderCanvas();
      renderRequestId.current = null;
    }, 45); // ~22fps limit gives the main thread time to update sliders smoothly
    
    return () => {
      if (renderRequestId.current) {
        clearTimeout(renderRequestId.current);
      }
    };
  }, [renderCanvas]);

  // Handle Pan Drag
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only pan if clicking middle mouse button, or holding space, or clicking on background
    if (e.button === 1 || e.altKey || (e.target as HTMLElement) === containerRef.current) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((z) => Math.min(3.0, Math.max(0.15, z * zoomFactor)));
    } else {
      // Pan with scroll
      setPanOffset((p) => ({
        x: p.x - e.deltaX * 0.8,
        y: p.y - e.deltaY * 0.8,
      }));
    }
  };

  // Drag & Drop image files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadImage(e.dataTransfer.files[0]);
    }
  };

  // Fit Canvas to screen initially or on demand
  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const availableW = rect.width - 80;
    const availableH = rect.height - 80;
    const scaleW = availableW / canvasConfig.width;
    const scaleH = availableH / canvasConfig.height;
    const bestFit = Math.min(scaleW, scaleH, 1.0);
    setZoom(Math.max(0.2, bestFit));
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      id="canvas-workspace"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full overflow-hidden bg-[#121212] flex items-center justify-center cursor-default ${
        isPanning ? 'cursor-grabbing' : ''
      }`}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #333333 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Floating Canvas Top Background Selector (Only Background Option) */}
      {onChangeBackgroundType && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-[#252525]/90 backdrop-blur-md border border-[#3c3c3c] px-3 py-1.5 rounded-lg shadow-lg text-xs">
          <span className="text-[#888] font-medium mr-1">Fundo:</span>
          <button
            onClick={() => onChangeBackgroundType('transparent')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              canvasConfig.backgroundType === 'transparent'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'text-[#aaa] hover:text-white bg-[#333]'
            }`}
          >
            Transparente
          </button>
          <button
            onClick={() => onChangeBackgroundType('dark')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              canvasConfig.backgroundType === 'dark'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'text-[#aaa] hover:text-white bg-[#333]'
            }`}
          >
            Preto
          </button>
          <button
            onClick={() => onChangeBackgroundType('white')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              canvasConfig.backgroundType === 'white'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'text-[#aaa] hover:text-white bg-[#333]'
            }`}
          >
            Branco
          </button>
        </div>
      )}

      {/* If No Image is Loaded: Show Prompt Symbol to Import Photo */}
      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative z-10 flex flex-col items-center justify-center p-10 max-w-md w-full mx-4 rounded-2xl border-2 border-dashed transition-all ${
            isDragOver
              ? 'border-[#007aff] bg-[#007aff]/15 scale-102'
              : 'border-[#3c3c3c] hover:border-[#555] bg-[#1a1a1a]/90 backdrop-blur-md shadow-2xl'
          }`}
        >
          <div className="w-20 h-20 mb-5 rounded-2xl bg-[#007aff]/15 border border-[#007aff]/30 flex items-center justify-center text-[#007aff] shadow-xl">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1.5 tracking-tight">
            Importe Sua Foto
          </h2>
          <p className="text-xs text-[#8e8e93] text-center leading-relaxed mb-6 max-w-xs">
            Arraste sua foto para cá ou clique abaixo. A resolução do canvas será automaticamente ajustada ao tamanho original da sua foto.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <label
              htmlFor="file-upload-input"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#007aff] hover:bg-[#006ee6] text-white text-xs font-bold text-center cursor-pointer shadow-lg shadow-[#007aff40] transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Escolher Foto...</span>
            </label>
            <button
              onClick={onLoadDemo}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333] border border-[#3c3c3c] text-[#e0e0e0] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Exemplo Demo</span>
            </button>
          </div>
          <span className="text-[11px] text-[#666] mt-4 font-mono">PNG, JPG, WEBP, SVG suportados</span>
        </div>
      ) : (
        /* Canvas Artboard with Imported Photo's Resolution */
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            width: `${canvasConfig.width}px`,
            height: `${canvasConfig.height}px`,
            transition: isPanning ? 'none' : 'transform 0.05s ease-out',
          }}
          className={`relative shrink-0 select-none shadow-[0_25px_80px_rgba(0,0,0,0.85)] border border-[#3c3c3c] rounded-xs ${
            canvasConfig.backgroundType === 'transparent' ? 'bg-checkered' : ''
          }`}
        >
          {/* Rendered Canvas Element */}
          <canvas
            ref={canvasRef as React.RefObject<HTMLCanvasElement>}
            id="main-photo-canvas"
            className="w-full h-full block"
          />

          {/* Drag Over Visual Indicator */}
          {isDragOver && (
            <div className="absolute inset-0 bg-[#007aff]/20 border-2 border-[#007aff] border-dashed rounded-xs flex items-center justify-center backdrop-blur-xs z-30">
              <span className="text-white font-bold text-sm bg-black/80 px-4 py-2 rounded-lg border border-[#3c3c3c]">
                Solte a imagem para substituir no Canvas
              </span>
            </div>
          )}
        </div>
      )}

      {/* Floating Canvas Quick Dock */}
      <div className="absolute bottom-5 z-30 flex items-center gap-1.5 p-1.5 bg-[#252525] border border-[#3c3c3c] rounded-xl shadow-2xl">
        <label
          htmlFor="file-upload-input"
          className="p-2 rounded-lg text-[#b0b0b0] hover:text-white hover:bg-[#3d3d3d] transition-colors cursor-pointer"
          title="Importar Outra Foto"
        >
          <Upload className="w-4 h-4 text-[#007aff]" />
        </label>
        <div className="w-[1px] h-4 bg-[#3c3c3c] mx-0.5" />
        <button
          onClick={() => setZoom(z => Math.min(3.0, z + 0.15))}
          className="p-2 rounded-lg text-[#b0b0b0] hover:text-white hover:bg-[#3d3d3d] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.15, z - 0.15))}
          className="p-2 rounded-lg text-[#b0b0b0] hover:text-white hover:bg-[#3d3d3d] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="p-2 rounded-lg text-[#b0b0b0] hover:text-white hover:bg-[#3d3d3d] transition-colors"
          title="Ajustar à Tela"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#3c3c3c] mx-0.5" />
        <button
          onClick={() => setTransform(t => ({ ...t, rotation: (t.rotation + 90) % 360 }))}
          className="p-2 rounded-lg text-[#b0b0b0] hover:text-white hover:bg-[#3d3d3d] transition-colors"
          title="Girar Imagem 90°"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTransform(t => ({ ...t, flipH: !t.flipH }))}
          className="p-2 rounded-lg text-[#b0b0b0] hover:text-white hover:bg-[#3d3d3d] transition-colors"
          title="Espelhar Horizontal"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#3c3c3c] mx-0.5" />
        {onRandomize && (
          <button
            onClick={onRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-amber-500/40 text-amber-400 hover:text-amber-300 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Randomizar Efeitos Criativos"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Randomizar</span>
          </button>
        )}
        <button
          onClick={onToggleEffectsPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isEffectsPanelOpen
              ? 'bg-[#007aff] border-[#007aff] text-white shadow-xs'
              : 'bg-[#2d2d2d] border-[#3c3c3c] text-[#b0b0b0] hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Efeitos</span>
        </button>
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#007aff] hover:bg-[#006ee6] text-white text-xs font-semibold shadow-lg shadow-[#007aff33] transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        id="file-upload-input"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUploadImage(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
    </div>
  );
};
