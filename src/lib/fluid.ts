type Format = {
  internalFormat: number;
  format: number;
};

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

export type FluidOptions = {
  simResolution: number;
  dyeResolution: number;
  densityDissipation: number;
  velocityDissipation: number;
  pressure: number;
  pressureIterations: number;
  curl: number;
  splatRadius: number;
  splatForce: number;
};

const DEFAULTS: FluidOptions = {
  simResolution: 128,
  dyeResolution: 512,
  densityDissipation: 0.98,
  velocityDissipation: 0.985,
  pressure: 0.8,
  pressureIterations: 18,
  curl: 28,
  splatRadius: 0.28,
  splatForce: 5200,
};

const BASE_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

function frag(body: string) {
  return `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
${body}`;
}

class Program {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null> = {};

  constructor(gl: WebGL2RenderingContext, vs: string, fs: string) {
    this.gl = gl;
    const v = compile(gl, gl.VERTEX_SHADER, vs);
    const f = compile(gl, gl.FRAGMENT_SHADER, fs);
    const p = gl.createProgram();
    if (!p) throw new Error("program");
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, "aPosition");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "link");
    }
    this.program = p;
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      if (!info) continue;
      this.uniforms[info.name] = gl.getUniformLocation(p, info.name);
    }
  }

  bind() {
    this.gl.useProgram(this.program);
  }
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const s = gl.createShader(type);
  if (!s) throw new Error("shader");
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || "compile");
  }
  return s;
}

export class FluidUniverse {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  opts: FluidOptions;
  destroyed = false;
  paused = false;
  raf = 0;
  last = 0;
  width = 0;
  height = 0;

  dye!: DoubleFBO;
  velocity!: DoubleFBO;
  divergence!: FBO;
  curlFbo!: FBO;
  pressure!: DoubleFBO;

  blit: (target: FBO | null, clear?: boolean) => void;

  clearProgram: Program;
  displayProgram: Program;
  splatProgram: Program;
  advectionProgram: Program;
  divergenceProgram: Program;
  curlProgram: Program;
  vorticityProgram: Program;
  pressureProgram: Program;
  gradProgram: Program;

  colorA: [number, number, number] = [0.22, 0.85, 0.78];
  colorB: [number, number, number] = [0.55, 0.38, 0.95];

  constructor(canvas: HTMLCanvasElement, opts?: Partial<FluidOptions>) {
    this.canvas = canvas;
    this.opts = { ...DEFAULTS, ...opts };
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("webgl2");
    this.gl = gl;
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");
    gl.clearColor(0.02, 0.02, 0.03, 1);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    const index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW,
    );
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    this.blit = (target, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl.clearColor(0.02, 0.02, 0.03, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    this.clearProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform float value;
        uniform sampler2D uTexture;
        void main() { fragColor = value * texture(uTexture, vUv); }
      `),
    );
    this.splatProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
        void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture(uTarget, vUv).xyz;
          fragColor = vec4(base + splat, 1.0);
        }
      `),
    );
    this.advectionProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
        void main () {
          vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
          vec4 result = texture(uSource, coord);
          float decay = 1.0 + dissipation * dt;
          fragColor = result / decay;
        }
      `),
    );
    this.divergenceProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uVelocity;
        void main () {
          float L = texture(uVelocity, vL).x;
          float R = texture(uVelocity, vR).x;
          float T = texture(uVelocity, vT).y;
          float B = texture(uVelocity, vB).y;
          vec2 C = texture(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }
          float div = 0.5 * (R - L + T - B);
          fragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `),
    );
    this.curlProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uVelocity;
        void main () {
          float L = texture(uVelocity, vL).y;
          float R = texture(uVelocity, vR).y;
          float T = texture(uVelocity, vT).x;
          float B = texture(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `),
    );
    this.vorticityProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
        void main () {
          float L = texture(uCurl, vL).x;
          float R = texture(uCurl, vR).x;
          float T = texture(uCurl, vT).x;
          float B = texture(uCurl, vB).x;
          float C = texture(uCurl, vUv).x;
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;
          vec2 velocity = texture(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          fragColor = vec4(velocity, 0.0, 1.0);
        }
      `),
    );
    this.pressureProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        void main () {
          float L = texture(uPressure, vL).x;
          float R = texture(uPressure, vR).x;
          float T = texture(uPressure, vT).x;
          float B = texture(uPressure, vB).x;
          float divergence = texture(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          fragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `),
    );
    this.gradProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        void main () {
          float L = texture(uPressure, vL).x;
          float R = texture(uPressure, vR).x;
          float T = texture(uPressure, vT).x;
          float B = texture(uPressure, vB).x;
          vec2 velocity = texture(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          fragColor = vec4(velocity, 0.0, 1.0);
        }
      `),
    );
    this.displayProgram = new Program(
      gl,
      BASE_VERT,
      frag(`
        uniform sampler2D uTexture;
        uniform float time;
        vec3 aces(vec3 x) {
          const float a = 2.51;
          const float b = 0.03;
          const float c = 2.43;
          const float d = 0.59;
          const float e = 0.14;
          return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
        }
        void main () {
          vec3 c = texture(uTexture, vUv).rgb;
          vec2 uv = vUv;
          float n = fract(sin(dot(uv * 400.0 + time, vec2(12.9898, 78.233))) * 43758.5453);
          vec3 glow = texture(uTexture, uv + vec2(0.002, 0.0)).rgb * vec3(0.15, 0.4, 0.55)
                    + texture(uTexture, uv - vec2(0.002, 0.0)).rgb * vec3(0.45, 0.15, 0.5);
          c = c * 1.15 + glow * 0.55;
          c += (n - 0.5) * 0.035;
          float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
          c *= mix(0.55, 1.0, vig);
          vec3 grade = mix(c, c.gbr * vec3(0.85, 1.05, 1.2), 0.12);
          grade = aces(grade);
          grade = pow(grade, vec3(0.92));
          fragColor = vec4(grade, 1.0);
        }
      `),
    );

    this.initFramebuffers();
    this.resize();
    this.seed();
  }

  setPalette(a: [number, number, number], b: [number, number, number]) {
    this.colorA = a;
    this.colorB = b;
  }

  private support(internalFormat: number, format: number, type: number) {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) return false;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    const ok =
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.deleteTexture(tex);
    gl.deleteFramebuffer(fbo);
    return ok;
  }

  private pickFormat(): { rgba: Format; rg: Format; r: Format; half: number } {
    const gl = this.gl;
    const half = gl.HALF_FLOAT;
    const rgba: Format = this.support(gl.RGBA16F, gl.RGBA, half)
      ? { internalFormat: gl.RGBA16F, format: gl.RGBA }
      : { internalFormat: gl.RGBA8, format: gl.RGBA };
    const rg: Format = this.support(gl.RG16F, gl.RG, half)
      ? { internalFormat: gl.RG16F, format: gl.RG }
      : rgba;
    const r: Format = this.support(gl.R16F, gl.RED, half)
      ? { internalFormat: gl.R16F, format: gl.RED }
      : rg;
    return { rgba, rg, r, half };
  }

  private createFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    filter: number,
  ): FBO {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    const fbo = gl.createFramebuffer();
    if (!texture || !fbo) throw new Error("fbo");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach: (id: number) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  private createDouble(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    filter: number,
  ): DoubleFBO {
    let f1 = this.createFBO(w, h, internalFormat, format, type, filter);
    let f2 = this.createFBO(w, h, internalFormat, format, type, filter);
    return {
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      get read() {
        return f1;
      },
      set read(v) {
        f1 = v;
      },
      get write() {
        return f2;
      },
      set write(v) {
        f2 = v;
      },
      swap() {
        const t = f1;
        f1 = f2;
        f2 = t;
      },
    };
  }

  private initFramebuffers() {
    const gl = this.gl;
    const fmt = this.pickFormat();
    const type = this.support(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT)
      ? gl.HALF_FLOAT
      : gl.UNSIGNED_BYTE;
    const sim = getResolution(this.opts.simResolution, this.canvas);
    const dye = getResolution(this.opts.dyeResolution, this.canvas);
    const filter = type === gl.UNSIGNED_BYTE ? gl.LINEAR : gl.LINEAR;
    this.dye = this.createDouble(
      dye.width,
      dye.height,
      fmt.rgba.internalFormat,
      fmt.rgba.format,
      type,
      filter,
    );
    this.velocity = this.createDouble(
      sim.width,
      sim.height,
      fmt.rg.internalFormat,
      fmt.rg.format,
      type,
      gl.LINEAR,
    );
    this.divergence = this.createFBO(
      sim.width,
      sim.height,
      fmt.r.internalFormat,
      fmt.r.format,
      type,
      gl.NEAREST,
    );
    this.curlFbo = this.createFBO(
      sim.width,
      sim.height,
      fmt.r.internalFormat,
      fmt.r.format,
      type,
      gl.NEAREST,
    );
    this.pressure = this.createDouble(
      sim.width,
      sim.height,
      fmt.r.internalFormat,
      fmt.r.format,
      type,
      gl.NEAREST,
    );
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.floor(this.canvas.clientWidth * dpr) || window.innerWidth;
    const h = Math.floor(this.canvas.clientHeight * dpr) || window.innerHeight;
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  splat(x: number, y: number, dx: number, dy: number, color?: [number, number, number]) {
    const gl = this.gl;
    const aspect = this.canvas.width / Math.max(this.canvas.height, 1);
    const col = color ?? this.mixColor();
    this.splatProgram.bind();
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.splatProgram.uniforms.aspectRatio, aspect);
    gl.uniform2f(this.splatProgram.uniforms.point, x, y);
    gl.uniform3f(this.splatProgram.uniforms.color, dx, dy, 0);
    gl.uniform1f(
      this.splatProgram.uniforms.radius,
      correctRadius(this.opts.splatRadius / 100, aspect),
    );
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(
      this.splatProgram.uniforms.color,
      col[0] * 0.28,
      col[1] * 0.28,
      col[2] * 0.28,
    );
    this.blit(this.dye.write);
    this.dye.swap();
  }

  mixColor(): [number, number, number] {
    const t = 0.5 + 0.5 * Math.sin(performance.now() * 0.0004);
    return [
      this.colorA[0] + (this.colorB[0] - this.colorA[0]) * t,
      this.colorA[1] + (this.colorB[1] - this.colorA[1]) * t,
      this.colorA[2] + (this.colorB[2] - this.colorA[2]) * t,
    ];
  }

  seed() {
    for (let i = 0; i < 12; i++) {
      const x = Math.random();
      const y = Math.random();
      const dx = (Math.random() * 2 - 1) * 800;
      const dy = (Math.random() * 2 - 1) * 800;
      this.splat(x, y, dx, dy);
    }
  }

  step(dt: number) {
    const gl = this.gl;
    gl.disable(gl.BLEND);
    const texel = [this.velocity.texelSizeX, this.velocity.texelSizeY] as const;

    this.curlProgram.bind();
    gl.uniform2f(this.curlProgram.uniforms.texelSize, texel[0], texel[1]);
    gl.uniform1i(this.curlProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curlFbo);

    this.vorticityProgram.bind();
    gl.uniform2f(this.vorticityProgram.uniforms.texelSize, texel[0], texel[1]);
    gl.uniform1i(
      this.vorticityProgram.uniforms.uVelocity,
      this.velocity.read.attach(0),
    );
    gl.uniform1i(this.vorticityProgram.uniforms.uCurl, this.curlFbo.attach(1));
    gl.uniform1f(this.vorticityProgram.uniforms.curl, this.opts.curl);
    gl.uniform1f(this.vorticityProgram.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.divergenceProgram.bind();
    gl.uniform2f(this.divergenceProgram.uniforms.texelSize, texel[0], texel[1]);
    gl.uniform1i(
      this.divergenceProgram.uniforms.uVelocity,
      this.velocity.read.attach(0),
    );
    this.blit(this.divergence);

    this.clearProgram.bind();
    gl.uniform1f(this.clearProgram.uniforms.value, this.opts.pressure);
    gl.uniform1i(this.clearProgram.uniforms.uTexture, this.pressure.read.attach(0));
    this.blit(this.pressure.write);
    this.pressure.swap();

    this.pressureProgram.bind();
    gl.uniform2f(this.pressureProgram.uniforms.texelSize, texel[0], texel[1]);
    gl.uniform1i(
      this.pressureProgram.uniforms.uDivergence,
      this.divergence.attach(0),
    );
    for (let i = 0; i < this.opts.pressureIterations; i++) {
      gl.uniform1i(
        this.pressureProgram.uniforms.uPressure,
        this.pressure.read.attach(1),
      );
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    this.gradProgram.bind();
    gl.uniform2f(this.gradProgram.uniforms.texelSize, texel[0], texel[1]);
    gl.uniform1i(this.gradProgram.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.gradProgram.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.advectionProgram.bind();
    gl.uniform2f(this.advectionProgram.uniforms.texelSize, texel[0], texel[1]);
    const velId = this.velocity.read.attach(0);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, velId);
    gl.uniform1i(this.advectionProgram.uniforms.uSource, velId);
    gl.uniform1f(this.advectionProgram.uniforms.dt, dt);
    gl.uniform1f(
      this.advectionProgram.uniforms.dissipation,
      this.opts.velocityDissipation,
    );
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(
      this.advectionProgram.uniforms.uVelocity,
      this.velocity.read.attach(0),
    );
    gl.uniform1i(this.advectionProgram.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(
      this.advectionProgram.uniforms.dissipation,
      this.opts.densityDissipation,
    );
    this.blit(this.dye.write);
    this.dye.swap();
  }

  draw() {
    const gl = this.gl;
    this.displayProgram.bind();
    gl.uniform1f(this.displayProgram.uniforms.time, performance.now() * 0.001);
    gl.uniform1i(this.displayProgram.uniforms.uTexture, this.dye.read.attach(0));
    this.blit(null);
  }

  loop = (now: number) => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.paused) return;
    const dt = Math.min((now - this.last) / 1000, 0.033);
    this.last = now;
    this.resize();
    if (Math.random() < 0.012) {
      this.splat(
        Math.random(),
        Math.random(),
        (Math.random() * 2 - 1) * 400,
        (Math.random() * 2 - 1) * 280,
      );
    }
    this.step(dt || 0.016);
    this.draw();
  };

  start() {
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
  }
}

function getResolution(resolution: number, canvas: HTMLCanvasElement) {
  const aspect = canvas.width / Math.max(canvas.height, 1);
  let a = aspect;
  if (a < 1) a = 1 / a;
  const min = Math.round(resolution);
  const max = Math.round(resolution * a);
  if (canvas.width > canvas.height) return { width: max, height: min };
  return { width: min, height: max };
}

function correctRadius(radius: number, aspect: number) {
  if (aspect > 1) radius *= aspect;
  return radius;
}
