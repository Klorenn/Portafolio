/** Archive: client-side filters + search + pagination, state mirrored in the URL (?page&type&year&q). */
const PER = 12;

interface State { page: number; type: string; year: string; q: string }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function initArchive(): void {
  const root = document.getElementById('afilters');
  const grid = document.getElementById('agrid');
  const pager = document.getElementById('apager');
  const top = document.getElementById('alist-top');
  const input = document.getElementById('aq') as HTMLInputElement | null;
  const empty = document.querySelector<HTMLElement>('.aempty');
  const countEl = document.querySelector<HTMLElement>('.acount');
  const infoEl = document.querySelector<HTMLElement>('.apage-info');
  if (!root || !grid || !pager || !top || !input || !empty || !countEl || !infoEl) return;

  const d = root.dataset;
  const fmt = (t: string, v: Record<string, number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.acard'));
  const groups = Array.from(root.querySelectorAll<HTMLElement>('.atabs'));
  const valid = (g: string) => new Set(Array.from(root.querySelectorAll<HTMLElement>(`.atabs[data-group="${g}"] button`)).map((b) => b.dataset.value ?? ''));
  const types = valid('type');
  const years = valid('year');

  const read = (): State => {
    const p = new URLSearchParams(location.search);
    const type = p.get('type') ?? '';
    const year = p.get('year') ?? '';
    return {
      page: Math.max(1, parseInt(p.get('page') ?? '1', 10) || 1),
      type: types.has(type) ? type : '',
      year: years.has(year) ? year : '',
      q: (p.get('q') ?? '').slice(0, 100),
    };
  };
  let state = read();

  const write = () => {
    const p = new URLSearchParams();
    if (state.page > 1) p.set('page', String(state.page));
    if (state.type) p.set('type', state.type);
    if (state.year) p.set('year', state.year);
    if (state.q.trim()) p.set('q', state.q.trim());
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
  };

  const pageList = (cur: number, last: number): (number | '…')[] => {
    const set = new Set([1, last, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= last));
    const nums = [...set].sort((a, b) => a - b);
    const out: (number | '…')[] = [];
    nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push('…'); out.push(n); });
    return out;
  };

  const renderPager = (cur: number, last: number) => {
    pager.hidden = last <= 1;
    pager.replaceChildren();
    if (last <= 1) return;
    const mk = (label: string, page: number, opts: { aria?: string; disabled?: boolean; current?: boolean } = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.dataset.page = String(page);
      if (opts.aria) b.setAttribute('aria-label', opts.aria);
      if (opts.disabled) b.disabled = true;
      if (opts.current) b.setAttribute('aria-current', 'page');
      return b;
    };
    pager.append(mk('‹', cur - 1, { aria: d.prev, disabled: cur === 1 }));
    pageList(cur, last).forEach((n) => {
      if (n === '…') {
        const s = document.createElement('span');
        s.className = 'gap'; s.textContent = '…'; s.setAttribute('aria-hidden', 'true');
        pager.append(s);
      } else pager.append(mk(String(n), n, { aria: `${d.pageLabel} ${n}`, current: n === cur }));
    });
    pager.append(mk('›', cur + 1, { aria: d.next, disabled: cur === last }));
  };

  const render = (scroll = false) => {
    const q = norm(state.q);
    const matches = cards.filter(
      (c) => (!state.type || c.dataset.kind === state.type) && (!state.year || c.dataset.year === state.year) && (!q || (c.dataset.s ?? '').includes(q)),
    );
    const last = Math.max(1, Math.ceil(matches.length / PER));
    state.page = Math.min(state.page, last);
    const from = (state.page - 1) * PER;
    const show = new Set(matches.slice(from, from + PER));
    cards.forEach((c) => { c.hidden = !show.has(c); });

    groups.forEach((g) => {
      const cur = state[g.dataset.group as 'type' | 'year'];
      g.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.value ?? '') === cur)));
    });
    if (input.value !== state.q) input.value = state.q;

    countEl.textContent = fmt(d.count!, { n: matches.length });
    infoEl.textContent = matches.length ? fmt(d.pageOf!, { p: state.page, t: last }) : '';
    empty.hidden = matches.length > 0;
    grid.hidden = matches.length === 0;
    renderPager(state.page, matches.length ? last : 1);
    write();
    if (scroll) top.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.atabs button');
    if (!b) return;
    state[b.closest<HTMLElement>('.atabs')!.dataset.group as 'type' | 'year'] = b.dataset.value ?? '';
    state.page = 1;
    render();
  });
  input.addEventListener('input', () => { state.q = input.value; state.page = 1; render(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.value) { input.value = ''; state.q = ''; state.page = 1; render(); } });
  pager.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-page]');
    if (!b || b.disabled) return;
    state.page = parseInt(b.dataset.page!, 10);
    render(true);
    pager.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus({ preventScroll: true });
  });
  empty.querySelector('[data-reset]')?.addEventListener('click', () => { state = { page: 1, type: '', year: '', q: '' }; render(); });
  window.addEventListener('popstate', () => { state = read(); render(); });

  render();
}
