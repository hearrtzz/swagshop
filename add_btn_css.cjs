const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const oldCSS = `    #btn-export-gif:hover {
      background: #9333ea !important;
    }`;

const newCSS = `    #btn-export-gif:hover {
      background: #9333ea !important;
    }

    #btn-export-3d-model {
      background: #3b82f6 !important;
      border-color: #3b82f6 !important;
    }
    
    #btn-export-3d-model:hover {
      background: #2563eb !important;
    }`;

html = html.replace(oldCSS, newCSS);
fs.writeFileSync('public/3d-studio.html', html);
