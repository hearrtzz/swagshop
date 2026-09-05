import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /const handleCloseImage = \(\) => \{\n    if \(image\) \{\n      if \(window\.confirm\("Você tem certeza que deseja fechar a imagem atual\? Você retornará ao menu inicial\."\)\) \{\n        setImage\(null\);\n        setEffectsState\(DEFAULT_PHOTO_EFFECTS\);\n        setTransform\(\{ x: 0, y: 0, scale: 1, rotation: 0, flipH: false, flipV: false \}\);\n      \}\n    \}\n  \};/,
  `const handleCloseImage = () => {
    if (image) {
      setImage(null);
      setEffectsState(DEFAULT_PHOTO_EFFECTS);
      setTransform({ x: 0, y: 0, scale: 1, rotation: 0, flipH: false, flipV: false });
    }
  };`
);
fs.writeFileSync('src/App.tsx', content);
