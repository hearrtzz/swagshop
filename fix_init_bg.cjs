const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

html = html.replace(/scene\.background = new THREE\.Color\(0x0b0c0e\);/g, 'scene.background = new THREE.Color(state.sceneBg);');

fs.writeFileSync('public/3d-studio.html', html);
