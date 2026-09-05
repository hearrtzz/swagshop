import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

// Inside renderProcessedImageWebGL, we have:
//   for (const layerId of order) {
// ...
//   }
//   if (!cpuMode) {
//     pipeline.render(targetCanvas);
//   }

content = content.replace(
  "  const order = (state.layerOrder && state.layerOrder.length > 0) ? state.layerOrder : DEFAULT_LAYER_ORDER;",
  `  const order = (state.layerOrder && state.layerOrder.length > 0) ? state.layerOrder : DEFAULT_LAYER_ORDER;
  const filteredOrder = order.filter(id => id !== 'texture');`
);

content = content.replace(
  "  for (const layerId of order) {",
  "  for (const layerId of filteredOrder) {"
);

// We should apply texture right before or after pipeline.render(targetCanvas);
// Wait, Texture is only applied via CPU right now? Let's check applyTextureLayer in webglProcessing.ts
// Wait, is there applyTextureLayerWebGL?
