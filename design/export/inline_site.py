"""Build self-contained HTML (desktop + mobile) from the Astro dist for Figma import."""
import base64, mimetypes, pathlib, re, sys

DIST = pathlib.Path('/Users/paukoh/PORTAFOLIO/web/dist')
OUT = pathlib.Path(__file__).parent

def data_uri(rel):
    p = DIST / rel.lstrip('/').split('?')[0].split('#')[0]
    if not p.exists():
        return None
    mime = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(p.read_bytes()).decode()

def inline_urls(css):
    def rep(m):
        u = m.group(2)
        if u.startswith('data:') or u.startswith('http'):
            return m.group(0)
        d = data_uri(u)
        return f'url({d})' if d else m.group(0)
    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', rep, css)

def blocks(css):
    """Yield (prelude, body) for top-level rules, keeping order."""
    i, n, out = 0, len(css), []
    while i < n:
        j = css.find('{', i)
        if j < 0:
            out.append((css[i:], None)); break
        depth, k = 1, j + 1
        while k < n and depth:
            depth += {'{': 1, '}': -1}.get(css[k], 0); k += 1
        out.append((css[i:j].strip(), css[j + 1:k - 1])); i = k
    return out

def flatten_for(css, width):
    res = []
    for pre, body in blocks(css):
        if body is None:
            continue
        if pre.startswith('@font-face'):
            continue
        if pre.startswith('@media'):
            q = pre
            if 'hover' in q or 'reduced-motion' in q or 'print' in q:
                continue
            ok = True
            for kind, px in re.findall(r'(max|min)-width:\s*(\d+)px', q):
                px = int(px)
                if kind == 'max' and width > px: ok = False
                if kind == 'min' and width < px: ok = False
            if ok:
                res.append(flatten_for(body, width))
            continue
        res.append(f'{pre}{{{body}}}')
    return '\n'.join(res)

def build(page, width, name):
    html = (DIST / page).read_text()
    css = ''
    for href in re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"', html) + re.findall(r'<link[^>]+href="([^"]+\.css)"[^>]*rel="stylesheet"', html):
        css += (DIST / href.lstrip('/')).read_text()
    css += ''.join(re.findall(r'<style[^>]*>(.*?)</style>', html, re.S))
    css = inline_urls(flatten_for(css, width))
    css = re.sub(r'(-?\d*\.?\d+)vw', lambda m: f'{float(m.group(1)) * width / 100:.2f}px', css)
    css = re.sub(r'(-?\d*\.?\d+)vh', lambda m: f'{float(m.group(1)) * 9:.2f}px', css)
    css += f'\nhtml,body{{width:{width}px !important;overflow-x:hidden}} [data-reveal]{{opacity:1 !important;transform:none !important}} .vitem.is-active{{transform:translateY(-16px) !important}} .vitem.is-active .sp::after{{display:none}}'
    html = re.sub(r'<link[^>]+stylesheet[^>]*>', '', html)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.S)
    html = re.sub(r'<script\b.*?</script>', '', html, flags=re.S)
    html = re.sub(r'<html([^>]*) class="[^"]*"', r'<html\1', html)
    html = re.sub(r'(src|href)="(/[^"]+\.(?:png|jpe?g|gif|svg|webp))"', lambda m: f'{m.group(1)}="{data_uri(m.group(2)) or m.group(2)}"', html)
    html = re.sub(r'url\((/[^)]+)\)', lambda m: f'url({data_uri(m.group(1)) or m.group(1)})', html)
    html = html.replace('</head>', f'<style>{css}</style></head>')
    (OUT / name).write_text(html)
    print(name, round(len(html) / 1e6, 2), 'MB')

for page, tag in (('index.html', 'es'), ('en/index.html', 'en')):
    build(page, 1440, f'site-{tag}-desktop.html')
    build(page, 390, f'site-{tag}-mobile.html')
