const fs = require('fs');
let html = fs.readFileSync('public/3d-studio.html', 'utf8');

const oldScripts = `<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/SVGLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>
</head>`;

const newScripts = `<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/SVGLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/OBJExporter.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>
</head>`;

html = html.replace(oldScripts, newScripts);
fs.writeFileSync('public/3d-studio.html', html);
