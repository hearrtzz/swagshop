import fs from 'fs';

let content = fs.readFileSync('src/utils/webgl/shaders.ts', 'utf8');

content = content.replace(
  "uniform float u_threshold;",
  "uniform float u_threshold;\nuniform float u_threshold_noise;"
);

content = content.replace(
  `  // Threshold
  if (u_threshold > 0.0) {
    lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    float bin = lum >= u_threshold ? 1.0 : 0.0;
    rgb = vec3(bin);
  }`,
  `  // Threshold
  if (u_threshold > 0.0) {
    lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    if (u_threshold_noise > 0.0) {
      float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      lum += (noise - 0.5) * u_threshold_noise;
    }
    float bin = lum >= u_threshold ? 1.0 : 0.0;
    rgb = vec3(bin);
  }`
);

fs.writeFileSync('src/utils/webgl/shaders.ts', content);
