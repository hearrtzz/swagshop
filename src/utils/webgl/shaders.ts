export const lutColorShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform sampler2D u_lut;
out vec4 outColor;
void main() {
  vec4 color = texture(u_texture, v_texCoord);
  if (color.a == 0.0) {
    outColor = color;
    return;
  }
  // LUT is a 256x1 texture. 
  // Sample at the exact center of each texel. 
  // The coordinate is (value * 255.0 + 0.5) / 256.0
  float r = texture(u_lut, vec2((color.r * 255.0 + 0.5) / 256.0, 0.5)).r;
  float g = texture(u_lut, vec2((color.g * 255.0 + 0.5) / 256.0, 0.5)).r;
  float b = texture(u_lut, vec2((color.b * 255.0 + 0.5) / 256.0, 0.5)).r;
  outColor = vec4(r, g, b, color.a);
}
`;

export const noiseShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float u_amount;
uniform float u_seed;
uniform vec2 u_resolution;
out vec4 outColor;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture(u_texture, v_texCoord);
  if (color.a == 0.0) {
    outColor = color;
    return;
  }
  
  vec2 pixelCoords = v_texCoord * u_resolution;
  float noise = rand(pixelCoords + u_seed) * 2.0 - 1.0;
  
  // Make noise sharper/crisper
  noise = sign(noise) * pow(abs(noise), 0.7);

  // mix noise based on amount
  vec3 rgb = color.rgb + noise * (u_amount * 0.8);
  outColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`;

export const halftoneShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_step;
uniform int u_mode; // 0=bw, 1=color
out vec4 outColor;

void main() {
  vec4 color = texture(u_texture, v_texCoord);
  if (color.a == 0.0) {
    outColor = color;
    return;
  }

  // Calculate grid cell center
  vec2 gridCoord = floor(v_texCoord * u_resolution / u_step) * u_step;
  vec2 center = (gridCoord + u_step * 0.5) / u_resolution;
  
  vec4 sampleColor = texture(u_texture, center);
  float lum = dot(sampleColor.rgb, vec3(0.299, 0.587, 0.114));
  
  float radius = (u_step * 0.5) * sqrt(max(0.0, 1.0 - lum)) * 1.35;
  float dist = distance(v_texCoord * u_resolution, gridCoord + u_step * 0.5);
  
  vec3 bg;
  vec3 fg;
  if (u_mode == 0) {
    bg = vec3(1.0);
    fg = vec3(17.0/255.0, 17.0/255.0, 22.0/255.0);
  } else if (u_mode == 1) {
    bg = vec3(9.0/255.0, 10.0/255.0, 13.0/255.0);
    fg = sampleColor.rgb;
  } else {
    bg = color.rgb;
    // Overlay mode: soft dark dots that blend with the image color
    fg = mix(color.rgb, vec3(0.0), 0.65);
  }

  if (dist <= radius && radius > 0.4) {
    // anti-aliasing the dot edge
    float smoothEdge = 1.0 - smoothstep(max(0.0, radius - 1.0), radius, dist);
    outColor = vec4(mix(bg, fg, smoothEdge), color.a);
  } else {
    outColor = vec4(bg, color.a);
  }
}
`;

export const vignetteShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float u_intensity; // 0 to 1
uniform vec2 u_resolution;
out vec4 outColor;
void main() {
  vec4 color = texture(u_texture, v_texCoord);
  if (color.a == 0.0) {
    outColor = color;
    return;
  }
  
  vec2 pos = v_texCoord - vec2(0.5);
  // correct aspect ratio
  float aspect = u_resolution.x / u_resolution.y;
  if (aspect > 1.0) {
    pos.x *= aspect;
  } else {
    pos.y /= aspect;
  }
  
  float dist = length(pos);
  
  // match CPU gradient roughly: inner=0.28, outer=0.72
  float v = smoothstep(0.28, 0.75, dist);
  // mix toward black based on intensity
  vec3 rgb = mix(color.rgb, vec3(0.0), v * u_intensity * 1.1);
  
  outColor = vec4(rgb, color.a);
}
`;

export const gradientMapShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform sampler2D u_lut; // RGB LUT
out vec4 outColor;
void main() {
  vec4 color = texture(u_texture, v_texCoord);
  if (color.a == 0.0) {
    outColor = color;
    return;
  }
  float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  vec3 gradColor = texture(u_lut, vec2((lum * 255.0 + 0.5) / 256.0, 0.5)).rgb;
  outColor = vec4(gradColor, color.a);
}
`;

export const baseColorShader = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_texture;

uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_exposure;
uniform float u_warmth;
uniform float u_tint;
uniform float u_threshold;
uniform float u_threshold_noise;
uniform float u_solarize;
uniform int u_invert;
uniform int u_preset; // 0=none, 1=digicam, 2=insta2012, 3=disposable, 4=y2k, 5=cinematic, 6=polaroid, 7=noir, 8=iphone4, 9=iphone8, 10=y2k_dream, 11=y2k_cyber

out vec4 outColor;

void main() {
  vec4 color = texture(u_texture, v_texCoord);
  if (color.a == 0.0) {
    outColor = color;
    return;
  }

  vec3 rgb = color.rgb;

  // Exposure
  if (u_exposure != 1.0) {
    rgb *= u_exposure;
  }

  // Warmth
  if (u_warmth != 0.0) {
    rgb.r += u_warmth * 0.45;
    rgb.b -= u_warmth * 0.45;
  }

  // Tint
  if (u_tint != 0.0) {
    rgb.g -= u_tint * 0.35;
    rgb.r += u_tint * 0.15;
    rgb.b += u_tint * 0.15;
  }

  // Contrast & Brightness
  // Math in JS: (r - 128)*contrast + 128 + bright; 128 is 0.5 in normalized float
  rgb = (rgb - 0.5) * u_contrast + 0.5 + (u_brightness / 255.0);

  // Saturation
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
  rgb = mix(vec3(lum), rgb, u_saturation);

  // Solarize
  if (u_solarize > 0.0) {
    float invLum = dot(rgb, vec3(0.299, 0.587, 0.114));
    if (invLum > 0.5) {
      rgb = mix(rgb, vec3(1.0) - rgb, u_solarize);
    }
  }

  // Invert
  if (u_invert == 1) {
    rgb = vec3(1.0) - rgb;
  }

  // Threshold
  if (u_threshold > 0.0) {
    lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    if (u_threshold_noise > 0.0) {
      float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      lum += (noise - 0.5) * u_threshold_noise;
    }
    float bin = lum >= u_threshold ? 1.0 : 0.0;
    rgb = vec3(bin);
  }

  // Presets
  lum = dot(rgb, vec3(0.299, 0.587, 0.114));
  if (u_preset == 1) {
    // digicam
    rgb.b = min(1.0, rgb.b * 1.08 + (1.0 - lum) * 0.08);
    rgb.g = min(1.0, rgb.g * 1.04);
    rgb.r = min(1.0, rgb.r * 0.98 + (lum > 0.7 ? (lum - 0.7) * 0.25 : 0.0));
  } else if (u_preset == 2) {
    // insta2012
    rgb.r = min(1.0, rgb.r * 1.15 + 14.0/255.0);
    rgb.g = min(1.0, rgb.g * 0.95 + 8.0/255.0);
    rgb.b = min(1.0, rgb.b * 0.85 + 24.0/255.0);
  } else if (u_preset == 3) {
    // disposable
    rgb.r = min(1.0, rgb.r * 1.12 + 8.0/255.0);
    rgb.g = min(1.0, rgb.g * 1.04 + 6.0/255.0);
    rgb.b = min(1.0, rgb.b * 0.90);
  } else if (u_preset == 4) {
    // y2k
    rgb.r = min(1.0, rgb.r * 0.92);
    rgb.g = min(1.0, rgb.g * 1.08 + 6.0/255.0);
    rgb.b = min(1.0, rgb.b * 1.18 + 16.0/255.0);
  } else if (u_preset == 5) {
    // cinematic_teal
    rgb.r = min(1.0, rgb.r * (0.8 + 0.4 * lum));
    rgb.g = min(1.0, rgb.g * (0.95 + 0.1 * lum));
    rgb.b = min(1.0, rgb.b * (1.25 - 0.4 * lum));
  } else if (u_preset == 6) {
    // polaroid_vintage
    rgb.r = min(1.0, rgb.r * 1.08 + 12.0/255.0);
    rgb.g = min(1.0, rgb.g * 1.02 + 6.0/255.0);
    rgb.b = min(1.0, rgb.b * 0.88 + 10.0/255.0);
  } else if (u_preset == 7) {
    // monochrome_noir
    rgb = vec3(lum);
  } else if (u_preset == 8) {
    // iphone4 (slightly blown out highlights, greenish shadow tint, warm highlights, high contrast)
    rgb.r = min(1.0, rgb.r * 1.1 + 0.05);
    rgb.g = min(1.0, rgb.g * 1.05 + 0.08 * (1.0 - lum));
    rgb.b = min(1.0, rgb.b * 0.95);
    rgb = (rgb - 0.5) * 1.1 + 0.5; // push contrast
  } else if (u_preset == 9) {
    // iphone8 (slightly warmer, flat HDR midtones)
    rgb.r = min(1.0, rgb.r * 1.05 + 0.02);
    rgb.g = min(1.0, rgb.g * 1.02 + 0.02);
    rgb.b = min(1.0, rgb.b * 0.98);
    // flattened shadows (HDR-ish)
    rgb = mix(rgb, vec3(lum), 0.1);
  } else if (u_preset == 10) {
    // y2k_dream (pastel tints, low contrast, washed out)
    rgb.r = min(1.0, rgb.r * 1.1 + 0.1);
    rgb.g = min(1.0, rgb.g * 1.05 + 0.1);
    rgb.b = min(1.0, rgb.b * 1.15 + 0.15);
    rgb = (rgb - 0.5) * 0.8 + 0.5; // low contrast
  } else if (u_preset == 11) {
    // y2k_cyber (high contrast, cyan/magenta push)
    rgb.r = min(1.0, rgb.r * 1.15);
    rgb.g = min(1.0, rgb.g * 0.9 + 0.1 * lum);
    rgb.b = min(1.0, rgb.b * 1.25 + 0.1);
    rgb = (rgb - 0.5) * 1.15 + 0.5;
  }

  outColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`;
export const glitchShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float u_chroma; // 0 to 1
uniform float u_scanlines; // 0 to 1
uniform float u_crt; // 0 to 1
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  vec2 uv = v_texCoord;
  vec4 color = vec4(0.0);

  // CRT Bulge
  if (u_crt > 0.0) {
    vec2 pos = uv * 2.0 - 1.0;
    float dist = dot(pos, pos);
    uv = uv + pos * dist * u_crt * 0.1;
  }
  
  // Bounds check after CRT bulge
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    outColor = vec4(0.0);
    return;
  }

  // Chroma shift
  if (u_chroma > 0.0) {
    float shift = u_chroma * 0.05; // max 5% shift
    float r = texture(u_texture, uv + vec2(shift, 0.0)).r;
    float g = texture(u_texture, uv).g;
    float b = texture(u_texture, uv - vec2(shift, 0.0)).b;
    float a = texture(u_texture, uv).a;
    color = vec4(r, g, b, a);
  } else {
    color = texture(u_texture, uv);
  }

  // CRT Color bleeding/bloom (simplified)
  if (u_crt > 0.0) {
    vec4 blur = (
      texture(u_texture, uv + vec2(1.0/u_resolution.x, 0.0)) + 
      texture(u_texture, uv - vec2(1.0/u_resolution.x, 0.0))
    ) * 0.5;
    color.rgb = mix(color.rgb, blur.rgb, u_crt * 0.5);
  }

  // Scanlines
  if (u_scanlines > 0.0) {
    float sl = sin(uv.y * u_resolution.y * 1.5) * 0.5 + 0.5;
    color.rgb = mix(color.rgb, color.rgb * sl, u_scanlines * 0.5);
  }

  outColor = color;
}
`;

export const datamoshShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_amount; // 0 to 1
out vec4 outColor;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = v_texCoord;
  
  if (u_amount > 0.0) {
    float blockSize = floor(mix(10.0, 50.0, u_amount));
    vec2 gridUV = floor(uv * u_resolution / blockSize) * blockSize / u_resolution;
    
    // Create some noisy displacement based on grid block
    float r = rand(gridUV);
    if (r < u_amount * 0.5) { // Threshold to decide if block should mosh
      float shiftX = (rand(gridUV + vec2(1.0)) * 2.0 - 1.0) * u_amount * 0.1;
      float shiftY = (rand(gridUV + vec2(2.0)) * 2.0 - 1.0) * u_amount * 0.1;
      uv = gridUV + vec2(shiftX, shiftY);
    }
  }

  outColor = texture(u_texture, uv);
}
`;

export const blurShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_direction;
uniform float u_radius;
out vec4 outColor;

void main() {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * u_direction;
  vec2 off2 = vec2(3.2307692308) * u_direction;
  
  // Fast 9-tap gaussian blur (optimized)
  color += texture(u_texture, v_texCoord) * 0.2270270270;
  color += texture(u_texture, v_texCoord + (off1 * u_radius / u_resolution)) * 0.3162162162;
  color += texture(u_texture, v_texCoord - (off1 * u_radius / u_resolution)) * 0.3162162162;
  color += texture(u_texture, v_texCoord + (off2 * u_radius / u_resolution)) * 0.0702702703;
  color += texture(u_texture, v_texCoord - (off2 * u_radius / u_resolution)) * 0.0702702703;

  outColor = color;
}
`;

export const blendGlowShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform sampler2D u_blurred_texture;
uniform float u_intensity;
out vec4 outColor;

void main() {
  vec4 base = texture(u_texture, v_texCoord);
  vec4 bloom = texture(u_blurred_texture, v_texCoord);
  
  // Screen blend mode
  vec3 rgb = 1.0 - (1.0 - base.rgb) * (1.0 - bloom.rgb * u_intensity);
  outColor = vec4(rgb, base.a);
}
`;

export const overlayBlendShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform sampler2D u_overlay;
uniform float u_alpha;
out vec4 outColor;

float overlay(float base, float blend) {
    return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

void main() {
  vec4 base = texture(u_texture, v_texCoord);
  vec4 blend = texture(u_overlay, v_texCoord);
  
  vec3 rgb = vec3(
    overlay(base.r, blend.r),
    overlay(base.g, blend.g),
    overlay(base.b, blend.b)
  );
  
  outColor = vec4(mix(base.rgb, rgb, u_alpha), base.a);
}
`;

export const thresholdShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_threshold;
uniform float u_threshold_noise;
out vec4 outColor;
void main() {
  vec4 color = texture(u_image, v_texCoord);
  if (color.a == 0.0) {
    outColor = color;
    return;
  }
  
  vec3 rgb = color.rgb;
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
  
  if (u_threshold_noise > 0.0) {
    float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    lum += (noise - 0.5) * u_threshold_noise;
  }
  
  float bin = lum >= u_threshold ? 1.0 : 0.0;
  outColor = vec4(vec3(bin), color.a);
}
`;

export const fisheyeShader = `#version 300 es
precision highp float;
in vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_distStrength;
out vec4 outColor;
void main() {
  vec2 uv = v_texCoord;
  vec2 d = uv - 0.5;
  float r = length(d) * 2.0;
  
  float factor = 1.0;
  if (u_distStrength > 0.0) {
    factor = 1.0 + u_distStrength * (r * r);
  } else {
    factor = 1.0 / (1.0 - u_distStrength * (r * r));
  }
  
  vec2 srcUV = 0.5 + d * factor;
  
  if (srcUV.x >= 0.0 && srcUV.x <= 1.0 && srcUV.y >= 0.0 && srcUV.y <= 1.0) {
    outColor = texture(u_image, srcUV);
  } else {
    outColor = vec4(0.0);
  }
}
`;
