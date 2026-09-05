import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /if \(!image\) \{\n\s*alert\("Carregue sua imagem primeiro"\);\n\s*handleUploadClick\(\);\n\s*return;\n\s*\}/g,
  `if (!image) {
      handleUploadClick();
      return;
    }`
);

content = content.replace(
  /if \(!validTypes\.includes\(file\.type\)\) \{\n\s*alert\("Erro: Formato de arquivo não suportado\. Por favor, envie apenas imagens \(PNG, JPEG, WEBP ou SVG\)\."\);\n\s*return;\n\s*\}/,
  `if (!validTypes.includes(file.type)) {
      console.warn("Formato não suportado");
      return;
    }`
);

fs.writeFileSync('src/App.tsx', content);
