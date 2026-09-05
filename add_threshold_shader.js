import fs from 'fs';
let content = fs.readFileSync('src/utils/webgl/shaders.ts', 'utf8');

const newShader = `
export const thresholdShader = \`#version 300 es
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
\`;
`;

content += newShader;
fs.writeFileSync('src/utils/webgl/shaders.ts', content);
