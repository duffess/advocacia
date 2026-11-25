import { useEffect, useRef } from 'react';
import { finePointer, reduced, startShader } from './gl';

/*
 * Vidro canelado, o mesmo das divisórias de sala de reunião: o que está atrás fica ilegível.
 * Onde o mouse passa, o vidro "limpa" e o texto aparece. Mostra a ideia de sigilo sem dizer.
 */
const FRAG = `
uniform vec2 res; uniform float time; uniform vec2 mouse; uniform float clear; uniform sampler2D tex;
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  float flutes = res.x / (res.x < 1400. ? 40. : 60.);
  float f = fract(uv.x * flutes);
  // cada canelura é uma lente cilíndrica: desloca e amplia o que está atrás
  float bend = (f - .5);
  vec2 m = mouse; float asp = res.x / res.y;
  float d = length((uv - m) * vec2(asp, 1.));
  float lens = smoothstep(.3, .1, d) * clear;
  float k = (1. - lens);
  vec2 o = vec2(-bend * (1. / flutes) * 1.6 * k, 0.);
  vec3 c = vec3(0.);
  // várias amostras dão o desfoque do vidro
  for (int i = -6; i <= 6; i++) {
    float fi = float(i);
    c += texture2D(tex, uv + o + vec2(fi * (.35 / flutes) * k, fi * .0015 * k)).rgb;
  }
  c /= 13.;
  // brilho na crista de cada canelura
  float ridge = pow(1. - abs(f - .5) * 2., 6.) * .07 * k;
  c += ridge;
  // sombra suave entre caneluras
  c *= 1. - smoothstep(.42, .5, abs(f - .5)) * .18 * k;
  gl_FragColor = vec4(c, 1.);
}`;

function paintBehind(cv: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const x = cv.getContext('2d')!;
  x.scale(dpr, dpr);
  x.fillStyle = '#1f2a24';
  x.fillRect(0, 0, w, h);
  // uma "folha" de processo com o texto que o vidro esconde
  const lines = [
    'Cláusula 4ª. As partes acordam',
    'que toda informação trocada',
    'neste atendimento é sigilosa',
    'e protegida pelo segredo',
    'profissional do advogado.',
  ];
  const fs = Math.max(26, Math.min(w / 13, 74));
  x.fillStyle = '#efe9dd';
  x.font = `400 ${fs}px "Caslon Display", Georgia, serif`;
  x.textBaseline = 'top';
  const lh = fs * 1.12;
  const top = (h - lh * lines.length) / 2;
  const left = Math.max(24, w * 0.08);
  lines.forEach((l, i) => x.fillText(l, left, top + i * lh));
  x.fillStyle = '#c9a46a';
  x.beginPath();
  x.arc(left + x.measureText(lines[4]).width + fs * 0.12, top + 4 * lh + fs * 0.78, fs * 0.09, 0, Math.PI * 2);
  x.fill();
}

export function Reeded() {
  const wrap = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const el = wrap.current;
    if (!c || !el) return;
    let stop = () => {};
    const mouse: [number, number] = [0.5, 0.5];
    const target: [number, number] = [0.5, 0.5];
    let clear = 0;
    let clearTarget = finePointer() ? 0 : 1;
    const start = () => {
      stop();
      const r = el.getBoundingClientRect();
      const behind = document.createElement('canvas');
      paintBehind(behind, r.width, r.height);
      stop = startShader(
        c,
        FRAG,
        (t) => {
          // no celular, a lente passeia sozinha pela frase
          if (!finePointer()) {
            target[0] = 0.5 + Math.sin(t * 0.5) * 0.32;
            target[1] = 0.5 + Math.sin(t * 0.37) * 0.22;
          }
          mouse[0] += (target[0] - mouse[0]) * 0.08;
          mouse[1] += (target[1] - mouse[1]) * 0.08;
          clear += (clearTarget - clear) * 0.06;
          return { mouse, clear: reduced() ? 1 : clear };
        },
        { texture: behind, dpr: 2 },
      );
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = 1 - (e.clientY - r.top) / r.height;
    };
    const on = () => (clearTarget = 1);
    const off = () => (clearTarget = finePointer() ? 0 : 1);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', on);
    el.addEventListener('pointerleave', off);
    document.fonts.ready.then(start);
    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(start, 200);
    };
    addEventListener('resize', onResize);
    return () => {
      stop();
      removeEventListener('resize', onResize);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', on);
      el.removeEventListener('pointerleave', off);
    };
  }, []);
  return (
    <div className="reeded" ref={wrap}>
      <canvas ref={ref} aria-hidden="true" />
      <p className="sr-only">
        Cláusula 4ª. As partes acordam que toda informação trocada neste atendimento é sigilosa e protegida pelo segredo profissional do advogado.
      </p>
    </div>
  );
}
