import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { Blinds } from './Blinds';
import { Reeded } from './Reeded';
import { finePointer, reduced } from './gl';
import { FIRM, areas, method, notes, team, waLink } from './data';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const INTRO_KEY = 'lv-intro';

/* Botão que termina num ponto: no hover o ponto corre pela frase e inunda o botão. */
function Fullstop({ href, children, dark }: { href: string; children: string; dark?: boolean }) {
  return (
    <a className={`fs${dark ? ' fs--dark' : ''}`} href={href} target="_blank" rel="noopener noreferrer">
      <span className="fs__label">{children}</span>
      <span className="fs__fill" aria-hidden="true">
        <span className="fs__label">{children}</span>
      </span>
      <span className="fs__dot" aria-hidden="true" />
    </a>
  );
}

function Nav() {
  return (
    <header className="nav">
      <a href="#topo" className="nav__brand">
        {FIRM.name}
        <span className="dot" />
      </a>
      <nav aria-label="Principal">
        <a href="#areas">Atuação</a>
        <a href="#metodo">Método</a>
        <a href="#equipe">Equipe</a>
        <a href="#contato">Contato</a>
      </nav>
    </header>
  );
}

function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const target = document.querySelector('.hero__dot');
      const dot = root.current!.querySelector('.intro__dot') as HTMLElement;
      const tl = gsap.timeline({ onComplete: onDone });
      tl.from(dot, { scale: 0, duration: 0.7, ease: 'back.out(2.2)' })
        .from('.intro__word', { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.25)
        .to('.intro__word', { yPercent: -110, duration: 0.6, ease: 'expo.in', stagger: 0.04 }, 1.35);
      if (target) {
        const a = dot.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        tl.to(
          dot,
          {
            x: b.left + b.width / 2 - (a.left + a.width / 2),
            y: b.top + b.height / 2 - (a.top + a.height / 2),
            scale: b.width / a.width,
            duration: 1,
            ease: 'expo.inOut',
          },
          1.7,
        );
      }
      tl.to(root.current, { autoAlpha: 0, duration: 0.5 }, 2.45);
    },
    { scope: root },
  );
  return (
    <div className="intro" ref={root} aria-hidden="true">
      <div className="intro__line">
        <span className="intro__mask"><span className="intro__word">Ponto</span></span>{' '}
        <span className="intro__mask"><span className="intro__word">final</span></span>
        <span className="intro__dot" />
      </div>
    </div>
  );
}

function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const open = useRef(reduced() ? 0.75 : 0.0);
  useGSAP(
    () => {
      if (!ready) return;
      const words = gsap.utils.toArray<HTMLElement>('.hero__w');
      const tl = gsap.timeline();
      tl.to(open, { current: 1, duration: 2.4, ease: 'power2.out' }, 0)
        .from(words, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.05 }, 0.1)
        .from('.hero__meta > *', { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.08 }, 0.6);
      if (reduced()) return;
      // a persiana fecha enquanto a página desce
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        .to(open, { current: 0.08, ease: 'none' }, 0)
        .to('.hero__inner', { yPercent: -14, autoAlpha: 0.2, ease: 'none' }, 0);
    },
    { scope: root, dependencies: [ready] },
  );
  return (
    <section className="hero" id="topo" ref={root}>
      <Blinds openRef={open} />
      <div className="hero__inner">
        <h1 className="hero__title" aria-label="Todo conflito merece um ponto final.">
          {['Todo', 'conflito', 'merece', 'um', 'ponto', 'final'].map((w, i) => (
            <span className="mask" key={w} aria-hidden="true">
              <span className="hero__w">
                {w}
                {i === 5 && <span className="hero__dot" />}
              </span>
            </span>
          ))}
        </h1>
        <div className="hero__meta">
          <p className="hero__lead">
            Advocacia empresarial, de família e sucessões em São Paulo. A gente escuta primeiro, explica sem juridiquês e
            conduz o caso até o fim.
          </p>
          <Fullstop href={waLink('Olá! Gostaria de agendar uma conversa com o escritório.')}>Agendar uma conversa</Fullstop>
          <p className="hero__fine">{FIRM.oab}</p>
        </div>
      </div>
      <p className="hero__scroll" aria-hidden="true">Role para fechar a persiana</p>
    </section>
  );
}

function Statement() {
  const root = useRef<HTMLElement>(null);
  const text =
    'Ninguém procura um advogado num dia bom. Por isso o nosso trabalho começa pela calma: ouvir a história inteira, mostrar os caminhos possíveis e só então decidir, juntos, qual seguir.';
  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        '.st__w',
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.st__p', start: 'top 80%', end: 'bottom 45%', scrub: true } },
      );
    },
    { scope: root },
  );
  return (
    <section className="st" ref={root} aria-label="O escritório">
      <p className="eyebrow">O escritório</p>
      <p className="st__p">
        {text.split(' ').map((w, i) => (
          <span className="st__w" key={i}>
            {w}{' '}
          </span>
        ))}
      </p>
      <dl className="st__facts">
        <div><dt>Fundação</dt><dd>2009</dd></div>
        <div><dt>Advogados</dt><dd>6</dd></div>
        <div><dt>Atendimento</dt><dd>Presencial e on-line</dd></div>
      </dl>
    </section>
  );
}

function Areas() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => setI(Math.min(areas.length - 1, Math.floor(s.progress * areas.length * 0.999))),
      });
    },
    { scope: root },
  );
  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo('.ar__word.is-on .ar__l', { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.025 });
      gsap.fromTo('.ar__panel.is-on li', { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.06, delay: 0.15 });
    },
    { scope: root, dependencies: [i] },
  );
  return (
    <section className="ar" id="areas" ref={root} style={{ height: `${areas.length * 100}svh` }}>
      <div className="ar__sticky">
        <div className="ar__head">
          <p className="eyebrow">Áreas de atuação</p>
          <ol className="ar__index" aria-label="Áreas">
            {areas.map((a, k) => (
              <li key={a.word} className={k === i ? 'is-on' : ''}>
                {a.word}
              </li>
            ))}
          </ol>
        </div>
        <div className="ar__stage">
          {areas.map((a, k) => (
            <h2 key={a.word} className={`ar__word${k === i ? ' is-on' : ''}`} aria-hidden={k !== i}>
              {a.word.split('').map((l, j) => (
                <span className="ar__m" key={j}>
                  <span className="ar__l">{l}</span>
                </span>
              ))}
            </h2>
          ))}
        </div>
        <div className="ar__panels">
          {areas.map((a, k) => (
            <div key={a.word} className={`ar__panel${k === i ? ' is-on' : ''}`} aria-hidden={k !== i}>
              <p className="ar__lead">{a.lead}</p>
              <ul>
                {a.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Method() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reduced()) return;
      gsap.from('.me__rule', { scaleX: 0, transformOrigin: '0 50%', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'center 55%', scrub: true } });
      gsap.from('.me__step', { autoAlpha: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.me__steps', start: 'top 80%' } });
    },
    { scope: root },
  );
  return (
    <section className="me" id="metodo" ref={root}>
      <p className="eyebrow">Como trabalhamos</p>
      <h2 className="h2">Quatro passos, sempre na mesma ordem.</h2>
      <div className="me__rule" aria-hidden="true" />
      <ol className="me__steps">
        {method.map((m, k) => (
          <li className="me__step" key={m.t}>
            <span className="me__n">{String(k + 1).padStart(2, '0')}</span>
            <h3>{m.t}</h3>
            <p>{m.p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Secret() {
  return (
    <section className="se" aria-labelledby="se-t">
      <div className="se__copy">
        <p className="eyebrow">Sigilo</p>
        <h2 className="h2" id="se-t">O que você conta aqui, fica aqui.</h2>
        <p>
          O segredo profissional é dever do advogado. Seus documentos ficam em ambiente protegido e só quem cuida do
          seu caso tem acesso.
        </p>
        <p className="se__hint">{finePointer() ? 'Passe o mouse pelo vidro.' : 'O vidro se abre sozinho.'}</p>
      </div>
      <Reeded />
    </section>
  );
}

function Team() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const drum = root.current!.querySelector('.tm__drum') as HTMLElement;
      const n = team.length;
      const cards = gsap.utils.toArray<HTMLElement>('.tm__card');
      const step = 42;
      const span = n * step;
      let rot = 0;
      let drag = 0;
      const place = () => {
        cards.forEach((c, k) => {
          const a = (((k * step + rot) % span) + span * 1.5) % span - span / 2;
          c.style.transform = `rotateY(${a}deg) translateZ(calc(var(--r) * -1))`;
          c.style.opacity = String(Math.max(0, 1 - Math.abs(a) / 75));
          c.style.visibility = Math.abs(a) > 80 ? 'hidden' : 'visible';
        });
      };
      place();
      if (!reduced()) {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (s) => {
            rot = s.progress * 220 + drag;
            place();
          },
        });
      }
      let x0 = 0;
      let d0 = 0;
      const down = (e: PointerEvent) => {
        x0 = e.clientX;
        d0 = drag;
        drum.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!drum.hasPointerCapture(e.pointerId)) return;
        const dd = (e.clientX - x0) * 0.25;
        rot += d0 + dd - drag;
        drag = d0 + dd;
        place();
      };
      drum.addEventListener('pointerdown', down);
      drum.addEventListener('pointermove', move);
      return () => {
        drum.removeEventListener('pointerdown', down);
        drum.removeEventListener('pointermove', move);
      };
    },
    { scope: root },
  );
  return (
    <section className="tm" id="equipe" ref={root}>
      <div className="tm__head">
        <p className="eyebrow">Equipe</p>
        <h2 className="h2">Quem cuida do seu caso tem nome.</h2>
      </div>
      <div className="tm__stage">
        <div className="tm__drum" role="list" aria-label="Equipe">
          {team.map((p) => (
            <article className="tm__card" role="listitem" key={p.name}>
              <div className="tm__mono" aria-hidden="true">{p.initials}</div>
              <h3>{p.name}</h3>
              <p>{p.role}</p>
            </article>
          ))}
        </div>
      </div>
      <p className="tm__hint" aria-hidden="true">Arraste para girar</p>
    </section>
  );
}

function Notes() {
  return (
    <section className="no" aria-labelledby="no-t">
      <div className="no__head">
        <p className="eyebrow">Notas</p>
        <h2 className="h2" id="no-t">Direito explicado em português.</h2>
      </div>
      <ul className="no__list">
        {notes.map((n) => (
          <li key={n.title}>
            <a href="#contato" className="no__item">
              <span className="no__tag">{n.tag}</span>
              <span className="no__title">{n.title}</span>
              <span className="no__meta">{n.date} · {n.min} min de leitura</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Contact() {
  const [err, setErr] = useState('');
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nome = String(f.get('nome') || '').trim();
    const assunto = String(f.get('assunto') || '');
    const msg = String(f.get('mensagem') || '').trim();
    if (!nome || !msg) {
      setErr('Preencha seu nome e conte, em poucas linhas, o que aconteceu.');
      return;
    }
    setErr('');
    window.open(waLink(`Olá, sou ${nome}. Assunto: ${assunto}.\n${msg}`), '_blank', 'noopener');
  };
  return (
    <section className="co" id="contato" aria-labelledby="co-t">
      <div className="co__info">
        <p className="eyebrow">Contato</p>
        <h2 className="h2" id="co-t">A primeira conversa é para entender.</h2>
        <dl>
          <div><dt>Endereço</dt><dd>{FIRM.address}</dd></div>
          <div><dt>Horário</dt><dd>{FIRM.hours}</dd></div>
          <div><dt>Telefone</dt><dd>{FIRM.phone}</dd></div>
          <div><dt>E-mail</dt><dd>{FIRM.email}</dd></div>
        </dl>
        <Fullstop href={waLink('Olá! Gostaria de falar com o escritório.')} dark>Falar no WhatsApp</Fullstop>
      </div>
      <form className="co__form" onSubmit={submit} noValidate>
        <label>
          Nome
          <input name="nome" autoComplete="name" placeholder="Seu nome completo" onInput={() => setErr('')} />
        </label>
        <label>
          Assunto
          <select name="assunto" defaultValue="Família">
            {areas.map((a) => (
              <option key={a.word}>{a.word}</option>
            ))}
            <option>Outro assunto</option>
          </select>
        </label>
        <label>
          O que aconteceu
          <textarea name="mensagem" rows={4} placeholder="Conte em poucas linhas. Não envie documentos por aqui." onInput={() => setErr('')} />
        </label>
        {err && <p className="co__err" role="alert">{err}</p>}
        <button type="submit" className="co__send">Enviar pelo WhatsApp</button>
        <p className="co__fine">
          O envio desta mensagem não cria relação entre advogado e cliente. As informações são usadas só para
          retornar o seu contato.
        </p>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ft">
      <p className="ft__giant" aria-hidden="true">
        {FIRM.name}
        <span className="dot" />
      </p>
      <div className="ft__row">
        <p>{FIRM.full} · {FIRM.oab}</p>
        <p>
          Escritório fictício. <a href="https://lysss.vercel.app" target="_blank" rel="noopener noreferrer">Site conceito feito pela LYSS</a>
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const [intro, setIntro] = useState(() => !reduced() && !sessionStorage.getItem(INTRO_KEY));
  const [ready, setReady] = useState(!intro);
  useEffect(() => {
    if (reduced()) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = intro ? 'hidden' : '';
  }, [intro]);
  return (
    <div className="app">
      <a className="skip" href="#areas">Pular para o conteúdo</a>
      <Nav />
      <main>
        <Hero ready={ready} />
        <Statement />
        <Areas />
        <Method />
        <Secret />
        <Team />
        <Notes />
        <Contact />
      </main>
      <Footer />
      {intro && (
        <Intro
          onDone={() => {
            sessionStorage.setItem(INTRO_KEY, '1');
            setIntro(false);
          }}
        />
      )}
      {intro && <IntroStarter onStart={() => setReady(true)} />}
    </div>
  );
}

/* O título do topo começa a entrar enquanto o ponto da abertura voa até ele. */
function IntroStarter({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const t = setTimeout(onStart, 1750);
    return () => clearTimeout(t);
  }, [onStart]);
  return null;
}
