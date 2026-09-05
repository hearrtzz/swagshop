import fs from 'fs';

let html = fs.readFileSync('public/3d-studio.html', 'utf-8');

html = html.replace('<title>Logo Studio - 3D, Cartoon 2D & Foto Retro</title>', '<title>Logo Studio - 3D & Cartoon 2D</title>');
html = html.replace('<button class="segmented-btn" id="tab-photo">📸 Foto Retro</button>', '');
html = html.replace("tabPhoto.classList.toggle('active', target === 'photo');", "if(tabPhoto) tabPhoto.classList.toggle('active', target === 'photo');");
html = html.replace("tabPhoto.addEventListener('click', () => switchTab('photo'));", "if(tabPhoto) tabPhoto.addEventListener('click', () => switchTab('photo'));");

fs.writeFileSync('public/3d-studio.html', html);
console.log('Patched public/3d-studio.html successfully.');
