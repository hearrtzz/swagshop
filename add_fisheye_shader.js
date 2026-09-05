import fs from 'fs';
let content = fs.readFileSync('src/utils/webgl/shaders.ts', 'utf8');

const newShader = `
export const fisheyeShader = \`#version 300 es
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
\`;
`;

content += newShader;
fs.writeFileSync('src/utils/webgl/shaders.ts', content);
