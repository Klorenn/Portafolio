/** Interaction layer: scroll progress, back-to-top, one-shot reveal, carousel dots. Loaded once from Base. */
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function progress(): void {
  const bar = document.querySelector<HTMLElement>('.nav-prog');
  const top = document.querySelector<HTMLButtonElement>('.to-top');
  if (!bar && !top) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    // stepped look: 2% increments
    if (bar) bar.style.width = `${Math.round(p * 50) * 2}%`;
    if (top) top.hidden = scrollY < innerHeight;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
  top?.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' });
  });
}

const REVEAL = '.sec-head, .work, .rb, .feat, .also, .box, .kpis, .portrait-col, .editorial, .more, .vhs, .g-top, .g-info li';

function reveal(): void {
  if (reduce() || !('IntersectionObserver' in window)) return;
  const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL)).filter((el) => el.getBoundingClientRect().top > innerHeight * 0.92);
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => (a.target.compareDocumentPosition(b.target) & 4 ? -1 : 1));
      hit.forEach((e, i) => {
        const el = e.target as HTMLElement;
        io.unobserve(el);
        el.style.setProperty('--d', `${Math.min(i, 5) * 60}ms`);
        el.classList.add('in');
        // one-shot: drop the reveal state afterwards so hover transforms/transitions are untouched
        setTimeout(() => { el.removeAttribute('data-reveal'); el.classList.remove('in'); el.style.removeProperty('--d'); }, 420 + i * 60 + 60);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  els.forEach((el) => { el.setAttribute('data-reveal', ''); io.observe(el); });
}

function dots(): void {
  document.querySelectorAll<HTMLElement>('.works').forEach((track) => {
    const items = Array.from(track.children) as HTMLElement[];
    if (items.length < 2) return;
    const wrap = document.createElement('div');
    wrap.className = 'dots';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = items.map(() => '<i></i>').join('');
    track.after(wrap);
    const ds = Array.from(wrap.children) as HTMLElement[];
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = track.scrollWidth - track.clientWidth;
      let idx = 0;
      if (max > 0) {
        idx = track.scrollLeft >= max - 2 ? items.length - 1 : Math.round((track.scrollLeft / max) * (items.length - 1));
      }
      ds.forEach((d, i) => d.classList.toggle('on', i === idx));
    };
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();
  });
}

export function initFx(): void {
  progress();
  dots();
  reveal();
}
