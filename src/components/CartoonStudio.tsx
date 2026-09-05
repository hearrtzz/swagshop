import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Play, Pause, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CartoonStudioState } from '../types';

interface CartoonStudioProps {
  image: HTMLImageElement | null;
  state: CartoonStudioState;
  onChange: React.Dispatch<React.SetStateAction<CartoonStudioState>>;
}

// --- Helper: Extract Vector Contours & Silhouette from Logo/Image ---
interface ContourData {
  loops: [number, number][][];
  loopLengths: number[];
  totalLength: number;
  silhouetteCanvas: HTMLCanvasElement;
  bounds: { x: number; y: number; w: number; h: number };
}

function extractImageContours(img: HTMLImageElement, targetW: number, targetH: number): ContourData {
  const iw = img.naturalWidth || img.width || 600;
  const ih = img.naturalHeight || img.height || 600;
  const maxDim = Math.min(targetW * 0.70, targetH * 0.70);
  const fitScale = Math.min(maxDim / iw, maxDim / ih);
  const dw = iw * fitScale;
  const dh = ih * fitScale;
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) / 2;

  // Offscreen canvas for raster sampling
  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const octx = offscreen.getContext('2d');

  // Silhouette mask canvas
  const silCanvas = document.createElement('canvas');
  silCanvas.width = targetW;
  silCanvas.height = targetH;
  const sctx = silCanvas.getContext('2d');

  if (!octx || !sctx) {
    return {
      loops: [],
      loopLengths: [],
      totalLength: 0,
      silhouetteCanvas: silCanvas,
      bounds: { x: dx, y: dy, w: dw, h: dh },
    };
  }

  octx.drawImage(img, dx, dy, dw, dh);

  // Generate solid silhouette mask
  sctx.drawImage(img, dx, dy, dw, dh);
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = '#18181b';
  sctx.fillRect(0, 0, targetW, targetH);
  sctx.globalCompositeOperation = 'source-over';

  // Fast Marching Squares contour extraction
  const imgData = octx.getImageData(0, 0, targetW, targetH).data;
  const step = 3;
  const gw = Math.floor(targetW / step);
  const gh = Math.floor(targetH / step);
  const grid: boolean[] = new Array(gw * gh).fill(false);

  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const px = gx * step;
      const py = gy * step;
      const idx = (py * targetW + px) * 4;
      const a = imgData[idx + 3];
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      grid[gy * gw + gx] = a > 45 && lum < 180;
    }
  }

  const segments: Map<string, { start: [number, number]; end: [number, number] }> = new Map();
  for (let gy = 0; gy < gh - 1; gy++) {
    for (let gx = 0; gx < gw - 1; gx++) {
      const tl = grid[gy * gw + gx];
      const tr = grid[gy * gw + (gx + 1)];
      const br = grid[(gy + 1) * gw + (gx + 1)];
      const bl = grid[(gy + 1) * gw + gx];
      const code = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (code === 0 || code === 15) continue;

      const topPt: [number, number] = [(gx + 0.5) * step, gy * step];
      const rightPt: [number, number] = [(gx + 1) * step, (gy + 0.5) * step];
      const bottomPt: [number, number] = [(gx + 0.5) * step, (gy + 1) * step];
      const leftPt: [number, number] = [gx * step, (gy + 0.5) * step];

      const addSeg = (p1: [number, number], p2: [number, number]) => {
        segments.set(`${p1[0].toFixed(0)},${p1[1].toFixed(0)}`, { start: p1, end: p2 });
      };

      switch (code) {
        case 1: addSeg(bottomPt, leftPt); break;
        case 2: addSeg(rightPt, bottomPt); break;
        case 3: addSeg(rightPt, leftPt); break;
        case 4: addSeg(topPt, rightPt); break;
        case 5: addSeg(topPt, rightPt); addSeg(bottomPt, leftPt); break;
        case 6: addSeg(topPt, bottomPt); break;
        case 7: addSeg(topPt, leftPt); break;
        case 8: addSeg(leftPt, topPt); break;
        case 9: addSeg(bottomPt, topPt); break;
        case 10: addSeg(leftPt, topPt); addSeg(rightPt, bottomPt); break;
        case 11: addSeg(rightPt, topPt); break;
        case 12: addSeg(leftPt, rightPt); break;
        case 13: addSeg(bottomPt, rightPt); break;
        case 14: addSeg(leftPt, bottomPt); break;
      }
    }
  }

  // Assemble loops
  const rawLoops: [number, number][][] = [];
  const visited = new Set<string>();

  segments.forEach((seg, startKey) => {
    if (visited.has(startKey)) return;
    const loop: [number, number][] = [seg.start];
    visited.add(startKey);
    let curr = seg.end;

    for (let s = 0; s < 5000; s++) {
      loop.push(curr);
      const nextKey = `${curr[0].toFixed(0)},${curr[1].toFixed(0)}`;
      if (visited.has(nextKey)) break;
      visited.add(nextKey);
      const nextSeg = segments.get(nextKey);
      if (!nextSeg) break;
      curr = nextSeg.end;
      if (Math.hypot(curr[0] - seg.start[0], curr[1] - seg.start[1]) < step * 1.5) {
        loop.push(seg.start);
        break;
      }
    }

    if (loop.length >= 6) {
      // Downsample to keep animation ultra-fluid
      const simplified: [number, number][] = [];
      const stride = Math.max(1, Math.floor(loop.length / 140));
      for (let i = 0; i < loop.length; i += stride) {
        simplified.push(loop[i]);
      }
      simplified.push(loop[loop.length - 1]);
      rawLoops.push(simplified);
    }
  });

  // Calculate loop perimeter lengths
  const loopLengths: number[] = [];
  let totalLength = 0;

  for (const loop of rawLoops) {
    let len = 0;
    for (let i = 0; i < loop.length - 1; i++) {
      len += Math.hypot(loop[i + 1][0] - loop[i][0], loop[i + 1][1] - loop[i][1]);
    }
    loopLengths.push(len);
    totalLength += len;
  }

  return {
    loops: rawLoops,
    loopLengths,
    totalLength: Math.max(1, totalLength),
    silhouetteCanvas: silCanvas,
    bounds: { x: dx, y: dy, w: dw, h: dh },
  };
}

export const CartoonStudio: React.FC<CartoonStudioProps> = ({
  image,
  state,
  onChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [useUploadedImage, setUseUploadedImage] = useState<HTMLImageElement | null>(null);
  const [sourceMode, setSourceMode] = useState<'mascot' | 'canvas' | 'custom'>('mascot');

  const activeImage = sourceMode === 'custom' ? useUploadedImage : sourceMode === 'canvas' ? image : null;

  // Memoize extracted vector contours for activeImage
  const contourData = React.useMemo(() => {
    if (!activeImage) return null;
    return extractImageContours(activeImage, 840, 840);
  }, [activeImage]);

  const resetReplay = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsPlaying(true);
  }, []);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setUseUploadedImage(img);
        setSourceMode('custom');
        resetReplay();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 840;
    const h = 840;
    canvas.width = w;
    canvas.height = h;

    let boilSeed = 1;
    let lastBoilTime = 0;

    const render = (now: number) => {
      if (!isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const elapsed = (now - startTimeRef.current) / 1000.0;
      let progress = elapsed / Math.max(0.2, state.duration);
      if (state.loop) {
        progress = progress % 1.0;
      } else {
        progress = Math.min(1.0, progress);
      }

      // 1. Sync SVG Line Boil Filter dynamically
      const boilInterval = 1000 / Math.max(1, state.fps);
      if (now - lastBoilTime >= boilInterval) {
        lastBoilTime = now;
        boilSeed = (boilSeed % 9999) + 1;
        const boilNoise = document.getElementById('boil-noise');
        if (boilNoise) {
          boilNoise.setAttribute('seed', String(boilSeed));
          boilNoise.setAttribute('baseFrequency', String(state.freq || 0.035));
        }
        const boilDisp = document.getElementById('boil-disp');
        if (boilDisp) {
          boilDisp.setAttribute('scale', String(state.jitter ? state.scale : 0));
        }
      }

      ctx.save();

      // 2. Paper Background & Subtle Vintage Texture
      if (state.paper) {
        ctx.fillStyle = state.paper;
        ctx.fillRect(0, 0, w, h);

        // Vintage vignette / subtle edge darkening
        const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.72);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.06)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      }

      // Ink stroke styles
      ctx.strokeStyle = state.inkColor;
      ctx.fillStyle = state.inkColor;
      ctx.lineWidth = Math.max(1, state.strokeWidth * 1.5);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 3. DRAW CONTENT (Either Loaded Image OR 1930s Retro Cartoon Mascot)
      if (activeImage) {
        const iw = activeImage.naturalWidth || 600;
        const ih = activeImage.naturalHeight || 600;
        const fitScale = Math.min(560 / iw, 560 / ih);
        const dw = iw * fitScale;
        const dh = ih * fitScale;

        const cd = contourData;
        const b = cd ? cd.bounds : { x: (w - dw) / 2, y: (h - dh) / 2, w: dw, h: dh };

        if (state.preset === 'rubber') {
          // --- 1. RUBBER HOSE BOUNCE (1930s Retro Cartoon) ---
          const t = elapsed * 7.5;
          const bounce = Math.abs(Math.sin(t));
          const squash = Math.sin(t);
          const sx = 1.0 + squash * 0.18;
          const sy = 1.0 - squash * 0.18;
          const ty = -bounce * 42;
          const rot = Math.sin(elapsed * 3.75) * 0.08;

          ctx.save();
          ctx.translate(w / 2, h / 2 + ty);
          ctx.rotate(rot);
          ctx.scale(sx, sy);
          ctx.drawImage(activeImage, -b.w / 2, -b.h / 2, b.w, b.h);
          ctx.restore();

          // Dust poofs when landing
          if (bounce < 0.14) {
            ctx.save();
            ctx.fillStyle = 'rgba(160, 160, 160, 0.45)';
            ctx.beginPath();
            ctx.arc(w / 2 - b.w * 0.35, h / 2 + b.h * 0.48 + 12, 16, 0, Math.PI * 2);
            ctx.arc(w / 2 + b.w * 0.35, h / 2 + b.h * 0.48 + 12, 16, 0, Math.PI * 2);
            ctx.arc(w / 2 - b.w * 0.25, h / 2 + b.h * 0.48 + 8, 11, 0, Math.PI * 2);
            ctx.arc(w / 2 + b.w * 0.25, h / 2 + b.h * 0.48 + 8, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (state.preset === 'stamp') {
          // --- 2. STAMP SLAM DROP & IMPACT SHAKE ---
          const slamT = Math.min(1.0, progress / 0.28);
          let scale = 1.0;
          let alpha = 1.0;
          let shakeX = 0;
          let shakeY = 0;

          if (slamT < 1.0) {
            // High velocity drop
            scale = 3.4 * (1 - slamT) + 1.0;
            alpha = 0.3 + slamT * 0.7;
          } else {
            // Impact shake with exponential decay
            const decay = Math.max(0, 1.0 - (progress - 0.28) * 4.2);
            shakeX = (Math.random() - 0.5) * 16 * decay;
            shakeY = (Math.random() - 0.5) * 16 * decay;
          }

          ctx.save();
          ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
          ctx.scale(scale, scale);
          ctx.globalAlpha = alpha;
          ctx.drawImage(activeImage, -b.w / 2, -b.h / 2, b.w, b.h);

          // Ink distress border on impact
          if (slamT >= 1.0) {
            ctx.strokeStyle = state.inkColor;
            ctx.lineWidth = Math.max(2, state.strokeWidth * 1.2);
            ctx.strokeRect(-b.w / 2 - 10, -b.h / 2 - 10, b.w + 20, b.h + 20);
          }
          ctx.restore();
        } else if (state.preset === 'hatch') {
          // --- 3. CHALK / CRAYON HATCH FILL (MASKED TO SILHOUETTE) ---
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = w;
          tempCanvas.height = h;
          const tctx = tempCanvas.getContext('2d');

          if (tctx) {
            tctx.strokeStyle = state.inkColor;
            tctx.lineWidth = Math.max(2, state.strokeWidth * 1.8);
            tctx.lineCap = 'round';
            tctx.lineJoin = 'round';

            const hatchProgress = Math.min(1.0, progress * 1.2);
            const step = 16;
            let lastChalkX = b.x;
            let lastChalkY = b.y;

            if (state.chalkPattern === 'cross' || state.chalkPattern === 'diagonal') {
              const maxOffset = b.w + b.h;
              const currentOffset = maxOffset * hatchProgress;

              for (let d = 0; d < currentOffset; d += step) {
                const x1 = Math.max(b.x, b.x + d - b.h);
                const y1 = Math.min(b.y + b.h, b.y + d);
                const x2 = Math.min(b.x + b.w, b.x + d);
                const y2 = Math.max(b.y, b.y + d - b.w);

                tctx.beginPath();
                tctx.moveTo(x1, y1);
                tctx.lineTo(x2, y2);
                tctx.stroke();

                lastChalkX = x2;
                lastChalkY = y2;

                if (state.chalkPattern === 'cross' && progress > 0.4) {
                  tctx.beginPath();
                  tctx.moveTo(b.x + b.w - (x1 - b.x), y1);
                  tctx.lineTo(b.x + b.w - (x2 - b.x), y2);
                  tctx.stroke();
                }
              }
            } else if (state.chalkPattern === 'zigzag') {
              const linesCount = Math.floor((b.h / step) * hatchProgress);
              tctx.beginPath();
              let toggle = false;
              for (let i = 0; i < linesCount; i++) {
                const yPos = b.y + i * step;
                if (i === 0) tctx.moveTo(b.x, yPos);
                if (toggle) {
                  tctx.lineTo(b.x + b.w, yPos);
                  tctx.lineTo(b.x + b.w, yPos + step);
                  lastChalkX = b.x + b.w;
                } else {
                  tctx.lineTo(b.x, yPos);
                  tctx.lineTo(b.x, yPos + step);
                  lastChalkX = b.x;
                }
                lastChalkY = yPos + step;
                toggle = !toggle;
              }
              tctx.stroke();
            } else {
              // Loops pattern
              const totalLoops = Math.floor(45 * hatchProgress);
              for (let i = 0; i < totalLoops; i++) {
                const lx = b.x + (Math.sin(i * 123.4) * 0.45 + 0.5) * b.w;
                const ly = b.y + (Math.cos(i * 456.7) * 0.45 + 0.5) * b.h;
                tctx.beginPath();
                tctx.arc(lx, ly, 18, 0, Math.PI * 2);
                tctx.stroke();
                lastChalkX = lx;
                lastChalkY = ly;
              }
            }

            // Mask chalk lines strictly to logo silhouette
            if (cd && cd.silhouetteCanvas) {
              tctx.globalCompositeOperation = 'destination-in';
              tctx.drawImage(cd.silhouetteCanvas, 0, 0);
            }

            // Draw base faded image underneath
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.drawImage(activeImage, b.x, b.y, b.w, b.h);
            ctx.globalAlpha = 1.0;
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.restore();

            // Chalk Stick & Dust Indicator
            if (progress < 0.95) {
              ctx.save();
              ctx.translate(lastChalkX, lastChalkY);
              ctx.rotate(Math.PI / 6);
              ctx.fillStyle = state.inkColor;
              ctx.fillRect(-4, -28, 8, 28);
              ctx.restore();
            }
          }
        } else if (state.preset === 'sketch' && cd && cd.loops.length > 0) {
          // --- 4. VECTOR CONTOUR PENCIL REVEAL (LOGO OUTLINES) ---
          const drawDist = Math.min(1.0, progress / 0.72) * cd.totalLength;
          let accumDist = 0;
          let tipX = b.x + b.w / 2;
          let tipY = b.y + b.h / 2;

          ctx.save();
          ctx.strokeStyle = state.inkColor;
          ctx.lineWidth = Math.max(1.5, state.strokeWidth * 1.5);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let l = 0; l < cd.loops.length; l++) {
            const loop = cd.loops[l];
            const loopLen = cd.loopLengths[l] || 1;

            if (accumDist >= drawDist) break;

            ctx.beginPath();
            ctx.moveTo(loop[0][0], loop[0][1]);

            let currSubDist = 0;
            for (let p = 0; p < loop.length - 1; p++) {
              const segLen = Math.hypot(loop[p + 1][0] - loop[p][0], loop[p + 1][1] - loop[p][1]);
              if (accumDist + currSubDist + segLen <= drawDist) {
                ctx.lineTo(loop[p + 1][0], loop[p + 1][1]);
                currSubDist += segLen;
                tipX = loop[p + 1][0];
                tipY = loop[p + 1][1];
              } else {
                const remain = drawDist - (accumDist + currSubDist);
                const t = Math.max(0, Math.min(1, remain / Math.max(0.001, segLen)));
                const finalX = loop[p][0] + (loop[p + 1][0] - loop[p][0]) * t;
                const finalY = loop[p][1] + (loop[p + 1][1] - loop[p][1]) * t;
                ctx.lineTo(finalX, finalY);
                tipX = finalX;
                tipY = finalY;
                break;
              }
            }
            ctx.stroke();
            accumDist += loopLen;
          }

          // Smoothly fade in filled silhouette after lines are traced
          if (progress > 0.65) {
            const fillAlpha = Math.min(1.0, (progress - 0.65) / 0.35);
            ctx.globalAlpha = fillAlpha;
            ctx.drawImage(cd.silhouetteCanvas, 0, 0);
          }
          ctx.restore();

          // Animated drafting pencil tip following active vector path
          if (progress < 0.95) {
            ctx.save();
            ctx.translate(tipX, tipY);
            ctx.rotate(-Math.PI / 4);

            // Pencil wooden shaft
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, -6, 38, 12);
            // Eraser & gold ferrule
            ctx.fillStyle = '#d97706';
            ctx.fillRect(38, -6, 6, 12);
            ctx.fillStyle = '#f472b6';
            ctx.fillRect(44, -6, 8, 12);
            // Sharpened cone
            ctx.fillStyle = '#e2c59f';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(-12, 0);
            ctx.lineTo(0, 6);
            ctx.fill();
            // Graphite lead
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.moveTo(-6, -3);
            ctx.lineTo(-12, 0);
            ctx.lineTo(-6, 3);
            ctx.fill();
            ctx.restore();
          }
        } else {
          // --- 5. SQUIGGLEVISION LINE BOIL (ALIVE ANIMATION) ---
          ctx.save();
          ctx.drawImage(activeImage, b.x, b.y, b.w, b.h);
          ctx.restore();
        }
      } else {
        // --- 1930s CLASSIC RETRO CARTOON MASCOT (Rubber-Hose Character) ---
        ctx.save();
        ctx.translate(w / 2, h / 2);

        let bounceY = 0;
        let squashX = 1.0;
        let squashY = 1.0;
        let tiltRot = 0;

        if (state.preset === 'rubber') {
          const t = elapsed * 7.5;
          const bounce = Math.abs(Math.sin(t));
          const squash = Math.sin(t);
          bounceY = -bounce * 40;
          squashX = 1.0 + squash * 0.18;
          squashY = 1.0 - squash * 0.18;
          tiltRot = Math.sin(elapsed * 3.75) * 0.08;
        } else if (state.preset === 'stamp') {
          const slamT = Math.min(1.0, progress / 0.28);
          if (slamT < 1.0) {
            squashX = 3.0 * (1 - slamT) + 1.0;
            squashY = squashX;
          } else {
            const decay = Math.max(0, 1 - (progress - 0.28) * 4);
            bounceY = (Math.random() - 0.5) * 12 * decay;
          }
        }

        ctx.translate(0, bounceY);
        ctx.rotate(tiltRot);
        ctx.scale(squashX, squashY);

        // Progress cutoff for sketch drawing
        const drawPct = state.preset === 'sketch' ? progress : 1.0;

        // 1. Head Silhouette
        if (drawPct > 0.05) {
          ctx.beginPath();
          ctx.arc(0, -20, 130, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();
        }

        // 2. Cartoon Ears
        if (drawPct > 0.25) {
          ctx.beginPath();
          ctx.arc(-110, -130, 55, 0, Math.PI * 2);
          ctx.arc(110, -130, 55, 0, Math.PI * 2);
          ctx.fillStyle = state.inkColor;
          ctx.fill();
          ctx.stroke();
        }

        // 3. Iconic Pie-Cut Eyes (Retro 1930s)
        if (drawPct > 0.45) {
          const blink = state.preset === 'rubber' && Math.sin(elapsed * 4.0) > 0.94;
          if (!blink) {
            // Left Eye
            ctx.beginPath();
            ctx.ellipse(-42, -50, 20, 36, 0, 0, Math.PI * 2);
            ctx.fillStyle = state.inkColor;
            ctx.fill();
            // Left Pie-slice notch
            ctx.beginPath();
            ctx.moveTo(-42, -50);
            ctx.lineTo(-24, -62);
            ctx.lineTo(-24, -38);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Right Eye
            ctx.beginPath();
            ctx.ellipse(42, -50, 20, 36, 0, 0, Math.PI * 2);
            ctx.fillStyle = state.inkColor;
            ctx.fill();
            // Right Pie-slice notch
            ctx.beginPath();
            ctx.moveTo(42, -50);
            ctx.lineTo(24, -62);
            ctx.lineTo(24, -38);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          } else {
            // Blink closed eyes
            ctx.beginPath();
            ctx.moveTo(-60, -50);
            ctx.quadraticCurveTo(-42, -35, -24, -50);
            ctx.moveTo(24, -50);
            ctx.quadraticCurveTo(42, -35, 60, -50);
            ctx.stroke();
          }
        }

        // 4. Cartoon Nose
        if (drawPct > 0.6) {
          ctx.beginPath();
          ctx.ellipse(0, -10, 16, 11, 0, 0, Math.PI * 2);
          ctx.fillStyle = state.inkColor;
          ctx.fill();
        }

        // 5. Huge Cartoon Smile & Dimples
        if (drawPct > 0.75) {
          ctx.beginPath();
          ctx.arc(0, 10, 75, 0.15 * Math.PI, 0.85 * Math.PI);
          ctx.stroke();

          // Left dimple
          ctx.beginPath();
          ctx.arc(-65, 30, 12, 1.2 * Math.PI, 1.8 * Math.PI);
          ctx.stroke();

          // Right dimple
          ctx.beginPath();
          ctx.arc(65, 30, 12, 1.2 * Math.PI, 1.8 * Math.PI);
          ctx.stroke();
        }

        // 6. Cartoon Four-Finger Gloves
        if (drawPct > 0.88) {
          const armWave = state.preset === 'rubber' ? Math.sin(elapsed * 7.5) * 20 : 0;

          // Left Glove
          ctx.save();
          ctx.translate(-140, 40 + armWave);
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();
          // Dart stitches on back of glove
          ctx.beginPath();
          ctx.moveTo(-10, -8); ctx.lineTo(-10, 10);
          ctx.moveTo(0, -10); ctx.lineTo(0, 12);
          ctx.moveTo(10, -8); ctx.lineTo(10, 10);
          ctx.stroke();
          ctx.restore();

          // Right Glove
          ctx.save();
          ctx.translate(140, 40 - armWave);
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-10, -8); ctx.lineTo(-10, 10);
          ctx.moveTo(0, -10); ctx.lineTo(0, 12);
          ctx.moveTo(10, -8); ctx.lineTo(10, 10);
          ctx.stroke();
          ctx.restore();
        }

        // Pencil tip for cartoon drawing
        if (state.preset === 'sketch' && progress < 0.98) {
          ctx.save();
          ctx.translate(Math.sin(elapsed * 8) * 120, Math.cos(elapsed * 8) * 90);
          ctx.rotate(-Math.PI / 4);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(0, -5, 36, 10);
          ctx.fillStyle = '#111';
          ctx.beginPath();
          ctx.moveTo(0, -5); ctx.lineTo(-10, 0); ctx.lineTo(0, 5);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeImage, state, isPlaying]);

  return (
    <div
      className="relative w-full h-[calc(100vh-36px)] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: state.paper || '#f4eee1' }}
    >
      {/* 2D Canvas with Line Boil Filter */}
      <canvas
        ref={canvasRef}
        style={{ filter: state.jitter ? 'url(#cartoon-boil)' : 'none' }}
        className="max-w-[85vw] max-h-[85vh] object-contain shadow-2xl rounded-xl"
      />

      {/* Hidden File Input for Custom Image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Floating 2D Controls macOS Widget */}
      <div className="absolute top-4 right-4 z-20 w-80 bg-[#252525] border border-[#3c3c3c] rounded-xl shadow-2xl p-4 text-xs space-y-3.5 max-h-[calc(100vh-80px)] overflow-y-auto text-[#e0e0e0]">
        <div className="flex items-center justify-between pb-2 border-b border-[#3c3c3c]">
          <span className="font-semibold text-white">Animação 2D Cartoon</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded bg-[#333] hover:bg-[#444] text-[#007aff]"
              title={isPlaying ? 'Pausar' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetReplay}
              className="flex items-center gap-1 text-[11px] text-[#007aff] hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Replay
            </button>
          </div>
        </div>

        {/* Source Selection */}
        <div className="space-y-1.5 bg-[#1e1e1e] p-2 rounded-lg border border-[#333]">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block">
            Origem da Imagem
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setSourceMode('mascot')}
              className={`py-1.5 px-1 rounded text-center text-[10px] font-medium transition-all ${
                sourceMode === 'mascot'
                  ? 'bg-[#007aff] text-white font-semibold shadow-xs'
                  : 'bg-[#2d2d2d] text-[#b0b0b0] hover:text-white'
              }`}
            >
              ✨ Mascote '30
            </button>
            <button
              disabled={!image}
              onClick={() => {
                if (image) setSourceMode('canvas');
              }}
              className={`py-1.5 px-1 rounded text-center text-[10px] font-medium transition-all ${
                sourceMode === 'canvas'
                  ? 'bg-[#007aff] text-white font-semibold shadow-xs'
                  : image
                  ? 'bg-[#2d2d2d] text-[#b0b0b0] hover:text-white'
                  : 'bg-[#222] text-[#555] cursor-not-allowed'
              }`}
              title={image ? 'Usar arte da prancheta Canvas' : 'Nenhuma imagem carregada no canvas'}
            >
              🎨 Do Canvas
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`py-1.5 px-1 rounded text-center text-[10px] font-medium transition-all ${
                sourceMode === 'custom'
                  ? 'bg-[#007aff] text-white font-semibold shadow-xs'
                  : 'bg-[#2d2d2d] text-[#b0b0b0] hover:text-white'
              }`}
            >
              📁 Carregar
            </button>
          </div>
        </div>

        {/* Animation Preset */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-1">
            Estilo da Animação
          </label>
          <select
            value={state.preset}
            onChange={e => {
              onChange(s => ({ ...s, preset: e.target.value as any }));
              resetReplay();
            }}
            className="w-full px-2 py-1.5 rounded-lg bg-[#2d2d2d] border border-[#3c3c3c] text-white text-xs focus:outline-none focus:border-[#007aff]"
          >
            <option value="sketch">✍️ Traçado à Mão (Pencil Reveal)</option>
            <option value="hatch">🖍️ Rabisco de Giz (Chalk Hatch)</option>
            <option value="rubber">🕺 Rubber Hose (Anos 30 Bounce)</option>
            <option value="stamp">💥 Carimbo com Slam (Impacto)</option>
            <option value="boil">〰️ Line Boil Puro (Squigglevision)</option>
          </select>
        </div>

        {/* Chalk Pattern (If Hatch is selected) */}
        {state.preset === 'hatch' && (
          <div className="bg-[#1e1e1e] p-2 rounded-lg border border-[#333]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-1">
              Padrão do Giz / Giz de Cera
            </label>
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: 'zigzag', name: '⚡ Zig-zag' },
                { id: 'cross', name: '❌ Cruzado' },
                { id: 'loops', name: '🌀 Espirais' },
                { id: 'diagonal', name: '📐 Diagonal' },
              ].map(pat => (
                <button
                  key={pat.id}
                  onClick={() => onChange(s => ({ ...s, chalkPattern: pat.id as any }))}
                  className={`py-1 px-1.5 rounded text-center text-[10px] border transition-all ${
                    state.chalkPattern === pat.id
                      ? 'bg-[#007aff] border-[#007aff] text-white font-semibold'
                      : 'bg-[#2d2d2d] border-[#3c3c3c] text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  {pat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        <div>
          <div className="flex justify-between text-[#b0b0b0] mb-0.5">
            <span>Duração do Ciclo</span>
            <span className="font-mono text-[#007aff] font-bold">{state.duration.toFixed(1)}s</span>
          </div>
          <input
            type="range" min="1.0" max="8.0" step="0.5" value={state.duration}
            onChange={e => onChange(s => ({ ...s, duration: parseFloat(e.target.value) }))}
            className="w-full accent-[#007aff]"
          />
        </div>

        {/* FPS & Boil */}
        <div>
          <div className="flex justify-between text-[#b0b0b0] mb-0.5">
            <span>Taxa de Quadros (FPS)</span>
            <span className="font-mono text-[#007aff] font-bold">{state.fps} FPS</span>
          </div>
          <input
            type="range" min="4" max="24" step="1" value={state.fps}
            onChange={e => onChange(s => ({ ...s, fps: parseInt(e.target.value) }))}
            className="w-full accent-[#007aff]"
          />
        </div>

        {/* Jitter / Boil Intensity */}
        <div>
          <div className="flex justify-between text-[#b0b0b0] mb-0.5">
            <span className="flex items-center gap-1">
              <span>Tremor Line Boil</span>
              <input
                type="checkbox"
                checked={state.jitter}
                onChange={e => onChange(s => ({ ...s, jitter: e.target.checked }))}
                className="w-3.5 h-3.5 accent-[#007aff] rounded ml-1"
              />
            </span>
            <span className="font-mono text-[#007aff] font-bold">{state.scale}px</span>
          </div>
          {state.jitter && (
            <input
              type="range" min="2" max="18" step="1" value={state.scale}
              onChange={e => onChange(s => ({ ...s, scale: parseInt(e.target.value) }))}
              className="w-full accent-[#007aff]"
            />
          )}
        </div>

        {/* Stroke Width */}
        <div>
          <div className="flex justify-between text-[#b0b0b0] mb-0.5">
            <span>Espessura do Traço</span>
            <span className="font-mono text-[#007aff] font-bold">{state.strokeWidth}px</span>
          </div>
          <input
            type="range" min="1" max="8" step="1" value={state.strokeWidth}
            onChange={e => onChange(s => ({ ...s, strokeWidth: parseInt(e.target.value) }))}
            className="w-full accent-[#007aff]"
          />
        </div>

        {/* Paper Background */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-1">
            Tipo de Papel / Fundo
          </label>
          <select
            value={state.paper}
            onChange={e => onChange(s => ({ ...s, paper: e.target.value }))}
            className="w-full px-2 py-1.5 rounded-lg bg-[#2d2d2d] border border-[#3c3c3c] text-white text-xs focus:outline-none focus:border-[#007aff]"
          >
            <option value="#f4eee1">Papel Sulfite Quente / Antigo</option>
            <option value="#ffffff">Branco Puro</option>
            <option value="#fef08a">Papel Amarelado Post-it</option>
            <option value="#93c5fd">Blueprint Azul Técnico</option>
            <option value="#18181b">Quadro Negro Dark</option>
          </select>
        </div>

        {/* Ink Color */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[#b0b0b0]">Cor da Tinta / Traço</span>
          <input
            type="color"
            value={state.inkColor}
            onChange={e => onChange(s => ({ ...s, inkColor: e.target.value }))}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        {/* Loop toggle */}
        <div className="pt-2 border-t border-[#3c3c3c]">
          <label className="flex items-center justify-between text-[#b0b0b0] cursor-pointer">
            <span>Repetir em Loop</span>
            <input
              type="checkbox"
              checked={state.loop}
              onChange={e => onChange(s => ({ ...s, loop: e.target.checked }))}
              className="w-4 h-4 accent-[#007aff] rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
