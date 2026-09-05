import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const uploadRegex = /const handleUploadImage = \(file: File\) => \{\s*if \(\!file\) return;\s*(if \(file\.type.*?\{\s*setCanvasConfig.*?\s*\}\s*)/;
const replacement = `const handleUploadImage = (file: File) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert("Erro: Formato de arquivo não suportado. Por favor, envie apenas imagens (PNG, JPEG, WEBP ou SVG).");
      return;
    }

    if (file.type.includes('png') || file.name.endsWith('.png') || file.type.includes('svg') || file.name.endsWith('.svg')) {
      setCanvasConfig(prev => ({ ...prev, backgroundType: 'transparent' }));
    }`;

content = content.replace(uploadRegex, replacement);

const nameRegex = /setCanvasConfig\(prev => \(\{\s*\.\.\.prev,\s*width: nw,\s*height: nh,\s*preset: 'custom',/;
const nameReplacement = `setCanvasConfig(prev => ({
        ...prev,
        name: file.name.split('.').slice(0, -1).join('.') || file.name,
        width: nw,
        height: nh,
        preset: 'custom',`;

content = content.replace(nameRegex, nameReplacement);

fs.writeFileSync('src/App.tsx', content);
