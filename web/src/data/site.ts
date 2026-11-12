export const EMAIL = 'pau@telluscoop.com';
export const LINKS = {
  email: `mailto:${EMAIL}`,
  linkedin: 'https://www.linkedin.com/in/kloren/',
  github: 'https://github.com/Klorenn',
  x: 'https://x.com/kl0ren',
  blogAuthor: 'https://blog.telluscoop.com/authors/pau-koh',
  loot: 'https://www.findloot.xyz/',
  tirly: 'https://tirly.xyz',
  setareh: 'https://setareh.site',
  local402: 'https://local402.xyz',
  nurea: 'https://nurea.app',
  atlas: 'https://atlastelluscoop.vercel.app/',
  topkale: 'https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/build',
  cosmic: 'https://klorenn.github.io/Cosmic-Coder-/',
  caupolicana: 'https://www.instagram.com/_caupolicana_/',
  kedgeway: 'https://kedgeway.vercel.app/',
  arcus: 'https://arcusx.pro/',
} as const;

/** Prefix a public asset / route with Astro's configured base path. */
export const url = (p = ''): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${p.replace(/^\//, '')}`;
};

export const SECTIONS = ['home', 'about', 'work', 'featured', 'contact'] as const;

/** Blog URL per work (from blog.telluscoop.com sitemap). */
export interface Work { id: string; img: string; w: number; h: number; url: string | null; featured?: boolean; wide?: boolean }
export const WORKS: Work[] = [
  { id: 'binance', img: 'img/work/w-binance.jpg', w: 900, h: 506, featured: true, url: 'https://blog.telluscoop.com/p/incidente-seguridad-binance-como-protegerte' },
  { id: 'php', img: 'img/work/w-php.jpg', w: 900, h: 506, url: 'https://blog.telluscoop.com/p/php2shell-fallo-critico-php-parchear' },
  { id: 'stable', img: 'img/work/w-stable.jpg', w: 900, h: 506, url: 'https://blog.telluscoop.com/p/aprende-quien-congela-stablecoin' },
  { id: 'mixer', img: 'img/work/w-mixer.jpg', w: 900, h: 506, url: 'https://blog.telluscoop.com/p/global-mixer-lisboa-hackmeridian' },
  { id: 'fyw', img: 'img/work/w-fyw.jpg', w: 900, h: 472, wide: true, url: 'https://blog.telluscoop.com/p/ganadores-find-your-way-hackathon' },
];

export const REBRANDS = [
  { id: 'setareh', img: 'img/covers/setareh.jpg', url: LINKS.setareh },
  { id: 'local402', img: 'img/covers/local402.jpg', url: LINKS.local402 },
  { id: 'arcus', img: 'img/covers/arcus.jpg', url: LINKS.arcus as string | null },
  { id: 'caupolicana', img: 'img/covers/caupolicana.jpg', url: LINKS.caupolicana },
  { id: 'kedgeway', img: 'img/covers/kedgeway.jpg', url: LINKS.kedgeway },
];

/** Project website per VHS tape (null = no public link). */
export const TAPE_URLS: Record<string, string | null> = {
  loot: LINKS.loot, nurea: LINKS.nurea, setareh: LINKS.setareh, cosmic: LINKS.cosmic, tirly: LINKS.tirly,
  topkale: LINKS.topkale, local402: LINKS.local402, arcus: LINKS.arcus, atlas: LINKS.atlas, caupolicana: LINKS.caupolicana, kedgeway: LINKS.kedgeway,
};

export interface Tape {
  id: string; n: string; tag: string; year: string; bg: string; fg: string; title: string;
  cats: ('hackathons' | 'products' | 'brands')[]; art: string; artBg: string; compact?: boolean;
}
export const TAPES: Tape[] = [
  { id: 'loot', n: '01', tag: 'ZK', year: '2026', bg: '#8B83FF', fg: '#141414', title: 'Loot', cats: ['products'], art: 'img/vhs/ill-loot.png', artBg: '#EFE6D2' },
  { id: 'nurea', n: '02', tag: 'App', year: '2025', bg: '#0C4A39', fg: '#F4EBD8', title: 'Nurea', cats: ['products'], art: 'img/vhs/ill-nurea.png', artBg: '#EFE6D2' },
  { id: 'setareh', n: '03', tag: 'Marca', year: '2026', bg: '#A84B24', fg: '#F6EEDF', title: 'Setareh', cats: ['brands'], art: 'img/vhs/ill-setareh.png', artBg: '#EFE6D2' },
  { id: 'cosmic', n: '04', tag: '4°', year: '2026', bg: '#0B1A22', fg: '#5CE1E6', title: 'Cosmic Coder', cats: ['hackathons'], art: 'img/vhs/ill-cosmic.png', artBg: '#0F2A33', compact: true },
  { id: 'tirly', n: '05', tag: 'Bot', year: '2026', bg: '#FF5A1F', fg: '#141414', title: 'Tirly', cats: ['products'], art: 'img/vhs/tirly-cat.png', artBg: '#FF5A1F' },
  { id: 'topkale', n: '06', tag: '6°', year: '2025', bg: '#3E7B27', fg: '#F4F1EA', title: 'TopKale', cats: ['hackathons'], art: 'img/vhs/ill-topkale.png', artBg: '#EFE6D2' },
  { id: 'local402', n: '07', tag: 'Marca', year: '2026', bg: '#5A5AC2', fg: '#F4F4F2', title: 'Local402', cats: ['brands', 'hackathons'], art: 'img/vhs/ill-local402.png', artBg: '#EFE6D2' },
  { id: 'arcus', n: '08', tag: 'Marca', year: '2026', bg: '#141414', fg: '#F4F4F2', title: 'Arcus', cats: ['brands'], art: 'img/vhs/ill-arcus.png', artBg: '#EFE6D2' },
  { id: 'atlas', n: '09', tag: 'OSS', year: '2026', bg: '#16233A', fg: '#F2E6D0', title: 'Atlas', cats: ['products'], art: 'img/vhs/ill-atlas.png', artBg: '#EFE6D2' },
  { id: 'caupolicana', n: '10', tag: 'Marca', year: '2026', bg: '#5B3A29', fg: '#F3E9DA', title: 'Caupolicana', cats: ['brands'], art: 'img/vhs/ill-caupolicana.png', artBg: '#EFE6D2', compact: true },
  { id: 'kedgeway', n: '11', tag: 'Tool', year: '2026', bg: '#F4F2EE', fg: '#0B0B0C', title: 'Kedgeway', cats: ['products'], art: 'img/vhs/ill-kedgeway.png', artBg: '#0B0B0C' },
];

/** Archive routes per language. */
export const ARCHIVE = { es: '/articles/', en: '/en/articles/' } as const;
