import { PhotoEffectsState, DEFAULT_LAYER_ORDER, EffectLayerId } from '../types';
import { GLPipeline } from './webgl/pipeline';
import { baseColorShader, lutColorShader, gradientMapShader, noiseShader, halftoneShader, vignetteShader, glitchShader, datamoshShader, thresholdShader, fisheyeShader } from './webgl/shaders';
import { buildCurveLUT, buildGradientMapLUT } from './imageProcessing';

import { applyBaseLayer, applyThresholdLayer, applyCurvesLayer, applyGradientLayer, applyGlowLayer, applyHalftoneLayer, applyAsciiLayer, applyNoiseLayer, applyTextureLayer, applyVignetteLayer, applyFisheyeLayer, applyGlitchLayer, applyDatamoshLayer, applyTimestampLayer, applyJpegLayer, PipelineManager } from './imageProcessing';

// Singleton instance to prevent creating WebGL context on every frame
let pipeline: GLPipeline | null = null;

export function renderProcessedImageWebGL(
  source: HTMLImageElement | HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  state: PhotoEffectsState,
  targetW: number,
  targetH: number,
  hasTransparency: boolean = false
): void {
  if (!pipeline || pipeline.canvas.width !== targetW || pipeline.canvas.height !== targetH) {
    if (pipeline) pipeline.destroy();
    pipeline = new GLPipeline(targetW, targetH);
  }

  pipeline.loadSource(source);
  const orderRaw = (state.layerOrder && state.layerOrder.length > 0) ? state.layerOrder : DEFAULT_LAYER_ORDER;
  const order = orderRaw.filter(id => id !== 'texture');
  
  let cpuMode = false;
  let cpuPipeline: PipelineManager | null = null;

  for (const layerId of order) {
    if (cpuMode) {
      // Once we drop into CPU mode, we stay in CPU mode for the rest of the layers
      if (!cpuPipeline) break;
      switch (layerId) {
        case 'base': applyBaseLayer(cpuPipeline, state, targetW, targetH); break;
            case 'threshold': applyThresholdLayer(cpuPipeline, state, targetW, targetH); break;
        case 'curves': applyCurvesLayer(cpuPipeline, state, targetW, targetH); break;
        case 'gradient': applyGradientLayer(cpuPipeline, state, targetW, targetH); break;
        case 'glow': applyGlowLayer(cpuPipeline, state, targetW, targetH); break;
        case 'halftone': applyHalftoneLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
        case 'ascii': applyAsciiLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
        
        case 'timestamp': applyTimestampLayer(cpuPipeline, state, targetW, targetH); break;
        case 'vignette': applyVignetteLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
        case 'jpeg': applyJpegLayer(cpuPipeline, state, targetW, targetH); break;
        case 'noise': applyNoiseLayer(cpuPipeline, state, targetW, targetH); break;
        case 'fisheye': applyFisheyeLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
            case 'glitch': applyGlitchLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
        case 'datamosh': applyDatamoshLayer(cpuPipeline, state, targetW, targetH); break;
      }
      continue;
    }

    // WebGL passes
    switch (layerId) {
      case 'base': applyBaseLayerWebGL(pipeline, state); break;
      case 'threshold': applyThresholdLayerWebGL(pipeline, state); break;
      case 'curves': applyCurvesLayerWebGL(pipeline, state); break;
      case 'gradient': applyGradientLayerWebGL(pipeline, state); break;
      case 'halftone': applyHalftoneLayerWebGL(pipeline, state); break;
      case 'noise': applyNoiseLayerWebGL(pipeline, state); break;
      case 'vignette': applyVignetteLayerWebGL(pipeline, state); break;
      case 'fisheye': applyFisheyeLayerWebGL(pipeline, state); break;
      case 'glitch': applyGlitchLayerWebGL(pipeline, state); break;
      case 'datamosh': applyDatamoshLayerWebGL(pipeline, state); break;
      default:
        // Transition to CPU mode
        pipeline.finalize();
        const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          targetCanvas.width = targetW;
          targetCanvas.height = targetH;
          ctx.clearRect(0, 0, targetW, targetH);
          ctx.drawImage(pipeline.canvas, 0, 0);
          
          cpuPipeline = new PipelineManager(ctx, targetW, targetH);
        }
        cpuMode = true;
        
        // now apply the layer that triggered the fallback
        if (cpuPipeline) {
          switch (layerId as EffectLayerId) {
            case 'base': applyBaseLayer(cpuPipeline, state, targetW, targetH); break;
            case 'threshold': applyThresholdLayer(cpuPipeline, state, targetW, targetH); break;
            case 'curves': applyCurvesLayer(cpuPipeline, state, targetW, targetH); break;
            case 'gradient': applyGradientLayer(cpuPipeline, state, targetW, targetH); break;
            case 'glow': applyGlowLayer(cpuPipeline, state, targetW, targetH); break;
            case 'halftone': applyHalftoneLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
            case 'ascii': applyAsciiLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
            
            case 'timestamp': applyTimestampLayer(cpuPipeline, state, targetW, targetH); break;
            case 'vignette': applyVignetteLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
            case 'jpeg': applyJpegLayer(cpuPipeline, state, targetW, targetH); break;
            case 'noise': applyNoiseLayer(cpuPipeline, state, targetW, targetH); break;
            case 'fisheye': applyFisheyeLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
            case 'glitch': applyGlitchLayer(cpuPipeline, state, targetW, targetH, hasTransparency); break;
            case 'datamosh': applyDatamoshLayer(cpuPipeline, state, targetW, targetH); break;
          }
        }
        break;
    }
  }

  // Texture always on top
  if (state.dustScratches > 0 || state.lightLeak !== 'none') {
    if (!cpuMode) {
      pipeline.finalize();
      const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        targetCanvas.width = targetW;
        targetCanvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(pipeline.canvas, 0, 0);
        cpuPipeline = new PipelineManager(ctx, targetW, targetH);
      }
      cpuMode = true;
    }
    if (cpuPipeline) {
      applyTextureLayer(cpuPipeline, state, targetW, targetH, hasTransparency);
    }
  }

  if (!cpuMode) {
    pipeline.finalize();
    const ctx = targetCanvas.getContext('2d');
    if (ctx) {
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(pipeline.canvas, 0, 0);
    }
  } else if (cpuPipeline) {
    cpuPipeline.sync();
  }

  // Global Pixelation (apply last so it affects all layers including noise/glitch)
  if (state.pixel > 1) {
    const pw = Math.max(1, Math.floor(targetW / state.pixel));
    const ph = Math.max(1, Math.floor(targetH / state.pixel));
    
    // Read from the current targetCanvas
    const pcan = document.createElement('canvas');
    pcan.width = pw;
    pcan.height = ph;
    const pctx = pcan.getContext('2d');
    if (pctx) {
      // Draw scaled down
      pctx.imageSmoothingEnabled = true;
      pctx.drawImage(targetCanvas, 0, 0, pw, ph);
      
      // Draw scaled up
      const ctx = targetCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pcan, 0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true; // restore
      }
    }
  }
}

function applyBaseLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  const bright = (state.brightness || 0) * 1.25;
  const contrast = ((state.contrast || 0) + 100) / 100;
  const sat = ((state.saturation || 0) + 100) / 100;
  const exp = Math.pow(2, (state.exposure || 0) / 50);
  const warmth = (state.warmth || 0) / 255.0; // scale down
  const tint = (state.tint || 0) / 255.0; // scale down
  const solarizeVal = (state.solarize || 0) / 100.0;
  const thresholdVal = 0.0;
  const thresholdNoiseVal = 0.0;

  let presetId = 0;
  const presets = [
    'none', 
    'digicam', 
    'insta2012', 
    'disposable', 
    'y2k', 
    'cinematic_teal', 
    'polaroid_vintage', 
    'monochrome_noir',
    'iphone4',
    'iphone8',
    'y2k_dream',
    'y2k_cyber'
  ];
  presetId = Math.max(0, presets.indexOf(state.preset || 'none'));

  const isIdentity = (
    bright === 0 &&
    contrast === 1 &&
    sat === 1 &&
    exp === 1 &&
    warmth === 0 &&
    tint === 0 &&
    presetId === 0 &&
    thresholdVal === 0 &&
    solarizeVal === 0 &&
    !state.invert
  );

  if (isIdentity) return;

  pipeline.applyPass(baseColorShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_brightness'), bright);
    gl.uniform1f(gl.getUniformLocation(program, 'u_contrast'), contrast);
    gl.uniform1f(gl.getUniformLocation(program, 'u_saturation'), sat);
    gl.uniform1f(gl.getUniformLocation(program, 'u_exposure'), exp);
    gl.uniform1f(gl.getUniformLocation(program, 'u_warmth'), warmth);
    gl.uniform1f(gl.getUniformLocation(program, 'u_tint'), tint);
    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold'), thresholdVal);
    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold_noise'), thresholdNoiseVal);
    gl.uniform1f(gl.getUniformLocation(program, 'u_solarize'), solarizeVal);
    gl.uniform1i(gl.getUniformLocation(program, 'u_invert'), state.invert ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_preset'), presetId);
  });
}

function applyCurvesLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.curveShadows === 0 && state.curveMidtones === 0 && state.curveHighlights === 0 && state.curveContrast === 0) {
    return;
  }
  const lut = buildCurveLUT(state);
  const tex = pipeline.createLUTTextureR8(lut, 256, 1);
  
  pipeline.applyPass(lutColorShader, (gl, program) => {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(program, 'u_lut'), 2);
  });
  
  pipeline.gl.deleteTexture(tex);
}

function applyGradientLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.gradientMode === 'none') return;
  const lut = buildGradientMapLUT(state.gradientMode, state.duoShadow, state.duoLight, state.duoMidtone, state.customGradientStops);
  if (!lut) return;
  
  const tex = pipeline.createLUTTextureRGB(lut, 256, 1);
  
  pipeline.applyPass(gradientMapShader, (gl, program) => {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(program, 'u_lut'), 2);
  });
  
  pipeline.gl.deleteTexture(tex);
}

function applyHalftoneLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.halftone <= 0) return;
  const step = Math.max(3, state.halftone);
  const mode = state.halftoneMode === 'bw' ? 0 : (state.halftoneMode === 'overlay' ? 2 : 1);
  pipeline.applyPass(halftoneShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_step'), step);
    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), mode);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), pipeline.canvas.width, pipeline.canvas.height);
  });
}

function applyNoiseLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.noise <= 0) return;
  const amount = state.noise / 100.0;
  pipeline.applyPass(noiseShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_amount'), amount);
    gl.uniform1f(gl.getUniformLocation(program, 'u_seed'), Math.random());
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), pipeline.canvas.width, pipeline.canvas.height);
  });
}

function applyVignetteLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.vignette <= 0) return;
  const intensity = state.vignette / 100.0;
  console.log("Applying WebGL Vignette, intensity:", intensity);
  pipeline.applyPass(vignetteShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), pipeline.canvas.width, pipeline.canvas.height);
  });
}

function applyGlitchLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.chroma === 0 && state.crtBloom === 0 && state.lensDistort === 0) return;
  pipeline.applyPass(glitchShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_chroma'), state.chroma / 100.0);
    gl.uniform1f(gl.getUniformLocation(program, 'u_scanlines'), 0.0); // No longer in PhotoEffectsState? Wait, if they are, they're called something else
    gl.uniform1f(gl.getUniformLocation(program, 'u_crt'), state.crtBloom / 100.0);
  });
}

function applyDatamoshLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.datamosh <= 0) return;
  pipeline.applyPass(datamoshShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_amount'), state.datamosh / 100.0);
  });
}
function applyThresholdLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.threshold === 0) return;
  
  const thresholdVal = (state.threshold || 0) / 255.0;
  const thresholdNoiseVal = (state.thresholdNoise || 0) / 100.0;
  
  pipeline.applyPass(thresholdShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold'), thresholdVal);
    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold_noise'), thresholdNoiseVal);
  });
}

function applyFisheyeLayerWebGL(pipeline: GLPipeline, state: PhotoEffectsState) {
  if (state.lensDistort === 0) return;
  const distStrength = state.lensDistort / 100.0;
  pipeline.applyPass(fisheyeShader, (gl, program) => {
    gl.uniform1f(gl.getUniformLocation(program, 'u_distStrength'), distStrength);
  });
}
