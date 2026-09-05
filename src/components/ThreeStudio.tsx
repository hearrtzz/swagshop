import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Upload, Sparkles, Image as ImageIcon, RotateCcw, Sliders, Check, Layers } from 'lucide-react';
import { ThreeStudioState } from '../types';

interface ThreeStudioProps {
  image: HTMLImageElement | null;
  state: ThreeStudioState;
  onChange: React.Dispatch<React.SetStateAction<ThreeStudioState>>;
  onResetCamera: () => void;
}

// Built-in Sample SVGs for instant one-click testing
const BUILTIN_SVGS: Record<string, { name: string; svg: string }> = {
  cross: {
    name: 'Cruz Gótica',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000000" d="M 43,4 L 57,4 L 57,36 L 90,36 L 90,48 L 57,48 L 57,96 L 43,96 L 43,48 L 10,48 L 10,36 L 43,36 Z" />
      <path fill="#000000" d="M 50,0 L 55,7 L 50,12 L 45,7 Z" />
      <path fill="#000000" d="M 50,88 L 55,94 L 50,100 L 45,94 Z" />
      <path fill="#000000" d="M 6,42 L 12,46 L 6,50 L 0,46 Z" />
      <path fill="#000000" d="M 94,42 L 100,46 L 94,50 L 88,46 Z" />
      <circle cx="50" cy="42" r="6" fill="#000000" />
    </svg>`,
  },
  lightning: {
    name: 'Raio Cyber',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000000" d="M 56,2 L 18,52 L 46,52 L 34,98 L 84,44 L 52,44 Z" />
    </svg>`,
  },
  heart: {
    name: 'Coração Y2K',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000000" d="M 50,88 C 22,65 6,45 6,26 C 6,12 17,3 31,3 C 41,3 47,8 50,16 C 53,8 59,3 69,3 C 83,3 94,12 94,26 C 94,45 78,65 50,88 Z" />
    </svg>`,
  },
  badge: {
    name: 'Emblema Star',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="#000000" points="50,5 64,36 98,36 71,58 81,91 50,71 19,91 29,58 2,36 36,36" />
    </svg>`,
  },
};

// Ascii Atlas Generator
function createAsciiAtlas(): THREE.CanvasTexture {
  const chars = " .:-=+*#%@";
  const canvas = document.createElement('canvas');
  canvas.width = chars.length * 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i], i * 32 + 16, 16);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

// Studio Lighting Environment
function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0f131a');
    grad.addColorStop(0.48, '#262f40');
    grad.addColorStop(0.50, '#080a0e');
    grad.addColorStop(1, '#11151c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    const softbox = ctx.createRadialGradient(512, 110, 10, 512, 110, 320);
    softbox.addColorStop(0, '#ffffff');
    softbox.addColorStop(0.3, '#edf2ff');
    softbox.addColorStop(0.7, 'rgba(180, 205, 245, 0.4)');
    softbox.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = softbox;
    ctx.fillRect(0, 0, 1024, 300);

    const leftRim = ctx.createLinearGradient(120, 0, 200, 0);
    leftRim.addColorStop(0, 'rgba(255,255,255,0)');
    leftRim.addColorStop(0.5, '#ffffff');
    leftRim.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = leftRim;
    ctx.fillRect(120, 60, 80, 400);

    const rightRim = ctx.createLinearGradient(820, 0, 900, 0);
    rightRim.addColorStop(0, 'rgba(255,230,200,0)');
    rightRim.addColorStop(0.5, '#fff1e0');
    rightRim.addColorStop(1, 'rgba(255,230,200,0)');
    ctx.fillStyle = rightRim;
    ctx.fillRect(820, 80, 80, 380);
  }

  const envTex = new THREE.CanvasTexture(canvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envMap = pmrem.fromEquirectangular(envTex).texture;
  pmrem.dispose();
  envTex.dispose();

  return envMap;
}

const PostShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tAscii;
    uniform vec2 uResolution;
    uniform int uFilter;
    uniform float uCellSize;
    uniform int uAsciiColorMode;
    varying vec2 vUv;

    vec4 renderCelShading() {
      vec2 texel = 1.0 / uResolution;
      float offset = max(1.0, uCellSize * 0.25);

      float l00 = dot(texture2D(tDiffuse, vUv + vec2(-texel.x, -texel.y) * offset).rgb, vec3(0.299, 0.587, 0.114));
      float l10 = dot(texture2D(tDiffuse, vUv + vec2(0.0, -texel.y) * offset).rgb, vec3(0.299, 0.587, 0.114));
      float l20 = dot(texture2D(tDiffuse, vUv + vec2(texel.x, -texel.y) * offset).rgb, vec3(0.299, 0.587, 0.114));
      float l01 = dot(texture2D(tDiffuse, vUv + vec2(-texel.x, 0.0) * offset).rgb, vec3(0.299, 0.587, 0.114));
      float l21 = dot(texture2D(tDiffuse, vUv + vec2(texel.x, 0.0) * offset).rgb, vec3(0.299, 0.587, 0.114));
      float l02 = dot(texture2D(tDiffuse, vUv + vec2(-texel.x, texel.y) * offset).rgb, vec3(0.299, 0.587, 0.114));
      float l12 = dot(texture2D(tDiffuse, vUv + vec2(0.0, texel.y) * offset).rgb, vec3(0.299, 0.587, 0.114));
      float l22 = dot(texture2D(tDiffuse, vUv + vec2(texel.x, texel.y) * offset).rgb, vec3(0.299, 0.587, 0.114));

      float gx = (l20 + 2.0 * l21 + l22) - (l00 + 2.0 * l01 + l02);
      float gy = (l02 + 2.0 * l12 + l22) - (l00 + 2.0 * l10 + l20);
      float edge = sqrt(gx * gx + gy * gy);

      vec4 color = texture2D(tDiffuse, vUv);
      float bands = 4.0;
      vec3 posterized = floor(color.rgb * bands + 0.5) / bands;

      float lum = dot(posterized, vec3(0.299, 0.587, 0.114));
      posterized = mix(vec3(lum), posterized, 1.35);

      float outline = smoothstep(0.25, 0.45, edge * 2.0);
      return vec4(mix(posterized, vec3(0.04, 0.04, 0.06), outline), 1.0);
    }

    vec4 renderHalftone() {
      float angle = 0.785398;
      vec2 p = gl_FragCoord.xy;
      mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      vec2 rotP = rot * p;
      vec2 cell = floor(rotP / uCellSize);
      vec2 cellCenterRot = (cell + 0.5) * uCellSize;
      mat2 invRot = mat2(cos(-angle), -sin(-angle), sin(-angle), cos(-angle));
      vec2 cellCenter = invRot * cellCenterRot;
      vec2 sampleUv = clamp(cellCenter / uResolution, 0.0, 1.0);

      vec4 color = texture2D(tDiffuse, sampleUv);
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      float dist = length(rotP - cellCenterRot);
      float maxRadius = uCellSize * 0.68;
      float dotRadius = maxRadius * sqrt(clamp(lum, 0.0, 1.0));
      float dotMask = smoothstep(dotRadius + 0.75, dotRadius - 0.75, dist);

      return vec4(vec3(dotMask), 1.0);
    }

    vec4 renderAscii() {
      vec2 coord = floor(gl_FragCoord.xy / uCellSize);
      vec2 sampleUv = (coord * uCellSize + uCellSize * 0.5) / uResolution;
      vec4 srcColor = texture2D(tDiffuse, sampleUv);
      float lum = clamp(dot(srcColor.rgb, vec3(0.299, 0.587, 0.114)), 0.0, 0.999);

      float charIndex = floor(lum * 10.0);
      vec2 cellUv = fract(gl_FragCoord.xy / uCellSize);
      vec2 charUv = vec2((charIndex + cellUv.x) / 10.0, cellUv.y);

      float glyph = texture2D(tAscii, charUv).r;
      if (uAsciiColorMode == 1) {
        return vec4(srcColor.rgb * glyph, 1.0);
      }
      return vec4(vec3(0.15, 0.95, 0.35) * glyph, 1.0);
    }

    vec4 renderChromatic() {
      vec2 shift = (vUv - 0.5) * (uCellSize * 0.003);
      float r = texture2D(tDiffuse, vUv + shift).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - shift).b;
      return vec4(r, g, b, 1.0);
    }

    vec4 renderPixelation() {
      vec2 pixelCoord = floor(gl_FragCoord.xy / uCellSize) * uCellSize + uCellSize * 0.5;
      vec2 pixelUv = pixelCoord / uResolution;
      return texture2D(tDiffuse, pixelUv);
    }

    void main() {
      if (uFilter == 1) gl_FragColor = renderHalftone();
      else if (uFilter == 2) gl_FragColor = renderAscii();
      else if (uFilter == 3) gl_FragColor = renderChromatic();
      else if (uFilter == 4) gl_FragColor = renderPixelation();
      else if (uFilter == 5) gl_FragColor = renderCelShading();
      else gl_FragColor = texture2D(tDiffuse, vUv);
    }
  `,
};

// --- PNG Black Pixel to High-Detail 3D Extrusion Geometry ---
function simplifyPoints(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const num = Math.abs((end[1] - start[1]) * p[0] - (end[0] - start[0]) * p[1] + end[0] * start[1] - end[1] * start[0]);
    const den = Math.hypot(end[1] - start[1], end[0] - start[0]);
    const d = den === 0 ? Math.hypot(p[0] - start[0], p[1] - start[1]) : num / den;
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPoints(points.slice(0, index + 1), tolerance);
    const right = simplifyPoints(points.slice(index), tolerance);
    return left.slice(0, left.length - 1).concat(right);
  }
  return [start, end];
}

// Chaikin corner smoothing algorithm to eliminate pixelated staircase artifacts
function applyChaikinSmoothing(points: [number, number][], passes: number = 2): [number, number][] {
  let pts = points;
  for (let p = 0; p < passes; p++) {
    if (pts.length < 3) break;
    const nextPts: [number, number][] = [];
    const len = pts.length;
    const isClosed = Math.hypot(pts[0][0] - pts[len - 1][0], pts[0][1] - pts[len - 1][1]) < 0.1;

    for (let i = 0; i < len - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const q: [number, number] = [0.75 * p0[0] + 0.25 * p1[0], 0.75 * p0[1] + 0.25 * p1[1]];
      const r: [number, number] = [0.25 * p0[0] + 0.75 * p1[0], 0.25 * p0[1] + 0.75 * p1[1]];
      nextPts.push(q, r);
    }
    if (isClosed && nextPts.length > 0) {
      nextPts.push(nextPts[0]);
    }
    pts = nextPts;
  }
  return pts;
}

function traceBlackPixelsToShapes(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  threshold: number,
  invert: boolean,
  smoothPasses: number = 2,
  preBlur: number = 1.0
): THREE.Shape[] {
  // High-resolution sampling (up to 750px) to capture every single curve, serif and cutout of the logo!
  const maxDim = 720;
  const srcW = imageSource.width || 720;
  const srcH = imageSource.height || 720;
  const scale = Math.min(maxDim / srcW, maxDim / srcH, 1.0);
  const w = Math.max(16, Math.floor(srcW * scale));
  const h = Math.max(16, Math.floor(srcH * scale));

  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return [];

  // Pre-blur to anti-alias pixel edges before sub-pixel Marching Squares
  if (preBlur > 0) {
    ctx.filter = `blur(${preBlur.toFixed(1)}px)`;
  }
  ctx.drawImage(imageSource, 0, 0, w, h);
  ctx.filter = 'none';

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Build high-resolution luminance grid with 1-pixel border padding
  const padW = w + 2;
  const padH = h + 2;
  const lumGrid: number[] = new Array(padW * padH).fill(invert ? 0 : 255);
  const boolGrid: boolean[] = new Array(padW * padH).fill(false);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Luminance check: "tudo que for preto, ele da extrude"
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (a < 30) {
        // Transparent pixels are treated as empty background
        lum = invert ? 0 : 255;
      }
      const gridIdx = (y + 1) * padW + (x + 1);
      lumGrid[gridIdx] = lum;
      boolGrid[gridIdx] = invert ? lum >= threshold : lum < threshold;
    }
  }

  // Linear interpolation for sub-pixel boundary positioning
  const interp = (v1: number, v2: number): number => {
    if (Math.abs(v2 - v1) < 0.0001) return 0.5;
    const t = (threshold - v1) / (v2 - v1);
    return Math.max(0.05, Math.min(0.95, t));
  };

  // Marching Squares Segments with Sub-Pixel Interpolation
  const segments: Map<string, { start: [number, number]; end: [number, number] }> = new Map();

  for (let y = 0; y < padH - 1; y++) {
    for (let x = 0; x < padW - 1; x++) {
      const tl = boolGrid[y * padW + x];
      const tr = boolGrid[y * padW + (x + 1)];
      const br = boolGrid[(y + 1) * padW + (x + 1)];
      const bl = boolGrid[(y + 1) * padW + x];

      const code = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (code === 0 || code === 15) continue;

      const tlLum = lumGrid[y * padW + x];
      const trLum = lumGrid[y * padW + (x + 1)];
      const brLum = lumGrid[(y + 1) * padW + (x + 1)];
      const blLum = lumGrid[(y + 1) * padW + x];

      const topPt: [number, number] = [x + interp(tlLum, trLum), y];
      const rightPt: [number, number] = [x + 1, y + interp(trLum, brLum)];
      const bottomPt: [number, number] = [x + interp(blLum, brLum), y + 1];
      const leftPt: [number, number] = [x, y + interp(tlLum, blLum)];

      const addSeg = (p1: [number, number], p2: [number, number]) => {
        const key = `${p1[0].toFixed(2)},${p1[1].toFixed(2)}`;
        segments.set(key, { start: p1, end: p2 });
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

  // Assemble continuous closed contour loops
  const rawLoops: [number, number][][] = [];
  const visited = new Set<string>();

  segments.forEach((seg, startKey) => {
    if (visited.has(startKey)) return;
    const loop: [number, number][] = [seg.start];
    visited.add(startKey);
    let curr = seg.end;

    for (let step = 0; step < 20000; step++) {
      loop.push(curr);
      const nextKey = `${curr[0].toFixed(2)},${curr[1].toFixed(2)}`;
      if (visited.has(nextKey)) break;
      visited.add(nextKey);
      const nextSeg = segments.get(nextKey);
      if (!nextSeg) break;
      curr = nextSeg.end;
      if (Math.hypot(curr[0] - seg.start[0], curr[1] - seg.start[1]) < 0.8) {
        loop.push(seg.start);
        break;
      }
    }

    if (loop.length >= 4) {
      // 1. Simplify with small tolerance (0.22) to retain fine curves and corners
      const simplified = simplifyPoints(loop, 0.22);
      // 2. Chaikin smoothing pass to convert hard polygon steps into soft vector curves
      const smoothed = smoothPasses > 0 ? applyChaikinSmoothing(simplified, Math.min(3, smoothPasses)) : simplified;
      rawLoops.push(smoothed);
    }
  });

  if (rawLoops.length === 0) return [];

  // Group loops into outer shapes and holes using signed area & point-in-polygon
  interface Polygon {
    points: [number, number][];
    area: number;
    isHole: boolean;
    holes: [number, number][][];
  }

  const polys: Polygon[] = rawLoops.map((pts) => {
    let a = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
    }
    const area = a * 0.5;
    return {
      points: pts,
      area,
      isHole: area < 0,
      holes: [],
    };
  }).filter(p => Math.abs(p.area) > 3.0);

  const outerPolys = polys.filter(p => !p.isHole);
  const holePolys = polys.filter(p => p.isHole);

  // Helper point in polygon test
  function pointInPoly(pt: [number, number], poly: [number, number][]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Match holes to their parent outer polygon
  for (const hole of holePolys) {
    const testPt = hole.points[0];
    for (const outer of outerPolys) {
      if (pointInPoly(testPt, outer.points)) {
        outer.holes.push(hole.points);
        break;
      }
    }
  }

  // Convert to THREE.Shape array (inverting Y for 3D coordinate space)
  const threeShapes: THREE.Shape[] = [];
  for (const outer of outerPolys) {
    const shape = new THREE.Shape();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    outer.points.forEach((pt, idx) => {
      const x = pt[0];
      const y = -pt[1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (idx === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });

    (shape as any).userData = { width: maxX - minX, height: maxY - minY };

    for (const holePts of outer.holes) {
      const holePath = new THREE.Path();
      holePts.forEach((pt, idx) => {
        const x = pt[0];
        const y = -pt[1];
        if (idx === 0) holePath.moveTo(x, y);
        else holePath.lineTo(x, y);
      });
      shape.holes.push(holePath);
    }
    threeShapes.push(shape);
  }

  return threeShapes;
}

export const ThreeStudio: React.FC<ThreeStudioProps> = ({
  image,
  state,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const postMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animPivotRef = useRef<THREE.Group | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active extrusion source
  const [activeExtrudeType, setActiveExtrudeType] = useState<'preset' | 'svg' | 'png' | 'canvas'>('preset');
  const [activePresetKey, setActivePresetKey] = useState<string>('cross');
  const [customSvgText, setCustomSvgText] = useState<string | null>(null);
  const [customPngImg, setCustomPngImg] = useState<HTMLImageElement | null>(null);
  const [sourceName, setSourceName] = useState<string>('Cruz Gótica (SVG)');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Build / Rebuild 3D Mesh Geometry
  const buildMesh = useCallback(() => {
    const modelGroup = modelGroupRef.current;
    const material = materialRef.current;
    if (!modelGroup || !material) return;

    // Clear previous children
    while (modelGroup.children.length > 0) {
      const child = modelGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      modelGroup.remove(child);
    }

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: state.depth || 14,
      bevelEnabled: state.bevel,
      bevelSegments: 4,
      steps: 1,
      bevelSize: state.bevelSize || 1.0,
      bevelThickness: state.bevelSize || 1.0,
    };

    let targetShapes: THREE.Shape[] = [];

    if (activeExtrudeType === 'svg' && customSvgText) {
      try {
        const loader = new SVGLoader();
        const svgData = loader.parse(customSvgText);
        for (const path of svgData.paths) {
          const style = (path.userData as any)?.style;
          const fill = style?.fill;
          const isDark = !fill || fill === 'none' || fill === 'black' || fill === '#000000' || fill === '#000';
          if (isDark || svgData.paths.length <= 4) {
            const pShapes = SVGLoader.createShapes(path);
            targetShapes.push(...pShapes);
          }
        }
        if (targetShapes.length === 0) {
          for (const path of svgData.paths) {
            targetShapes.push(...SVGLoader.createShapes(path));
          }
        }
      } catch (err) {
        console.error('Failed to parse SVG:', err);
      }
    } else if (activeExtrudeType === 'png' && customPngImg) {
      targetShapes = traceBlackPixelsToShapes(customPngImg, state.threshold, state.invert, state.smoothPasses ?? 2, state.preBlur ?? 1.0);
    } else if (activeExtrudeType === 'canvas' && image) {
      targetShapes = traceBlackPixelsToShapes(image, state.threshold, state.invert, state.smoothPasses ?? 2, state.preBlur ?? 1.0);
    } else {
      // Default: built-in SVG preset
      const presetSvg = BUILTIN_SVGS[activePresetKey]?.svg || BUILTIN_SVGS.cross.svg;
      try {
        const loader = new SVGLoader();
        const svgData = loader.parse(presetSvg);
        for (const path of svgData.paths) {
          targetShapes.push(...SVGLoader.createShapes(path));
        }
      } catch (err) {
        console.error('Built-in SVG parse failed:', err);
      }
    }

    // If shapes extracted successfully, create ExtrudeGeometry using HTML source logic
    if (targetShapes.length > 0) {
      try {
        const baseBevelSize = Number(state.bevelSize || 1.0);
        const group = new THREE.Group();

        targetShapes.forEach((shape) => {
          const sAny = shape as any;
          const minDim = Math.min(sAny.userData?.width || 50, sAny.userData?.height || 50);
          let useBevel = state.bevel;
          let effectiveBevel = baseBevelSize;

          if (minDim < baseBevelSize * 3) {
            effectiveBevel = minDim * 0.25;
            if (effectiveBevel < 0.08) useBevel = false;
          }

          const shapeExtrudeSettings: THREE.ExtrudeGeometryOptions = {
            depth: Number(state.depth || 14),
            bevelEnabled: useBevel,
            bevelSegments: useBevel ? 4 : 0,
            steps: 1,
            bevelSize: effectiveBevel,
            bevelThickness: effectiveBevel,
          };

          let geo: THREE.ExtrudeGeometry;
          try {
            geo = new THREE.ExtrudeGeometry(shape, shapeExtrudeSettings);
          } catch (e) {
            geo = new THREE.ExtrudeGeometry(shape, { ...shapeExtrudeSettings, bevelEnabled: false });
          }

          geo.computeVertexNormals();

          // If from SVG text, flip X/Y to face forward right-side up
          if (activeExtrudeType === 'svg' || activeExtrudeType === 'preset') {
            geo.rotateX(Math.PI);
          }

          const mesh = new THREE.Mesh(geo, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);
        });

        if (group.children.length > 0) {
          const box = new THREE.Box3().setFromObject(group);
          const center = new THREE.Vector3();
          const size = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          const maxDim = Math.max(size.x, size.y) || 1;
          const targetScale = 68 / maxDim;

          group.children.forEach((child) => {
            const mesh = child as THREE.Mesh;
            mesh.geometry.translate(-center.x, -center.y, -center.z);
          });

          modelGroup.scale.set(targetScale, targetScale, targetScale);
          modelGroup.add(group);
          return;
        }
      } catch (e) {
        console.warn('Adaptive ExtrudeGeometry failed, falling back to badge:', e);
      }
    }

    // Fallback: Default Chrome Emblem
    const shape = new THREE.Shape();
    const r = 26;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const hole = new THREE.Path();
    const hr = 12;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = hr * Math.cos(angle);
      const y = hr * Math.sin(angle);
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    }
    hole.closePath();
    shape.holes.push(hole);

    const fallbackGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    fallbackGeo.computeVertexNormals();
    fallbackGeo.center();
    const fallbackMesh = new THREE.Mesh(fallbackGeo, material);
    modelGroup.add(fallbackMesh);
  }, [activeExtrudeType, activePresetKey, customSvgText, customPngImg, image, state.depth, state.bevel, state.bevelSize, state.threshold, state.invert, state.smoothPasses, state.preBlur]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0c0e');

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 110);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 300;
    controls.minDistance = 20;
    controlsRef.current = controls;

    // Environment map for chrome reflections
    const envMap = createStudioEnvironment(renderer);
    scene.environment = envMap;

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(50, 70, 70);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa0c4ff, 1.4);
    fillLight.position.set(-60, -30, 40);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.8, 450);
    rimLight.position.set(0, 90, -100);
    scene.add(rimLight);

    const animPivot = new THREE.Group();
    const modelGroup = new THREE.Group();
    animPivot.add(modelGroup);
    scene.add(animPivot);
    animPivotRef.current = animPivot;
    modelGroupRef.current = modelGroup;

    // Chrome Material with Chroma Reflection
    const chromaFactor = state.chromaReflect ?? 1.6;
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(state.color),
      metalness: state.metalness,
      roughness: state.roughness,
      clearcoat: state.clearcoat,
      clearcoatRoughness: 0.04,
      reflectivity: Math.min(1.0, 0.4 + chromaFactor * 0.5),
      envMapIntensity: state.chromeEnabled ? state.chromeIntensity * chromaFactor : 0.0,
      iridescence: Math.min(1.0, chromaFactor * 0.7),
      iridescenceIOR: 1.3 + chromaFactor * 0.4,
      iridescenceThicknessRange: [120, 800],
      side: THREE.DoubleSide,
    });
    materialRef.current = mainMaterial;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth * dpr, window.innerHeight * dpr);
    const asciiFontTexture = createAsciiAtlas();

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const filterMap: Record<string, number> = { none: 0, halftone: 1, ascii: 2, chromatic: 3, pixel: 4, cel: 5 };

    const postMaterial = new THREE.ShaderMaterial({
      vertexShader: PostShader.vertexShader,
      fragmentShader: PostShader.fragmentShader,
      uniforms: {
        tDiffuse: { value: null },
        tAscii: { value: asciiFontTexture },
        uResolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) },
        uFilter: { value: filterMap[state.filter] || 0 },
        uCellSize: { value: state.filterSize || 8.0 },
        uAsciiColorMode: { value: state.asciiMode || 0 },
      },
    });
    postMaterialRef.current = postMaterial;

    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
    postScene.add(postQuad);

    // Initial mesh build
    buildMesh();

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (state.rotate && animPivotRef.current) {
        animPivotRef.current.rotation.y += state.rotSpeed * 0.012;
      }
      if (state.float && animPivotRef.current) {
        animPivotRef.current.position.y = Math.sin(elapsed * 2.2) * 4;
      }
      if (state.pulse && animPivotRef.current) {
        const factor = 1 + Math.sin(elapsed * 4.0) * 0.04;
        animPivotRef.current.scale.set(factor, factor, factor);
      }

      controls.update();

      if (state.filter === 'none') {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
      } else {
        renderer.setRenderTarget(renderTarget);
        renderer.clear();
        renderer.render(scene, camera);

        renderer.setRenderTarget(null);
        postMaterial.uniforms.tDiffuse.value = renderTarget.texture;
        renderer.render(postScene, postCamera);
      }
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderTarget.setSize(w * dpr, h * dpr);
      postMaterial.uniforms.uResolution.value.set(w * dpr, h * dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Trigger rebuild whenever extrude configuration updates
  useEffect(() => {
    buildMesh();
  }, [buildMesh]);

  // Sync Material & Chroma Reflexo properties dynamically
  useEffect(() => {
    if (materialRef.current) {
      const chroma = state.chromaReflect ?? 1.6;
      materialRef.current.color.set(state.color);
      materialRef.current.metalness = state.metalness;
      materialRef.current.roughness = state.roughness;
      materialRef.current.clearcoat = state.clearcoat;
      materialRef.current.envMapIntensity = state.chromeEnabled ? state.chromeIntensity * chroma : 0.0;
      materialRef.current.iridescence = Math.min(1.0, chroma * 0.7);
      materialRef.current.iridescenceIOR = 1.3 + chroma * 0.4;
      materialRef.current.reflectivity = Math.min(1.0, 0.4 + chroma * 0.5);
      materialRef.current.needsUpdate = true;
    }

    if (postMaterialRef.current) {
      const filterMap: Record<string, number> = { none: 0, halftone: 1, ascii: 2, chromatic: 3, pixel: 4, cel: 5 };
      postMaterialRef.current.uniforms.uFilter.value = filterMap[state.filter] || 0;
      postMaterialRef.current.uniforms.uCellSize.value = state.filterSize || 8.0;
      postMaterialRef.current.uniforms.uAsciiColorMode.value = state.asciiMode || 0;
    }
  }, [state]);

  // Handle File Upload (.SVG or .PNG)
  const processUploadedFile = (file: File) => {
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.svg') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCustomSvgText(text);
        setActiveExtrudeType('svg');
        setSourceName(file.name);
      };
      reader.readAsText(file);
    } else {
      // PNG or Raster Image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setCustomPngImg(img);
          setActiveExtrudeType('png');
          setSourceName(file.name);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'silver':
        onChange(s => ({ ...s, preset: 'silver', color: '#ffffff', metalness: 1.0, roughness: 0.08, clearcoat: 1.0, chromeEnabled: true, chromaReflect: 1.8 }));
        break;
      case 'gold':
        onChange(s => ({ ...s, preset: 'gold', color: '#ffc83b', metalness: 1.0, roughness: 0.12, clearcoat: 1.0, chromeEnabled: true, chromaReflect: 1.6 }));
        break;
      case 'dark':
        onChange(s => ({ ...s, preset: 'dark', color: '#383d44', metalness: 1.0, roughness: 0.16, clearcoat: 1.0, chromeEnabled: true, chromaReflect: 1.4 }));
        break;
      case 'copper':
        onChange(s => ({ ...s, preset: 'copper', color: '#e07a5f', metalness: 0.95, roughness: 0.1, clearcoat: 1.0, chromeEnabled: true, chromaReflect: 1.5 }));
        break;
      case 'neochrome':
        onChange(s => ({ ...s, preset: 'neochrome', color: '#c084fc', metalness: 0.95, roughness: 0.06, clearcoat: 1.0, chromeEnabled: true, chromaReflect: 2.4 }));
        break;
      case 'matte':
        onChange(s => ({ ...s, preset: 'matte', color: '#ffffff', metalness: 0.0, roughness: 0.45, clearcoat: 0.0, chromeEnabled: false, chromaReflect: 0.2 }));
        break;
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className="relative w-full h-[calc(100vh-36px)] overflow-hidden bg-[#0b0c0e]"
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Drag & Drop Overlay Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-[#007aff]/20 backdrop-blur-xs border-2 border-dashed border-[#007aff] flex flex-col items-center justify-center pointer-events-none text-white">
          <Upload className="w-14 h-14 mb-3 text-[#007aff] animate-bounce" />
          <h3 className="text-lg font-bold">Solte o arquivo .SVG ou .PNG aqui</h3>
          <p className="text-xs text-neutral-300">Tudo que for preto será extrusado em cromo 3D!</p>
        </div>
      )}

      {/* Top Floating Tag: Active Model & Shortcuts */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#252525] border border-[#3c3c3c] px-3 py-1.5 rounded-lg shadow-lg text-xs">
        <span className="w-2 h-2 rounded-full bg-[#007aff] animate-pulse" />
        <span className="font-semibold text-white">{sourceName}</span>
        <span className="text-[#888] text-[11px]">| Profundidade: {state.depth}px</span>
      </div>

      {/* Floating 3D Control Widget macOS Style */}
      <div className="absolute top-4 right-4 z-20 w-80 bg-[#252525] border border-[#3c3c3c] rounded-xl shadow-2xl p-4 text-xs space-y-3.5 max-h-[calc(100vh-80px)] overflow-y-auto text-[#e0e0e0]">
        {/* Titlebar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">Extrusão 3D & Cromo</span>
          </div>
          <button
            onClick={() => controlsRef.current?.reset()}
            className="flex items-center gap-1 text-[11px] text-[#007aff] hover:underline"
          >
            <RotateCcw className="w-3 h-3" /> Câmera
          </button>
        </div>

        {/* SECTION 1: SVG / PNG Extrusion Options */}
        <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#333]">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] flex items-center justify-between">
            <span>Importar .SVG ou .PNG</span>
            <span className="text-[#007aff] text-[9px] lowercase font-normal">tudo preto vira 3D</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.png,image/svg+xml,image/png"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processUploadedFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-2 rounded-md bg-[#007aff] hover:bg-[#006fe6] text-white font-medium flex items-center justify-center gap-1.5 shadow-xs text-[11px]"
            >
              <Upload className="w-3.5 h-3.5" /> Enviar .SVG / .PNG
            </button>

            <button
              disabled={!image}
              onClick={() => {
                if (image) {
                  setActiveExtrudeType('canvas');
                  setSourceName('Imagem do Canvas');
                }
              }}
              className={`py-1.5 px-2 rounded-md border font-medium flex items-center justify-center gap-1.5 text-[11px] transition-all ${
                image
                  ? activeExtrudeType === 'canvas'
                    ? 'bg-[#007aff]/20 border-[#007aff] text-white'
                    : 'bg-[#2d2d2d] border-[#3c3c3c] text-[#e0e0e0] hover:text-white'
                  : 'bg-[#222] border-[#333] text-[#666] cursor-not-allowed'
              }`}
              title={image ? 'Extrusar a imagem carregada na prancheta do Canvas' : 'Nenhuma imagem no canvas'}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Usar do Canvas
            </button>
          </div>

          {/* Quick Preset Shapes */}
          <div className="pt-1">
            <span className="text-[10px] text-[#888] block mb-1">Exemplos Rápidos:</span>
            <div className="grid grid-cols-4 gap-1">
              {Object.entries(BUILTIN_SVGS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveExtrudeType('preset');
                    setActivePresetKey(key);
                    setSourceName(`${item.name} (SVG)`);
                  }}
                  className={`py-1 px-1 rounded text-center text-[10px] border transition-all truncate ${
                    activeExtrudeType === 'preset' && activePresetKey === key
                      ? 'bg-[#007aff] border-[#007aff] text-white font-semibold'
                      : 'bg-[#2d2d2d] border-[#3c3c3c] text-[#a0a0a0] hover:text-white'
                  }`}
                  title={item.name}
                >
                  {item.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Extrusion Parameters */}
          <div className="space-y-1.5 pt-1.5 border-t border-[#2d2d2d]">
            <div className="flex justify-between text-[#b0b0b0] text-[11px]">
              <span>Profundidade (Extrusão)</span>
              <span className="font-mono text-[#007aff] font-bold">{state.depth}px</span>
            </div>
            <input
              type="range" min="2" max="45" step="1"
              value={state.depth}
              onChange={e => onChange(s => ({ ...s, depth: parseInt(e.target.value) }))}
              className="w-full accent-[#007aff]"
            />

            <div className="flex justify-between text-[#b0b0b0] text-[11px] pt-1">
              <span className="flex items-center gap-1">
                <span>Bisel & Curvatura</span>
                <input
                  type="checkbox"
                  checked={state.bevel}
                  onChange={e => onChange(s => ({ ...s, bevel: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#007aff] rounded ml-1"
                />
              </span>
              <span className="font-mono text-[#007aff] font-bold">{state.bevelSize.toFixed(1)}</span>
            </div>
            {state.bevel && (
              <input
                type="range" min="0.2" max="3.5" step="0.1"
                value={state.bevelSize}
                onChange={e => onChange(s => ({ ...s, bevelSize: parseFloat(e.target.value) }))}
                className="w-full accent-[#007aff]"
              />
            )}

            {/* Threshold slider for PNG / Raster detection */}
            {(activeExtrudeType === 'png' || activeExtrudeType === 'canvas') && (
              <div className="pt-1.5 border-t border-[#2d2d2d] space-y-1">
                <div className="flex justify-between text-[#b0b0b0] text-[11px]">
                  <span>Limiar de Preto (PNG)</span>
                  <span className="font-mono text-[#007aff] font-bold">{state.threshold}</span>
                </div>
                <input
                  type="range" min="15" max="235" step="5"
                  value={state.threshold}
                  onChange={e => onChange(s => ({ ...s, threshold: parseInt(e.target.value) }))}
                  className="w-full accent-[#007aff]"
                />
                <label className="flex items-center justify-between text-[#b0b0b0] text-[10px] cursor-pointer pt-0.5">
                  <span>Inverter Detecção (Branco / Preto)</span>
                  <input
                    type="checkbox"
                    checked={state.invert}
                    onChange={e => onChange(s => ({ ...s, invert: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-[#007aff] rounded"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Chroma Reflexo & Material */}
        <div className="space-y-2">
          {/* CHROMA REFLEXO ADJUSTMENT SLIDER */}
          <div className="bg-[#1e1e1e] p-2.5 rounded-lg border border-[#007aff]/30">
            <div className="flex justify-between text-white text-[11px] font-semibold mb-1">
              <span className="flex items-center gap-1 text-[#007aff]">
                <Sparkles className="w-3.5 h-3.5 text-[#007aff]" /> Chroma Reflexo
              </span>
              <span className="font-mono text-[#007aff] font-bold">
                {((state.chromaReflect ?? 1.6) * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.05"
              value={state.chromaReflect ?? 1.6}
              onChange={e => onChange(s => ({ ...s, chromaReflect: parseFloat(e.target.value) }))}
              className="w-full accent-[#007aff]"
            />
            <p className="text-[10px] text-[#888] mt-1">
              Controla a intensidade das luzes de estúdio, iridescência metálica e reflexão cromada.
            </p>
          </div>

          {/* Metal Presets */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-1">
              Presets de Metal
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['silver', 'gold', 'dark', 'copper', 'neochrome', 'matte'].map(p => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`py-1 px-1.5 rounded-lg border text-[11px] font-medium capitalize transition-all ${
                    state.preset === p ? 'bg-[#007aff] border-[#007aff] text-white shadow-xs' : 'bg-[#2d2d2d] border-[#3c3c3c] text-[#b0b0b0] hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Shaders Filter Select */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-1">
              Filtros Shaders 3D
            </label>
            <select
              value={state.filter}
              onChange={e => onChange(s => ({ ...s, filter: e.target.value as any }))}
              className="w-full px-2 py-1.5 rounded-lg bg-[#2d2d2d] border border-[#3c3c3c] text-white text-xs focus:outline-none focus:border-[#007aff]"
            >
              <option value="none">Nenhum (Visual Cromo Padrão)</option>
              <option value="cel">Cel Shading (Anime 3D)</option>
              <option value="halftone">Halftone 3D (Pop-Art)</option>
              <option value="ascii">ASCII Art 3D (Matrix Terminal)</option>
              <option value="chromatic">Aberração Cromática RGB</option>
              <option value="pixel">Pixel Art 3D (Arcade 8-Bit)</option>
            </select>
          </div>

          {/* Base Color */}
          <div className="flex items-center justify-between">
            <span className="text-[#b0b0b0]">Cor Base do Metal</span>
            <input
              type="color"
              value={state.color}
              onChange={e => onChange(s => ({ ...s, color: e.target.value, preset: 'custom' }))}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>

          {/* Sliders: Metalness & Roughness */}
          <div>
            <div className="flex justify-between text-[#b0b0b0] mb-0.5">
              <span>Metálico</span>
              <span className="font-mono text-[#007aff] font-bold">{state.metalness}</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05" value={state.metalness}
              onChange={e => onChange(s => ({ ...s, metalness: parseFloat(e.target.value), preset: 'custom' }))}
              className="w-full accent-[#007aff]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#b0b0b0] mb-0.5">
              <span>Rugosidade</span>
              <span className="font-mono text-[#007aff] font-bold">{state.roughness}</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.02" value={state.roughness}
              onChange={e => onChange(s => ({ ...s, roughness: parseFloat(e.target.value), preset: 'custom' }))}
              className="w-full accent-[#007aff]"
            />
          </div>
        </div>

        {/* SECTION 3: Animations */}
        <div className="pt-2 border-t border-[#3c3c3c] space-y-1.5">
          <label className="flex items-center justify-between text-[#b0b0b0] cursor-pointer">
            <span>Giro Automático</span>
            <input
              type="checkbox"
              checked={state.rotate}
              onChange={e => onChange(s => ({ ...s, rotate: e.target.checked }))}
              className="w-4 h-4 accent-[#007aff] rounded"
            />
          </label>
          <label className="flex items-center justify-between text-[#b0b0b0] cursor-pointer">
            <span>Flutuação Suave</span>
            <input
              type="checkbox"
              checked={state.float}
              onChange={e => onChange(s => ({ ...s, float: e.target.checked }))}
              className="w-4 h-4 accent-[#007aff] rounded"
            />
          </label>
          <label className="flex items-center justify-between text-[#b0b0b0] cursor-pointer">
            <span>Pulso de Escala</span>
            <input
              type="checkbox"
              checked={state.pulse}
              onChange={e => onChange(s => ({ ...s, pulse: e.target.checked }))}
              className="w-4 h-4 accent-[#007aff] rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
