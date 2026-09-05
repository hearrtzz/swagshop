import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StudioMode,
  CanvasConfig,
  PhotoEffectsState,
  ImageTransform,
  DEFAULT_PHOTO_EFFECTS,
} from './types';
import { MacMenuBar } from './components/MacMenuBar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { EffectsPanel } from './components/EffectsPanel';
import { NewCanvasModal } from './components/NewCanvasModal';
import { ExportModal } from './components/ExportModal';
import { renderProcessedImageWebGL } from './utils/webglProcessing';
import { getRandomEffects } from './utils/randomEffects';

export default function App() {
  const [mode, setMode] = useState<StudioMode>('canvas');

  // Canvas Configuration - dynamic resolution based on uploaded photo
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    width: 1080,
    height: 1080,
    preset: 'square',
    backgroundType: 'transparent',
    customBgColor: '#0b0c0e',
    name: 'Meu Projeto',
  });

  // Effects & State
  const [effectsState, setEffectsState] = useState<PhotoEffectsState>(DEFAULT_PHOTO_EFFECTS);
  const lastAlertTime = useRef<number>(0);

  const handleEffectsChange = (value: React.SetStateAction<PhotoEffectsState>) => {
    if (!image) {
      const now = Date.now();
      if (now - lastAlertTime.current > 2000) {
        alert("Carregue sua imagem primeiro");
        handleUploadClick();
        lastAlertTime.current = now;
      }
      return;
    }
    setEffectsState(value);
  };

  // Loaded Image & Transformations
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipH: false,
    flipV: false,
  });

  // Workspace Navigation
  const [zoom, setZoom] = useState<number>(0.65);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Modals & Panels Visibility
  const [isNewCanvasModalOpen, setIsNewCanvasModalOpen] = useState<boolean>(false);
  const [isEffectsPanelOpen, setIsEffectsPanelOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper: Generate Demo Graphic Image
  const loadDemoGraphic = useCallback(() => {
    const c = document.createElement('canvas');
    c.width = 1200;
    c.height = 1200;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    // Dark sleek gradient background for demo
    const grad = ctx.createRadialGradient(600, 600, 50, 600, 600, 700);
    grad.addColorStop(0, '#1c1f2b');
    grad.addColorStop(0.6, '#0f1117');
    grad.addColorStop(1, '#08090d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 1200);

    // Glowing Neon Rings
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(600, 600, 420, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(600, 600, 390, 0, Math.PI * 2);
    ctx.stroke();

    // Geometric Star Emblem
    ctx.save();
    ctx.translate(600, 600);
    const spikes = 8;
    const outerR = 320;
    const innerR = 140;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(0, -outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.closePath();

    const starGrad = ctx.createLinearGradient(-300, -300, 300, 300);
    starGrad.addColorStop(0, '#6366f1');
    starGrad.addColorStop(0.5, '#ec4899');
    starGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = starGrad;
    ctx.fill();

    // Inner Core Circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STUDIO CANVA PRO', 600, 1100);

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setCanvasConfig(prev => ({
        ...prev,
        width: 1200,
        height: 1200,
        preset: 'custom',
      }));
      setTransform({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipH: false,
        flipV: false,
      });
      const availW = window.innerWidth - 64;
      const availH = window.innerHeight - 120;
      const fit = Math.min(availW / 1200, availH / 1200, 1.0);
      setZoom(Math.max(0.15, Math.min(1.0, fit * 0.85)));
      setPanOffset({ x: 0, y: 0 });
    };
    img.src = c.toDataURL('image/png');
  }, []);

  // Handle Image Upload: Canvas resolution dynamically becomes the image resolution
  const handleUploadImage = (file: File) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      console.warn("Formato não suportado");
      return;
    }

    if (file.type.includes('png') || file.name.endsWith('.png') || file.type.includes('svg') || file.name.endsWith('.svg')) {
      setCanvasConfig(prev => ({ ...prev, backgroundType: 'transparent' }));
    }

    const onImageLoaded = (img: HTMLImageElement) => {
      const nw = img.naturalWidth || img.width || 1080;
      const nh = img.naturalHeight || img.height || 1080;
      setImage(img);
      setEffectsState(DEFAULT_PHOTO_EFFECTS);
      setCanvasConfig(prev => ({
        ...prev,
        name: file.name.split('.').slice(0, -1).join('.') || file.name,
        width: nw,
        height: nh,
        preset: 'custom',
      }));
      setTransform({ x: 0, y: 0, scale: 1, rotation: 0, flipH: false, flipV: false });

      // Automatically adjust zoom to comfortably frame the uploaded photo in viewport
      const availW = window.innerWidth - 64;
      const availH = window.innerHeight - 120;
      const fit = Math.min(availW / nw, availH / nh, 1.0);
      setZoom(Math.max(0.15, Math.min(1.0, fit * 0.85)));
      setPanOffset({ x: 0, y: 0 });
    };

    if (file.name.endsWith('.svg') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => onImageLoaded(img);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => onImageLoaded(img);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    const input = document.getElementById('file-upload-input');
    if (input) input.click();
  };

  const handleCloseImage = () => {
    if (image) {
      setImage(null);
      setEffectsState(DEFAULT_PHOTO_EFFECTS);
      setTransform({ x: 0, y: 0, scale: 1, rotation: 0, flipH: false, flipV: false });
    }
  };

  // Reset all adjustments
  const handleResetEffects = () => {
    if (!image) {
      handleUploadClick();
      return;
    }
    setEffectsState(DEFAULT_PHOTO_EFFECTS);
  };

  // Randomize all effects
  const handleRandomizeEffects = () => {
    if (!image) {
      handleUploadClick();
      return;
    }
    setEffectsState(getRandomEffects());
  };

  // Image Transform actions
  const handleRotateImage = (deg: number) => {
    setTransform(t => ({ ...t, rotation: (t.rotation + deg) % 360 }));
  };

  const handleFlipImage = (axis: 'h' | 'v') => {
    if (axis === 'h') setTransform(t => ({ ...t, flipH: !t.flipH }));
    else setTransform(t => ({ ...t, flipV: !t.flipV }));
  };

  const handleFitImage = (fitMode: 'fit' | 'fill' | 'center') => {
    if (!image) return;
    const w = canvasConfig.width;
    const h = canvasConfig.height;
    const iw = image.naturalWidth || w;
    const ih = image.naturalHeight || h;

    if (fitMode === 'fit') {
      setTransform(t => ({ ...t, x: 0, y: 0, scale: 1 }));
    } else if (fitMode === 'fill') {
      const scaleX = w / iw;
      const scaleY = h / ih;
      const fillScale = Math.max(scaleX, scaleY) / Math.min(w / iw, h / ih);
      setTransform(t => ({ ...t, x: 0, y: 0, scale: fillScale }));
    } else if (fitMode === 'center') {
      setTransform(t => ({ ...t, x: 0, y: 0, scale: 1 }));
    }
  };

  // Get final rendered canvas for export or clipboard
  const getProcessedCanvas = useCallback((
    scale: number = 1,
    forceTransparent: boolean = false,
    customWidth?: number,
    customHeight?: number
  ): HTMLCanvasElement | null => {
    const exportW = customWidth ? Math.round(customWidth) : Math.round(canvasConfig.width * scale);
    const exportH = customHeight ? Math.round(customHeight) : Math.round(canvasConfig.height * scale);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportW;
    exportCanvas.height = exportH;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return null;

    // Clear transparent
    ctx.clearRect(0, 0, exportW, exportH);

    // Draw background only if not transparent and not forced transparent
    if (!forceTransparent && canvasConfig.backgroundType !== 'transparent') {
      if (canvasConfig.backgroundType === 'dark') {
        ctx.fillStyle = '#0b0c0e';
        ctx.fillRect(0, 0, exportW, exportH);
      } else if (canvasConfig.backgroundType === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportW, exportH);
      } else if (canvasConfig.backgroundType === 'color') {
        ctx.fillStyle = canvasConfig.customBgColor || '#121316';
        ctx.fillRect(0, 0, exportW, exportH);
      }
    }

    if (image) {
      const offscreen = document.createElement('canvas');
      offscreen.width = exportW;
      offscreen.height = exportH;
      const offCtx = offscreen.getContext('2d');

      if (offCtx) {
        const effectiveScaleX = exportW / Math.max(1, canvasConfig.width);
        const effectiveScaleY = exportH / Math.max(1, canvasConfig.height);

        offCtx.save();
        offCtx.translate(exportW / 2 + transform.x * effectiveScaleX, exportH / 2 + transform.y * effectiveScaleY);
        offCtx.rotate((transform.rotation * Math.PI) / 180);
        offCtx.scale(
          transform.scale * (transform.flipH ? -1 : 1),
          transform.scale * (transform.flipV ? -1 : 1)
        );

        const iw = image.naturalWidth || image.width || exportW;
        const ih = image.naturalHeight || image.height || exportH;
        const baseRatio = Math.min(canvasConfig.width / iw, canvasConfig.height / ih);
        const drawW = iw * baseRatio * effectiveScaleX;
        const drawH = ih * baseRatio * effectiveScaleY;

        offCtx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
        offCtx.restore();

        const filteredCanvas = document.createElement('canvas');
        const hasTransparency = forceTransparent || canvasConfig.backgroundType === 'transparent';
        renderProcessedImageWebGL(offscreen, filteredCanvas, effectsState, exportW, exportH, hasTransparency);
        ctx.drawImage(filteredCanvas, 0, 0);
      }
    }

    return exportCanvas;
  }, [canvasConfig, image, transform, effectsState]);

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const executeExport = (format: 'png' | 'jpeg' | 'webp' | 'svg', quality: number, customName: string) => {
    const canvas = getProcessedCanvas(1, false);
    if (!canvas) return;
    
    const exportName = `${customName.replace(/\s+/g, '_')}.${format}`;
    
    if (format === 'svg') {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n`;
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
              svg += `<rect x="${startX}" y="${y}" width="${currentRectWidth}" height="1" fill="#000" />\n`;
              currentRectWidth = 0;
            }
          }
        }
        if (currentRectWidth > 0) {
          svg += `<rect x="${startX}" y="${y}" width="${currentRectWidth}" height="1" fill="#000" />\n`;
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
    }, `image/${format}`, quality);
  };

  // Copy to clipboard
  const handleCopyCanvas = () => {
    const canvas = getProcessedCanvas(1);
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }, 'image/png');
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#1e1e1e] text-[#e0e0e0]">
      {/* macOS Top Menu Bar */}
      <MacMenuBar
        mode={mode}
        setMode={setMode}
        canvasConfig={canvasConfig}
        zoom={zoom}
        setZoom={setZoom}
        resetZoom={() => {
          setZoom(0.65);
          setPanOffset({ x: 0, y: 0 });
        }}
        onOpenNewCanvasModal={() => setIsNewCanvasModalOpen(true)}
        onOpenExportModal={handleOpenExportModal}
        onUploadClick={handleUploadClick}
        onCloseImage={handleCloseImage}
        onResetEffects={handleResetEffects}
        onRandomize={handleRandomizeEffects}
        onRotateImage={handleRotateImage}
        onFlipImage={handleFlipImage}
        onFitImage={handleFitImage}
        onCopyCanvas={handleCopyCanvas}
        onLoadDemo={loadDemoGraphic}
        effectsState={effectsState}
        setEffectsState={handleEffectsChange}
        isEffectsPanelOpen={isEffectsPanelOpen}
        setIsEffectsPanelOpen={setIsEffectsPanelOpen}
      />

      {/* Main Studio Viewport */}
      <main className="relative flex-1 w-full flex flex-col md:flex-row overflow-hidden">
        <div className="relative flex-1 h-full overflow-hidden">
          <CanvasWorkspace
            canvasConfig={canvasConfig}
            effectsState={effectsState}
            image={image}
            transform={transform}
            setTransform={setTransform}
            zoom={zoom}
            setZoom={setZoom}
            panOffset={panOffset}
            setPanOffset={setPanOffset}
            onUploadImage={handleUploadImage}
            onOpenNewCanvasModal={() => setIsNewCanvasModalOpen(true)}
            onOpenExportModal={handleOpenExportModal}
            onToggleEffectsPanel={() => setIsEffectsPanelOpen(prev => !prev)}
            isEffectsPanelOpen={isEffectsPanelOpen}
            onLoadDemo={loadDemoGraphic}
            canvasRef={mainCanvasRef}
            onChangeBackgroundType={(bg) => setCanvasConfig(prev => ({ ...prev, backgroundType: bg }))}
            onRandomize={handleRandomizeEffects}
          />
        </div>
        {/* Sidebar Effects Panel */}
        <div className="shrink-0 border-t md:border-t-0 md:border-l border-[#3c3c3c] bg-[#252525] transition-all flex h-[45vh] md:h-full z-30">
          <EffectsPanel
            state={effectsState}
            onChange={handleEffectsChange}
            onReset={handleResetEffects}
            onRandomize={handleRandomizeEffects}
            isOpen={isEffectsPanelOpen}
            onClose={() => setIsEffectsPanelOpen(false)}
            onOpen={() => setIsEffectsPanelOpen(true)}
          />
        </div>
      </main>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={executeExport} 
        fileName={canvasConfig.name.replace(/\s+/g, '_')} 
      />
      
      {/* Modal: New Canvas / Resize Artboard */}
      <NewCanvasModal
        isOpen={isNewCanvasModalOpen}
        onClose={() => setIsNewCanvasModalOpen(false)}
        currentConfig={canvasConfig}
        onCreateCanvas={(newConfig) => {
          setCanvasConfig(newConfig);
          setTransform({ x: 0, y: 0, scale: 1, rotation: 0, flipH: false, flipV: false });
        }}
      />
    </div>
  );
}
