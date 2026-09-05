const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const targetStr2 = `            if (state.mode === '3d') {
                modelGroup.rotation.y = currentRotation + (i * rotationStep);`;

const newStr2 = `            if (state.mode === '2d' && state.c2dJitter) {
                boilNoise.setAttribute('seed', Math.floor(Math.random() * 500) + 1);
            }
            if (state.mode === '3d') {
                modelGroup.rotation.y = currentRotation + (i * rotationStep);`;

if (html.includes(targetStr2)) {
  html = html.replace(targetStr2, newStr2);
  fs.writeFileSync('public/3d-studio.html', html);
  console.log("Applied seed mutation for GIF");
} else {
  console.log("target 2 not found");
}
