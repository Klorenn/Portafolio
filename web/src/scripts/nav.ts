/** Menu overlay (a11y: Esc, focus trap, scroll lock) + active-section highlight + language link hash. */
export function initNav(): void {
  const menu = document.getElementById('menu') as HTMLElement | null;
  const burger = document.querySelector<HTMLButtonElement>('.burger');
  const closeBtn = menu?.querySelector<HTMLButtonElement>('.menu-close');
  if (!menu || !burger || !closeBtn) return;

  const focusable = () =>
    Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((el) => el.offsetParent !== null);

  const setOpen = (open: boolean) => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) closeBtn.focus();
    else if (document.activeElement && menu.contains(document.activeElement)) burger.focus();
  };

  burger.addEventListener('click', () => setOpen(true));
  closeBtn.addEventListener('click', () => setOpen(false));
  menu.querySelectorAll('a[data-section]').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
    if (e.key === 'Tab') {
      const f = focusable();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Leaving the mobile layout while open: close so the page isn't left scroll-locked.
  window.matchMedia('(min-width: 1021px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) setOpen(false); });

  // Active section
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-section]'));
  const ids = Array.from(new Set(links.map((l) => l.dataset.section!)));
  let current = ids[0];
  const mark = (id: string) => {
    current = id;
    links.forEach((l) => (l.dataset.section === id ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
  };
  if (ids.some((id) => document.getElementById(id))) mark(current);
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) mark(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => io.observe(s));
    // Bottom of page => contact (footer can be shorter than the observation band)
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) mark(ids[ids.length - 1]);
    }, { passive: true });
  }

  // Language toggle keeps the current section hash
  document.querySelectorAll<HTMLAnchorElement>('a[data-lang]').forEach((a) => {
    a.addEventListener('click', () => {
      if (!sections.length) return; // sub-pages (archive): plain route switch
      const base = a.getAttribute('href')!.split('#')[0];
      a.setAttribute('href', `${base}#${current}`);
    });
  });
}
