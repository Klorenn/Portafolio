export type Lang = 'es' | 'en';

export interface WorkCopy {
  fmt: string;
  meta: string;
  date: string;
  title: string;
  desc: string;
  part: string;
  cta: string;
  alt: string;
}

export interface Copy {
  lang: Lang;
  htmlLang: string;
  meta: { title: string; description: string; ogAlt: string };
  skip: string;
  nav: {
    home: string; about: string; work: string; articles: string; featured: string; contact: string;
    cta: string; burger: string; close: string; menu: string; langName: string; sections: string; top: string;
  };
  hero: { first: string; accent: string; phrase: string; welcome: string; cta1: string; cta2: string; alt: string; bubble: string };
  marquee: string[];
  kpisTitle: string;
  kpis: { n: string; label: string }[];
  about: {
    h2: [string, string]; lead: string; sticker: string; photoAlt: string;
    bioPre: string; bioEm: string; bioPost: string; bioSub: string;
    areas: { k: string; v: string }; skills: { k: string; v: string };
    awardsK: string; awards: { n: string; color: 'lime' | 'lav' | 'stellar' | 'orange' | 'ua'; title: string; sub: string }[];
    hobbiesK: string; hobbies: string[]; stackK: string;
  };
  stack: { id: string; label: string; icon?: string; zk?: boolean }[];
  works: {
    h2: [string, string]; lead: string; featuredBadge: string; items: Record<string, WorkCopy>;
    more: string; moreNote: string; /* {n} = article count */ newsletters: string; chips: string[]; todo: string;
  };
  feat: {
    h2: [string, string]; lead: string; kicker: string; title: string; desc: string; chips: string[]; cta: string;
    ctaAria: string; imgAlt: string;
    qs: { h: string; p: string }[];
    tirly: { title: string; desc: string; chips: string[]; cta: string; imgAlt: string };
  };
  rebrands: {
    h2: [string, string]; lead: string;
    items: Record<string, { meta2: string; title: string; desc: string; part: string; alt: string }>;
  };
  vhs: {
    h2: [string, string]; lead: string; tabs: [string, string, string, string]; kicker: string;
    prev: string; next: string; tabsLabel: string; shelfLabel: string; tirlyAlt: string; open: string;
    items: Record<string, { sub: string; line?: string }>;
  };
  footer: {
    lead: string; leadAccent: string; cta: string; contactCards: { k: string; v: string }[];
    available: string; copy: string; zz: string; sleepAlt: string;
  };
  articles: {
    meta: { title: string; description: string };
    h2: [string, string]; lead: string; note?: string;
    filterType: string; filterYear: string; allYears: string; types: [string, string, string];
    kinds: { nota: string; boletin: string }; cta: { nota: string; boletin: string };
    searchLabel: string; searchPlaceholder: string; clear: string;
    count: string; pageOf: string; prev: string; next: string; pagerLabel: string; page: string;
    empty: string; emptyReset: string; months: string[]; dateFmt: 'dmy' | 'mdy';
  };
  e404: { title: string; text: string; back: string; code: string };
}
