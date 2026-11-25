// Pequeno motor de shader em tela cheia: um triângulo, uniforms por quadro e pausa fora da tela.
export type Uniforms = Record<string, number | [number, number] | [number, number, number]>;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

export function startShader(
  canvas: HTMLCanvasElement,
  frag: string,
  getUniforms: (t: number) => Uniforms,
  opts: { dpr?: number; texture?: HTMLCanvasElement } = {},
): () => void {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true });
  if (!gl) return () => {};
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision highp float;' + frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  let tex: WebGLTexture | null = null;
  if (opts.texture) {
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, opts.texture);
  }

  const dpr = Math.min(window.devicePixelRatio || 1, opts.dpr ?? 1.5);
  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);

  const locs: Record<string, WebGLUniformLocation | null> = {};
  const u = (n: string) => (n in locs ? locs[n] : (locs[n] = gl.getUniformLocation(prog, n)));
  let raf = 0;
  const t0 = performance.now();
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;
    gl.uniform2f(u('res'), canvas.width, canvas.height);
    gl.uniform1f(u('time'), t);
    for (const [k, v] of Object.entries(getUniforms(t))) {
      if (typeof v === 'number') gl.uniform1f(u(k), v);
      else if (v.length === 2) gl.uniform2f(u(k), v[0], v[1]);
      else gl.uniform3f(u(k), v[0], v[1], v[2]);
    }
    if (tex) gl.uniform1i(u('tex'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  frame();
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    // não perde o contexto: no modo de desenvolvimento o React monta o componente duas vezes
    // e o mesmo canvas precisa continuar desenhando
    gl.deleteProgram(prog);
    gl.deleteBuffer(buf);
    if (tex) gl.deleteTexture(tex);
  };
}

export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
