export type StudioMode = 'canvas' | '3d' | 'cartoon';

export type CanvasPresetId =
  | 'square'
  | 'story'
  | 'widescreen'
  | 'portrait'
  | 'classic'
  | 'twitter_header'
  | 'a4'
  | 'custom';

export interface CanvasPreset {
  id: CanvasPresetId;
  name: string;
  width: number;
  height: number;
  description: string;
  icon: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: 'square', name: 'Quadrado 1:1', width: 1080, height: 1080, description: 'Feed Instagram, Logo, Avatar', icon: 'Square' },
  { id: 'story', name: 'Story / Reels 9:16', width: 1080, height: 1920, description: 'Instagram, TikTok, Shorts', icon: 'Smartphone' },
  { id: 'widescreen', name: 'Widescreen 16:9', width: 1920, height: 1080, description: 'Full HD, YouTube, Banner', icon: 'Monitor' },
  { id: 'portrait', name: 'Retrato 4:5', width: 1080, height: 1350, description: 'Instagram Feed Vertical', icon: 'Image' },
  { id: 'classic', name: 'Fotografia 4:3', width: 1600, height: 1200, description: 'Câmera Clássica, Monitor', icon: 'Camera' },
  { id: 'twitter_header', name: 'Cabeçalho / Banner 3:1', width: 1500, height: 500, description: 'Twitter / X, LinkedIn', icon: 'Layout' },
  { id: 'a4', name: 'Documento A4', width: 1240, height: 1754, description: 'Impressão A4 (150 DPI)', icon: 'FileText' },
  { id: 'custom', name: 'Personalizado', width: 1200, height: 800, description: 'Dimensões manuais livres', icon: 'Sliders' },
];

export type BackgroundType = 'transparent' | 'dark' | 'white' | 'color';

export interface CanvasConfig {
  width: number;
  height: number;
  preset: CanvasPresetId;
  backgroundType: BackgroundType;
  customBgColor: string;
  name: string;
}

export interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export type PhotoPreset =
  | 'none'
  | 'digicam'
  | 'iphone8'
  | 'iphone4'
  | 'y2k_dream'
  | 'y2k_cyber'
  | 'insta2012'
  | 'disposable'
  | 'y2k'
  | 'lofi_jpeg'
  | 'cinematic_teal'
  | 'polaroid_vintage'
  | 'monochrome_noir'
  | 'cyberpunk';

export type GradientMapMode =
  | 'none'
  | 'threetone'
  | 'custom_duo'
  | 'custom_stops';

export interface GradientStop {
  color: string; // hex
  pos: number; // 0 to 100
}

export interface PhotoEffectsState {
  preset: PhotoPreset;
  gradientMode: GradientMapMode;
  duoShadow: string;
  duoMidtone: string;
  duoLight: string;
  customGradientStops?: GradientStop[];

  // Basic adjustments
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  warmth: number; // -100 to 100 (Color temp)
  tint: number; // -100 to 100 (Green / Magenta)
  sharpness: number; // 0 to 100 (Unsharp mask)

  // Tone Curves
  curveShadows: number; // -60 to 80 (Matte lift)
  curveMidtones: number; // -80 to 80
  curveHighlights: number; // -80 to 80 (Flash blowout)
  curveContrast: number; // -50 to 80 (S-Curve)

  // Glow & Threshold
  glow: number; // 0 to 100% (Intensity)
  glowRadius: number; // 0 to 100%
  glowThreshold: number; // 0 to 100%
  threshold: number; // 0 (off) to 255
  thresholdNoise: number; // 0 to 100
  solarize: number; // 0 to 100% (Sabattier effect)

  // Halftone
  halftone: number; // 0 to 24
  halftoneMode: 'bw' | 'color' | 'overlay';

  // ASCII & Shapes & Airbrush
  ascii: number; // 0 to 100%
  asciiMode?: 'color' | 'bw' | 'green';
  asciiText: number; // 0 to 100%
  asciiTextString: string;
  asciiTextRandom: boolean;
  shapes: number; // 0 to 100%
  shapesMode: 'bw' | 'color' | 'overlay';
  airbrush: number; // 0 to 100%

  // Pixelmosh / Datamosh (Digital Video / Macroblock corruption)
  datamosh: number; // 0 to 100%
  datamoshBlockSize: number; // 4 to 64px
  datamoshSlices: number; // 0 to 100% (horizontal displacement tears)
  datamoshMelt: number; // 0 to 100% (pixel smear / decay)
  datamoshSeed: number; // seed for glitch pattern

  // CRT & Glitch
  scanlines: number; // 0 to 100%
  crtBloom: number; // 0 to 100%
  chroma: number; // 0 to 20px (RGB chromatic aberration)
  lensDistort: number; // -50 to 50 (Fisheye barrel / pincushion)

  // Blur & Tilt-shift
  tiltShift: number; // 0 to 100%
  tiltShiftFocus: number; // 0 to 100% (Y center)

  // Analog textures & Artifacts
  noise: number; // 0 to 100%
  jpeg: number; // 0 to 10 (DCT compression)
  pixel: number; // 1 to 16
  vignette: number; // 0 to 100%
  lightLeak: 'none' | 'sunburst' | 'prism' | 'golden' | 'neon';
  lightLeakIntensity: number; // 0 to 100%
  dustScratches: number; // 0 to 100%
  emboss: number; // 0 to 100%
  invert: boolean;

  // HUD / Cyber Trace
  cyberTrace: number; // 0 to 100%
  cyberTraceDensity: number; // 0 to 100
  cyberTraceThreshold: number; // 0 to 255
  cyberTraceBoxSize?: number; // 10 to 150% (node box size)
  cyberTraceMode: 'straight' | 'orthogonal' | 'curve';
  cyberTraceColor: string;

  // LED Camera Timestamp
  timestamp: boolean;
  dateText: string;
  timestampColor: '#ffa200' | '#22c55e' | '#ef4444' | '#38bdf8';

  // Dynamic Effect Layer Hierarchy (Rendering order from bottom/first to top/last)
  layerOrder: EffectLayerId[];
  hiddenLayers: EffectLayerId[];
}

export type EffectLayerId =
  | 'lens'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'exposure'
  | 'warmth'
  | 'tint'
  | 'curves'
  | 'gradient'
  | 'glow'
  | 'threshold'
  | 'halftone'
  | 'ascii'
  | 'asciiText'
  | 'datamosh'
  | 'glitch'
  | 'noise'
  | 'fisheye'
  | 'texture'
  | 'vignette'
  | 'jpeg'
  | 'timestamp'
  | 'cyberTrace';

export const DEFAULT_LAYER_ORDER: EffectLayerId[] = [
  'lens',
  'brightness',
  'contrast',
  'saturation',
  'exposure',
  'warmth',
  'tint',
  'threshold',
  'curves',
  'gradient',
  'ascii',
  'asciiText',
  'halftone',
  'cyberTrace',
  'glow',
  'datamosh',
  'glitch',
  'noise',
  'fisheye',
  'vignette',
  'jpeg',
  'timestamp',
];

export const DEFAULT_PHOTO_EFFECTS: PhotoEffectsState = {
  preset: 'none',
  gradientMode: 'none',
  duoShadow: '#0d0e14',
  duoMidtone: '#5e43a6',
  duoLight: '#ff7700',
  customGradientStops: [
    { color: '#000000', pos: 0 },
    { color: '#ffffff', pos: 100 }
  ],
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  warmth: 0,
  tint: 0,
  sharpness: 0,
  curveShadows: 0,
  curveMidtones: 0,
  curveHighlights: 0,
  curveContrast: 0,
  glow: 0,
  glowRadius: 25,
  glowThreshold: 60,
  threshold: 0,
  thresholdNoise: 0,
  solarize: 0,
  halftone: 0,
  halftoneMode: 'overlay',
  ascii: 0,
  asciiMode: 'color',
  asciiText: 0,
  asciiTextString: 'Hello World. ',
  asciiTextRandom: false, 
  shapes: 0,
  shapesMode: 'overlay',
  airbrush: 0,
  datamosh: 0,
  datamoshBlockSize: 16,
  datamoshSlices: 35,
  datamoshMelt: 25,
  datamoshSeed: 1,
  scanlines: 0,
  crtBloom: 0,
  chroma: 0,
  lensDistort: 0,
  tiltShift: 0,
  tiltShiftFocus: 50,
  noise: 0,
  jpeg: 0,
  pixel: 1,
  vignette: 0,
  lightLeak: 'none',
  lightLeakIntensity: 60,
  dustScratches: 0,
  emboss: 0,
  invert: false,
  cyberTrace: 0,
  cyberTraceDensity: 50,
  cyberTraceThreshold: 100,
  cyberTraceBoxSize: 40,
  cyberTraceMode: 'orthogonal',
  cyberTraceColor: '#22c55e',
  timestamp: false,
  dateText: "'03 09 26",
  timestampColor: '#ffa200',
  layerOrder: [...DEFAULT_LAYER_ORDER],
  hiddenLayers: [],
};

// 3D Studio Configuration
export interface ThreeStudioState {
  depth: number;
  bevel: boolean;
  bevelSize: number;
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  chromeEnabled: boolean;
  chromeIntensity: number;
  chromaReflect: number; // Chroma reflexo adjustment slider
  preset: string;
  filter: 'none' | 'cel' | 'halftone' | 'ascii' | 'chromatic' | 'pixel';
  filterSize: number;
  asciiMode: number;
  smoothPasses: number;
  preBlur: number;
  rotate: boolean;
  float: boolean;
  pulse: boolean;
  rotSpeed: number;
  threshold: number;
  invert: boolean;
  customFileName?: string;
}

export const DEFAULT_THREE_STATE: ThreeStudioState = {
  depth: 14,
  bevel: true,
  bevelSize: 1.0,
  color: '#ffffff',
  metalness: 1.0,
  roughness: 0.08,
  clearcoat: 1.0,
  chromeEnabled: true,
  chromeIntensity: 1.0,
  chromaReflect: 1.6,
  preset: 'silver',
  filter: 'none',
  filterSize: 8,
  asciiMode: 0,
  smoothPasses: 2,
  preBlur: 1.0,
  rotate: true,
  float: true,
  pulse: false,
  rotSpeed: 1.0,
  threshold: 128,
  invert: false,
};

// 2D Cartoon Configuration
export interface CartoonStudioState {
  preset: 'sketch' | 'hatch' | 'rubber' | 'stamp' | 'boil';
  chalkPattern: 'zigzag' | 'cross' | 'loops' | 'diagonal';
  duration: number;
  strokeWidth: number;
  loop: boolean;
  scale: number;
  fps: number;
  freq: number;
  jitter: boolean;
  inkColor: string;
  paper: string;
}

export const DEFAULT_CARTOON_STATE: CartoonStudioState = {
  preset: 'sketch',
  chalkPattern: 'zigzag',
  duration: 3.0,
  strokeWidth: 3,
  loop: true,
  scale: 7,
  fps: 10,
  freq: 0.035,
  jitter: true,
  inkColor: '#111116',
  paper: '#f4eee1',
};
