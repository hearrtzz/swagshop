export class GLPipeline {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  private width: number;
  private height: number;

  private textureSource: WebGLTexture;
  private fboA: WebGLFramebuffer;
  private texA: WebGLTexture;
  private fboB: WebGLFramebuffer;
  private texB: WebGLTexture;

  private quadBuffer: WebGLBuffer;
  private vao: WebGLVertexArrayObject;
  private currentSourceIsA = true;
  private originalTextureLoaded = false;
  private programCache: Map<string, WebGLProgram> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    const gl = this.canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;

    // Create quad for rendering
    const quad = new Float32Array([
      -1, -1, 
       1, -1, 
      -1,  1, 
      -1,  1, 
       1, -1, 
       1,  1
    ]);
    
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    
    this.quadBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindVertexArray(null);

    // Create textures and FBOs
    this.textureSource = this.createTexture();
    
    this.texA = this.createTexture();
    this.fboA = this.createFBO(this.texA);
    
    this.texB = this.createTexture();
    this.fboB = this.createFBO(this.texB);
  }

  private createTexture(): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return tex;
  }

  private createFBO(tex: WebGLTexture): WebGLFramebuffer {
    const gl = this.gl;
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return fbo;
  }

  loadSource(image: TexImageSource) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.textureSource);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    
    // Copy to FBO A
    this.currentSourceIsA = true;
    const program = this.compileShader(this.basicVertexShader, this.copyFragmentShader);
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA);
    gl.viewport(0, 0, this.width, this.height);
    this.setupQuad(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textureSource);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.originalTextureLoaded = true;
  }

  private compileShader(vsSource: string, fsSource: string): WebGLProgram {
    const cacheKey = fsSource;
    if (this.programCache.has(cacheKey)) {
      return this.programCache.get(cacheKey)!;
    }

    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(vs);
      console.error('VS Error', err);
      throw new Error("VS Error: " + err);
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(fs);
      console.error('FS Error', err);
      throw new Error("FS Error: " + err);
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'a_position');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program);
      console.error('Program Error', err);
      throw new Error("Program Error: " + err);
    }

    this.programCache.set(cacheKey, program);
    return program;
  }

  private setupQuad(program: WebGLProgram) {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
  }

  applyPass(fsSource: string, uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => void) {
    const gl = this.gl;
    const program = this.compileShader(this.basicVertexShader, fsSource);
    gl.useProgram(program);

    const sourceTex = this.currentSourceIsA ? this.texA : this.texB;
    const targetFbo = this.currentSourceIsA ? this.fboB : this.fboA;

    gl.bindFramebuffer(gl.FRAMEBUFFER, targetFbo);
    gl.viewport(0, 0, this.width, this.height);

    this.setupQuad(program);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTex);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), this.width, this.height);

    // Provide original texture on unit 1 for effects that need it (like noise, masking)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textureSource);
    gl.uniform1i(gl.getUniformLocation(program, 'u_original_texture'), 1);

    uniforms(gl, program);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    const err = gl.getError();
    if (err !== gl.NO_ERROR) {
      console.error('WebGL error during applyPass:', err);
    }

    // Swap
    this.currentSourceIsA = !this.currentSourceIsA;
  }

  finalize() {
    // Draw the final FBO back to the pipeline canvas (the screen)
    const gl = this.gl;
    const program = this.compileShader(this.basicVertexShader, this.copyFragmentShader);
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    this.setupQuad(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.currentSourceIsA ? this.texA : this.texB);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.finish();
  }

  createLUTTexture(data: Uint8Array, width: number, height: number): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return tex;
  }
  
  createLUTTextureR8(data: Uint8Array, width: number, height: number): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, data);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4); // restore default
    return tex;
  }
  
  createLUTTextureRGB(data: Uint8Array, width: number, height: number): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4); // restore default
    return tex;
  }

  destroy() {
    const gl = this.gl;
    gl.deleteTexture(this.textureSource);
    gl.deleteTexture(this.texA);
    gl.deleteTexture(this.texB);
    gl.deleteFramebuffer(this.fboA);
    gl.deleteFramebuffer(this.fboB);
    gl.deleteBuffer(this.quadBuffer);
    gl.deleteVertexArray(this.vao);
    this.programCache.forEach(p => gl.deleteProgram(p));
    this.programCache.clear();
  }

  private basicVertexShader = `#version 300 es
    in vec2 a_position;
    out vec2 v_texCoord;
    void main() {
      // Convert from -1..1 to 0..1
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  private copyFragmentShader = `#version 300 es
    precision highp float;
    uniform sampler2D u_texture;
    in vec2 v_texCoord;
    out vec4 outColor;
    void main() {
      // Sample the texture.
      outColor = texture(u_texture, v_texCoord);
    }
  `;
}
