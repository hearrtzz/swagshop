import { PhotoEffectsState, GradientMapMode, EffectLayerId, DEFAULT_LAYER_ORDER } from '../types';

// Helper: Build Tone Curve LUT (Look-Up Table)
export function buildCurveLUT(state: PhotoEffectsState): Uint8Array {
  const lut = new Uint8Array(256); // Single channel (R)
  const shadows = state.curveShadows;
  const midtones = state.curveMidtones;
  const highlights = state.curveHighlights;
  const sCurve = state.curveContrast;

  for (let i = 0; i < 256; i++) {
    let val = i / 255.0;

    if (shadows !== 0) {
      const weight = Math.pow(1.0 - val, 2.0);
      val += (shadows / 255.0) * weight;
    }

    if (midtones !== 0) {
      const weight = Math.sin(val * Math.PI);
      val += (midtones / 255.0) * weight * 0.5;
    }

    if (highlights !== 0) {
      const weight = Math.pow(val, 2.0);
      val += (highlights / 255.0) * weight;
    }

    if (sCurve !== 0) {
      const factor = sCurve / 100.0;
      val = val + factor * Math.sin(val * Math.PI * 2.0) * -0.18;
    }

    lut[i] = Math.max(0, Math.min(255, Math.round(val * 255)));
  }
  return lut;
}

// Helper: Build Gradient Map LUT
export function buildGradientMapLUT(mode: GradientMapMode, customShadow: string, customLight: string, customMidtone: string = '#5e43a6', customStops?: {color: string; pos: number}[]): Uint8Array | null {
  if (mode === 'none') return null;
  const lut = new Uint8Array(256 * 3);

  function parseHex(h: string): [number, number, number] {
    const clean = h.replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16) || 0,
      parseInt(clean.substring(2, 4), 16) || 0,
      parseInt(clean.substring(4, 6), 16) || 0
    ];
  }

  interface Stop {
    p: number;
    c: [number, number, number];
  }

  let stops: Stop[] = [];

  switch (mode) {
    case 'threetone':
      stops = [
        { p: 0.0, c: parseHex(customShadow) },
        { p: 0.5, c: parseHex(customMidtone) },
        { p: 1.0, c: parseHex(customLight) }
      ];
      break;
    
    case 'custom_duo':
      stops = [
        { p: 0.0, c: parseHex(customShadow) },
        { p: 1.0, c: parseHex(customLight) }
      ];
      break;
    case 'custom_stops':
      if (customStops && customStops.length >= 2) {
        // Ensure sorted by pos
        const sorted = [...customStops].sort((a, b) => a.pos - b.pos);
        stops = sorted.map(s => ({ p: s.pos / 100.0, c: parseHex(s.color) }));
      } else {
        stops = [
          { p: 0.0, c: parseHex(customShadow) },
          { p: 1.0, c: parseHex(customLight) }
        ];
      }
      break;
    default:
      // Fallback
      stops = [
        { p: 0.0, c: parseHex(customShadow) },
        { p: 1.0, c: parseHex(customLight) }
      ];
      break;
  }

  for (let i = 0; i < 256; i++) {
    const t = i / 255.0;
    let c = stops[0].c;
    
    if (t <= stops[0].p) {
      c = stops[0].c;
    } else if (t >= stops[stops.length - 1].p) {
      c = stops[stops.length - 1].c;
    } else {
      for (let s = 0; s < stops.length - 1; s++) {
        if (t >= stops[s].p && t <= stops[s + 1].p) {
          const range = stops[s + 1].p - stops[s].p;
          const factor = range === 0 ? 0 : (t - stops[s].p) / range;
          c = [
            Math.round(stops[s].c[0] + factor * (stops[s + 1].c[0] - stops[s].c[0])),
            Math.round(stops[s].c[1] + factor * (stops[s + 1].c[1] - stops[s].c[1])),
            Math.round(stops[s].c[2] + factor * (stops[s + 1].c[2] - stops[s].c[2]))
          ];
          break;
        }
      }
    }
    lut[i * 3] = c[0];
    lut[i * 3 + 1] = c[1];
    lut[i * 3 + 2] = c[2];
  }
  return lut;
}

// Class to manage pixel vs canvas operations efficiently and minimize getImageData calls
export class PipelineManager {
  public imgData: ImageData | null = null;
  
  constructor(
    public ctx: CanvasRenderingContext2D,
    public w: number,
    public h: number
  ) {}

  getPixels(): ImageData {
    if (!this.imgData) {
      this.imgData = this.ctx.getImageData(0, 0, this.w, this.h);
    }
    return this.imgData;
  }

  sync() {
    if (this.imgData) {
      this.ctx.putImageData(this.imgData, 0, 0);
      this.imgData = null;
    }
  }
}

// Master Function: Render All Effects onto a Target Canvas with Dynamic Layer Hierarchy
export function renderProcessedImage(
  source: HTMLImageElement | HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
): void {
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  targetCanvas.width = targetW;
  targetCanvas.height = targetH;

  // Draw initial source onto canvas
  if (state.pixel > 1) {
    const pw = Math.max(1, Math.floor(targetW / state.pixel));
    const ph = Math.max(1, Math.floor(targetH / state.pixel));
    const pcan = document.createElement('canvas');
    pcan.width = pw;
    pcan.height = ph;
    const pctx = pcan.getContext('2d');
    if (pctx) {
      pctx.drawImage(source, 0, 0, pw, ph);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(pcan, 0, 0, targetW, targetH);
    }
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, targetW, targetH);
  }

  // Track original transparency from source directly from the drawn canvas
  let hasTransparency = false;
  const originalAlpha = new Uint8ClampedArray(targetW * targetH);
  const initialDataObj = ctx.getImageData(0, 0, targetW, targetH);
  const initialData = initialDataObj.data;
  for (let i = 0; i < initialData.length; i += 4) {
    originalAlpha[i / 4] = initialData[i + 3];
    if (initialData[i + 3] < 255) {
      hasTransparency = true;
    }
  }

  const pipeline = new PipelineManager(ctx, targetW, targetH);
  pipeline.imgData = initialDataObj;

  // Execute layers in the user-defined order
  const order = (state.layerOrder && state.layerOrder.length > 0) ? state.layerOrder : DEFAULT_LAYER_ORDER;

  for (const layerId of order) {
    switch (layerId) {
      case 'base':
        applyBaseLayer(pipeline, state, targetW, targetH);
        break;
      case 'curves':
        applyCurvesLayer(pipeline, state, targetW, targetH);
        break;
      case 'gradient':
        applyGradientLayer(pipeline, state, targetW, targetH);
        break;
      case 'glow':
        applyGlowLayer(pipeline, state, targetW, targetH);
        break;
      case 'halftone':
        applyHalftoneLayer(pipeline, state, targetW, targetH, hasTransparency);
        break;
      case 'datamosh':
        applyDatamoshLayer(pipeline, state, targetW, targetH);
        break;
      case 'glitch':
        applyGlitchLayer(pipeline, state, targetW, targetH, hasTransparency);
        break;
      case 'noise':
        applyNoiseLayer(pipeline, state, targetW, targetH);
        break;
      case 'texture':
        applyTextureLayer(pipeline, state, targetW, targetH, hasTransparency);
        break;
      case 'vignette':
        applyVignetteLayer(pipeline, state, targetW, targetH, hasTransparency);
        break;
      case 'timestamp':
        applyTimestampLayer(pipeline, state, targetW, targetH);
        break;
      case 'threshold':
        applyThresholdLayer(pipeline, state, targetW, targetH);
        break;
      case 'ascii':
        applyAsciiLayer(pipeline, state, targetW, targetH, hasTransparency);
        break;
      case 'fisheye':
        applyFisheyeLayer(pipeline, state, targetW, targetH);
        break;
      case 'jpeg':
        applyJpegLayer(pipeline, state, targetW, targetH);
        break;
    }
  }

  // Ensure any pending pixel modifications are written
  pipeline.sync();

  // Re-enforce original alpha transparency mask if source had transparent pixels
  if (hasTransparency) {
    const imgData = pipeline.getPixels();
    const pd = imgData.data;
    const hasGlow = state.glow > 0;
    const maxGlowAlpha = Math.round((state.glow / 100.0) * 180);

    for (let i = 0; i < pd.length; i += 4) {
      const origA = originalAlpha[i / 4];
      if (origA === 0) {
        if (!hasGlow) {
          pd[i + 3] = 0;
        } else {
          pd[i + 3] = Math.min(pd[i + 3], maxGlowAlpha);
        }
      } else if (pd[i + 3] > origA && !hasGlow) {
        pd[i + 3] = origA;
      }
    }
  }
  
  pipeline.sync();
}

export function applyJpegLayer(pipeline: PipelineManager, state: PhotoEffectsState, targetW: number, targetH: number) {
  if (state.jpeg > 0) {
    const imgData = pipeline.getPixels();
    const d = imgData.data;
    const blockSize = Math.max(2, Math.floor(state.jpeg * 1.5));
    const levels = Math.max(2, 16 - state.jpeg);

    for (let y = 0; y < targetH; y += blockSize) {
      for (let x = 0; x < targetW; x += blockSize) {
        const i = (y * targetW + x) * 4;
        let r = d[i], g = d[i+1], b = d[i+2];
        
        r = Math.round((r / 255) * levels) * (255 / levels);
        g = Math.round((g / 255) * levels) * (255 / levels);
        b = Math.round((b / 255) * levels) * (255 / levels);

        for (let by = 0; by < blockSize; by++) {
          if (y + by >= targetH) continue;
          for (let bx = 0; bx < blockSize; bx++) {
            if (x + bx >= targetW) continue;
            if ((bx + by) % 2 === 0 || state.jpeg > 5) {
                const idx = ((y + by) * targetW + (x + bx)) * 4;
                d[idx] = (d[idx] + r) / 2; 
                d[idx+1] = (d[idx+1] + g) / 2;
                d[idx+2] = (d[idx+2] + b) / 2;
            }
          }
        }
      }
    }
  }
}

// 1. Base Layer (Color Balance, Exposure, Contrast, Warmth, Invert, Threshold, Sharpness)
export function applyBaseLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  const bright = state.brightness * 1.25;
  const contrast = (state.contrast + 100) / 100;
  const sat = (state.saturation + 100) / 100;
  const exp = Math.pow(2, state.exposure / 50);
  const warmth = state.warmth;
  const tint = state.tint;
  const preset = state.preset;
  const thresholdVal = state.threshold;
  const solarizeVal = state.solarize / 100.0;
  const doInvert = state.invert;

  const isIdentity = (
    bright === 0 &&
    contrast === 1 &&
    sat === 1 &&
    exp === 1 &&
    warmth === 0 &&
    tint === 0 &&
    preset === 'none' &&
    thresholdVal === 0 &&
    solarizeVal === 0 &&
    !doInvert
  );

  if (isIdentity) return;

  const imgData = pipeline.getPixels();
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;

      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      if (exp !== 1.0) {
        r *= exp; g *= exp; b *= exp;
      }

      if (warmth !== 0) {
        r += warmth * 0.45;
        b -= warmth * 0.45;
      }
      if (tint !== 0) {
        g -= tint * 0.35;
        r += tint * 0.15;
        b += tint * 0.15;
      }

      r = (r - 128) * contrast + 128 + bright;
      g = (g - 128) * contrast + 128 + bright;
      b = (b - 128) * contrast + 128 + bright;

      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * sat;
      g = lum + (g - lum) * sat;
      b = lum + (b - lum) * sat;

      if (solarizeVal > 0) {
        const invLum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (invLum > 128) {
          r = r * (1 - solarizeVal) + (255 - r) * solarizeVal;
          g = g * (1 - solarizeVal) + (255 - g) * solarizeVal;
          b = b * (1 - solarizeVal) + (255 - b) * solarizeVal;
        }
      }

      if (doInvert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      

      if (preset === 'digicam') {
        b = Math.min(255, b * 1.08 + (255 - lum) * 0.08);
        g = Math.min(255, g * 1.04);
        r = Math.min(255, r * 0.98 + (lum > 180 ? (lum - 180) * 0.25 : 0));
      } else if (preset === 'insta2012') {
        r = Math.min(255, r * 1.15 + 14);
        g = Math.min(255, g * 0.95 + 8);
        b = Math.min(255, b * 0.85 + 24);
      } else if (preset === 'disposable') {
        r = Math.min(255, r * 1.12 + 8);
        g = Math.min(255, g * 1.04 + 6);
        b = Math.min(255, b * 0.90);
      } else if (preset === 'y2k') {
        r = Math.min(255, r * 0.92);
        g = Math.min(255, g * 1.08 + 6);
        b = Math.min(255, b * 1.18 + 16);
      } else if (preset === 'cinematic_teal') {
        const t = lum / 255.0;
        r = Math.min(255, r * (0.8 + 0.4 * t));
        g = Math.min(255, g * (0.95 + 0.1 * t));
        b = Math.min(255, b * (1.25 - 0.4 * t));
      } else if (preset === 'polaroid_vintage') {
        r = Math.min(255, r * 1.08 + 12);
        g = Math.min(255, g * 1.02 + 6);
        b = Math.min(255, b * 0.88 + 10);
      } else if (preset === 'monochrome_noir') {
        r = lum; g = lum; b = lum;
      }

      d[i] = Math.max(0, Math.min(255, Math.round(r)));
      d[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      d[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }

  // Sharpness unsharp mask (uses Canvas API, so we must sync first)
  if (state.sharpness > 0) {
    pipeline.sync();
    const sharpCanvas = document.createElement('canvas');
    sharpCanvas.width = targetW;
    sharpCanvas.height = targetH;
    const sctx = sharpCanvas.getContext('2d');
    if (sctx) {
      sctx.drawImage(pipeline.ctx.canvas, 0, 0);
      pipeline.ctx.save();
      pipeline.ctx.globalAlpha = (state.sharpness / 100.0) * 0.5;
      pipeline.ctx.globalCompositeOperation = 'overlay';
      pipeline.ctx.drawImage(sharpCanvas, 0, 0);
      pipeline.ctx.restore();
    }
  }
}

// 2. Curves Layer
export function applyCurvesLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.curveShadows === 0 && state.curveMidtones === 0 && state.curveHighlights === 0 && state.curveContrast === 0) {
    return;
  }
  const curveLUT = buildCurveLUT(state);
  const imgData = pipeline.getPixels();
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    d[i] = curveLUT[d[i]];
    d[i + 1] = curveLUT[d[i + 1]];
    d[i + 2] = curveLUT[d[i + 2]];
  }
}

// 3. Gradient Map Layer (Duotone)
export function applyGradientLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.gradientMode === 'none') return;
  const gradientLUT = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight, state.duoMidtone, state.customGradientStops);
  if (!gradientLUT) return;

  const imgData = pipeline.getPixels();
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const lum = Math.max(0, Math.min(255, Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])));
    d[i] = gradientLUT[lum * 3];
    d[i + 1] = gradientLUT[lum * 3 + 1];
    d[i + 2] = gradientLUT[lum * 3 + 2];
  }
}

// 4. Glow / Optical Bloom Layer
export function applyGlowLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.glow <= 0) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  const intensity = state.glow / 100.0;

  const highCanvas = document.createElement('canvas');
  highCanvas.width = targetW;
  highCanvas.height = targetH;
  const hctx = highCanvas.getContext('2d');
  if (!hctx) return;

  hctx.drawImage(ctx.canvas, 0, 0);
  const hData = hctx.getImageData(0, 0, targetW, targetH);
  const hd = hData.data;

  // Lowered luminance threshold so colors bloom better
  const lumThreshold = state.glowThreshold !== undefined ? Math.round(state.glowThreshold * 2.55) : 40; 
  
  for (let i = 0; i < hd.length; i += 4) {
    const a = hd[i + 3];
    if (a === 0) continue;
    
    // Calculate relative luminance
    const lum = 0.299 * hd[i] + 0.587 * hd[i + 1] + 0.114 * hd[i + 2];
    
    if (lum < lumThreshold) {
      hd[i + 3] = 0; // Don't bloom very dark areas
    } else {
      const factor = lumThreshold < 255 ? Math.min(1.0, (lum - lumThreshold) / (255 - lumThreshold)) : 1.0;
      hd[i] = Math.min(255, hd[i] * 1.2);
      hd[i + 1] = Math.min(255, hd[i + 1] * 1.2);
      hd[i + 2] = Math.min(255, hd[i + 2] * 1.2);
      hd[i + 3] = Math.round(a * factor);
    }
  }
  hctx.putImageData(hData, 0, 0);

  const radiusScale = (state.glowRadius !== undefined ? state.glowRadius : 25) / 25.0;
  const blurTight = Math.max(2, Math.round(Math.min(targetW, targetH) * 0.018 * radiusScale));
  const blurWide = Math.max(6, Math.round(Math.min(targetW, targetH) * 0.065 * radiusScale));

  const bloomCanvas = document.createElement('canvas');
  bloomCanvas.width = targetW;
  bloomCanvas.height = targetH;
  const bctx = bloomCanvas.getContext('2d');
  if (!bctx) return;

  bctx.filter = `blur(${blurWide}px)`;
  bctx.globalAlpha = 0.8;
  bctx.drawImage(highCanvas, 0, 0);

  bctx.filter = `blur(${blurTight}px)`;
  bctx.globalAlpha = 1.0;
  bctx.drawImage(highCanvas, 0, 0);

  ctx.save();
  // 'screen' works well, but 'lighter' can sometimes be better for colors on transparent backgrounds
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = Math.min(1.0, intensity * 1.5);
  ctx.drawImage(bloomCanvas, 0, 0);
  ctx.restore();
}

// 5. Halftone Layer
export function applyHalftoneLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean
) {
  if (state.halftone <= 0) return;
  
  pipeline.sync();
  
  const ctx = pipeline.ctx;
  const step = Math.max(3, state.halftone);

  const sampleW = Math.ceil(targetW / step);
  const sampleH = Math.ceil(targetH / step);

  const temp = document.createElement('canvas');
  temp.width = sampleW;
  temp.height = sampleH;
  const tctx = temp.getContext('2d');
  if (!tctx) return;

  // Draw image scaled down to average the pixels perfectly for each block
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'medium';
  tctx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);
  
  const halfImgData = tctx.getImageData(0, 0, sampleW, sampleH).data;

  if (state.halftoneMode !== 'overlay') {
    ctx.clearRect(0, 0, targetW, targetH);
    if (!hasTransparency) {
      ctx.fillStyle = state.halftoneMode === 'bw' ? '#ffffff' : '#090a0d';
      ctx.fillRect(0, 0, targetW, targetH);
    }
  } else {
    // If overlay, we might want to just draw black dots over the original image
    ctx.fillStyle = '#111116'; 
  }

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const idx = (y * sampleW + x) * 4;
      if (halfImgData[idx + 3] < 10) continue;

      const r = halfImgData[idx];
      const g = halfImgData[idx + 1];
      const b = halfImgData[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

      const radius = (step * 0.5) * Math.sqrt(Math.max(0.0, 1.0 - lum)) * 1.35;
      if (radius > 0.4) {
        if (state.halftoneMode !== 'overlay') {
           ctx.fillStyle = state.halftoneMode === 'bw' ? '#111116' : `rgb(${r},${g},${b})`;
        } else {
           ctx.fillStyle = '#0b0c10';
        }
        ctx.beginPath();
        ctx.arc(x * step + step * 0.5, y * step + step * 0.5, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// 6. Datamosh / Pixelmosh Layer (Digital Video Glitch & Block Displacement)
export function applyDatamoshLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.datamosh <= 0) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  const amount = state.datamosh / 100.0;
  const bs = Math.max(6, Math.min(64, Math.round(state.datamoshBlockSize || 16)));
  const seed = state.datamoshSeed || 1;
  const slices = state.datamoshSlices ?? 35;
  const melt = state.datamoshMelt ?? 25;

  // Snapshot current state
  const snapshot = document.createElement('canvas');
  snapshot.width = targetW;
  snapshot.height = targetH;
  const sctx = snapshot.getContext('2d');
  if (!sctx) return;
  sctx.drawImage(ctx.canvas, 0, 0);

  // A. Macroblock motion vector displacement
  const blockCount = Math.round(18 + amount * 45);
  for (let p = 0; p < blockCount; p++) {
    const r1 = Math.abs(Math.sin(seed * 1337 + p * 19.3));
    const r2 = Math.abs(Math.cos(seed * 777 + p * 23.7));
    const r3 = Math.abs(Math.sin(seed * 999 + p * 41.1));

    const bw = bs * (1 + Math.floor(r1 * 2.5));
    const bh = bs * (1 + Math.floor(r2 * 2.5));

    const sx = Math.floor(r2 * (targetW - bw));
    const sy = Math.floor(r3 * (targetH - bh));

    const shiftDist = (r1 - 0.5) * bs * (2 + amount * 7);
    const dx = Math.min(Math.max(0, sx + shiftDist), targetW - bw);
    const dy = Math.min(Math.max(0, sy + (r2 - 0.5) * bs * 2.5), targetH - bh);

    ctx.save();
    if (p % 4 === 0) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(snapshot, sx, sy, bw, bh, dx + (r1 > 0.5 ? 4 : -4), dy, bw, bh);
    } else {
      ctx.drawImage(snapshot, sx, sy, bw, bh, dx, dy, bw, bh);
    }
    ctx.restore();
  }

  // B. Horizontal slice tearing / channel drift bands
  if (slices > 0) {
    const sliceCount = Math.round((slices / 100.0) * 16 * amount);
    for (let s = 0; s < sliceCount; s++) {
      const sRand = Math.abs(Math.sin(seed * 311 + s * 17.5));
      const sliceY = Math.floor(sRand * targetH);
      const sliceH = Math.max(3, Math.floor(Math.abs(Math.cos(seed * 433 + s * 29)) * 36 * amount + 3));
      const tearX = Math.round((Math.sin(seed * 521 + s * 11)) * targetW * 0.12 * amount);

      ctx.save();
      ctx.drawImage(snapshot, 0, sliceY, targetW, sliceH, tearX, sliceY, targetW, sliceH);
      ctx.restore();
    }
  }

  // C. Pixel melt / vertical column smearing
  if (melt > 0) {
    const meltAmt = (melt / 100.0) * amount;
    const meltCols = Math.round(targetW * 0.05 * meltAmt);
    for (let m = 0; m < meltCols; m++) {
      const colX = Math.floor(Math.abs(Math.sin(seed * 877 + m * 37)) * targetW);
      const colW = Math.max(2, Math.floor(bs * 0.8));
      const startY = Math.floor(Math.abs(Math.cos(seed * 613 + m * 43)) * (targetH * 0.7));
      const smearLen = Math.floor(targetH * 0.28 * meltAmt + 12);

      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.drawImage(snapshot, colX, startY, colW, 2, colX, startY, colW, smearLen);
      ctx.restore();
    }
  }
}

// 7. Glitch Layer (Chromatic Aberration, CRT Scanlines, CRT Bloom, Lens Fisheye)
export function applyGlitchLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean
) {
  pipeline.sync();
  const ctx = pipeline.ctx;
  // Chromatic Aberration
  if (state.chroma > 0) {
    const shift = state.chroma;
    const temp = document.createElement('canvas');
    temp.width = targetW;
    temp.height = targetH;
    const tctx = temp.getContext('2d');
    if (tctx) {
      tctx.drawImage(ctx.canvas, 0, 0);
      ctx.save();
      if (hasTransparency) ctx.globalCompositeOperation = 'source-atop';
      else ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(temp, shift, 0);
      ctx.drawImage(temp, -shift, 0);
      ctx.restore();
    }
  }

  // CRT Scanlines
  if (state.scanlines > 0) {
    ctx.save();
    if (hasTransparency) {
      ctx.globalCompositeOperation = 'source-atop';
    }
    const alpha = state.scanlines / 100;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
    
    // Draw horizontal lines
    const lineSpacing = 3;
    for (let y = 0; y < targetH; y += lineSpacing) {
      ctx.fillRect(0, y, targetW, 1);
    }
    ctx.restore();
  }
}

// 8. Film Grain / Noise Layer
export function applyNoiseLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.noise <= 0) return;
  const imgData = pipeline.getPixels();
  const d = imgData.data;
  const noiseAmt = state.noise * 0.8;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const grain = (Math.random() - 0.5) * noiseAmt;
    d[i] = Math.max(0, Math.min(255, d[i] + grain));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + grain));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + grain));
  }
}

// 9. Texture Layer (Light Leak & Dust/Scratches)
export function applyTextureLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean
) {
  pipeline.sync();
  const ctx = pipeline.ctx;
  // Light Leak
  if (state.lightLeak !== 'none') {
    ctx.save();
    if (hasTransparency) ctx.globalCompositeOperation = 'source-atop';
    else ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (state.lightLeakIntensity / 100.0);

    if (state.lightLeak === 'sunburst') {
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.max(targetW, targetH) * 0.75);
      grad.addColorStop(0, '#fff4cc');
      grad.addColorStop(0.3, '#ff7800');
      grad.addColorStop(0.7, '#ff0055');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (state.lightLeak === 'prism') {
      const grad = ctx.createLinearGradient(0, targetH * 0.2, targetW, targetH * 0.8);
      grad.addColorStop(0, '#ff0055');
      grad.addColorStop(0.35, '#ffaa00');
      grad.addColorStop(0.65, '#00ffaa');
      grad.addColorStop(1, '#0088ff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (state.lightLeak === 'golden') {
      const grad = ctx.createRadialGradient(targetW, 0, 20, targetW, 0, targetW * 0.85);
      grad.addColorStop(0, '#fff8e7');
      grad.addColorStop(0.4, '#f59e0b');
      grad.addColorStop(0.8, '#b45309');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (state.lightLeak === 'neon') {
      const grad = ctx.createRadialGradient(targetW / 2, targetH, 10, targetW / 2, targetH, targetW * 0.7);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.4, '#8b5cf6');
      grad.addColorStop(0.8, '#ec4899');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    }
    ctx.restore();
  }

  // Dust & Scratches
  if (state.dustScratches > 0) {
    ctx.save();
    if (hasTransparency) ctx.globalCompositeOperation = 'source-atop';
    else ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255, 255, 255, ${(state.dustScratches / 100.0) * 0.6})`;

    const dustCount = Math.round((targetW * targetH) / 18000) * (state.dustScratches / 50.0);
    for (let i = 0; i < dustCount; i++) {
      const rx = Math.random() * targetW;
      const ry = Math.random() * targetH;
      const r = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const scratchCount = Math.round(state.dustScratches / 15.0);
    ctx.strokeStyle = `rgba(255, 255, 255, ${(state.dustScratches / 100.0) * 0.4})`;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < scratchCount; i++) {
      const sx = Math.random() * targetW;
      const sy = Math.random() * targetH;
      const len = Math.random() * 80 + 20;
      const angle = (Math.random() - 0.5) * 0.3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.sin(angle) * len, sy + Math.cos(angle) * len);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// 10. Vignette Layer
export function applyVignetteLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean
) {
  if (state.vignette <= 0) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  ctx.save();
  if (hasTransparency) ctx.globalCompositeOperation = 'source-atop';
  const grad = ctx.createRadialGradient(
    targetW / 2, targetH / 2, Math.min(targetW, targetH) * 0.28,
    targetW / 2, targetH / 2, Math.max(targetW, targetH) * 0.72
  );
  const vigAlpha = state.vignette / 100.0;
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${vigAlpha * 0.95})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.restore();
}

// 11. LED Timestamp Layer
export function applyTimestampLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (!state.timestamp) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  ctx.save();
  let dateStr = state.dateText;
  if (dateStr === 'DATE_NOW') {
    const now = new Date();
    const yr = String(now.getFullYear()).slice(-2);
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const dy = String(now.getDate()).padStart(2, '0');
    dateStr = `'${yr} ${mo} ${dy}`;
  }

  const fontSize = Math.max(16, Math.round(targetW * 0.036));
  ctx.font = `bold ${fontSize}px "Courier New", "JetBrains Mono", monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';

  const posX = targetW - fontSize * 0.8;
  const posY = targetH - fontSize * 0.8;

  const baseColor = state.timestampColor || '#ffa200';
  ctx.shadowColor = baseColor;
  ctx.shadowBlur = fontSize * 0.35;
  ctx.fillStyle = baseColor;
  ctx.fillText(dateStr, posX, posY);

  ctx.fillStyle = '#fff9db';
  ctx.shadowBlur = 0;
  ctx.fillText(dateStr, posX, posY);
  ctx.restore();
}

export function applyAsciiLayer(pipeline: PipelineManager, state: PhotoEffectsState, targetW: number, targetH: number, hasTransparency: boolean = false) {
  if (state.ascii <= 0) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  const step = Math.max(6, Math.round(state.ascii / 2));
  
  const sampleW = Math.ceil(targetW / step);
  const sampleH = Math.ceil(targetH / step);
  
  const temp = document.createElement('canvas');
  temp.width = sampleW;
  temp.height = sampleH;
  const tctx = temp.getContext('2d');
  if (!tctx) return;
  
  tctx.imageSmoothingEnabled = true;
  tctx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);
  const data = tctx.getImageData(0, 0, sampleW, sampleH).data;
  
  ctx.clearRect(0, 0, targetW, targetH);
  if (!hasTransparency) {
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(0, 0, targetW, targetH);
  }
  
  const chars = ['@', '%', '#', '*', '+', '=', '-', ':', '.', ' '];
  ctx.font = `bold ${step}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const mode = state.asciiMode || 'color';

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const idx = (y * sampleW + x) * 4;
      if (data[idx + 3] < 10) continue;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      
      const charIdx = Math.floor((1.0 - lum) * (chars.length - 1));
      const char = chars[charIdx];
      
      if (mode === 'color') {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      } else if (mode === 'green') {
        ctx.fillStyle = '#00ff41';
      } else {
        ctx.fillStyle = '#ffffff';
      }
      
      ctx.fillText(char, x * step + step / 2, y * step + step / 2);
    }
  }
}

export function applyThresholdLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number
) {
  if (state.threshold === 0) return;
  const thresholdVal = state.threshold;
  const thresholdNoise = (state.thresholdNoise || 0) / 100.0;
  
  const imgData = pipeline.getPixels();
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    
    if (thresholdNoise > 0) {
       // Simple pseudo-random noise based on pixel index
       const noise = (Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
       lum += (noise - 0.5) * thresholdNoise * 255.0;
    }
    
    const bin = lum >= thresholdVal ? 255 : 0;
    d[i] = bin;
    d[i + 1] = bin;
    d[i + 2] = bin;
  }
}


// Fisheye Lens Distortion Layer
export function applyFisheyeLayer(
  pipeline: PipelineManager,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean
) {
  if (state.lensDistort === 0) return;
  pipeline.sync();
  const ctx = pipeline.ctx;
  const distStrength = state.lensDistort / 100.0;
  const srcImgData = ctx.getImageData(0, 0, targetW, targetH);
  const srcData = srcImgData.data;
  const outImgData = ctx.createImageData(targetW, targetH);
  const outData = outImgData.data;
  const halfW = targetW / 2;
  const halfH = targetH / 2;
  for (let y = 0; y < targetH; y++) {
    const dy = (y - halfH) / halfH;
    for (let x = 0; x < targetW; x++) {
      const dx = (x - halfW) / halfW;
      const r = Math.hypot(dx, dy);
      let factor = 1.0;
      if (distStrength > 0) {
        factor = 1.0 + distStrength * (r * r);
      } else {
        factor = 1.0 / (1.0 - distStrength * (r * r));
      }
      const srcX = Math.round(halfW + dx * factor * halfW);
      const srcY = Math.round(halfH + dy * factor * halfH);
      const outIdx = (y * targetW + x) * 4;
      if (srcX >= 0 && srcX < targetW && srcY >= 0 && srcY < targetH) {
        const srcIdx = (srcY * targetW + srcX) * 4;
        outData[outIdx] = srcData[srcIdx];
        outData[outIdx + 1] = srcData[srcIdx + 1];
        outData[outIdx + 2] = srcData[srcIdx + 2];
        outData[outIdx + 3] = srcData[srcIdx + 3];
      } else {
        outData[outIdx] = 0;
        outData[outIdx + 1] = 0;
        outData[outIdx + 2] = 0;
        outData[outIdx + 3] = 0;
      }
    }
  }
  ctx.putImageData(outImgData, 0, 0);
}
