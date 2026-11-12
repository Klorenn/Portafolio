"""Genera el tablero de exploración de logo (Kl0ren / Archivo 01) como HTML para importar a Figma."""
import base64
from pathlib import Path

INK = "#141414"
CREAM = "#EDE9DF"
LIME = "#E8F542"
LAV = "#A78BFA"


def onda(size=360, color=CREAM, rings=5, gap=10):
    """Crescentes concéntricos a ambos lados, como ondas de señal (ref. Void)."""
    w, h = size, size * 0.6
    cx, cy = w / 2, h / 2
    paths = []
    step = (w / 2 - gap - 6 - w * 0.05) / (rings - 1)
    for i in range(rings):
        rx = w * 0.05 + i * step
        ry = h * 0.12 + i * (h / 2 - 2 - h * 0.12) / (rings - 1)
        t = step * 0.55
        for s in (-1, 1):
            x = cx + s * gap
            sweep_out, sweep_in = (0, 1) if s < 0 else (1, 0)
            paths.append(
                f'<path d="M{x:.1f} {cy-ry:.1f} A{rx:.1f} {ry:.1f} 0 0 {sweep_out} {x:.1f} {cy+ry:.1f} '
                f'A{rx-t:.1f} {ry:.1f} 0 0 {sweep_in} {x:.1f} {cy-ry:.1f}Z" fill="{color}"/>'
            )
    return f'<svg width="{w:.0f}" height="{h:.0f}" viewBox="0 0 {w:.0f} {h:.0f}">{"".join(paths)}</svg>'


def lente(size=300, fg=INK, bg=CREAM):
    """Bloque superior + anillos elípticos recortados por el cuadrado: un ojo/lente (ref. 2)."""
    s = size
    cx, cy = s / 2, s * 0.62
    rings = ""
    for rx, ry, sw in [(s * 0.62, s * 0.36, s * 0.035), (s * 0.40, s * 0.24, s * 0.03), (s * 0.30, s * 0.17, s * 0.012)]:
        rings += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx:.1f}" ry="{ry:.1f}" fill="none" stroke="{fg}" stroke-width="{sw:.1f}"/>'
    return (
        f'<svg width="{s}" height="{s}" viewBox="0 0 {s} {s}"><defs><clipPath id="c{s}"><rect width="{s}" height="{s}"/></clipPath></defs>'
        f'<g clip-path="url(#c{s})"><rect width="{s}" height="{s}" fill="{bg}"/>'
        f'<rect x="0" y="0" width="{s}" height="{s*0.36:.1f}" fill="{fg}"/>'
        f'<ellipse cx="{cx}" cy="{cy}" rx="{s*0.66:.1f}" ry="{s*0.40:.1f}" fill="{bg}"/>'
        f'{rings}<ellipse cx="{cx}" cy="{cy}" rx="{s*0.13:.1f}" ry="{s*0.08:.1f}" fill="{fg}"/></g></svg>'
    )


def tunel(size=300, a=CREAM, b=INK, n=7):
    """Un '0' hecho de anillos que se hunden: túnel / gota que cae en el agua."""
    s = size
    out = ""
    for i in range(n):
        k = 1 - i / n
        rx, ry = s * 0.36 * k, s * 0.46 * k
        cy = s / 2 + i * s * 0.022
        out += f'<ellipse cx="{s/2}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{a if i % 2 == 0 else b}"/>'
    return f'<svg width="{s}" height="{s}" viewBox="0 0 {s} {s}">{out}</svg>'


def eco(size=300, color=CREAM, n=5):
    """Anillos de grosor variable desplazados hacia un punto: eco orgánico (ref. 3)."""
    s = size
    out = ""
    for i in range(n):
        k = 1 - i / n
        r = s * 0.46 * k
        cx = s / 2 + i * s * 0.03
        cy = s / 2 + i * s * 0.035
        out += f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="{color}" stroke-width="{s*0.05*k+2:.1f}"/>'
    out += f'<circle cx="{s/2 + n*s*0.03:.1f}" cy="{s/2 + n*s*0.035:.1f}" r="{s*0.035:.1f}" fill="{color}"/>'
    return f'<svg width="{s}" height="{s}" viewBox="0 0 {s} {s}">{out}</svg>'


CONCEPTS = [
    ("A", "Onda", "La señal que se propaga: periodismo como transmisión. El hueco central es el ‘0’ — una voz que se abre hacia los lados.", onda(), INK),
    ("B", "Lente", "Un ojo que observa bajo un bloque sólido: el encuadre del fotógrafo y la mirada del periodista.", lente(bg=CREAM), CREAM),
    ("C", "Túnel 0", "El cero como gota que cae en el agua: cada anillo es una capa de la historia. Funciona solo como monograma.", tunel(), INK),
    ("D", "Eco", "Anillos que se desplazan hacia un punto, como un sonido que rebota. Más orgánico y artesanal.", eco(), "#1F3D2B"),
]

mini_onda = onda(size=64, color=INK, rings=4, gap=3)

REFS = Path(__file__).with_name("refs")
MOOD_PICKS = ["06", "07", "08", "09", "11", "12", "13", "14", "15", "31", "32", "35"]
TYPE_REFS = Path(__file__).with_name("refs-type")
TYPE_PICKS = ["33", "36", "31", "10", "01", "03", "15", "17", "21", "13", "24", "16"]


def mood(folder, picks):
    return "".join(
        f'<img src="data:image/jpeg;base64,{base64.b64encode((folder / f"{n}.jpg").read_bytes()).decode()}" alt="">'
        for n in picks
    )


MOOD = mood(REFS, MOOD_PICKS)
TYPE_MOOD = mood(TYPE_REFS, TYPE_PICKS)


def card(code, name, desc, svg, bg):
    fg = INK if bg == CREAM else CREAM
    return f'''<div class="card"><div class="art" style="background:{bg}">{svg}<span class="tm" style="color:{fg}">™</span></div>
<div class="meta"><span class="code">{code}</span><div><h3>{name}</h3><p>{desc}</p></div></div></div>'''


html = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Logo — exploración</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1440px;background:#0E0E0E;color:{CREAM};font-family:"Space Grotesk",sans-serif;padding:72px 64px 80px}}
.mono{{font-family:"Space Mono",monospace}}
header{{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #2E2E2E;padding-bottom:32px}}
header h1{{font-family:"Dela Gothic One";font-size:72px;line-height:.95;text-transform:uppercase}}
header p{{max-width:460px;color:#A3A3A3;font-size:16px;line-height:1.5}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}}
.card{{border:1px solid #2E2E2E;border-radius:20px;overflow:hidden;background:#161616}}
.art{{height:440px;display:flex;align-items:center;justify-content:center;position:relative}}
.tm{{position:absolute;right:28px;top:24px;font-size:14px}}
.meta{{display:flex;gap:18px;padding:22px 26px}}
.code{{width:40px;height:40px;flex:none;border-radius:10px;background:{LIME};color:{INK};font-weight:700;display:flex;align-items:center;justify-content:center;font-size:18px}}
.meta h3{{font-size:22px;margin-bottom:6px}}
.meta p{{font-size:14px;line-height:1.5;color:#A3A3A3}}
h2{{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:{LIME};margin:64px 0 20px}}
.apps{{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:24px}}
.app{{border:1px solid #2E2E2E;border-radius:20px;height:260px;display:flex;align-items:center;justify-content:center;gap:16px;position:relative}}
.app .lbl{{position:absolute;left:20px;bottom:16px;font-size:12px;opacity:.6}}
.word{{font-size:54px;font-weight:700;letter-spacing:-2px;display:flex;align-items:center}}
.word svg{{margin:0 2px}}
.stack{{display:flex;flex-direction:column;align-items:center;gap:10px}}
.stack .t1{{font-size:34px;font-weight:700;letter-spacing:-1px}}
.stack .t2{{font-size:13px;letter-spacing:3px;text-transform:uppercase;opacity:.75}}
.mood{{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}}
.note{{color:#A3A3A3;font-size:15px;max-width:760px;margin:-8px 0 18px;line-height:1.5}}
.mood img{{width:100%;height:200px;object-fit:cover;border-radius:12px;display:block}}
.fav{{display:flex;gap:18px;align-items:flex-end}}
.fav div{{border-radius:14px;background:{INK};display:flex;align-items:center;justify-content:center;border:1px solid #2E2E2E}}
</style></head><body>
<header><h1>Kl0ren<br>Logo · exploración</h1><p class="mono">4 direcciones a partir de las referencias: anillos concéntricos, señal, ojo/lente. Un solo símbolo compartido entre Kl0ren y Archivo 01, donde el anillo es el “0”.</p></header>
<div class="grid">{"".join(card(*c) for c in CONCEPTS)}</div>

<h2 class="mono">Moodboard · Pinterest</h2>
<div class="mood">{MOOD}</div>

<h2 class="mono">Logotypes aesthetic · Pinterest</h2>
<p class="note">Los tres primeros (elipse que abraza la palabra, letras rebanadas en franjas, una letra intervenida) son los que mejor conversan con la onda: el “0” puede ser la letra intervenida.</p>
<div class="mood">{TYPE_MOOD}</div>

<h2 class="mono">Aplicaciones · dirección A</h2>
<div class="apps">
  <div class="app" style="background:{LIME};color:{INK}"><div class="word">KL{mini_onda}REN</div><span class="lbl mono">Wordmark · el 0 es la onda</span></div>
  <div class="app" style="background:{INK}"><div class="stack">{onda(size=150, rings=4, gap=6)}<span class="t1">Archivo 01</span><span class="t2">Fotografía</span></div><span class="lbl mono">Archivo 01 · lockup</span></div>
  <div class="app" style="background:#161616"><div class="fav"><div style="width:96px;height:96px">{onda(size=72, rings=3, gap=4)}</div><div style="width:48px;height:48px">{onda(size=36, rings=3, gap=2)}</div><div style="width:24px;height:24px;border-radius:6px">{onda(size=18, rings=2, gap=1)}</div></div><span class="lbl mono">Favicon · 96 / 48 / 24</span></div>
</div>
</body></html>'''

Path(__file__).with_name("board.html").write_text(html)
print("ok", len(html))
