import { useEffect, useRef } from 'react';
import { reduced, startShader } from './gl';

/*
 * A parede do escritório no fim da tarde: o sol atravessa a persiana e desenha faixas de luz.
 * "open" vai de 1 (lâminas abertas) a 0 (fechadas). A rolagem fecha a persiana e a sala escurece.
 */
const FRAG = `
uniform vec2 res; uniform float time; uniform float open; uniform vec2 mouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  float asp = res.x / res.y;
  vec2 p = (uv - .5) * vec2(asp, 1.);
  // parede: grafite quente, um pouco mais clara no alto
  vec3 wall = mix(vec3(.055,.052,.046), vec3(.10,.092,.078), uv.y);
  wall += (noise(uv * vec2(3., 40.)) - .5) * .012;
  // projeção da janela: inclinada como luz de fim de tarde, com deriva lenta e leve paralaxe do mouse
  vec2 q = rot(-.42) * (p - vec2(.34 * asp, .16) - mouse * .025);
  q.x += q.y * .32;
  float drift = sin(time * .05) * .03;
  q.y += drift;
  vec2 hs = vec2(.42 * max(asp, 1.), .5);
  float soft = .05 + .06 * (1. - open);
  float win = smoothstep(hs.x, hs.x - soft, abs(q.x)) * smoothstep(hs.y, hs.y - soft, abs(q.y));
  // caixilho: uma travessa vertical faz sombra no meio
  win *= mix(1., .0, smoothstep(.018, .004, abs(q.x - .05)));
  // lâminas da persiana
  float n = 13.;
  float s = fract(q.y * n + .5);
  float duty = mix(.035, .56, open);
  float edge = .03 + .05 * (1. - open) + .025 * abs(q.y);
  float slat = smoothstep(0., edge, s) * smoothstep(duty + edge, duty, s);
  float light = win * slat;
  // a luz é mais forte perto da janela e cai devagar
  float fall = smoothstep(1.4, -.2, length(q * vec2(.55, .9)));
  vec3 sun = vec3(.98, .84, .62) * .62;
  vec3 col = wall + sun * light * fall * (.55 + .45 * open);
  // halo quente e difuso em volta da projeção
  col += sun * .05 * win * fall * open;
  // poeira suspensa, só visível dentro da luz
  vec2 dp = uv * vec2(asp, 1.) * 90.; dp.y += time * 2.2; dp.x += sin(time * .3 + uv.y * 6.) * 2.;
  float mote = step(.9985, hash(floor(dp))) * light;
  col += sun * mote * .18;
  // canto inferior esquerdo mais escuro, onde fica o texto
  col *= mix(.55, 1., smoothstep(.0, .75, uv.x * .7 + uv.y));
  // grão de filme
  col += (hash(uv * res + time) - .5) * .028;
  // vinheta
  col *= mix(1., .55, smoothstep(.45, 1.25, length((uv - .5) * vec2(asp * .8, 1.))));
  gl_FragColor = vec4(col, 1.);
}`;

export function Blinds({ openRef }: { openRef: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const mouse: [number, number] = [0, 0];
    const target: [number, number] = [0, 0];
    const onMove = (e: PointerEvent) => {
      target[0] = e.clientX / innerWidth - 0.5;
      target[1] = 0.5 - e.clientY / innerHeight;
    };
    addEventListener('pointermove', onMove, { passive: true });
    const still = reduced();
    const stop = startShader(
      c,
      FRAG,
      (t) => {
        mouse[0] += (target[0] - mouse[0]) * 0.04;
        mouse[1] += (target[1] - mouse[1]) * 0.04;
        return { open: openRef.current, mouse, time: still ? 0 : t };
      },
      { dpr: innerWidth < 700 ? 1 : 1.5 },
    );
    return () => {
      stop();
      removeEventListener('pointermove', onMove);
    };
  }, [openRef]);
  return <canvas ref={ref} className="blinds" aria-hidden="true" />;
}
