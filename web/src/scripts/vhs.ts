/** VHS shelf: filter tabs, prev/next, click-to-pull, responsive spine window. */
export function initVhs(root: HTMLElement): void {
  const items = Array.from(root.querySelectorAll<HTMLButtonElement>('.vitem'));
  const row = root.querySelector<HTMLElement>('.vrow')!;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('.vtabs button'));
  const cap = { t: root.querySelector('.vc b')!, s: root.querySelector('.vc span')!, y: root.querySelector('.vc i')! };
  const link = root.querySelector<HTMLAnchorElement>('.vlink');
  let filter = 'all';
  let active = Math.max(0, items.findIndex((i) => i.dataset.id === root.dataset.start));

  const matches = (el: HTMLElement) => filter === 'all' || (el.dataset.cats ?? '').split(' ').includes(filter);
  const list = () => items.filter(matches);

  const capacity = () => {
    const css = getComputedStyle(root);
    const num = (v: string, d: number) => { const n = parseFloat(v); return Number.isNaN(n) ? d : n; };
    const sw = num(css.getPropertyValue('--sw'), 66);
    const cw = num(css.getPropertyValue('--cw'), 0);
    const gap = num(getComputedStyle(row).columnGap, 8);
    const avail = row.clientWidth - cw - 24;
    // total spines that fit in the row (the window shows n + 1 items)
    return Math.max(2, Math.floor((avail + gap) / (sw + gap)) - 1);
  };

  const render = () => {
    const vis = list();
    if (!vis.length) return;
    if (!vis.includes(items[active])) active = items.indexOf(vis[0]);
    const pos = vis.indexOf(items[active]);
    const n = Math.min(vis.length - 1, capacity());
    const start = Math.min(Math.max(0, pos - Math.floor(n / 2)), Math.max(0, vis.length - 1 - n));
    const windowSet = new Set(vis.slice(start, start + n + 1));
    items.forEach((el, i) => {
      const show = matches(el) && windowSet.has(el);
      el.hidden = !show;
      const on = i === active;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-pressed', String(on));
      if (on) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
    });
    const cur = items[active];
    cap.t.textContent = cur.dataset.title ?? '';
    cap.s.textContent = cur.dataset.sub ?? '';
    cap.y.textContent = cur.dataset.year ?? '';
    if (link) {
      const href = cur.dataset.url;
      link.hidden = !href;
      if (href) link.href = href; else link.removeAttribute('href');
    }
  };

  const step = (d: number) => {
    const vis = list();
    if (!vis.length) return;
    const pos = vis.indexOf(items[active]);
    active = items.indexOf(vis[(pos + d + vis.length) % vis.length]);
    render();
  };

  root.querySelector('.va-prev')?.addEventListener('click', () => step(-1));
  root.querySelector('.va-next')?.addEventListener('click', () => step(1));
  // First click pulls the tape out; clicking the pulled-out tape opens its project.
  items.forEach((el, i) => el.addEventListener('click', () => {
    if (i === active && el.dataset.url) { window.open(el.dataset.url, '_blank', 'noopener'); return; }
    active = i; render();
  }));
  tabs.forEach((t) =>
    t.addEventListener('click', () => {
      filter = t.dataset.filter ?? 'all';
      tabs.forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
      render();
    }),
  );
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { step(-1); }
    else if (e.key === 'ArrowRight') { step(1); }
  });
  let raf = 0;
  new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); }).observe(row);
  render();
}
