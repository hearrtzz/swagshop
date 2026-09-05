import fs from 'fs';
let content = fs.readFileSync('src/utils/webglProcessing.ts', 'utf8');

const endOfLoopAndRender = 
`  if (!cpuMode) {
    pipeline.finalize();
    const ctx = targetCanvas.getContext('2d');
    if (ctx) {
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(pipeline.canvas, 0, 0);
    }
  } else if (cpuPipeline) {
    cpuPipeline.sync();
  }`;

const newEndOfLoopAndRender =
`  // Texture always on top
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
    const ctx = targetCanvas.getContext('2d');
    if (ctx) {
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(pipeline.canvas, 0, 0);
    }
  } else if (cpuPipeline) {
    cpuPipeline.sync();
  }`;

content = content.replace(endOfLoopAndRender, newEndOfLoopAndRender);

fs.writeFileSync('src/utils/webglProcessing.ts', content);
