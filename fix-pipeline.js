import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

// 1. Remove texture from order array
content = content.replace(
  "  const order = (state.layerOrder && state.layerOrder.length > 0) ? state.layerOrder : DEFAULT_LAYER_ORDER;",
  `  const orderRaw = (state.layerOrder && state.layerOrder.length > 0) ? state.layerOrder : DEFAULT_LAYER_ORDER;
  const order = orderRaw.filter(id => id !== 'texture');`
);

// 2. Ensure texture gets executed at the very end
// We find where the loop ends.
const endOfLoopAndRender = 
`  }

  if (!cpuMode) {
    pipeline.finalize();
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(pipeline.canvas, 0, 0);
    }
  } else if (cpuPipeline) {
    cpuPipeline.sync();
  }
}`;

const newEndOfLoopAndRender =
`  }

  // Always apply Texture layer last
  if (state.dustScratches > 0 || state.lightLeak > 0) {
    if (!cpuMode) {
      pipeline.finalize();
      const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        targetCanvas.width = targetW;
        targetCanvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(pipeline.canvas, 0, 0);
        cpuPipeline = new PipelineManager(ctx, targetW, targetH);
      }
      cpuMode = true;
    }
    if (cpuPipeline) {
      applyTextureLayer(cpuPipeline, state, targetW, targetH, hasTransparency);
    }
  }

  if (!cpuMode) {
    pipeline.finalize();
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(pipeline.canvas, 0, 0);
    }
  } else if (cpuPipeline) {
    cpuPipeline.sync();
  }
}`;

content = content.replace(endOfLoopAndRender, newEndOfLoopAndRender);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
